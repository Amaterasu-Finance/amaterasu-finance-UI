import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
// import { JSBI } from '@amaterasu-fi/sdk'
import { ButtonPrimary } from '../Button'
import { VaultsInfo } from '../../state/vault/hooks'
import { useColor } from '../../hooks/useColor'
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

const StatContainer = styled.div`
  display: flex;
  justify-content: space-between;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 1rem;
  margin-right: 1rem;
  margin-left: 1rem;
  ${({ theme }) => theme.mediaWidth.upToSmall`
  display: none;
`};
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const Wrapper = styled(AutoColumn)<{ showBackground: boolean; bgColor: any }>`
  border-radius: 8px;
  width: 100%;
  overflow: hidden;
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

const TopSection = styled.div`
  display: grid;
  grid-template-columns: 48px 1fr 120px;
  grid-gap: 0px;
  align-items: center;
  padding: 1rem;
  z-index: 1;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    grid-template-columns: 48px 1fr 96px;
  `};
`

// const BottomSection = styled.div<{ showBackground: boolean }>`
//   display: grid;
//   grid-template-columns: 48px 1fr 120px;
//   grid-gap: 0px;
//   align-items: center;
//   padding: 1rem;
//   opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
//   border-radius: 0 0 12px 12px;
//   z-index: 1;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     grid-template-columns: 48px 1fr 96px;
//   `};
// `

export default function PoolCard({ stakingInfo, isArchived }: { stakingInfo: VaultsInfo; isArchived: boolean }) {
  // const govToken = useGovernanceToken()
  const xToken = usePitToken()
  // const govTokenPrice = useBUSDPrice(govToken)
  // const pitRatio = usePitRatio()

  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false) // TODO - update this

  const isStaking = Boolean(stakingInfo.stakedAmount.greaterThan('0'))

  // get the color of the token
  const token0 = stakingInfo.tokens[0]
  const token1 = stakingInfo.tokens[1]
  const currency0 = unwrappedToken(token0)
  const currency1 = unwrappedToken(token1)
  const backgroundColor = useColor(stakingInfo?.baseToken)

  return (
    <Wrapper showBackground={isStaking} bgColor={backgroundColor}>
      <TopSection>
        <DoubleCurrencyLogo currency0={currency0} currency1={currency1} size={40} />
        <TYPE.white fontWeight={600} fontSize={24} style={{ marginLeft: '40px' }}>
          {currency0.symbol}-{currency1.symbol} Vault
        </TYPE.white>

        {/*<StyledInternalLink to={`/vaults/${stakingInfo.pid}`} style={{ width: '100%' }}>*/}
        {/*  <ButtonPrimary padding="8px" borderRadius="8px">*/}
        {/*    {isStaking || isArchived ? 'Manage' : 'Deposit'}*/}
        {/*  </ButtonPrimary>*/}
        {/*</StyledInternalLink>*/}
        <TYPE.white fontWeight={600} fontSize={24}>
          <StyledLogo size={'60px'} srcs={[stakingInfo.lp.protocol.logoFilename]} alt={'blah'} />
          {stakingInfo.lp.protocol.name}
        </TYPE.white>
      </TopSection>

      <StatContainer>
        <ClaimRewardModal
          isOpen={showClaimRewardModal}
          onDismiss={() => setShowClaimRewardModal(false)}
          stakingInfo={stakingInfo}
          autostake={true}
        />
        <RowBetween>
          <TYPE.white> APY/APR*</TYPE.white>
          <TYPE.white fontWeight={500}>
            <b>
              {stakingInfo.apy && stakingInfo.apy.greaterThan('0')
                ? `${stakingInfo.apy.multiply('100').toSignificant(3, { groupSeparator: ',' })}%`
                : 'TBD'}
            </b>
            {' / '}
            {stakingInfo.apr && stakingInfo.apr.greaterThan('0')
              ? `${stakingInfo.apr.multiply('100').toSignificant(3, { groupSeparator: ',' })}%`
              : 'TBD'}
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white>
            <b> Reward Breakdown:</b>
            1% Automation Fee - {stakingInfo.buybackRate}% Buyback Fee - {stakingInfo.xIzaRate}% xIZA Rewards -{' '}
            {stakingInfo.compoundRate}% LP Rewards
          </TYPE.white>
        </RowBetween>
        {stakingInfo.withdrawFee && stakingInfo.withdrawFee > 0 ? (
          <RowBetween>
            <TYPE.white> Withdraw Fee </TYPE.white>
            <TYPE.white>
              {typeof stakingInfo.withdrawFee === 'number' ? `${stakingInfo.withdrawFee.toFixed(1)}%` : '-'}
            </TYPE.white>
          </RowBetween>
        ) : (
          <></>
        )}
        <RowBetween>
          <TYPE.white> Total deposited </TYPE.white>
          <TYPE.white fontWeight={500}>
            <b>
              {stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd
                ? `$${stakingInfo.valueOfTotalStakedAmountInUsd.toSignificant(5, { groupSeparator: ',' })}`
                : '-'}
            </b>
          </TYPE.white>
        </RowBetween>
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <StatContainer>
            <RowBetween>
              <TYPE.black color={'white'} fontWeight={500}>
                <span>Your Total Staked</span>
              </TYPE.black>

              <TYPE.white fontWeight={500}>
                <b>
                  {stakingInfo && stakingInfo.stakedAmountUsd
                    ? `$${stakingInfo.stakedAmountUsd.toSignificant(5, { groupSeparator: ',' })}`
                    : '-'}
                </b>
              </TYPE.white>
            </RowBetween>
            <RowBetween>
              <TYPE.black color={'white'} fontWeight={500}>
                <span>Your Total Rewards</span>
              </TYPE.black>
              <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
                <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                  <Avatar size={40} src={xIzaLogo} style={{ marginRight: '4px' }} />
                </span>
                {stakingInfo
                  ? stakingInfo.active
                    ? `${stakingInfo.earnedAmountxIza.toSignificant(4, { groupSeparator: ',' })} ${xToken?.symbol}`
                    : `0 ${xToken?.symbol}`
                  : '-'}
              </TYPE.black>
            </RowBetween>
            <RowBetween>
              {stakingInfo && stakingInfo.earnedAmountxIza.greaterThan('0') && (
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="170px"
                  onClick={() => setShowClaimRewardModal(true)}
                >
                  Deposit
                </ButtonPrimary>
              )}
              {stakingInfo && stakingInfo.earnedAmountxIza.greaterThan('0') && (
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="170px"
                  onClick={() => setShowClaimRewardModal(true)}
                >
                  Withdraw
                </ButtonPrimary>
              )}
              {stakingInfo && stakingInfo.earnedAmountxIza.greaterThan('0') && (
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="170px"
                  onClick={() => setShowClaimRewardModal(true)}
                >
                  Claim Rewards
                </ButtonPrimary>
              )}
            </RowBetween>
          </StatContainer>
        </>
      )}
    </Wrapper>
  )
}
