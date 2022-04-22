import { useMemo } from 'react'
import { ChainId } from '@amaterasu-fi/sdk'
import { VAULT_INFO, VaultInfo } from '../constants/vaults'

export default function useFilterVaultRewardsInfo(
  chainId: ChainId | undefined,
  active: boolean | undefined = undefined,
  pid?: number | null
): VaultInfo[] {
  return useMemo(() => {
    const pools = chainId
      ? VAULT_INFO[chainId]?.filter(vaultInfo =>
          pid === undefined ? true : pid === null ? false : pid === vaultInfo.pid
        ) ?? []
      : []

    if (active !== undefined) {
      return pools?.filter(stakingRewardInfo => stakingRewardInfo.active === active) ?? []
    }

    return pools
  }, [chainId, active, pid])
}
