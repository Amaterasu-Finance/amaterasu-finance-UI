import React from 'react'
import { TokenAmount } from '@amaterasu-fi/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { AutoRow, RowBetween } from '../../components/Row'
import { DataCard, CardSection } from '../../components/earn/styled'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { PIT, ZERO_ADDRESS } from '../../constants'
import { GOVERNANCE_TOKEN_INTERFACE } from '../../constants/abis/governanceToken'
import { PIT_INTERFACE } from '../../constants/abis/pit'
import useGovernanceToken from 'hooks/useGovernanceToken'
import usePitRatio from '../../hooks/usePitRatio'
import useXFoxApy from '../../hooks/usexFoxApy'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { usePitContract } from '../../hooks/useContract'
import useWithdrawalFeeTimer from '../../hooks/useWithdrawalFeeTimer'
import WithdrawFeeTimer from '../../components/Pit/WithdrawFeeTimer'
import { Text } from 'rebass'
import { MouseoverTooltip } from '../../components/Tooltip'
import useBUSDPrice from '../../hooks/useBUSDPrice'
import Loader from '../../components/Loader'
import { StakingTabCard } from './StakingTabCard'
import { Avatar, Card, Col, Row, Statistic } from 'antd'
import IzaLogo from '../../assets/images/iza-blue.png'
import xIzaLogo from '../../assets/images/iza-purple.png'
import AmaLogo from '../../assets/svg/amaterasu.svg'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const CustomCard = styled(DataCard)`
  background: linear-gradient(
    60deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  overflow: hidden;
  padding: 0.5rem;
`

const DurationText = styled(Text)`
  color: green;
  background-color: lightgreen;
  border-radius: 8px;
  text-align: center;
  font-size: 15px;
  width: 75%;
`

export default function Pit({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { account, chainId } = useActiveWeb3React()

  const govToken = useGovernanceToken()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const govTokenPrice = useBUSDPrice(govToken)

  const big18 = 1000000000000000000
  const withdrawalFeePeriod = '7200' // 2 hours
  const pit = chainId ? PIT[chainId] : undefined
  const pitContract = usePitContract()
  const pitBalance: TokenAmount | undefined = useTokenBalance(account ?? undefined, pit, 'balanceOf', PIT_INTERFACE)
  const pitTokenBalance = useSingleCallResult(pitContract, 'balanceOfThis')?.result?.[0]
  const userInfo = useSingleCallResult(pitContract, 'userInfo', [account ? account : ZERO_ADDRESS])
  const govTokenPitTokenRatio = usePitRatio()
  const apy = useXFoxApy()

  const adjustedPitBalance = govTokenPitTokenRatio ? pitBalance?.multiply(govTokenPitTokenRatio) : undefined
  const pitTVL = (parseFloat(pitTokenBalance) * (govTokenPrice ? parseFloat(govTokenPrice?.toFixed(3)) : 1)) / big18
  const lastDepositedTime = userInfo.result?.lastDepositedTime
  const { secondsRemaining } = useWithdrawalFeeTimer(parseInt(lastDepositedTime, 10), parseInt(withdrawalFeePeriod, 10))

  return (
    <PageWrapper gap="lg" justify="center">
      <CustomCard>
        <CardSection gap="md">
          <AutoRow>
            <Text>DEX Fee Sharing Vault</Text>
          </AutoRow>
          <AutoRow justify="space-between">
            <AutoColumn>
              <Text fontWeight={300} fontSize={13}>
                TVL
              </Text>
              {pitTokenBalance && govTokenPrice ? (
                <Text fontWeight={500} fontSize={18}>
                  ${pitTVL.toLocaleString()}
                </Text>
              ) : (
                <Loader />
              )}
            </AutoColumn>
            <AutoColumn>
              <Text fontWeight={300} fontSize={13}>
                Ratio
              </Text>
              {govTokenPitTokenRatio ? (
                <Text fontWeight={500} fontSize={18}>
                  {govTokenPitTokenRatio.toFixed(5)}
                </Text>
              ) : (
                <Loader />
              )}
            </AutoColumn>
            <AutoColumn>
              <Text fontWeight={300} fontSize={13}>
                Daily
              </Text>
              {apy && pitTokenBalance ? (
                <Text fontWeight={500} fontSize={18}>
                  {apy.apyDay?.toFixed(4)}%
                </Text>
              ) : (
                <Loader />
              )}
            </AutoColumn>
            <AutoColumn>
              <Text fontWeight={300} fontSize={13}>
                Yearly
              </Text>
              {apy && pitTokenBalance ? (
                <Text fontWeight={500} fontSize={18}>
                  {apy.apy > 1e10 ? '∞' : apy.apy?.toLocaleString()}%
                </Text>
              ) : (
                <Loader />
              )}
              <RowBetween />
            </AutoColumn>
            <AutoColumn>
              <MouseoverTooltip
                text={'xIZA has a 0.2% unstaking fee if withdrawn within 2h. All fees are distributed to xIZA holders.'}
              >
                <Text fontWeight={300} fontSize={13}>
                  Withdraw Fee Until
                </Text>
              </MouseoverTooltip>
              {secondsRemaining ? (
                <WithdrawFeeTimer secondsRemaining={secondsRemaining} />
              ) : (
                <DurationText>Unlocked</DurationText>
              )}
              <RowBetween />
            </AutoColumn>
          </AutoRow>
        </CardSection>
      </CustomCard>
      <Row wrap={false} gutter={12} justify={'space-around'} style={{ position: 'relative' }}>
        <Col sm={8} md={12} className={'gutter-row'}>
          <Card style={{ borderRadius: '8px', background: '#212429' }}>
            <Statistic
              title="TVL"
              value={pitTVL.toLocaleString()}
              precision={2}
              valueStyle={{ borderRadius: '8px' }}
              prefix={<Avatar size={'default'} src={AmaLogo} />}
              suffix=""
            />
          </Card>
        </Col>
        <Col sm={8} md={12} className={'gutter-row'}>
          <Card style={{ borderRadius: '8px', background: '#212429' }}>
            <Statistic
              title="IZA Balance"
              value={govTokenBalance ? govTokenBalance.toFixed(2, { groupSeparator: ',' }) : '0'}
              precision={2}
              style={{ borderRadius: '8px' }}
              prefix={<Avatar size={'default'} src={IzaLogo} />}
              suffix=""
            />
          </Card>
        </Col>
        <Col sm={8} md={12} className={'gutter-row'}>
          <Card style={{ borderRadius: '8px', background: '#212429' }}>
            <Statistic
              title={`x${govToken?.symbol} Balance`}
              value={adjustedPitBalance?.toFixed(3, { groupSeparator: ',' })}
              precision={2}
              style={{ borderRadius: '8px', alignItems: 'center' }}
              prefix={<Avatar size={'default'} src={xIzaLogo} />}
            />
          </Card>
        </Col>
      </Row>
      <StakingTabCard />
    </PageWrapper>
  )
}
