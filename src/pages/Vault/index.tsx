import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Col, Row, List, Statistic, Divider } from 'antd'
import { VAULT_INFO } from '../../constants/vaults'
import { useVaultsInfo } from '../../state/vault/hooks'
import { TYPE } from '../../theme'
import { RowBetween } from '../../components/Row'
import { CardSection, ExtraDataCard } from '../../components/vault/styled'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import { OutlineCard } from '../../components/Card'
import { sortByApyDaily, sortByApyYearly, sortByTvl } from '../../hooks/useFilterVaultInfos'
import CombinedTVL from '../../components/CombinedTVL'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { CustomMouseoverTooltip } from '../../components/Tooltip/custom'
import OldSelect, { OptionProps } from '../../components/Select'
import Toggle from '../../components/Toggle'
import { PROTOCOLS_MAINNET } from '../../constants/protocol'
import VaultCard from '../../components/vault/VaultCard'
import useUserVaultStats from '../../hooks/useUserVaultStats'
import { ButtonPrimary } from '../../components/Button'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useVaultChefContract } from '../../hooks/useContract'
import { useTransactionAdder } from '../../state/transactions/hooks'
import InfiniteScroll from 'react-infinite-scroll-component'

const PAGE_SIZE = 7
const NEW_ROWS = 4
const SHOW_USER_INFO_CARD = false
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
  },
  {
    label: 'Rose',
    value: 'Rose',
    img: PROTOCOLS_MAINNET.Rose.logoFilename
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

const TopSection = styled(Col)`
  max-width: 1000px;
  width: 100%;
`

const CenteredCol = styled(Col)`
  display: flex;
  text-align: center;
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

const VaultCardWrapper = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  margin-top: 6px;
`

export default function Vault() {
  const { chainId, account } = useActiveWeb3React()

  const vaultChef = useVaultChefContract()
  const vaultInfos = useVaultsInfo()
  const vaultUserInfo = useUserVaultStats(vaultInfos)
  // console.log('vaultUserInfo', vaultUserInfo)
  // console.log('totalStakedUsd', vaultUserInfo.totalStakedUsd?.toSignificant(5))
  // console.log('totalEarnedAmountxIza', vaultUserInfo.totalEarnedAmountxIza?.toSignificant(5))
  // console.log('pids', vaultUserInfo.pids)
  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (VAULT_INFO[chainId]?.length ?? 0) > 0)
  const [platformOption, setPlatformOption] = React.useState(PLATFORM_OPTIONS[0].value)
  const [sortOption, setSortOption] = React.useState(SORTING_OPTIONS[0].value)
  const [stakedOnlySelected, setStakedOnlySelected] = React.useState(false)
  const [archivedSelected, setArchivedSelected] = React.useState(false)

  // Infinite Scroll
  const [initLoading, setInitLoading] = React.useState(true)
  const [scrollLoading, setScrollLoading] = React.useState(false)
  const [numberOfItemsVisible, setNumberOfItemsVisible] = React.useState(PAGE_SIZE)
  const onLoadMore = (): void => {
    if (scrollLoading) {
      return
    }
    setScrollLoading(true)
    setNumberOfItemsVisible(numberOfItemsVisible + NEW_ROWS)
    setScrollLoading(false)
  }

  // For the Claim All functionality
  const [attempting, setAttempting] = useState(false)
  const [failed, setFailed] = useState<boolean>(false)
  const addTransaction = useTransactionAdder()

  async function onClaimRewards() {
    const summary = `Claim accumulated xIZA rewards`
    if (vaultChef && vaultUserInfo?.pids?.length > 0) {
      setAttempting(true)
      const estimatedGas = await vaultChef.estimateGas.harvest(vaultUserInfo.pids[0])

      vaultUserInfo.pids.map((pid: number) => {
        vaultChef
          .harvest(pid, {
            gasLimit: calculateGasMargin(estimatedGas)
          })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: summary
            })
          })
          .catch((error: any) => {
            setAttempting(false)
            if (error?.code === -32603) {
              setFailed(true)
            }
            console.log(error)
          })
      })
    }
  }

  const finalVaultInfos = React.useMemo(() => {
    let filteredVaults = vaultInfos
    if (platformOption !== PLATFORM_OPTIONS[0].value) {
      filteredVaults = filteredVaults.filter(vault => vault.protocol.name === platformOption)
    }
    if (sortOption === SORTING_OPTIONS[0].value) {
      filteredVaults = sortByApyYearly(filteredVaults, !archivedSelected, stakedOnlySelected)
    } else if (sortOption === SORTING_OPTIONS[1].value) {
      filteredVaults = sortByApyDaily(filteredVaults, !archivedSelected, stakedOnlySelected)
    } else if (sortOption === SORTING_OPTIONS[2].value) {
      filteredVaults = sortByTvl(filteredVaults, !archivedSelected, stakedOnlySelected)
    }
    if (initLoading && filteredVaults[0].valueOfTotalStakedAmountInUsd) {
      setInitLoading(false)
    }
    return filteredVaults.slice(0, numberOfItemsVisible)
  }, [vaultInfos, platformOption, sortOption, stakedOnlySelected, archivedSelected, numberOfItemsVisible, initLoading])

  const handlePlatformOptionChange = (option: OptionProps): void => {
    setPlatformOption(option.value)
  }
  console.log('finalVaultInfos', finalVaultInfos)

  const handlesortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  return (
    <PageWrapper gap="md" justify="center">
      <TopSection>
        <ExtraDataCard>
          <CardSection>
            <AutoColumn gap="sm">
              <TYPE.largeHeader>Vaults</TYPE.largeHeader>
            </AutoColumn>
          </CardSection>
        </ExtraDataCard>
      </TopSection>
      <TopSection>
        {SHOW_USER_INFO_CARD && vaultUserInfo.totalStakedUsd?.greaterThan('0') && (
          <Row align={'middle'} justify={'space-around'} style={{ margin: '0px' }}>
            <TopSection>
              <OutlineCard>
                <Row align={'middle'} justify={'space-around'} style={{ margin: '0' }}>
                  <CenteredCol xs={8}>
                    <Statistic
                      title="User Total Staked"
                      value={`~$${vaultUserInfo.totalStakedUsd?.toSignificant(5)}`}
                      valueStyle={{ fontSize: '17px', color: 'white', margin: '0' }}
                      style={{ margin: '0' }}
                    />
                  </CenteredCol>
                  <CenteredCol xs={8}>
                    <Statistic
                      title="Pending xIZA"
                      value={vaultUserInfo.totalEarnedAmountxIza?.toSignificant(5)}
                      valueStyle={{ fontSize: '17px', color: 'white', margin: '0' }}
                      style={{ margin: '0' }}
                    />
                  </CenteredCol>
                  <CenteredCol xs={4} offset={4} pull={2}>
                    <ButtonPrimary
                      padding="8px"
                      disabled={failed || attempting || !vaultUserInfo.totalEarnedAmountxIza?.greaterThan('0')}
                      borderRadius="8px"
                      onClick={onClaimRewards}
                    >
                      <TYPE.black style={{ margin: '0' }}>Claim All xIZA</TYPE.black>
                    </ButtonPrimary>
                    {vaultUserInfo.totalEarnedAmountxIza?.greaterThan('0') && (
                      <TYPE.black style={{ margin: '0', fontSize: '8px' }}>
                        ({vaultUserInfo.pids.length} Txns)
                      </TYPE.black>
                    )}
                  </CenteredCol>
                </Row>
              </OutlineCard>
            </TopSection>
          </Row>
        )}
        <Row align={'middle'} justify={'space-between'} style={{ marginTop: '5px', padding: '0' }}>
          <OutlineCard style={{ maxWidth: '1000px', width: '100%' }}>
            <Row align={'middle'} justify={'space-around'} style={{ margin: '0' }}>
              <Col xs={12} md={6} style={{ marginBottom: '10px' }}>
                <TYPE.black style={{ marginTop: '0.5rem' }}>
                  <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                    🏆
                  </span>
                  <CombinedTVL />
                </TYPE.black>
              </Col>
              <Col xs={12} md={0} push={6}>
                <CustomMouseoverTooltip
                  element={
                    <ToolTipContainer>
                      <RowBetween>
                        <TYPE.subHeader style={{ fontWeight: '600' }}>Fees:</TYPE.subHeader>
                      </RowBetween>
                      <RowBetween>
                        <TYPE.subHeader>0.0% - Zapping Fee</TYPE.subHeader>
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
                      <QuestionCircleOutlined style={{ fontSize: '1.2rem', alignSelf: 'end' }} />
                    </span>
                  </TYPE.body>
                </CustomMouseoverTooltip>
              </Col>
              <Col xs={12} sm={4} md={3}>
                <Row>
                  <TYPE.white>Archived</TYPE.white>
                </Row>
                <Row>
                  <Toggle isActive={archivedSelected} toggle={() => setArchivedSelected(!archivedSelected)} />
                </Row>
              </Col>
              <Col xs={12} sm={4} md={3}>
                <Row>
                  <TYPE.white>Staked</TYPE.white>
                </Row>
                <Row>
                  <Toggle isActive={stakedOnlySelected} toggle={() => setStakedOnlySelected(!stakedOnlySelected)} />
                </Row>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Row>
                  <TYPE.white marginLeft={'5px'}>Platform</TYPE.white>
                </Row>
                <Row>
                  <OldSelect options={PLATFORM_OPTIONS} onChange={handlePlatformOptionChange} />
                </Row>
              </Col>
              <Col xs={12} sm={8} md={4}>
                <Row>
                  <TYPE.white marginLeft={'5px'}>Sorting</TYPE.white>
                </Row>
                <Row>
                  <OldSelect options={SORTING_OPTIONS} onChange={handlesortOptionChange} />
                </Row>
              </Col>
              <Col xs={0} md={3} push={1} style={{ marginTop: '10px' }}>
                <CustomMouseoverTooltip
                  element={
                    <ToolTipContainer>
                      <RowBetween>
                        <TYPE.subHeader style={{ fontWeight: '600' }}>Fees:</TYPE.subHeader>
                      </RowBetween>
                      <RowBetween>
                        <TYPE.subHeader>0.0% - Zapping Fee</TYPE.subHeader>
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
                      <QuestionCircleOutlined style={{ fontSize: '1.2rem', alignSelf: 'end' }} />
                    </span>
                  </TYPE.body>
                </CustomMouseoverTooltip>
              </Col>
            </Row>
          </OutlineCard>
        </Row>
      </TopSection>
      <TopSection>
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
            <InfiniteScroll
              dataLength={numberOfItemsVisible}
              next={onLoadMore}
              hasMore={numberOfItemsVisible < vaultInfos.length}
              loader={
                <PoolSection style={{ marginTop: '10px' }}>
                  <Loader style={{ margin: 'auto' }} />
                </PoolSection>
              }
              endMessage={<Divider plain>End</Divider>}
              scrollableTarget="scrollableDiv"
              style={{ overflowY: 'hidden' }}
            >
              <List
                bordered={false}
                className="vault-list"
                itemLayout="horizontal"
                dataSource={finalVaultInfos}
                renderItem={vaultInfo => (
                  <VaultCardWrapper>
                    <VaultCard key={vaultInfo.pid} stakingInfo={vaultInfo} />
                  </VaultCardWrapper>
                )}
                style={{ rowGap: '8px' }}
              />
            </InfiniteScroll>
            // finalVaultInfos?.map(vaultInfo => {
            //   // need to sort by added liquidity here
            //   return <VaultCard key={vaultInfo.pid} stakingInfo={vaultInfo} />
            // })
          )}
        </PoolSection>
      </TopSection>
    </PageWrapper>
  )
}
