import { ChainId } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import { VAULT_INFO } from '../constants/vaults'

export default function useCalculateVaultInfoMembers(chainId: ChainId | undefined): Record<string, number | undefined> {
  return useMemo(() => {
    const activeStakingInfos = chainId
      ? VAULT_INFO[chainId as ChainId]?.filter(stakingRewardInfo => stakingRewardInfo.active)
      : []
    const inactiveStakingInfos = chainId
      ? VAULT_INFO[chainId as ChainId]?.filter(stakingRewardInfo => !stakingRewardInfo.active)
      : []

    return {
      active: activeStakingInfos?.length,
      inactive: inactiveStakingInfos?.length
    }
  }, [chainId])
}
