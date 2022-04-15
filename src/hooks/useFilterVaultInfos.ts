import { useMemo } from 'react'
import { VaultsInfo } from '../state/vault/hooks'

export default function useFilterStakingInfos(
  stakingInfos: VaultsInfo[],
  isActive: boolean | undefined = undefined,
  onlyStaked: boolean | undefined = undefined
): VaultsInfo[] {
  return useMemo(() => {
    if (isActive !== undefined) {
      stakingInfos = stakingInfos.filter(s => s.active === isActive)
    }

    if (onlyStaked !== undefined) {
      return stakingInfos
        .filter(s => s.earnedAmountxIza.greaterThan('0'))
        .sort((a, b) => {
          if (a.earnedAmountxIza === undefined || b.earnedAmountxIza === undefined) {
            return 0
          }
          return b.earnedAmountxIza.greaterThan(a.earnedAmountxIza) ? 1 : -1
        })
    }

    return stakingInfos.sort((a, b) => {
      if (a.apr === undefined || b.apr === undefined) {
        return 0
      }
      return b.apr.greaterThan(a.apr) ? 1 : -1
    })
  }, [stakingInfos, isActive, onlyStaked])
}
