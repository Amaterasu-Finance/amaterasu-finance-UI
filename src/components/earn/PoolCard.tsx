import React, { useState } from 'react'
// import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
// import { JSBI } from '@amaterasu-fi/sdk'
import { ButtonPrimary } from '../Button'
import { StakingInfo } from '../../state/stake/hooks'
import { Break } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import useBUSDPrice from '../../hooks/useBUSDPrice'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import ClaimRewardModal from './ClaimRewardModal'
import { Avatar, Badge, Card, Col, Row, Statistic } from 'antd'
import { AutoColumn } from '../Column'
import { AutoRow, RowBetween } from '../Row'
import ZapModal from './ZapModal'
import StakingModal from './StakingModal'
import ModifiedUnstakingModal from './ModifiedUnstakingModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import izaLogo from '../../assets/images/iza-blue.png'
import { GreyCard } from '../Card'
import { CardSection } from '../vault/styled'

const HeaderClickable = styled.div`
  cursor: pointer;
  border-radius: 8px;
  padding: 0;
  margin: 0;
  &:disabled {
    cursor: auto;
  }
  > * {
    user-select: none;
  }
`

const ColumnWrapper = styled.div`
  display: flex;
  justify-content: start;
  align-items: start;
`

const HidingCol = styled(Col)`
  padding: 0;
  margin: 0;
  display: grid;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const HidingStatistic = styled(Statistic)`
  margin: 0;
  display: grid;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
   flex-direction: column;
   margin: 1px;
 `};
`

const Wrapper = styled(Card)<{ showBackground: boolean }>`
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
  align-items: start;
  padding: 0;
  z-index: 1;
  box-shadow: ${({ theme }) => theme.bg1} 0 2px 8px 0;
  position: relative;
  background: ${({ theme }) => theme.bg1};
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  &:hover {
    box-shadow: #f3841e 0 1px 6px;
  }
`

const StyledStatCard = styled(GreyCard)`
  padding: 5px;
  min-height: 160px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 110px;
  `};
`

const StyledVaultActionCard = ({ children, badgeValue }: any) => {
  return (
    <StyledStatCard>
      <CardSection style={{ width: '100%' }}>
        {badgeValue != undefined && (
          <AutoColumn>
            <Badge.Ribbon text={badgeValue} placement={'end'} color={'green'} />
          </AutoColumn>
        )}
        {children}
      </CardSection>
    </StyledStatCard>
  )
}

export default function PoolCard({ stakingInfo, isArchived }: { stakingInfo: StakingInfo; isArchived: boolean }) {
  const { account } = useActiveWeb3React()
  const govToken = useGovernanceToken()
  const govTokenPrice = useBUSDPrice(govToken)

  const [showZapModal, setShowZapModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const userLiquidityUnstakedUsd = userLiquidityUnstaked && stakingInfo.pricePerLpToken?.multiply(userLiquidityUnstaked)

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))
  const defaultOpen = isStaking || Boolean(userLiquidityUnstaked && userLiquidityUnstaked?.greaterThan('0'))
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen)

  React.useEffect(() => {
    setIsOpen(defaultOpen)
  }, [defaultOpen])

  const pendingIzaUsd =
    govTokenPrice && stakingInfo.earnedAmount && stakingInfo.earnedAmount.multiply(govTokenPrice.adjusted)
  // if less than $0.01, then just show `<$0.01`
  const pendingIzaUsdString =
    pendingIzaUsd &&
    (pendingIzaUsd.equalTo('0')
      ? '$0'
      : pendingIzaUsd.multiply('100').lessThan('1')
      ? '<$0.01'
      : `$${pendingIzaUsd.toFixed(2)}`)

  // get the color of the token
  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)

  return (
    <Wrapper showBackground={false} bodyStyle={{ padding: '0.7rem' }}>
      <HeaderClickable onClick={() => setIsOpen(!isOpen)} style={{ padding: '0px', margin: '0px' }}>
        <AutoRow justify={'space-between'} margin={'0'}>
          <AutoColumn className="gutter-row" style={{ minWidth: '250px' }}>
            <AutoRow justify={'start'} margin={'0'} style={{ padding: '0', marginRight: '10px' }}>
              <ColumnWrapper style={{ paddingLeft: '20px' }}>
                <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={40} />
                <TYPE.white fontWeight={600} fontSize={20} style={{ marginLeft: '10px' }}>
                  {currency0.symbol}-{currency1.symbol}
                </TYPE.white>
              </ColumnWrapper>
            </AutoRow>

            {/*<StyledInternalLink*/}
            {/*  to={`/staking/${currencyId(currency0)}/${currencyId(currency1)}`}*/}
            {/*  style={{ width: '100%' }}*/}
            {/*>*/}
            {/*  <ButtonPrimary padding="8px" borderRadius="8px">*/}
            {/*    {isStaking || isArchived ? 'Manage' : 'Deposit'}*/}
            {/*  </ButtonPrimary>*/}
            {/*</StyledInternalLink>*/}
          </AutoColumn>
          <HidingCol>
            <ColumnWrapper>
              <HidingStatistic
                title="TVL"
                value={
                  stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd
                    ? `$${stakingInfo.valueOfTotalStakedAmountInUsd.toFixed(0, { groupSeparator: ',' })}`
                    : '-'
                }
                valueStyle={{ fontSize: '17px', color: 'white', margin: '0' }}
                style={{ margin: '0' }}
              />
            </ColumnWrapper>
          </HidingCol>
          <AutoColumn>
            <Statistic
              title="APR"
              value={stakingInfo.apr ? `${stakingInfo.apr.multiply('100').toSignificant(4)}%` : 'TBD'}
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </AutoColumn>
          <HidingCol style={{ paddingRight: '50px' }}>
            <HidingStatistic
              title="Deposit Fee"
              value={typeof stakingInfo.depositFee === 'number' ? `${stakingInfo.depositFee.toFixed(1)}%` : '-'}
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </HidingCol>
        </AutoRow>
      </HeaderClickable>

      {isOpen && (
        <>
          <Break style={{ margin: '15px' }} />
          {stakingInfo && (
            <>
              <ZapModal isOpen={showZapModal} onDismiss={() => setShowZapModal(false)} stakingInfo={stakingInfo} />
              <StakingModal
                isOpen={showDepositModal}
                onDismiss={() => setShowDepositModal(false)}
                stakingInfo={stakingInfo}
                userLiquidityUnstaked={userLiquidityUnstaked}
              />
              <ModifiedUnstakingModal
                isOpen={showWithdrawModal}
                onDismiss={() => setShowWithdrawModal(false)}
                stakingInfo={stakingInfo}
              />
              <ClaimRewardModal
                isOpen={showClaimRewardModal}
                onDismiss={() => setShowClaimRewardModal(false)}
                stakingInfo={stakingInfo}
                autostake={true}
              />
            </>
          )}
          <AutoRow justify={'space-between'}>
            <AutoColumn gap="lg" style={{ width: '100%' }}>
              <DataRow style={{ gap: '12px', margin: 0 }}>
                <StyledVaultActionCard
                  badgeValue={
                    userLiquidityUnstakedUsd
                      ? `$${userLiquidityUnstakedUsd.toSignificant(5, { groupSeparator: ',' })}`
                      : undefined
                  }
                >
                  <AutoRow justify="start" marginLeft="1.5rem">
                    <Statistic
                      title="Wallet Balance"
                      value={
                        userLiquidityUnstaked
                          ? userLiquidityUnstaked.toSignificant(5, {
                              groupSeparator: ','
                            })
                          : '-'
                      }
                      valueStyle={{ fontSize: '17px', color: 'white' }}
                    />
                  </AutoRow>
                  <Row gutter={12} style={{ justifyContent: 'center', marginTop: '20px' }} justify={'space-around'}>
                    <Col className="gutter-row" span={12}>
                      <ButtonPrimary
                        disabled={stakingInfo?.valueOfTotalStakedAmountInUsd?.lessThan('2000')}
                        padding="8px"
                        borderRadius="8px"
                        onClick={() => setShowZapModal(true)}
                      >
                        Zap
                      </ButtonPrimary>
                    </Col>
                    <Col className="gutter-row" span={12}>
                      <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowDepositModal(true)}>
                        Deposit
                      </ButtonPrimary>
                    </Col>
                  </Row>
                </StyledVaultActionCard>
                <StyledVaultActionCard
                  badgeValue={
                    stakingInfo.stakedAmount && stakingInfo.pricePerLpToken
                      ? `$${stakingInfo.stakedAmount
                          .multiply(stakingInfo.pricePerLpToken)
                          .toSignificant(5, { groupSeparator: ',' })}`
                      : undefined
                  }
                >
                  <AutoRow justify="start" marginLeft="1.5rem">
                    <Statistic
                      title={'Staked Balance'}
                      value={
                        stakingInfo.stakedAmount
                          ? `${stakingInfo.stakedAmount.toSignificant(5, { groupSeparator: ',' })}`
                          : '-'
                      }
                      valueStyle={{ fontSize: '17px', color: 'white' }}
                    />
                  </AutoRow>
                  <AutoRow style={{ justifyContent: 'center', marginTop: '20px' }}>
                    <ButtonPrimary
                      padding="8px"
                      disabled={!(stakingInfo && stakingInfo.stakedAmount.greaterThan('0'))}
                      borderRadius="8px"
                      onClick={() => setShowWithdrawModal(true)}
                    >
                      Withdraw
                    </ButtonPrimary>
                  </AutoRow>
                </StyledVaultActionCard>
                <StyledVaultActionCard badgeValue={pendingIzaUsdString}>
                  <AutoRow justify="start" marginLeft="1.5rem">
                    <Statistic
                      title="Pending Rewards"
                      suffix={
                        <span role="img" aria-label="wizard-icon">
                          <Avatar size={30} src={izaLogo} style={{ marginRight: '4px' }} />
                        </span>
                      }
                      value={
                        stakingInfo
                          ? `${stakingInfo.earnedAmount.toSignificant(5, { groupSeparator: ',' })} ${govToken?.symbol}`
                          : '-'
                      }
                      valueStyle={{ fontSize: '17px', color: 'white' }}
                      style={{ justifyContent: 'center' }}
                    />
                  </AutoRow>
                  <AutoRow style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <ButtonPrimary
                      padding="8px"
                      disabled={!(stakingInfo && stakingInfo.earnedAmount.greaterThan('0'))}
                      borderRadius="8px"
                      onClick={() => setShowClaimRewardModal(true)}
                    >
                      Claim Rewards
                    </ButtonPrimary>
                  </AutoRow>
                </StyledVaultActionCard>
              </DataRow>
            </AutoColumn>
          </AutoRow>
        </>
      )}
    </Wrapper>
  )
}
