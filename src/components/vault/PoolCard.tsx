import React, { useState } from 'react'
// import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
// import { JSBI } from '@amaterasu-fi/sdk'
import { Col, Row, Statistic, Card } from 'antd'
import { ButtonPrimary } from '../Button'
import { VaultsInfo } from '../../state/vault/hooks'
// import { useColor } from '../../hooks/useColor'
// import { currencyId } from '../../utils/currencyId'
import { Break } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
// import useBUSDPrice from '../../hooks/useBUSDPrice'
//import useUSDCPrice from '../../utils/useUSDCPrice'
//import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
// import useGovernanceToken from '../../hooks/useGovernanceToken'
import ClaimRewardModal from './ClaimRewardModal'
// import usePitRatio from '../../hooks/usePitRatio'
import usePitToken from '../../hooks/usePitToken'
import xIzaLogo from '../../assets/images/iza-purple.png'
import { Avatar } from 'antd'
import Logo from '../Logo'
import ModifiedUnstakingModal from './ModifiedUnstakingModal'
import StakingModal from './StakingModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import ZapModal from './ZapModal'
import { CustomMouseoverTooltip } from '../Tooltip/custom'
import { QuestionCircleOutlined } from '@ant-design/icons'

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

const HeaderClickable = styled.div`
  cursor: pointer;
  border-radius: 8px;
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

const Wrapper = styled(Card)<{ showBackground: boolean }>`
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  justify-self: 'space-around'
  box-shadow: ${({ theme }) => theme.bg1} 0 2px 8px 0;
  position: relative;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '1')};
  background: ${({ theme }) => theme.bg1};
  ${({ showBackground }) =>
    showBackground &&
    `  box-shadow: 0px 0px 1px rgba(0, 0, 0, 0.01), 0px 4px 8px rgba(0, 0, 0, 0.04), 0px 16px 24px rgba(0, 0, 0, 0.04),
    0px 24px 32px rgba(0, 0, 0, 0.01);`}
  &:hover {
    box-shadow: #f3841e 0 1px 6px;
  }
`

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 0rem;
  margin-right: 0rem;
  margin-left: 0rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

export default function PoolCard({ stakingInfo, isArchived }: { stakingInfo: VaultsInfo; isArchived: boolean }) {
  const { account } = useActiveWeb3React()
  const xToken = usePitToken()

  const [isOpen, setIsOpen] = useState<boolean>(true)
  const [showZapModal, setShowZapModal] = useState(false)
  const [showDepositModal, setShowDepositModal] = useState(false)
  const [showWithdrawModal, setShowWithdrawModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  const userLiquidityUnstakedUsd = userLiquidityUnstaked && stakingInfo.pricePerLpToken?.multiply(userLiquidityUnstaked)

  // get the color of the token
  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  // const backgroundColor = useColor(stakingInfo?.baseToken)

  return (
    <Wrapper showBackground={isStaking}>
      <HeaderClickable onClick={() => setIsOpen(!isOpen)}>
        <Row gutter={24} justify={'space-between'} style={{ alignSelf: 'center' }}>
          <Col className="gutter-row" span={8} style={{ alignItems: 'center' }}>
            <Row gutter={12}>
              <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={30} />
              <TYPE.white fontWeight={600} fontSize={20} style={{ marginLeft: '10px' }}>
                {currency0.symbol}-{currency1.symbol}
              </TYPE.white>
            </Row>
            <Row gutter={12} style={{ marginTop: '10px' }}>
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
            </Row>
          </Col>
          <Col className="gutter-row" span={4}>
            <Statistic
              title={<TYPE.gray>TVL</TYPE.gray>}
              value={
                stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd
                  ? `$${stakingInfo.valueOfTotalStakedAmountInUsd.toSignificant(5, { groupSeparator: ',' })}`
                  : '-'
              }
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </Col>
          <Col className="gutter-row" span={4}>
            <Statistic
              title={<TYPE.gray>Daily</TYPE.gray>}
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
          </Col>
          <Col className="gutter-row" span={4}>
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
                      <QuestionCircleOutlined style={{ fontSize: '1.1rem', alignSelf: 'center' }} />
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
          </Col>
          <Col className="gutter-row" span={4}>
            <Statistic
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
                  <TYPE.gray>
                    xIZA Rate
                    <span role="img" aria-label="wizard-icon" style={{ marginLeft: '0.2rem' }}>
                      <QuestionCircleOutlined style={{ fontSize: '1.1rem', alignSelf: 'center' }} />
                    </span>
                  </TYPE.gray>
                </CustomMouseoverTooltip>
              }
              value={
                stakingInfo.xIzaRate && stakingInfo.xIzaRate > 0
                  ? `${stakingInfo.xIzaRate.toLocaleString('en', {
                      maximumSignificantDigits: 2,
                      minimumSignificantDigits: 2
                    })}%`
                  : 'TBD'
              }
              valueStyle={{ fontSize: '17px', color: 'white' }}
            />
          </Col>
        </Row>
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
          <Row gutter={24} justify={'space-around'} style={{ display: 'flex', alignItems: 'center' }}>
            {/*<Col className="gutter-row" span={8}>*/}
            <Card
              style={{
                justifyContent: 'center',
                boxSizing: 'border-box',
                height: '100%',
                width: '29%',
                borderRadius: '8px'
              }}
            >
              <div style={{ height: '100%', width: '100%' }}>
                <Row>
                  <Statistic
                    title={<TYPE.gray>Wallet Balance</TYPE.gray>}
                    value={
                      userLiquidityUnstaked
                        ? `${userLiquidityUnstaked.toSignificant(5, {
                            groupSeparator: ','
                          })}`
                        : '-'
                    }
                    valueStyle={{ fontSize: '17px', color: 'white' }}
                  />
                </Row>
                {userLiquidityUnstakedUsd && userLiquidityUnstakedUsd.greaterThan('0') && (
                  <Row>
                    <TYPE.gray>
                      ~${userLiquidityUnstakedUsd && userLiquidityUnstakedUsd.toSignificant(4, { groupSeparator: ',' })}
                    </TYPE.gray>
                  </Row>
                )}
                <Row style={{ alignContent: 'center', marginTop: '20px', width: '100%' }}>
                  <ButtonPrimary padding="8px" borderRadius="8px" width="50%" onClick={() => setShowDepositModal(true)}>
                    Deposit
                  </ButtonPrimary>
                  <ButtonPrimary padding="8px" borderRadius="8px" width="50%" onClick={() => setShowZapModal(true)}>
                    Zap
                  </ButtonPrimary>
                </Row>
              </div>
            </Card>
            {/*</Col>*/}
            {/*<Col className="gutter-row" span={8} style={{ alignItems: 'center' }}>*/}
            <Card
              style={{
                height: '100%',
                width: '29%',
                borderRadius: '8px'
              }}
            >
              {/*<Row>*/}
              {/*  <Statistic*/}
              {/*    title={<TYPE.gray>Staked Balance</TYPE.gray>}*/}
              {/*    value={*/}
              {/*      stakingInfo.stakedAmount*/}
              {/*        ? `${stakingInfo.stakedAmount.toSignificant(4, { groupSeparator: ',' })}`*/}
              {/*        : '-'*/}
              {/*    }*/}
              {/*    valueStyle={{ fontSize: '17px', color: 'white' }}*/}
              {/*  />*/}
              {/*  <Statistic*/}
              {/*    title={<TYPE.gray>Recent Profit</TYPE.gray>}*/}
              {/*    value={*/}
              {/*      stakingInfo.stakedAmount.subtract(stakingInfo.userStakedAtLastAction)*/}
              {/*        ? `${stakingInfo.stakedAmount*/}
              {/*            .subtract(stakingInfo.userStakedAtLastAction)*/}
              {/*            .toSignificant(4, { groupSeparator: ',' })}`*/}
              {/*        : '-'*/}
              {/*    }*/}
              {/*    valueStyle={{ fontSize: '17px', color: 'white' }}*/}
              {/*  />*/}
              {/*</Row>*/}
              {/*{stakingInfo.stakedAmountUsd && stakingInfo.stakedAmountUsd.greaterThan('0') && (*/}
              {/*  <Row>*/}
              {/*    <TYPE.gray>~${stakingInfo.stakedAmountUsd.toSignificant(4, { groupSeparator: ',' })}</TYPE.gray>*/}
              {/*  </Row>*/}
              {/*)}*/}
              <StatContainer>
                <RowBetween>
                  <TYPE.white> Staked Balance:</TYPE.white>
                  <TYPE.white fontWeight={500}>
                    {stakingInfo.stakedAmount
                      ? `${stakingInfo.stakedAmount.toSignificant(4, { groupSeparator: ',' })}`
                      : '-'}
                    <TYPE.gray fontSize={10}>
                      ~$
                      {stakingInfo.stakedAmountUsd
                        ? stakingInfo.stakedAmountUsd.toSignificant(4, { groupSeparator: ',' })
                        : '-'}
                    </TYPE.gray>
                  </TYPE.white>
                </RowBetween>
                <RowBetween>
                  <TYPE.white> Recent Profit:</TYPE.white>
                  <TYPE.white fontWeight={500}>
                    {stakingInfo.stakedAmount.subtract(stakingInfo.userStakedAtLastAction)
                      ? `${stakingInfo.stakedAmount
                          .subtract(stakingInfo.userStakedAtLastAction)
                          .toSignificant(4, { groupSeparator: ',' })}`
                      : '-'}
                    <TYPE.gray fontSize={10}>
                      ~$
                      {stakingInfo.stakedAmount.subtract(stakingInfo.userStakedAtLastAction)
                        ? `${stakingInfo.stakedAmount
                            .subtract(stakingInfo.userStakedAtLastAction)
                            .toSignificant(4, { groupSeparator: ',' })}`
                        : '-'}
                    </TYPE.gray>
                  </TYPE.white>
                </RowBetween>
              </StatContainer>
              <Row style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <ButtonPrimary
                  padding="8px"
                  disabled={!(stakingInfo && stakingInfo.stakedAmount.greaterThan('0'))}
                  borderRadius="8px"
                  width="170px"
                  onClick={() => setShowWithdrawModal(true)}
                >
                  Withdraw
                </ButtonPrimary>
              </Row>
            </Card>
            <Card
              style={{
                display: 'flex',
                justifyContent: 'center',
                boxSizing: 'border-box',
                height: '100%',
                width: '29%',
                borderRadius: '8px'
              }}
            >
              <Row>
                <Statistic
                  title={<TYPE.gray>Pending Rewards</TYPE.gray>}
                  suffix={
                    <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                      <Avatar size={30} src={xIzaLogo} style={{ marginRight: '4px' }} />
                    </span>
                  }
                  value={
                    stakingInfo
                      ? `${stakingInfo.earnedAmountxIza.toSignificant(4, { groupSeparator: ',' })} ${xToken?.symbol}`
                      : '-'
                  }
                  valueStyle={{ fontSize: '17px', color: 'white' }}
                  style={{ justifyContent: 'center' }}
                />
              </Row>
              <Row style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <ButtonPrimary
                  padding="8px"
                  disabled={!(stakingInfo && stakingInfo.earnedAmountxIza.greaterThan('0'))}
                  borderRadius="8px"
                  width="170px"
                  onClick={() => setShowClaimRewardModal(true)}
                >
                  Claim Rewards
                </ButtonPrimary>
              </Row>
            </Card>
          </Row>
        </>
      )}
    </Wrapper>
  )
}
