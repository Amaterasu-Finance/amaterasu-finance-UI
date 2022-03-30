import { useActiveWeb3React } from '../../hooks'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import { TokenAmount } from '@amaterasu-fi/sdk'
import { useTokenBalance } from '../../state/wallet/hooks'
import { GOVERNANCE_TOKEN_INTERFACE } from '../../constants/abis/governanceToken'
import React, { useCallback, useState } from 'react'
import { useDerivedStakeInfo } from '../../state/stake/hooks'
import { PIT_SETTINGS } from '../../constants'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { usePitContract } from '../../hooks/useContract'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { Col, Divider, Row } from 'antd'
import ProgressCircles from '../../components/ProgressSteps'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { CloseIcon, TYPE } from '../../theme'
import styled from 'styled-components'
import { ButtonConfirmed, ButtonError } from '../../components/Button'

export const ButtonConfirmedPit = styled(ButtonConfirmed)`
  background: linear-gradient(
    60deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  border: 1px solid #ff6600;
`

export const ButtonErrorPit = styled(ButtonError)`
  background: linear-gradient(
    60deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  border: 1px solid #ff6600;
`

export const StakePanel = () => {
  const { chainId, library, account } = useActiveWeb3React()
  const stakingToken: any = useGovernanceToken()
  const userLiquidityUnstaked: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    stakingToken,
    'balanceOf',
    GOVERNANCE_TOKEN_INTERFACE
  )

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, stakingToken, userLiquidityUnstaked)

  const govToken = useGovernanceToken()
  const pitSettings = chainId ? PIT_SETTINGS[chainId] : undefined

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [failed, setFailed] = useState<boolean>(false)

  const pit = usePitContract()

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [approval, approveCallback] = useApproveCallback(parsedAmount, pit?.address)

  async function onStake() {
    setAttempting(true)
    if (pit && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const formattedAmount = `0x${parsedAmount.raw.toString(16)}`
        const estimatedGas = await pit.estimateGas.enter(formattedAmount, account)
        await pit
          .enter(formattedAmount, account, {
            gasLimit: calculateGasMargin(estimatedGas)
          })
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Deposit ${govToken?.symbol} to ${pitSettings?.name}`
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
      } else {
        setAttempting(false)
        throw new Error('Attempting to stake without approval or a signature. Please contact support.')
      }
    }
  }
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    setFailed(false)
  }, [])

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityUnstaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  async function onAttemptToApprove() {
    if (!pit || !library || !deadline) throw new Error('missing dependencies')
    const liquidityAmount = parsedAmount
    if (!liquidityAmount) throw new Error('missing liquidity amount')

    return approveCallback()
  }

  return (
    <>
      {!attempting && !hash && !failed && (
        <>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={stakingToken}
            label={''}
            isPit={true}
            disableCurrencySelect={true}
            customBalanceText={'Available to deposit: '}
            id="stake-liquidity-token"
          />
          <Divider />
          <Row gutter={24} style={{ fontSize: '14px' }} justify={'space-around'}>
            <Col className="gutter-row" span={12}>
              <ButtonConfirmedPit
                mr="0.5rem"
                onClick={onAttemptToApprove}
                confirmed={approval === ApprovalState.APPROVED}
                disabled={approval !== ApprovalState.NOT_APPROVED}
              >
                Approve
              </ButtonConfirmedPit>
            </Col>
            <Col className="gutter-row" span={12}>
              <ButtonErrorPit
                disabled={!!error || approval !== ApprovalState.APPROVED}
                error={!!error && !!parsedAmount}
                onClick={onStake}
              >
                {error ?? 'Deposit'}
              </ButtonErrorPit>
            </Col>
          </Row>
          <br />
          <ProgressCircles steps={[approval === ApprovalState.APPROVED]} disabled={true} />
        </>
      )}
      {attempting && !hash && !failed && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <Col>
            <TYPE.largeHeader>
              Depositing {govToken?.symbol} to {pitSettings?.name}
            </TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              {parsedAmount?.toSignificant(4)} {govToken?.symbol}
            </TYPE.body>
          </Col>
        </LoadingView>
      )}
      {attempting && hash && !failed && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <Col>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              Deposited {parsedAmount?.toSignificant(4)} {govToken?.symbol}
            </TYPE.body>
          </Col>
        </SubmittedView>
      )}
      {!attempting && !hash && failed && (
        <>
          <Row>
            <TYPE.mediumHeader>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '0.5rem' }}>
                ⚠️
              </span>
              Error!
            </TYPE.mediumHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </Row>
          <TYPE.subHeader style={{ textAlign: 'center' }}>
            Your transaction couldn&apos;t be submitted.
            <br />
            You may have to increase your Gas Price (GWEI) settings!
          </TYPE.subHeader>
        </>
      )}
    </>
  )
}
