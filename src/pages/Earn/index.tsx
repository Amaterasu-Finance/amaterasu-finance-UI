import React, { useState } from 'react'
import { JSBI, BLOCKCHAIN_SETTINGS } from '@amaterasu-fi/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { STAKING_REWARDS_INFO } from '../../constants/staking'
import { TYPE, StyledInternalLink } from '../../theme'
import PoolCard from '../../components/earn/PoolCard'
import { ButtonPrimary, CustomButtonWhite } from '../../components/Button'
import { RowBetween } from '../../components/Row'
import { CardSection, ExtraDataCard } from '../../components/earn/styled'
import Loader from '../../components/Loader'
import { useActiveWeb3React } from '../../hooks'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import useCalculateStakingInfoMembers from '../../hooks/useCalculateStakingInfoMembers'
import useTotalCombinedTVL from '../../hooks/useTotalCombinedTVL'
import useBaseStakingRewardsEmission from '../../hooks/useBaseStakingRewardsEmission'
import { OutlineCard } from '../../components/Card'
import useFilterStakingInfos, { sortByApyYearly, sortByTvl } from '../../hooks/useFilterStakingInfos'
import CombinedTVL from '../../components/CombinedTVL'
import OldSelect, { OptionProps } from '../../components/Select'
import { Col, Row, Statistic } from 'antd'
import Toggle from '../../components/Toggle'
import useUserStakeStats from '../../hooks/useUserStakeStats'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useMasterBreederContract } from '../../hooks/useContract'

const SORTING_OPTIONS = [
  {
    label: 'Yearly',
    value: 'yearly'
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

const CenteredCol = styled(Col)`
  display: flex;
  text-align: center;
`

const TopSection = styled(Col)`
  max-width: 1000px;
  width: 100%;
  padding: 0;
`

const PoolSection = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  column-gap: 10px;
  row-gap: 8px;
  width: 100%;
  justify-self: center;
`

export default function Earn() {
  const { chainId, account } = useActiveWeb3React()
  const govToken = useGovernanceToken()
  const blockchainSettings = chainId ? BLOCKCHAIN_SETTINGS[chainId] : undefined

  const TVLs = useTotalCombinedTVL()
  const stakingInfos = TVLs.stakingInfos
  const stakeUserInfo = useUserStakeStats(stakingInfos)

  // For the Claim All functionality
  const masterchefContract = useMasterBreederContract()
  const [attempting, setAttempting] = useState(false)
  const [failed, setFailed] = useState<boolean>(false)
  const addTransaction = useTransactionAdder()

  async function onClaimRewards() {
    const summary = `Claim + AutoStake accumulated IZA rewards`
    if (masterchefContract && stakeUserInfo?.pids?.length > 0) {
      setAttempting(true)
      const estimatedGas = await masterchefContract.estimateGas.claimReward(stakeUserInfo.pids[0], true)

      stakeUserInfo.pids.map((pid: number) => {
        masterchefContract
          .claimReward(pid, true, {
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
      setAttempting(false)
    }
  }

  /**
   * only show staking cards with balance
   * @todo only account for this if rewards are inactive
   */
  const stakingRewardsExist = Boolean(typeof chainId === 'number' && (STAKING_REWARDS_INFO[chainId]?.length ?? 0) > 0)
  const [sortOption, setSortOption] = React.useState(SORTING_OPTIONS[0].value)
  const [stakedOnlySelected, setStakedOnlySelected] = React.useState(false)

  const baseEmissions = useBaseStakingRewardsEmission()
  const blocksPerMinute = 60
  const emissionsPerMinute =
    baseEmissions && blockchainSettings ? baseEmissions.multiply(JSBI.BigInt(blocksPerMinute)) : undefined

  const activeStakingInfos = useFilterStakingInfos(stakingInfos)
  const inactiveStakingInfos = useFilterStakingInfos(stakingInfos, false)
  const stakingInfoStats = useCalculateStakingInfoMembers(chainId)
  const hasArchivedStakingPools =
    (stakingInfoStats?.inactive && stakingInfoStats?.inactive > 0) || inactiveStakingInfos?.length > 0

  const finalStakingInfos = React.useMemo(() => {
    if (sortOption === SORTING_OPTIONS[0].value) {
      return sortByApyYearly(stakingInfos, true, stakedOnlySelected)
    } else {
      return sortByTvl(stakingInfos, true, stakedOnlySelected)
    }
  }, [activeStakingInfos, stakingInfos, sortOption, stakedOnlySelected])

  const handlesortOptionChange = (option: OptionProps): void => {
    setSortOption(option.value)
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection>
        <ExtraDataCard style={{ marginBottom: '5px' }}>
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>{govToken?.symbol} liquidity mining</TYPE.white>
              </RowBetween>
              <RowBetween>
                <TYPE.white fontSize={14}>
                  Deposit your Liquidity Provider tokens to receive {govToken?.symbol}
                </TYPE.white>
              </RowBetween>{' '}
              {hasArchivedStakingPools && (
                <RowBetween>
                  <StyledInternalLink to={`/staking/archived`}>
                    <CustomButtonWhite padding="8px" borderRadius="8px">
                      Archived Farms
                    </CustomButtonWhite>
                  </StyledInternalLink>
                </RowBetween>
              )}
            </AutoColumn>
          </CardSection>
        </ExtraDataCard>
        <OutlineCard>
          <Row align={'middle'} justify={'space-between'} style={{ margin: '0px' }}>
            <Col style={{ margin: '0' }} xs={0} sm={6}>
              <TYPE.mediumHeader style={{ marginLeft: '0.5rem' }}>Farms</TYPE.mediumHeader>
            </Col>
            <Col style={{ marginRight: '20px' }} xs={2} sm={2}>
              <Row>
                <TYPE.white>Staked</TYPE.white>
              </Row>
              <Row>
                <Toggle isActive={stakedOnlySelected} toggle={() => setStakedOnlySelected(!stakedOnlySelected)} />
              </Row>
            </Col>
            <Col style={{ margin: '0' }} xs={6} sm={2}>
              <Row>
                <TYPE.white marginLeft={'5px'}>Sorting</TYPE.white>
              </Row>
              <Row>
                <OldSelect options={SORTING_OPTIONS} onChange={handlesortOptionChange} />
              </Row>
            </Col>
            <Col style={{ display: 'flex', justifyContent: 'end' }} xs={8} sm={8}>
              <TYPE.black style={{ marginRight: '0.5rem' }}>
                <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                  🏆
                </span>
                <CombinedTVL />
              </TYPE.black>
            </Col>
          </Row>
        </OutlineCard>
        {stakeUserInfo.totalStakedUsd?.greaterThan('0') && (
          <Row align={'middle'} justify={'center'} style={{ margin: '5px 0 0 0' }}>
            <TopSection>
              <OutlineCard>
                <Row align={'middle'} justify={'center'} style={{ margin: '0' }}>
                  <CenteredCol xs={0} md={2} />
                  <CenteredCol xs={8} md={4}>
                    <Statistic
                      title="User Total Staked"
                      value={`~$${stakeUserInfo.totalStakedUsd?.toSignificant(6, { groupSeparator: ',' })}`}
                      valueStyle={{ fontSize: '17px', color: 'white', margin: '0' }}
                      style={{ margin: '0' }}
                    />
                  </CenteredCol>
                  <CenteredCol xs={0} md={4} />
                  <CenteredCol xs={8} md={4}>
                    <Statistic
                      title="Pending xIZA"
                      value={stakeUserInfo.totalEarnedAmountIza?.toSignificant(5)}
                      valueStyle={{ fontSize: '17px', color: 'white', margin: '0' }}
                      style={{ margin: '0' }}
                    />
                  </CenteredCol>
                  <CenteredCol xs={0} md={4} />
                  <CenteredCol xs={24} sm={4}>
                    {/*{vaultUserInfo.totalEarnedAmountxIza?.greaterThan('0') && (*/}
                    {/*  <TYPE.black style={{ margin: '0', fontSize: '12px' }}>*/}
                    {/*    ({vaultUserInfo.pids.length} Txns)*/}
                    {/*  </TYPE.black>*/}
                    {/*)}*/}
                    <ButtonPrimary
                      padding="8px"
                      disabled={failed || attempting || !stakeUserInfo.totalEarnedAmountIza?.greaterThan('0')}
                      borderRadius="8px"
                      onClick={onClaimRewards}
                    >
                      <TYPE.black style={{ margin: '0' }}>Claim + AutoStake All IZA</TYPE.black>
                    </ButtonPrimary>
                  </CenteredCol>
                  <CenteredCol xs={0} md={2} />
                </Row>
              </OutlineCard>
            </TopSection>
          </Row>
        )}
      </TopSection>
      <TopSection>
        <PoolSection>
          {account && stakingRewardsExist && stakingInfos?.length === 0 ? (
            <Loader style={{ margin: 'auto' }} />
          ) : account && !stakingRewardsExist ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : account && stakingInfos?.length !== 0 && !activeStakingInfos ? (
            <OutlineCard>No active pools</OutlineCard>
          ) : !account ? (
            <OutlineCard>Please connect your wallet to see available pools</OutlineCard>
          ) : (
            finalStakingInfos?.map(stakingInfo => {
              // need to sort by added liquidity here
              return <PoolCard key={stakingInfo.pid} stakingInfo={stakingInfo} isArchived={false} />
            })
          )}
        </PoolSection>

        {stakingRewardsExist && baseEmissions && (
          <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              ☁️
            </span>
            The base emission rate is currently{' '}
            <b>{baseEmissions.multiply('86400').toSignificant(4, { groupSeparator: ',' })}</b> {govToken?.symbol} per
            day.
            <br />
            <b>{emissionsPerMinute?.toSignificant(4, { groupSeparator: ',' })}</b> {govToken?.symbol} will be minted
            every minute given the current emission schedule.
            <br />
            <br />
            <TYPE.small style={{ textAlign: 'center' }} fontSize={10}>
              * = The APR is calculated using a very simplified formula, it might not fully represent the exact APR
              <br />
              when factoring in the dynamic emission schedule and the locked/unlocked rewards vesting system.
            </TYPE.small>
          </TYPE.main>
        )}
      </TopSection>
    </PageWrapper>
  )
}
