import React from 'react'
import { TokenAmount } from '@amaterasu-fi/sdk'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import Row, { AutoRow, RowBetween } from '../../components/Row'
import { DataCard, CardSection } from '../../components/earn/styled'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { ZERO_ADDRESS } from '../../constants'
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
import Loader from '../../components/Loader'
import { StakingTabCard } from './StakingTabCard'
import { Avatar } from 'antd'
import IzaLogo from '../../assets/images/iza-blue.png'
import xIzaLogo from '../../assets/images/iza-purple.png'
import VaultLogo from '../../assets/images/vault-png-transparent-image.png'

// import AmaLogo from '../../assets/svg/amaterasu.svg'
// import useBUSDPrice from '../../hooks/useBUSDPrice'
// import useAuroraPrice from '../../hooks/useAuroraPrice'
import { TYPE } from '../../theme'
import usePitToken from '../../hooks/usePitToken'
import { LightGreyCard } from '../../components/Card'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const DataRow = styled(RowBetween)`
  ${({ theme }) => theme.mediaWidth.upToExtraSmall`
   flex-direction: column;
   margin: 15px;
 `};
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

const StyledStatCard = styled(LightGreyCard)`
  padding: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 110px;
  `};
`

const StyledStatDataCard = ({ children, label }: any) => {
  return (
    <StyledStatCard>
      <CardSection>
        <AutoColumn gap="md">
          <AutoRow justify="center">
            <TYPE.black fontWeight={600} fontSize={16}>
              {label}
            </TYPE.black>
          </AutoRow>
          {children}
        </AutoColumn>
      </CardSection>
    </StyledStatCard>
  )
}

export default function Pit({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { account } = useActiveWeb3React()

  const govToken = useGovernanceToken()
  const govTokenBalance: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    govToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )
  const pitToken = usePitToken()
  const userLiquidityStaked: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    pitToken,
    'balanceOf',
    PIT_INTERFACE
  )

  const big18 = 1000000000000000000
  const withdrawalFeePeriod = '7200' // 2 hours
  const pitContract = usePitContract()
  const pitTokenBalance = useSingleCallResult(pitContract, 'balanceOfThis')?.result?.[0]
  const userInfo = useSingleCallResult(pitContract, 'userInfo', [account ? account : ZERO_ADDRESS])
  const govTokenPitTokenRatio = usePitRatio()
  const apy = useXFoxApy()
  const lastDepositedTime = userInfo.result?.lastDepositedTime
  const { secondsRemaining } = useWithdrawalFeeTimer(parseInt(lastDepositedTime, 10), parseInt(withdrawalFeePeriod, 10))

  return (
    <PageWrapper gap="lg" justify="center">
      <CustomCard>
        <CardSection gap="md">
          <AutoRow>
            <Text fontSize={18} fontWeight={700}>
              DEX Fee Sharing Vault
            </Text>
          </AutoRow>
          <AutoRow justify="space-between">
            <AutoColumn>
              <Text fontWeight={500} fontSize={13}>
                Ratio
              </Text>
              {govTokenPitTokenRatio ? (
                <Text fontWeight={400} fontSize={18}>
                  {govTokenPitTokenRatio.toFixed(5)}
                </Text>
              ) : (
                <Loader />
              )}
            </AutoColumn>
            <AutoColumn>
              <Text fontWeight={500} fontSize={13}>
                Daily
              </Text>
              {apy && pitTokenBalance ? (
                <Text fontWeight={400} fontSize={18}>
                  {apy.apyDay?.toFixed(2)}%
                </Text>
              ) : (
                <Loader />
              )}
            </AutoColumn>
            <AutoColumn>
              <Text fontWeight={500} fontSize={13}>
                Yearly
              </Text>
              {apy && pitTokenBalance ? (
                <Text fontWeight={400} fontSize={18}>
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
                <Text fontWeight={500} fontSize={13}>
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
      <AutoRow justify={'space-between'}>
        <AutoColumn gap="lg" style={{ width: '100%', maxWidth: '720px' }}>
          <DataRow style={{ gap: '10px', margin: 0 }}>
            <StyledStatDataCard label="Total IZA Staked">
              <Row justify={'center'} align={'center'}>
                <Avatar size={25} src={VaultLogo} style={{ marginRight: '4px' }} />
                <TYPE.black fontWeight={400} fontSize={16}>
                  {pitTokenBalance ? (parseFloat(pitTokenBalance) / big18).toLocaleString() : ''}
                </TYPE.black>
              </Row>
            </StyledStatDataCard>
            <StyledStatDataCard label="Balance xTRI">
              <Row justify={'center'} align={'center'}>
                <Avatar size={25} src={xIzaLogo} style={{ marginRight: '4px' }} />
                <TYPE.black fontWeight={400} fontSize={16}>
                  {userLiquidityStaked?.toFixed(2, { groupSeparator: ',' })}
                </TYPE.black>
              </Row>
            </StyledStatDataCard>
            <StyledStatDataCard label="Unstaked IZA">
              <Row justify={'center'} align={'center'}>
                <Avatar size={25} src={IzaLogo} style={{ marginRight: '4px' }} />
                <TYPE.black fontWeight={400} fontSize={16}>
                  {govTokenBalance ? govTokenBalance.toFixed(2, { groupSeparator: ',' }) : '0'}
                </TYPE.black>
              </Row>
            </StyledStatDataCard>
          </DataRow>
        </AutoColumn>
      </AutoRow>
      <StakingTabCard />
    </PageWrapper>
  )
}
