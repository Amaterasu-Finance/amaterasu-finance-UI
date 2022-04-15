import { useMemo } from 'react'
import { Fraction, JSBI } from '@amaterasu-fi/sdk'
import { VaultsInfo } from '../state/vault/hooks'

export default function useTotalVaultTVL(stakingInfos: VaultsInfo[]): Fraction {
  return useMemo(() => {
    return stakingInfos.reduce<Fraction>((memo, stakingInfo) => {
      // console.log('stakingInfo', stakingInfo.pid, stakingInfo)
      if (stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd) {
        if (stakingInfo.valueOfTotalStakedAmountInUsd) {
          memo = memo.add(stakingInfo.valueOfTotalStakedAmountInUsd)
        }
      }
      return memo
    }, new Fraction(JSBI.BigInt(0), JSBI.BigInt(1)))
  }, [stakingInfos])
}
