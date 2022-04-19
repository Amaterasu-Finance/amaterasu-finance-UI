import React from 'react'
// import { JSBI, BLOCKCHAIN_SETTINGS } from '@amaterasu-fi/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { VAULT_INFO } from '../../constants/vaults'
import { useVaultsInfo } from '../../state/vault/hooks'
import { TYPE, StyledInternalLink } from '../../theme'
import PoolCard from '../../components/vault/PoolCard'
import { CustomButtonWhite } from '../../components/Button'
import AwaitingRewards from '../../components/vault/AwaitingRewards'
import { RowBetween } from '../../components/Row'
import { CardSection, ExtraDataCard } from '../../components/vault/styled'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
// import useCalculateStakingInfoMembers from '../../hooks/useCalculateVaultInfoMembers'
import { OutlineCard } from '../../components/Card'
import useFilterVaultInfos from '../../hooks/useFilterVaultInfos'
// import useTotalVaultTVL from '../../hooks/useTotalVaultTVL'
import useCalculateVaultInfoMembers from '../../hooks/useCalculateVaultInfoMembers'
import CombinedTVL from '../../components/CombinedTVL'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 15px;
  width: 100%;
  justify-self: center;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToSmall`
flex-direction: column;
`};
`

export default function Vault() {
  const { chainId, account } = useActiveWeb3React()

  const vaultInfos = useVaultsInfo()
  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (VAULT_INFO[chainId]?.length ?? 0) > 0)

  const activeVaultInfos = useFilterVaultInfos(vaultInfos)
  const inactiveVaultInfos = useFilterVaultInfos(vaultInfos, false)
  const stakingInfoStats = useCalculateVaultInfoMembers(chainId)
  const hasArchivedStakingPools =
    (stakingInfoStats?.inactive && stakingInfoStats?.inactive > 0) || inactiveVaultInfos?.length > 0

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <ExtraDataCard>
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.largeHeader>Vaults</TYPE.largeHeader>
              </RowBetween>
              <RowBetween>
                <TYPE.black style={{ marginTop: '0.5rem' }}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                    🏆
                  </span>
                  <CombinedTVL />
                </TYPE.black>
              </RowBetween>
              {hasArchivedStakingPools && (
                <RowBetween>
                  <StyledInternalLink to={`/staking/archived`}>
                    <CustomButtonWhite padding="8px" borderRadius="8px">
                      Archived Vaults
                    </CustomButtonWhite>
                  </StyledInternalLink>
                </RowBetween>
              )}
            </AutoColumn>
          </CardSection>
        </ExtraDataCard>
      </TopSection>

      <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
        <DataRow style={{ alignItems: 'baseline' }}>
          <TYPE.mediumHeader style={{ marginTop: '0.5rem' }}>Vaults</TYPE.mediumHeader>
        </DataRow>

        <AwaitingRewards />

        <PoolSection>
          {account && stakingRewardsExist && vaultInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : account && !stakingRewardsExist ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : account && vaultInfos?.length !== 0 && !activeVaultInfos ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : !account ? (
            <OutlineCard>Please connect your wallet to see available pools</OutlineCard>
          ) : (
            activeVaultInfos?.map(stakingInfo => {
              // need to sort by added liquidity here
              return <PoolCard key={stakingInfo.pid} stakingInfo={stakingInfo} isArchived={false} />
            })
          )}
        </PoolSection>
      </AutoColumn>
    </PageWrapper>
  )
}