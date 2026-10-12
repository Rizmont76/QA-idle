import type { CareerState, NetworkState } from "../../types";
import { networkConnectionUnlocked, rebootReward } from "./networkEffects";
import { rebootNetworkState } from "./networkData";
import { distributedTestRate, hasAutoReport, production, reportValue } from "./selectors";
import { royaltyRate } from "./productEffects";

export function networkImpact(
  s: CareerState,
  network: NetworkState = s.pipeline.network,
) {
  const state: CareerState = { ...s, pipeline: { ...s.pipeline, network } };
  return {
    agents: distributedTestRate(state),
    bugs: production(state),
    income:
      (hasAutoReport(state) ? production(state) * reportValue(state) : 0) +
      royaltyRate(state),
  };
}
export const networkConnectPreview = (s: CareerState) =>
  networkConnectionUnlocked(s)
    ? networkImpact(s, { ...s.pipeline.network, linked: true })
    : null;
export const networkRebootPreview = (s: CareerState) =>
  rebootReward(s) > 0
    ? networkImpact(s, rebootNetworkState(s.pipeline.network, rebootReward(s)))
    : null;
