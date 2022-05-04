import { useMemo } from 'react'
import { Fraction, JSBI, TokenAmount } from '@amaterasu-fi/sdk'
import { StakingInfo } from '../state/stake/hooks'
import useGovernanceToken from './useGovernanceToken'

export default function useUserStakeStats(stakingInfos: StakingInfo[]): Record<string, any> {
  const govToken = useGovernanceToken()
  return useMemo(() => {
    return govToken
      ? stakingInfos.reduce(
          (memo, stakingInfo) => {
            if (stakingInfo) {
              if (stakingInfo.pricePerLpToken && stakingInfo.stakedAmount?.greaterThan('0')) {
                memo.totalStakedUsd = memo.totalStakedUsd.add(
                  stakingInfo.stakedAmount.multiply(stakingInfo.pricePerLpToken)
                )
              }
              if (stakingInfo.earnedAmount?.greaterThan('0')) {
                memo.totalEarnedAmountIza = memo.totalEarnedAmountIza.add(stakingInfo.earnedAmount)
                memo.pids = [...memo.pids, stakingInfo.pid]
              }
            }
            return memo
          },
          {
            totalStakedUsd: new Fraction(JSBI.BigInt(0), JSBI.BigInt(1)),
            totalEarnedAmountIza: new TokenAmount(govToken, '0'),
            pids: [] as number[]
          }
        )
      : { totalStakedUsd: undefined, totalEarnedAmountIza: undefined, pids: [] }
  }, [stakingInfos, govToken])
}
