import React, { useState } from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { CloseIcon, TYPE } from '../../theme'
import { RowBetween } from '../../components/Row'
import { DataCard, CardBGImage, CardNoise } from '../../components/earn/styled'
import { ButtonPrimary } from '../../components/Button'
import { useActiveWeb3React } from '../../hooks'
import useGovernanceToken from 'hooks/useGovernanceToken'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { usePayoutContract } from '../../hooks/useContract'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { TokenAmount } from '@amaterasu-fi/sdk'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

const TopSection = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const BottomSection = styled(AutoColumn)`
  border-radius: 8px;
  width: 100%;
  position: relative;
`

const StyledBottomCard = styled(DataCard)<{ dim: any }>`
  background: linear-gradient(
    140deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  opacity: ${({ dim }) => (dim ? 0.4 : 1)};
  margin-top: -40px;
  padding: 0 1.25rem 1rem 1.25rem;
  padding-top: 32px;
  z-index: 1;
  width: 90%;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

const ButtonPit = styled(ButtonPrimary)`
  background: linear-gradient(
    60deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  border: 1px solid #ffcc00;
`

export default function Admin({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  const { account } = useActiveWeb3React()

  const addTransaction = useTransactionAdder()
  const [hash, setHash] = useState<string | undefined>()
  const [attempting, setAttempting] = useState(false)
  const [failed, setFailed] = useState<boolean>(false)

  const payoutContract = usePayoutContract()
  const govToken = useGovernanceToken()
  const payoutTokenBalance = useSingleCallResult(payoutContract, 'balanceOf', [govToken?.address])
  const payoutTokenBalanceResult =
    govToken && payoutTokenBalance.result && new TokenAmount(govToken, payoutTokenBalance.result[0])

  const totalAlloc = useSingleCallResult(payoutContract, 'totalAllocPoint').result
  const userAlloc = useSingleCallResult(payoutContract, 'userInfo', [account ?? undefined]).result
  const userAllocResult = userAlloc && parseFloat(userAlloc[0])
  const userPercent = userAllocResult && totalAlloc && (userAllocResult * 100) / parseFloat(totalAlloc[0])

  function wrappedOnDismiss() {
    setHash(undefined)
    setAttempting(false)
    setFailed(false)
  }

  async function onClaimRewards() {
    if (payoutContract) {
      setAttempting(true)

      try {
        const estimatedGas = await payoutContract.estimateGas.distributeReward(govToken?.address)

        await payoutContract
          .distributeReward(govToken?.address, {
            gasLimit: calculateGasMargin(estimatedGas)
          })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Distribute dev rewards`
            })
            setHash(response.hash)
          })
          .catch((error: any) => {
            setAttempting(false)
            if (error?.code === -32603) {
              setFailed(true)
            }
            console.log(error)
          })
      } catch (error) {
        setAttempting(false)
        setFailed(true)
        console.log(error)
      }
    }
  }

  return (
    <PageWrapper gap="lg" justify="center">
      <TopSection gap="lg" justify="center">
        <BottomSection gap="lg" justify="center">
          <StyledBottomCard dim={false}>
            <CardBGImage />
            <CardNoise />
            {userPercent && userPercent > 0 ? (
              <AutoColumn gap="sm">
                <RowBetween style={{ alignItems: 'baseline' }}>
                  <TYPE.largeHeader fontSize={36}>
                    {payoutTokenBalanceResult && payoutTokenBalanceResult.toFixed(2)}
                  </TYPE.largeHeader>
                </RowBetween>
                <RowBetween>
                  <div>
                    <TYPE.black>{govToken?.symbol} Balance to Distribute</TYPE.black>
                  </div>
                </RowBetween>
              </AutoColumn>
            ) : (
              <TYPE.black fontSize={22} textAlign={'center'}>
                Admins Only Buddy
              </TYPE.black>
            )}
          </StyledBottomCard>
        </BottomSection>
        {userPercent && userPercent > 0 ? (
          <TYPE.body fontSize={18} textAlign={'center'}>
            Your allocation: {userPercent.toLocaleString('en-us', { maximumFractionDigits: 2 })}% of rewards
          </TYPE.body>
        ) : (
          <div />
        )}

        {account && userAllocResult ? (
          <DataRow style={{ marginBottom: '0rem' }}>
            <ButtonPit padding="8px" borderRadius="8px" width="160px" onClick={onClaimRewards}>
              Distribute Rewards
            </ButtonPit>
          </DataRow>
        ) : (
          <div />
        )}
        {attempting && !hash && !failed && (
          <LoadingView onDismiss={wrappedOnDismiss}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.body fontSize={20}>Distributing rewards</TYPE.body>
            </AutoColumn>
          </LoadingView>
        )}
        {hash && !failed && (
          <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
            <AutoColumn gap="12px" justify={'center'}>
              <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
              <TYPE.body fontSize={20}>Distributed {govToken?.symbol}!</TYPE.body>
            </AutoColumn>
          </SubmittedView>
        )}
        {!attempting && !hash && failed && (
          <ContentWrapper gap="sm">
            <RowBetween>
              <TYPE.mediumHeader>
                <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                  ⚠️
                </span>
                Error!
              </TYPE.mediumHeader>
              <CloseIcon onClick={wrappedOnDismiss} />
            </RowBetween>
            <TYPE.subHeader style={{ textAlign: 'center' }}>
              Your transaction couldn&apos;t be submitted.
              <br />
              You may have to increase your Gas Price (GWEI) settings!
            </TYPE.subHeader>
          </ContentWrapper>
        )}
      </TopSection>
    </PageWrapper>
  )
}
