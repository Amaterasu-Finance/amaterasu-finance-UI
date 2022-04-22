import React, { useState } from 'react'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
import { Avatar, Badge, Col, Statistic, Card, Row } from 'antd'
import { ButtonPrimary } from '../Button'
import { VaultsInfo } from '../../state/vault/hooks'

import { Break } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'

import ClaimRewardModal from './ClaimRewardModal'
import usePitToken from '../../hooks/usePitToken'
import xIzaLogo from '../../assets/images/iza-purple.png'
import Logo from '../Logo'
import ModifiedUnstakingModal from './ModifiedUnstakingModal'
import StakingModal from './StakingModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import ZapModal from './ZapModal'
import { CustomMouseoverTooltip } from '../Tooltip/custom'
import { QuestionCircleOutlined } from '@ant-design/icons'
import { GreyCard } from '../Card'
import { CardSection } from './styled'
import { AutoColumn } from '../Column'
import { AutoRow } from '../Row'
import usePitRatio from '../../hooks/usePitRatio'
import useUSDCPrice from '../../utils/useUSDCPrice'
import useGovernanceToken from '../../hooks/useGovernanceToken'

const ToolTipContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 2px;
  margin: 0;
  padding: 0;
`

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

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const StyledAutoColumn = styled(AutoColumn)`
  padding: 0;
  margin: 0;
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
  align-items: center;
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
export default function VaultCard({ stakingInfo, isArchived }: { stakingInfo: VaultsInfo; isArchived: boolean }) {
  const { account } = useActiveWeb3React()
  const xToken = usePitToken()
  const govToken = useGovernanceToken()
  const govTokenPrice = useUSDCPrice(govToken)
  const pitRatio = usePitRatio()

  const [showZapModal, setShowZapModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const userLiquidityUnstakedUsd = userLiquidityUnstaked && stakingInfo.pricePerLpToken?.multiply(userLiquidityUnstaked)
  const defaultOpen = isStaking || Boolean(userLiquidityUnstaked && userLiquidityUnstaked?.greaterThan('0'))
  const [isOpen, setIsOpen] = useState<boolean>(defaultOpen)

  const pendingxIzaUsd =
    govTokenPrice &&
    pitRatio &&
    stakingInfo.earnedAmountxIza &&
    stakingInfo.earnedAmountxIza.multiply(pitRatio).multiply(govTokenPrice.adjusted)
  // if less than $0.01, then just show `<$0.01`
  const pendingxIzaUsdString =
    pendingxIzaUsd &&
    (pendingxIzaUsd.equalTo('0')
      ? '$0'
      : pendingxIzaUsd.multiply('100').lessThan('1')
      ? '<$0.01'
      : `$${pendingxIzaUsd.toFixed(2)}`)

  const userRecentProfit = stakingInfo.stakedAmount.subtract(stakingInfo.userStakedAtLastAction)
  const userRecentProfitUsd = stakingInfo.pricePerLpToken?.multiply(userRecentProfit)
  // if less than $0.01, then just show `<$0.01`
  const userRecentProfitUsdString =
    userRecentProfitUsd &&
    (userRecentProfitUsd.equalTo('0')
      ? '$0'
      : userRecentProfitUsd.multiply('100').lessThan('1')
      ? '<$0.01'
      : `$${userRecentProfitUsd.toFixed(2)}`)

  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  // get the color of the token
  // const backgroundColor = useColor(stakingInfo?.baseToken)

  return (
    <Wrapper showBackground={false} bodyStyle={{ padding: '0.7rem' }}>
      <HeaderClickable onClick={() => setIsOpen(!isOpen)} style={{ padding: '0px', margin: '0px' }}>
        <AutoRow justify={'space-between'} style={{ alignSelf: 'center', margin: '0px', marginLeft: '20px' }}>
          <StyledAutoColumn className="gutter-row" style={{ alignItems: 'center', minWidth: '250px' }}>
            <AutoRow>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={30} />
              <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '10px' }}>
                {currency0.symbol}-{currency1.symbol}
              </TYPE.white>
            </AutoRow>
            <AutoRow style={{ margin: '0px' }}>
              <TYPE.gray fontWeight={600} fontSize={14}>
                Platform:{' '}
              </TYPE.gray>
              <TYPE.white fontWeight={600} fontSize={14} style={{ marginLeft: '10px' }}>
                {stakingInfo.protocol.name}
                <span role="img" aria-label="wizard-icon" style={{ marginLeft: '5px' }}>
                  <StyledLogo
                    size={'22px'}
                    srcs={[stakingInfo.protocol.logoFilename]}
                    alt={stakingInfo.protocol.name}
                  />
                </span>
              </TYPE.white>
            </AutoRow>
          </StyledAutoColumn>
          <HidingCol>
            <Statistic
              title="TVL"
              value={
                stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd
                  ? `$${stakingInfo.valueOfTotalStakedAmountInUsd.toFixed(2, { groupSeparator: ',' })}`
                  : '-'
              }
              valueStyle={{ fontSize: '17px', color: 'white', margin: '0' }}
              style={{ margin: '0' }}
            />
          </HidingCol>
          <HidingCol>
            <Statistic
              title="Daily"
              value={
                stakingInfo.apyDaily && stakingInfo.apyDaily > 0
                  ? `${(stakingInfo.apyDaily * 100).toLocaleString('en', {
                      maximumSignificantDigits: 4,
                      minimumSignificantDigits: 2
                    })}%`
                  : 'TBD'
              }
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </HidingCol>
          <StyledAutoColumn className="gutter-row" style={{ marginTop: '0px' }}>
            <Statistic
              title={
                <CustomMouseoverTooltip
                  element={
                    <ToolTipContainer>
                      {stakingInfo.apyBase && stakingInfo.apyBase > 0 && (
                        <RowBetween>
                          <TYPE.subHeader>Compounding: </TYPE.subHeader>
                          <TYPE.subHeader>
                            {(stakingInfo.apyBase * 100).toLocaleString('en', {
                              maximumSignificantDigits: 4,
                              minimumSignificantDigits: 2
                            })}
                            %
                          </TYPE.subHeader>
                        </RowBetween>
                      )}
                      {stakingInfo.apyxIza && stakingInfo.apyxIza > 0 && (
                        <RowBetween>
                          <TYPE.subHeader>xIZA APY: </TYPE.subHeader>
                          <TYPE.subHeader>
                            {(stakingInfo.apyxIza * 100).toLocaleString('en', {
                              maximumSignificantDigits: 4,
                              minimumSignificantDigits: 2
                            })}
                            %
                          </TYPE.subHeader>
                        </RowBetween>
                      )}
                      {stakingInfo.apyxToken && stakingInfo.apyxToken > 0 ? (
                        <RowBetween>
                          <TYPE.subHeader>{stakingInfo.lp.protocol.xToken?.symbol} APY:</TYPE.subHeader>
                          <TYPE.subHeader>
                            {(stakingInfo.apyxToken * 100).toLocaleString('en', {
                              maximumSignificantDigits: 4,
                              minimumSignificantDigits: 2
                            })}
                            %
                          </TYPE.subHeader>
                        </RowBetween>
                      ) : (
                        <></>
                      )}
                      <Break />
                      {stakingInfo.apy && stakingInfo.apy > 0 && (
                        <RowBetween>
                          <TYPE.body style={{ fontWeight: '600' }}>Total APY:</TYPE.body>
                          <TYPE.body style={{ fontWeight: '600' }}>
                            {(stakingInfo.apy * 100).toLocaleString('en', {
                              maximumSignificantDigits: 4,
                              minimumSignificantDigits: 2
                            })}
                            %
                          </TYPE.body>
                        </RowBetween>
                      )}
                    </ToolTipContainer>
                  }
                >
                  <TYPE.gray>
                    Yearly
                    <span role="img" aria-label="wizard-icon" style={{ marginLeft: '0.2rem' }}>
                      <QuestionCircleOutlined style={{ fontSize: '0.85rem', alignSelf: 'center' }} />
                    </span>
                  </TYPE.gray>
                </CustomMouseoverTooltip>
              }
              value={
                stakingInfo.apy && stakingInfo.apy > 0
                  ? `${(stakingInfo.apy * 100).toLocaleString('en', {
                      maximumSignificantDigits: 4,
                      minimumSignificantDigits: 2
                    })}%`
                  : 'TBD'
              }
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </StyledAutoColumn>
          <HidingCol className="gutter-row" span={4}>
            <HidingStatistic
              title={
                <CustomMouseoverTooltip
                  element={
                    <ToolTipContainer>
                      <TYPE.subHeader>
                        This vault pays out{' '}
                        {stakingInfo.xIzaRate && stakingInfo.xIzaRate > 0
                          ? `${stakingInfo.xIzaRate.toLocaleString('en', {
                              maximumSignificantDigits: 2,
                              minimumSignificantDigits: 2
                            })}%`
                          : 'TBD'}{' '}
                        of the rewards in <b>xIZA</b>
                        <br />
                        and compounds the rest into <b>{stakingInfo.lp.name} LP</b>
                      </TYPE.subHeader>
                    </ToolTipContainer>
                  }
                >
                  <HidingCol style={{ marginTop: '0px' }}>
                    <TYPE.gray>
                      xIZA Rate
                      <span role="img" aria-label="wizard-icon" style={{ marginLeft: '0.2rem' }}>
                        <QuestionCircleOutlined style={{ fontSize: '0.85rem', alignSelf: 'center' }} />
                      </span>
                    </TYPE.gray>
                  </HidingCol>
                </CustomMouseoverTooltip>
              }
              value={
                stakingInfo.xIzaRate && stakingInfo.xIzaRate > 0
                  ? `${stakingInfo.xIzaRate.toLocaleString('en', {
                      maximumSignificantDigits: 4,
                      minimumSignificantDigits: 2
                    })}%`
                  : 'TBD'
              }
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </HidingCol>
        </AutoRow>
      </HeaderClickable>

      {isOpen && (
        <>
          <Break style={{ margin: '10px' }} />
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
                      <ButtonPrimary padding="8px" borderRadius="8px" onClick={() => setShowZapModal(true)}>
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
                    stakingInfo.stakedAmountUsd
                      ? `$${stakingInfo.stakedAmountUsd.toSignificant(5, { groupSeparator: ',' })}`
                      : undefined
                  }
                >
                  <AutoRow justify="start" marginLeft="1.5rem">
                    <CustomMouseoverTooltip
                      element={
                        <ToolTipContainer style={{ minWidth: '150px' }}>
                          <AutoRow>
                            <TYPE.subHeader style={{ fontSize: '17px', fontWeight: '700' }}>
                              Recent Profit*
                            </TYPE.subHeader>
                          </AutoRow>
                          <Break />
                          <AutoRow>
                            <TYPE.subHeader style={{ fontSize: '14px' }}>
                              {userRecentProfit.toSignificant(4)} ({userRecentProfitUsdString})
                            </TYPE.subHeader>
                          </AutoRow>
                          <AutoRow>
                            <TYPE.subHeader style={{ fontSize: '12px', fontWeight: '700' }}>
                              {stakingInfo.lp.name} LP Tokens
                            </TYPE.subHeader>
                          </AutoRow>
                          <AutoRow>
                            <TYPE.small style={{ fontSize: '11px' }}>*Since last stake or unstake</TYPE.small>
                          </AutoRow>
                        </ToolTipContainer>
                      }
                    >
                      <Statistic
                        title={'Staked Balance'}
                        value={
                          stakingInfo.stakedAmount
                            ? `${stakingInfo.stakedAmount.toSignificant(5, { groupSeparator: ',' })}`
                            : '-'
                        }
                        valueStyle={{ fontSize: '17px', color: 'white' }}
                      />
                    </CustomMouseoverTooltip>
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
                <StyledVaultActionCard badgeValue={pendingxIzaUsdString}>
                  <AutoRow justify="start" marginLeft="1.5rem">
                    <Statistic
                      title="Pending Rewards"
                      suffix={
                        <span role="img" aria-label="wizard-icon">
                          <Avatar size={30} src={xIzaLogo} style={{ marginRight: '4px' }} />
                        </span>
                      }
                      value={
                        stakingInfo
                          ? `${stakingInfo.earnedAmountxIza.toSignificant(5, { groupSeparator: ',' })} ${
                              xToken?.symbol
                            }`
                          : '-'
                      }
                      valueStyle={{ fontSize: '17px', color: 'white' }}
                      style={{ justifyContent: 'center' }}
                    />
                  </AutoRow>
                  <AutoRow style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                    <ButtonPrimary
                      padding="8px"
                      disabled={!(stakingInfo && stakingInfo.earnedAmountxIza.greaterThan('0'))}
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
