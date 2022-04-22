import React, { useState } from 'react'
import { AutoColumn } from '../Column'
import { RowBetween } from '../Row'
import styled from 'styled-components'
import { TYPE, StyledInternalLink } from '../../theme'
import DoubleCurrencyLogo from '../DoubleLogo'
// import { JSBI } from '@amaterasu-fi/sdk'
import { ButtonPrimary } from '../Button'
import { StakingInfo } from '../../state/stake/hooks'
import { useColor } from '../../hooks/useColor'
import { currencyId } from '../../utils/currencyId'
import { Break } from './styled'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import useBUSDPrice from '../../hooks/useBUSDPrice'
//import useUSDCPrice from '../../utils/useUSDCPrice'
//import { BIG_INT_SECONDS_IN_WEEK } from '../../constants'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import ClaimRewardModal from './ClaimRewardModal'

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

const BottomSection = styled.div<{ showBackground: boolean }>`
  padding: 12px 16px;
  opacity: ${({ showBackground }) => (showBackground ? '1' : '0.4')};
  border-radius: 0 0 12px 12px;
  display: flex;
  flex-direction: row;
  align-items: baseline;
  justify-content: space-between;
  z-index: 1;
`

export default function OldPoolCard({ stakingInfo, isArchived }: { stakingInfo: StakingInfo; isArchived: boolean }) {
  const govToken = useGovernanceToken()
  const govTokenPrice = useBUSDPrice(govToken)

  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

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
          {currency0.symbol}-{currency1.symbol}
        </TYPE.white>

        <StyledInternalLink to={`/staking/${currencyId(currency0)}/${currencyId(currency1)}`} style={{ width: '100%' }}>
          <ButtonPrimary padding="8px" borderRadius="8px">
            {isStaking || isArchived ? 'Manage' : 'Deposit'}
          </ButtonPrimary>
        </StyledInternalLink>
      </TopSection>

      <StatContainer>
        <ClaimRewardModal
          isOpen={showClaimRewardModal}
          onDismiss={() => setShowClaimRewardModal(false)}
          stakingInfo={stakingInfo}
          autostake={true}
        />
        <RowBetween>
          <TYPE.white> APR*</TYPE.white>
          <TYPE.white fontWeight={500}>
            <b>
              {stakingInfo.apr && stakingInfo.apr.greaterThan('0')
                ? `${stakingInfo.apr.multiply('100').toSignificant(4, { groupSeparator: ',' })}%`
                : 'To be determined'}
            </b>
          </TYPE.white>
        </RowBetween>
        {stakingInfo.depositFee && stakingInfo.depositFee > 0 ? (
          <RowBetween>
            <TYPE.white> Deposit Fee </TYPE.white>
            <TYPE.white>
              {typeof stakingInfo.depositFee === 'number' ? `${stakingInfo.depositFee.toFixed(1)}%` : '-'}
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
                ? `$${stakingInfo.valueOfTotalStakedAmountInUsd.toFixed(0, { groupSeparator: ',' })}`
                : '-'}
            </b>
          </TYPE.white>
        </RowBetween>
        <RowBetween>
          <TYPE.white> Emission rate </TYPE.white>
          <TYPE.white>
            {stakingInfo
              ? stakingInfo.active
                ? `${stakingInfo.poolRewardsPerBlock.multiply('86400').toSignificant(4, { groupSeparator: ',' })} 
                ${govToken?.symbol} / day`
                : `0 ${govToken?.symbol} / day`
              : '-'}
          </TYPE.white>
        </RowBetween>
      </StatContainer>

      {isStaking && (
        <>
          <Break />
          <BottomSection showBackground={true}>
            <TYPE.black color={'white'} fontWeight={500}>
              <span>Your Total Rewards</span>
            </TYPE.black>
            {stakingInfo && stakingInfo.earnedAmount.greaterThan('0') && (
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width="170px"
                onClick={() => setShowClaimRewardModal(true)}
              >
                Claim + AutoStake
              </ButtonPrimary>
            )}

            <TYPE.black style={{ textAlign: 'right' }} color={'white'} fontWeight={500}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                🎁
              </span>
              {stakingInfo
                ? stakingInfo.active
                  ? `${stakingInfo.earnedAmount.toSignificant(4, { groupSeparator: ',' })} ${govToken?.symbol} / $${
                      govTokenPrice
                        ? stakingInfo.earnedAmount
                            .multiply(govTokenPrice?.raw)
                            .multiply('1000000000000')
                            .toSignificant(4, { groupSeparator: ',' })
                        : '0'
                    }`
                  : `0 ${govToken?.symbol}`
                : '-'}
            </TYPE.black>
          </BottomSection>
        </>
      )}
    </Wrapper>
  )
}
