import React from 'react'
// import { useStakingInfo } from '../../state/stake/hooks'
import { useActiveWeb3React } from '../../hooks'
import useTotalCombinedTVL from '../../hooks/useTotalCombinedTVL'
import { CustomMouseoverTooltip } from '../Tooltip/custom'
import { PIT_SETTINGS } from '../../constants'
// import useFilterStakingInfos from '../../hooks/useFilterStakingInfos'

export default function CombinedTVL({}) {
  const { chainId } = useActiveWeb3React()
  const pitSettings: Record<string, string> | undefined = chainId ? PIT_SETTINGS[chainId] : undefined
  const TVLs = useTotalCombinedTVL()
  // console.log('TVLs', TVLs.totalVaultTVL && TVLs.totalVaultTVL.toSignificant(10))

  return (
    <>
      {TVLs?.stakingPoolTVL?.greaterThan('0') && (
        <CustomMouseoverTooltip
          element={
            <>
              {TVLs.stakingPoolTVL?.greaterThan('0') && (
                <>
                  <b>Farm:</b> $
                  {TVLs.stakingPoolTVL.toSignificant(8, {
                    groupSeparator: ','
                  })}
                  <br />
                </>
              )}
              {TVLs.totalVaultTVL?.greaterThan('0') && (
                <>
                  <b>Vaults:</b> ${TVLs.totalVaultTVL.toSignificant(8, { groupSeparator: ',' })}
                  <br />
                </>
              )}
              {TVLs.totalPitTVL?.greaterThan('0') && (
                <>
                  <b>{pitSettings?.name}:</b> ${TVLs.totalPitTVL.toSignificant(8, { groupSeparator: ',' })}
                  <br />
                </>
              )}
              {TVLs.totalCombinedTVL?.greaterThan('0') && (
                <>
                  <b>Total:</b> ${TVLs.totalCombinedTVL.toSignificant(8, { groupSeparator: ',' })}
                </>
              )}
            </>
          }
        >
          {TVLs.totalCombinedTVL?.greaterThan('0') && (
            <>TVL: ${TVLs.totalCombinedTVL.toSignificant(8, { groupSeparator: ',' })}</>
          )}
        </CustomMouseoverTooltip>
      )}
    </>
  )
}
