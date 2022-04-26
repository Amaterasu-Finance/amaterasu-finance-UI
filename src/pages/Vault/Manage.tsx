import React, { useCallback, useState, useMemo } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { Link } from 'react-router-dom'

import { JSBI } from '@amaterasu-fi/sdk'
import { RouteComponentProps } from 'react-router-dom'
import DoubleCurrencyLogo from '../../components/DoubleLogo'
// import { useCurrency } from '../../hooks/Tokens'
import { useWalletModalToggle } from '../../state/application/hooks'
import { TYPE } from '../../theme'

import { RowBetween } from '../../components/Row'
import { CardSection, DataCard } from '../../components/vault/styled'
import { ButtonPrimary, ButtonEmpty } from '../../components/Button'
import StakingModal from '../../components/vault/StakingModal'
import AwaitingRewards from '../../components/vault/AwaitingRewards'
import { useVaultsInfo } from '../../state/vault/hooks'
import ModifiedUnstakingModal from '../../components/vault/ModifiedUnstakingModal'
import ClaimRewardModal from '../../components/vault/ClaimRewardModal'
import { useTokenBalance } from '../../state/wallet/hooks'
import { useActiveWeb3React } from '../../hooks'
import { useColor } from '../../hooks/useColor'
import { CountUp } from 'use-count-up'

// import { wrappedCurrency } from '../../utils/wrappedCurrency'
import { currencyId } from '../../utils/currencyId'
// import { usePair } from '../../data/Reserves'
import usePrevious from '../../hooks/usePrevious'
import { BIG_INT_ZERO } from '../../constants'
import useGovernanceToken from '../../hooks/useGovernanceToken'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const PositionInfo = styled(AutoColumn)<{ dim: any }>`
  position: relative;
  max-width: 720px;
  width: 100%;
  opacity: ${({ dim }) => (dim ? 0.6 : 1)};
`

const BottomSection = styled(AutoColumn)`
  border-radius: 8px;
  width: 100%;
  position: relative;
`

const StyledDataCard = styled(DataCard)<{ bgColor?: any; showBackground?: any }>`
  z-index: 2;
  box-shadow: #04ccfb 0 2px 8px 0;
  background: ${({ theme }) => theme.bg1};
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: ${({ theme }) => theme.bg3};
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
`

const PoolData = styled(DataCard)`
  background: none;
  border: 1px solid ${({ theme }) => theme.bg4};
  padding: 1rem;
  z-index: 1;
`

const VoteCard = styled(DataCard)`
  background: ${({ theme }) => theme.bg1};
  overflow: hidden;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export default function ManageVault({
  match: {
    params: { pid }
  }
}: RouteComponentProps<{ pid: string }>) {
  const { account } = useActiveWeb3React()
  const govToken = useGovernanceToken()

  const stakingInfo = useVaultsInfo(undefined, Number(pid))?.[0]
  // get currencies and pair
  const lp = stakingInfo?.lp

  // detect existing unstaked LP position to show add button if none found
  const userLiquidityUnstaked = useTokenBalance(account ?? undefined, stakingInfo?.stakedAmount?.token)
  //const showAddLiquidityButton =
  //  stakingInfo === undefined || Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))

  const showAddLiquidityButton = useMemo<boolean>(() => {
    return Boolean(stakingInfo?.stakedAmount?.equalTo('0') && userLiquidityUnstaked?.equalTo('0'))
  }, [stakingInfo, userLiquidityUnstaked])

  // toggle for staking modal and unstaking modal
  const [showStakingModal, setShowStakingModal] = useState(false)
  const [autostake, setAutostake] = useState(false)
  const [showUnstakingModal, setShowUnstakingModal] = useState(false)
  const [showClaimRewardModal, setShowClaimRewardModal] = useState(false)

  // fade cards if nothing staked or nothing earned yet
  const disableTop = !stakingInfo?.stakedAmount || stakingInfo.stakedAmount.equalTo(JSBI.BigInt(0))

  const backgroundColor = useColor(stakingInfo?.baseToken)

  const countUpAmount = stakingInfo?.earnedAmountxIza?.toFixed(6) ?? '0'
  const countUpAmountPrevious = usePrevious(countUpAmount) ?? '0'

  const toggleWalletModal = useWalletModalToggle()

  const handleDepositClick = useCallback(() => {
    if (account) {
      setShowStakingModal(true)
    } else {
      toggleWalletModal()
    }
  }, [account, toggleWalletModal])

  return (
    <PageWrapper gap="lg" justify="center">
      <RowBetween style={{ gap: '24px' }}>
        <TYPE.mediumHeader style={{ margin: 0 }}>
          {stakingInfo?.lp.name} {stakingInfo?.lp.protocol.name} Vault
        </TYPE.mediumHeader>
        <DoubleCurrencyLogo currency0={lp?.token0 ?? undefined} currency1={lp?.token1 ?? undefined} size={40} />
      </RowBetween>

      <DataRow style={{ gap: '24px' }}>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Total Deposits</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo && stakingInfo.valueOfTotalStakedAmountInUsd
                ? `$${stakingInfo.valueOfTotalStakedAmountInUsd.toSignificant(5, { groupSeparator: ',' })}`
                : '-'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
        <PoolData>
          <AutoColumn gap="sm">
            <TYPE.body style={{ margin: 0 }}>Emission Rate</TYPE.body>
            <TYPE.body fontSize={24} fontWeight={500}>
              {stakingInfo && stakingInfo.poolRewardsPerBlock
                ? stakingInfo.active
                  ? `${stakingInfo.poolRewardsPerBlock.toSignificant(5, { groupSeparator: ',' })} 
                  ${govToken?.symbol} / block`
                  : `0 ${govToken?.symbol} / block`
                : '-'}
            </TYPE.body>
          </AutoColumn>
        </PoolData>
      </DataRow>

      {showAddLiquidityButton && (
        <VoteCard>
          <CardSection>
            <AutoColumn gap="md">
              <RowBetween>
                <TYPE.white fontWeight={600}>Step 1. Get IZA-LP Liquidity tokens</TYPE.white>
              </RowBetween>
              <RowBetween style={{ marginBottom: '1rem' }}>
                <TYPE.white fontSize={14}>
                  {`LP tokens are required. Once you've added liquidity to the ${lp?.token0?.symbol}-${lp?.token1?.symbol} pool you can stake your liquidity tokens on this page.`}
                </TYPE.white>
              </RowBetween>
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width={'fit-content'}
                as={Link}
                to={`/add/${lp?.token0 && currencyId(lp?.token0)}/${lp?.token1 && currencyId(lp?.token1)}`}
              >
                {`Add ${lp?.token0?.symbol}-${lp?.token1?.symbol} liquidity on ${lp?.protocol.name}`}
              </ButtonPrimary>
            </AutoColumn>
          </CardSection>
        </VoteCard>
      )}

      {stakingInfo && (
        <>
          <StakingModal
            isOpen={showStakingModal}
            onDismiss={() => setShowStakingModal(false)}
            stakingInfo={stakingInfo}
            userLiquidityUnstaked={userLiquidityUnstaked}
          />
          <ModifiedUnstakingModal
            isOpen={showUnstakingModal}
            onDismiss={() => setShowUnstakingModal(false)}
            stakingInfo={stakingInfo}
          />
          <ClaimRewardModal
            isOpen={showClaimRewardModal}
            onDismiss={() => setShowClaimRewardModal(false)}
            stakingInfo={stakingInfo}
            autostake={autostake}
          />
        </>
      )}

      <PositionInfo gap="lg" justify="center" dim={showAddLiquidityButton}>
        <BottomSection gap="lg" justify="center">
          <StyledDataCard disabled={disableTop} bgColor={backgroundColor} showBackground={!showAddLiquidityButton}>
            <CardSection>
              <AutoColumn gap="md">
                <RowBetween>
                  <TYPE.white fontWeight={600}>Your liquidity deposits</TYPE.white>
                </RowBetween>
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.white fontSize={36} fontWeight={600}>
                    {stakingInfo?.stakedAmount?.toSignificant(6) ?? '-'}
                  </TYPE.white>
                  <TYPE.white>
                    IZA-LP {lp?.token0?.symbol}-{lp?.token1?.symbol}
                  </TYPE.white>
                </RowBetween>
              </AutoColumn>
            </CardSection>
          </StyledDataCard>
          <StyledBottomCard dim={stakingInfo?.stakedAmount?.equalTo(JSBI.BigInt(0))}>
            <AutoColumn gap="sm">
              <RowBetween>
                <div>
                  <TYPE.black>Your unclaimed {govToken?.symbol}</TYPE.black>
                </div>
                {stakingInfo?.earnedAmountxIza && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmountxIza?.raw) && (
                  <ButtonEmpty
                    padding="8px"
                    borderRadius="8px"
                    width="fit-content"
                    onClick={() => {
                      setShowClaimRewardModal(true)
                      setAutostake(true)
                    }}
                  >
                    Claim + AutoStake
                  </ButtonEmpty>
                )}
              </RowBetween>
              <RowBetween style={{ alignItems: 'baseline' }}>
                <TYPE.largeHeader fontSize={36} fontWeight={600}>
                  <CountUp
                    key={countUpAmount}
                    isCounting
                    decimalPlaces={4}
                    start={parseFloat(countUpAmountPrevious)}
                    end={parseFloat(countUpAmount)}
                    thousandsSeparator={','}
                    duration={1}
                  />
                </TYPE.largeHeader>
                <TYPE.black fontSize={16} fontWeight={500}></TYPE.black>
              </RowBetween>
            </AutoColumn>
          </StyledBottomCard>
        </BottomSection>
        <>
          <TYPE.main style={{ textAlign: 'center' }} fontSize={14}>
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              ⭐️
            </span>
            When you deposit or withdraw the contract will automatically claim {govToken?.symbol} on your behalf.
            <br />
            <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
              💡
            </span>
            The unclaimed {govToken?.symbol} amount listed above is your total rewards
          </TYPE.main>
        </>
        <AwaitingRewards />
        {!showAddLiquidityButton && (
          <DataRow style={{ marginBottom: '1rem' }}>
            {stakingInfo && stakingInfo.active && (
              <ButtonPrimary padding="8px" borderRadius="8px" width="160px" onClick={handleDepositClick}>
                {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) ? 'Deposit' : 'Deposit IZA-LP Tokens'}
              </ButtonPrimary>
            )}

            {stakingInfo?.earnedAmountxIza && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmountxIza?.raw) && (
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width="160px"
                onClick={() => setShowClaimRewardModal(true)}
              >
                Claim
              </ButtonPrimary>
            )}
            {stakingInfo?.earnedAmountxIza && JSBI.notEqual(BIG_INT_ZERO, stakingInfo?.earnedAmountxIza?.raw) && (
              <ButtonPrimary
                padding="8px"
                borderRadius="8px"
                width="160px"
                onClick={() => {
                  setShowClaimRewardModal(true)
                  setAutostake(true)
                }}
              >
                Claim + Stake
              </ButtonPrimary>
            )}

            {stakingInfo?.stakedAmount?.greaterThan(JSBI.BigInt(0)) && (
              <>
                <ButtonPrimary
                  padding="8px"
                  borderRadius="8px"
                  width="160px"
                  onClick={() => setShowUnstakingModal(true)}
                >
                  Withdraw
                </ButtonPrimary>
              </>
            )}
          </DataRow>
        )}
        {!userLiquidityUnstaked ? null : userLiquidityUnstaked.equalTo('0') ? null : !stakingInfo?.active ? null : (
          <TYPE.main>You have {userLiquidityUnstaked.toSignificant(6)} IZA-LP tokens available to deposit</TYPE.main>
        )}
      </PositionInfo>
    </PageWrapper>
  )
}
