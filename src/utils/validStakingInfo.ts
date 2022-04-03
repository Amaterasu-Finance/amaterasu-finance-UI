import { Token } from '@amaterasu-fi/sdk'
import { CallState } from '../state/multicall/hooks'

export default function validStakingInfo(
  tokens: [Token, Token],
  poolInfo: CallState,
  pendingReward: CallState,
  userInfo: CallState,
  lpTokenTotalSupply: CallState,
  lpTokenReserve: CallState,
  lpTokenBalance: CallState,
  rewardPerBlock: CallState,
  totalAllocPoint: CallState
): boolean {
  if (
    tokens &&
    poolInfo &&
    !poolInfo.error &&
    !poolInfo.loading &&
    poolInfo?.result?.[0] !== undefined &&
    pendingReward &&
    !pendingReward.error &&
    !pendingReward.loading &&
    pendingReward?.result?.[0] !== undefined &&
    userInfo &&
    !userInfo.error &&
    !userInfo.loading &&
    userInfo?.result?.[0] !== undefined &&
    lpTokenTotalSupply &&
    !lpTokenTotalSupply.error &&
    !lpTokenTotalSupply.loading &&
    lpTokenTotalSupply?.result?.[0] !== undefined &&
    lpTokenReserve &&
    !lpTokenReserve.error &&
    !lpTokenReserve.loading &&
    lpTokenReserve?.result?.[0] !== undefined &&
    lpTokenBalance &&
    !lpTokenBalance.error &&
    !lpTokenBalance.loading &&
    lpTokenBalance?.result?.[0] !== undefined &&
    rewardPerBlock &&
    !rewardPerBlock.error &&
    !rewardPerBlock.loading &&
    rewardPerBlock?.result?.[0] !== undefined &&
    totalAllocPoint !== undefined &&
    !totalAllocPoint.error &&
    !totalAllocPoint.loading &&
    totalAllocPoint?.result?.[0] !== undefined
  ) {
    return true
  }

  return false
}
