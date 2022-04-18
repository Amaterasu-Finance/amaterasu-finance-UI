import { useMemo } from 'react'
import useTotalTVL from './useTotalTVL'
import usePitTVL from './usePitTVL'
import { useStakingInfo } from '../state/stake/hooks'
// import { useVaultsInfo } from '../state/vault/hooks'
// import useTotalVaultTVL from './useTotalVaultTVL'

export default function useTotalCombinedTVL(): Record<string, any> {
  const stakingInfos = useStakingInfo()
  const totalStakingPoolTVL = useTotalTVL(stakingInfos)
  // const vaultInfos = useVaultsInfo()
  // const totalVaultTVL = useTotalVaultTVL(vaultInfos)
  const totalPitTVL = usePitTVL()

  return useMemo(() => {
    return {
      stakingPoolTVL: totalStakingPoolTVL ? totalStakingPoolTVL : undefined,
      totalPitTVL: totalPitTVL ? totalPitTVL : undefined,
      totalVaultTVL: undefined, //totalVaultTVL,
      totalCombinedTVL:
        totalStakingPoolTVL && totalPitTVL
          ? totalStakingPoolTVL.add(totalPitTVL) //.add(totalVaultTVL)
          : undefined,
      stakingInfos: stakingInfos,
      vaultInfos: undefined
    }
  }, [stakingInfos, totalStakingPoolTVL, totalPitTVL])
}
