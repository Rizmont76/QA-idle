const DECIMAL_BASE = 10n;
const BIGINT_ZERO = BigInt(0);
const BIGINT_ONE = BigInt(1);
const BIGINT_TWO = BIGINT_ONE + BIGINT_ONE;
const BIGINT_NEGATIVE_ONE = -BIGINT_ONE;

function scaleFor(decimalPlaces: number) {
  if (!Number.isInteger(decimalPlaces) || decimalPlaces < 0) {
    throw new Error("Fixed-point decimal places must be a non-negative integer.");
  }

  return DECIMAL_BASE ** BigInt(decimalPlaces);
}

function roundDivHalfAwayFromZero(numerator: bigint, denominator: bigint) {
  if (denominator <= BIGINT_ZERO) {
    throw new Error("Fixed-point denominator must be positive.");
  }

  const sign = numerator < BIGINT_ZERO ? BIGINT_NEGATIVE_ONE : BIGINT_ONE;
  const absolute = numerator < BIGINT_ZERO ? -numerator : numerator;
  return sign * ((absolute * BIGINT_TWO + denominator) / (denominator * BIGINT_TWO));
}

export class FixedPoint {
  private constructor(
    readonly units: bigint,
    readonly decimalPlaces: number,
  ) {}

  static fromNumber(value: number, decimalPlaces: number) {
    if (!Number.isFinite(value)) {
      throw new Error("Fixed-point values must be finite.");
    }

    const scale = scaleFor(decimalPlaces);
    const [coefficient = "0", exponentText = "0"] = value
      .toString()
      .toLowerCase()
      .split("e");
    const exponent = Number(exponentText);
    const negative = coefficient.startsWith("-");
    const digits = coefficient.replace("-", "").replace(".", "");
    const fractionLength = coefficient.includes(".")
      ? coefficient.length - coefficient.indexOf(".") - 1
      : 0;
    const signedDigits =
      BigInt(digits || "0") * (negative ? BIGINT_NEGATIVE_ONE : BIGINT_ONE);
    const sourceScalePower = fractionLength - exponent;
    const sourceScale =
      sourceScalePower >= 0 ? DECIMAL_BASE ** BigInt(sourceScalePower) : BIGINT_ONE;
    const expanded =
      sourceScalePower >= 0
        ? signedDigits * scale
        : signedDigits * DECIMAL_BASE ** BigInt(-sourceScalePower) * scale;

    return new FixedPoint(roundDivHalfAwayFromZero(expanded, sourceScale), decimalPlaces);
  }

  add(other: FixedPoint) {
    this.assertSameScale(other);
    return new FixedPoint(this.units + other.units, this.decimalPlaces);
  }

  multiply(other: FixedPoint) {
    this.assertSameScale(other);
    return new FixedPoint(
      roundDivHalfAwayFromZero(this.units * other.units, scaleFor(this.decimalPlaces)),
      this.decimalPlaces,
    );
  }

  toNumber() {
    return Number(this.units) / Number(scaleFor(this.decimalPlaces));
  }

  private assertSameScale(other: FixedPoint) {
    if (this.decimalPlaces !== other.decimalPlaces) {
      throw new Error("Cannot mix fixed-point scales.");
    }
  }
}
