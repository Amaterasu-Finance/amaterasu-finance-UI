import { useMemo } from 'react'
import { Fraction, JSBI, TokenAmount } from '@amaterasu-fi/sdk'
import { VaultsInfo } from '../state/vault/hooks'
import usePitToken from './usePitToken'

export default function useUserVaultStats(stakingInfos: VaultsInfo[]): Record<string, any> {
  const xgovToken = usePitToken()
  return useMemo(() => {
    return xgovToken
      ? stakingInfos.reduce(
          (memo, stakingInfo) => {
            if (stakingInfo) {
              if (stakingInfo.stakedAmountUsd?.greaterThan('0')) {
                memo.totalStakedUsd = memo.totalStakedUsd.add(stakingInfo.stakedAmountUsd)
              }
              if (stakingInfo.earnedAmountxIza?.greaterThan('0')) {
                memo.totalEarnedAmountxIza = memo.totalEarnedAmountxIza.add(stakingInfo.earnedAmountxIza)
                memo.pids = [...memo.pids, stakingInfo.pid]
              }
            }
            return memo
          },
          {
            totalStakedUsd: new Fraction(JSBI.BigInt(0), JSBI.BigInt(1)),
            totalEarnedAmountxIza: new TokenAmount(xgovToken, '0'),
            pids: [] as number[]
          }
        )
      : { totalStakedUsd: undefined, totalEarnedAmountxIza: undefined, pids: [] }
  }, [stakingInfos, xgovToken])
}
