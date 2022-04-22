import React from 'react'
// import { JSBI, BLOCKCHAIN_SETTINGS } from '@amaterasu-fi/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Col, Row } from 'antd'
import { VAULT_INFO } from '../../constants/vaults'
import { useVaultsInfo } from '../../state/vault/hooks'
import { TYPE, StyledInternalLink } from '../../theme'
import PoolCard from '../../components/vault/VaultCard'
import { CustomButtonWhite } from '../../components/Button'
import AwaitingRewards from '../../components/vault/AwaitingRewards'
import { RowBetween } from '../../components/Row'
import { CardSection, ExtraDataCard } from '../../components/vault/styled'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
// import useCalculateStakingInfoMembers from '../../hooks/useCalculateVaultInfoMembers'
import { OutlineCard } from '../../components/Card'
import useFilterVaultInfos, { sortByApyDaily, sortByApyYearly, sortByTvl } from '../../hooks/useFilterVaultInfos'
// import useTotalVaultTVL from '../../hooks/useTotalVaultTVL'
import useCalculateVaultInfoMembers from '../../hooks/useCalculateVaultInfoMembers'
import CombinedTVL from '../../components/CombinedTVL'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { CustomMouseoverTooltip } from '../../components/Tooltip/custom'
import OldSelect, { OptionProps } from '../../components/Select'
import Toggle from '../../components/Toggle'
import { PROTOCOLS_MAINNET } from '../../constants/protocol'

const PLATFORM_OPTIONS = [
  {
    label: 'All',
    value: 'all'
  },
  {
    label: 'Trisolaris',
    value: 'Trisolaris',
    img: PROTOCOLS_MAINNET.Trisolaris.logoFilename
  },
  {
    label: 'Amaterasu',
    value: 'Amaterasu',
    img: PROTOCOLS_MAINNET.Amaterasu.logoFilename
  }
]

const SORTING_OPTIONS = [
  {
    label: 'Yearly',
    value: 'yearly'
  },
  {
    label: 'Daily',
    value: 'daily'
  },
  {
    label: 'TVL',
    value: 'tvl'
  }
]

const PageWrapper = styled(AutoColumn)`
  max-width: 1000px;
  width: 100%;
`

const TopSection = styled(AutoColumn)`
  max-width: 1000px;
  width: 100%;
`

const ToolTipContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;
  margin: 0px;
  padding: 0px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 8px;
  width: 100%;
  justify-self: center;
`

export default function Vault() {
  const { chainId, account } = useActiveWeb3React()

  const vaultInfos = useVaultsInfo()
  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (VAULT_INFO[chainId]?.length ?? 0) > 0)
  const [platformOption, setPlatformOption] = React.useState(PLATFORM_OPTIONS[0].value)
  const [sortOption, setSortOption] = React.useState(SORTING_OPTIONS[0].value)
  const [stakedOnlySelected, setStakedOnlySelected] = React.useState(false)

  const activeVaultInfos = useFilterVaultInfos(vaultInfos)
  const inactiveVaultInfos = useFilterVaultInfos(vaultInfos, false)
  const stakingInfoStats = useCalculateVaultInfoMembers(chainId)
  const hasArchivedStakingPools =
    (stakingInfoStats?.inactive && stakingInfoStats?.inactive > 0) || inactiveVaultInfos?.length > 0

  const finalVaultInfos = React.useMemo(() => {
    // TODO - fix for stakedOnlySelected
    let filteredVaults = activeVaultInfos
    if (platformOption !== PLATFORM_OPTIONS[0].value) {
      filteredVaults = filteredVaults.filter(vault => vault.protocol.name === platformOption)
    }
    if (sortOption === SORTING_OPTIONS[0].value) {
      return sortByApyYearly(filteredVaults, true, stakedOnlySelected)
    } else if (sortOption === SORTING_OPTIONS[1].value) {
      return sortByApyDaily(filteredVaults, true, stakedOnlySelected)
    } else if (sortOption === SORTING_OPTIONS[2].value) {
      return sortByTvl(filteredVaults, true, stakedOnlySelected)
    }
    return filteredVaults
  }, [activeVaultInfos, vaultInfos, platformOption, sortOption, stakedOnlySelected])

  const handlePlatformOptionChange = (option: OptionProps): void => {
    setPlatformOption(option.value)
  }

  const handlesortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="md">
        <ExtraDataCard>
          <CardSection>
            <AutoColumn gap="md">
              <TYPE.largeHeader>Vaults</TYPE.largeHeader>
            </AutoColumn>
            <TYPE.largeHeader fontSize={50}>STILL TESTING - USE AT OWN RISK</TYPE.largeHeader>
          </CardSection>
        </ExtraDataCard>
      </TopSection>

      <TopSection gap="lg">
        <Row style={{ alignItems: 'baseline', justifyContent: 'space-between', margin: '10px' }}>
          <Col span={6}>
            <TYPE.black style={{ marginTop: '0.5rem' }}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                🏆
              </span>
              <CombinedTVL />
            </TYPE.black>
            {hasArchivedStakingPools && (
              <RowBetween>
                <StyledInternalLink to={`/vaults/archived`}>
                  <CustomButtonWhite padding="8px" borderRadius="8px">
                    Archived Vaults
                  </CustomButtonWhite>
                </StyledInternalLink>
              </RowBetween>
            )}
          </Col>
          <Col style={{ marginTop: '10px' }}>
            <Row>
              <TYPE.white>Show Staked</TYPE.white>
            </Row>
            <Row>
              <Toggle isActive={stakedOnlySelected} toggle={() => setStakedOnlySelected(!stakedOnlySelected)} />
            </Row>
          </Col>
          <Col style={{ marginTop: '10px' }}>
            <Row>
              <TYPE.white marginLeft={'5px'}>Platform</TYPE.white>
            </Row>
            <Row>
              <OldSelect options={PLATFORM_OPTIONS} onChange={handlePlatformOptionChange} />
            </Row>
          </Col>
          <Col style={{ marginTop: '10px' }}>
            <Row>
              <TYPE.white marginLeft={'5px'}>Sorting</TYPE.white>
            </Row>
            <Row>
              <OldSelect options={SORTING_OPTIONS} onChange={handlesortOptionChange} />
            </Row>
          </Col>
          <Col style={{ marginTop: '10px' }} offset={2}>
            <CustomMouseoverTooltip
              element={
                <ToolTipContainer>
                  <RowBetween>
                    <TYPE.subHeader style={{ fontWeight: '600' }}>Fees:</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.subHeader>0.0% - Deposit Fee</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.subHeader>0.1% - Withdraw Fee</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.subHeader style={{ fontWeight: '600' }}>Fees on Rewards:</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.subHeader>1.0% - Automation Fee to pay for compounding</TYPE.subHeader>
                  </RowBetween>
                  <RowBetween>
                    <TYPE.subHeader>3.0% - IZA buy+burn for all non-native vaults</TYPE.subHeader>
                  </RowBetween>
                </ToolTipContainer>
              }
            >
              <TYPE.body style={{ marginRight: '1rem' }}>
                Fees
                <span role="img" aria-label="wizard-icon" style={{ marginLeft: '0.2rem' }}>
                  <QuestionCircleOutlined style={{ fontSize: '1.2rem', alignSelf: 'center' }} />
                </span>
              </TYPE.body>
            </CustomMouseoverTooltip>
          </Col>
        </Row>

        <AwaitingRewards />

        <PoolSection>
          {account && stakingRewardsExist && vaultInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : account && !stakingRewardsExist ? (
            <OutlineCard>No active vaults</OutlineCard>
          ) : account && vaultInfos?.length !== 0 && !finalVaultInfos ? (
            <OutlineCard>No active vaults</OutlineCard>
          ) : !account ? (
            <OutlineCard>Please connect your wallet to see available vaults</OutlineCard>
          ) : (
            finalVaultInfos?.map(vaultInfo => {
              // need to sort by added liquidity here
              return <PoolCard key={vaultInfo.pid} stakingInfo={vaultInfo} isArchived={false} />
            })
          )}
        </PoolSection>
      </TopSection>
    </PageWrapper>
  )
}
