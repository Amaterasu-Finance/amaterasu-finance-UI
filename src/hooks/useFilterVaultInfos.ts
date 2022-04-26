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

    if (onlyStaked === true) {
      return stakingInfos
        .filter(s => s.stakedAmount && s.stakedAmount.greaterThan('0'))
        .sort((a, b) => {
          if (a.stakedAmount === undefined || b.stakedAmount === undefined) {
            return 0
          }
          return b.stakedAmount.greaterThan(a.stakedAmount) ? 1 : -1
        })
    }

    return stakingInfos.sort((a, b) => {
      if (a.apy === undefined || b.apy === undefined) {
        return 0
      }
      return b.apy > a.apy ? 1 : -1
    })
  }, [stakingInfos, isActive, onlyStaked])
}

export function sortByApyDaily(stakingInfos: VaultsInfo[], isActive = true, onlyStaked = false): VaultsInfo[] {
  if (isActive) {
    stakingInfos = stakingInfos.filter(s => s.active === isActive)
  }
  if (onlyStaked) {
    stakingInfos = stakingInfos.filter(s => s.stakedAmount && s.stakedAmount.greaterThan('0'))
  }
  return stakingInfos.sort((a, b) => {
    if (a.apyDaily === undefined || b.apyDaily === undefined) {
      return 0
    }
    return b.apyDaily > a.apyDaily ? 1 : -1
  })
}

export function sortByApyYearly(stakingInfos: VaultsInfo[], isActive = true, onlyStaked = false): VaultsInfo[] {
  if (isActive) {
    stakingInfos = stakingInfos.filter(s => s.active === isActive)
  }
  if (onlyStaked) {
    stakingInfos = stakingInfos.filter(s => s.stakedAmount && s.stakedAmount.greaterThan('0'))
  }
  return stakingInfos.sort((a, b) => {
    if (a.apy === undefined || b.apy === undefined) {
      return 0
    }
    return b.apy > a.apy ? 1 : -1
  })
}

export function sortByTvl(stakingInfos: VaultsInfo[], isActive = true, onlyStaked = false): VaultsInfo[] {
  if (isActive) {
    stakingInfos = stakingInfos.filter(s => s.active === isActive)
  }
  if (onlyStaked) {
    stakingInfos = stakingInfos.filter(s => s.stakedAmount && s.stakedAmount.greaterThan('0'))
  }
  return stakingInfos.sort((a, b) => {
    if (a.valueOfTotalStakedAmountInUsd === undefined || b.valueOfTotalStakedAmountInUsd === undefined) {
      return 0
    }
    return b.valueOfTotalStakedAmountInUsd.greaterThan(a.valueOfTotalStakedAmountInUsd) ? 1 : -1
  })
}
