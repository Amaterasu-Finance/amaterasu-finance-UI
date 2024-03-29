import { useMemo } from 'react'
import { Fraction, JSBI } from '@amaterasu-fi/sdk'
import { StakingInfo } from '../state/stake/hooks'

export default function useTotalTVL(stakingInfos: StakingInfo[]): Fraction {
  return useMemo(() => {
    return stakingInfos.reduce<Fraction>((memo, stakingInfo) => {
      if (stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd) {
        if (stakingInfo.valueOfTotalStakedAmountInUsd) {
          // Use total LP amount for TVL
          const mult = stakingInfo.totalLpTokenSupply.divide(stakingInfo.totalStakedAmount)
          memo = memo.add(stakingInfo.valueOfTotalStakedAmountInUsd.multiply(mult))
        }
      }
      return memo
    }, new Fraction(JSBI.BigInt(0), JSBI.BigInt(1)))
  }, [stakingInfos])
}
