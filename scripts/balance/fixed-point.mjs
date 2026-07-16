export const DEFAULT_SCALE_PLACES = 6;

function pow10(exponent) {
  return 10n ** BigInt(exponent);
}

function roundDivHalfAwayFromZero(numerator, denominator) {
  if (denominator <= 0n) {
    throw new Error("denominator must be positive");
  }

  const sign = numerator < 0n ? -1n : 1n;
  const absolute = numerator < 0n ? -numerator : numerator;

  return sign * ((absolute * 2n + denominator) / (denominator * 2n));
}

export class Fixed {
  constructor(units, scalePlaces = DEFAULT_SCALE_PLACES) {
    this.units = BigInt(units);
    this.scalePlaces = scalePlaces;
    this.scale = pow10(scalePlaces);
  }

  static zero(scalePlaces = DEFAULT_SCALE_PLACES) {
    return new Fixed(0n, scalePlaces);
  }

  static from(value, scalePlaces = DEFAULT_SCALE_PLACES) {
    if (value instanceof Fixed) {
      if (value.scalePlaces === scalePlaces) {
        return value;
      }

      return Fixed.from(value.toNumber(), scalePlaces);
    }

    if (typeof value === "bigint") {
      return new Fixed(value * pow10(scalePlaces), scalePlaces);
    }

    if (!Number.isFinite(value)) {
      throw new Error(`Invalid fixed-point value: ${String(value)}`);
    }

    const scale = Number(pow10(scalePlaces));
    const sign = value < 0 ? -1 : 1;
    const absolute = Math.abs(value);
    const units = BigInt(sign * Math.round(absolute * scale));

    return new Fixed(units, scalePlaces);
  }

  static currency(value, scalePlaces = DEFAULT_SCALE_PLACES) {
    return Fixed.from(Math.round(value), scalePlaces);
  }

  assertSameScale(other) {
    if (this.scalePlaces !== other.scalePlaces) {
      throw new Error("Cannot mix fixed-point scales");
    }
  }

  add(other) {
    const value = Fixed.from(other, this.scalePlaces);
    this.assertSameScale(value);
    return new Fixed(this.units + value.units, this.scalePlaces);
  }

  sub(other) {
    const value = Fixed.from(other, this.scalePlaces);
    this.assertSameScale(value);
    return new Fixed(this.units - value.units, this.scalePlaces);
  }

  mul(other) {
    const value = Fixed.from(other, this.scalePlaces);
    this.assertSameScale(value);
    return new Fixed(
      roundDivHalfAwayFromZero(this.units * value.units, this.scale),
      this.scalePlaces,
    );
  }

  div(other) {
    const value = Fixed.from(other, this.scalePlaces);
    this.assertSameScale(value);
    if (value.units === 0n) {
      throw new Error("Cannot divide by zero");
    }

    return new Fixed(
      roundDivHalfAwayFromZero(this.units * this.scale, value.units),
      this.scalePlaces,
    );
  }

  lt(other) {
    return this.units < Fixed.from(other, this.scalePlaces).units;
  }

  lte(other) {
    return this.units <= Fixed.from(other, this.scalePlaces).units;
  }

  gt(other) {
    return this.units > Fixed.from(other, this.scalePlaces).units;
  }

  gte(other) {
    return this.units >= Fixed.from(other, this.scalePlaces).units;
  }

  eq(other) {
    return this.units === Fixed.from(other, this.scalePlaces).units;
  }

  isZero() {
    return this.units === 0n;
  }

  toNumber() {
    return Number(this.units) / Number(this.scale);
  }

  toString() {
    const sign = this.units < 0n ? "-" : "";
    const absolute = this.units < 0n ? -this.units : this.units;
    const whole = absolute / this.scale;
    const fractional = (absolute % this.scale).toString().padStart(this.scalePlaces, "0");
    const trimmed = fractional.replace(/0+$/, "");

    return trimmed.length > 0
      ? `${sign}${whole.toString()}.${trimmed}`
      : `${sign}${whole.toString()}`;
  }

  toJSON() {
    return this.toString();
  }
}

export function normalizeDecimal(value, scalePlaces = DEFAULT_SCALE_PLACES) {
  return Fixed.from(value, scalePlaces);
}
