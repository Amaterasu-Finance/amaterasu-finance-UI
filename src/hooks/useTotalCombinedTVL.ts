import { useMemo } from 'react'
import useTotalTVL from './useTotalTVL'
import useTotalVaultTVL from './useTotalVaultTVL'
import usePitTVL from './usePitTVL'
import { useStakingInfo } from '../state/stake/hooks'
import { useVaultsInfo } from '../state/vault/hooks'

export default function useTotalCombinedTVL(): Record<string, any> {
  const stakingInfos = useStakingInfo()
  const vaultInfos = useVaultsInfo()
  const totalStakingPoolTVL = useTotalTVL(stakingInfos)
  const totalVaultTVL = useTotalVaultTVL(vaultInfos)
  const totalPitTVL = usePitTVL()

  return useMemo(() => {
    return {
      stakingPoolTVL: totalStakingPoolTVL ? totalStakingPoolTVL : undefined,
      totalPitTVL: totalPitTVL ? totalPitTVL : undefined,
      totalVaultTVL: totalVaultTVL ? totalVaultTVL : undefined,
      totalCombinedTVL:
        totalVaultTVL && totalStakingPoolTVL && totalPitTVL
          ? totalStakingPoolTVL.add(totalPitTVL).add(totalVaultTVL)
          : undefined,
      stakingInfos: stakingInfos,
      vaultInfos: vaultInfos
    }
  }, [totalVaultTVL, totalStakingPoolTVL, totalPitTVL])
}
