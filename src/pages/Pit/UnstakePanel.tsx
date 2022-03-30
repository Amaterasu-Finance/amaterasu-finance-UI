import { useActiveWeb3React } from '../../hooks'
import React, { useCallback, useState } from 'react'
import { useDerivedUnstakeInfo } from '../../state/stake/hooks'
import { useTransactionAdder } from '../../state/transactions/hooks'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import { PIT_SETTINGS } from '../../constants'
import { usePitContract } from '../../hooks/useContract'
import usePitToken from '../../hooks/usePitToken'
import { calculateGasMargin } from '../../utils'
import { TransactionResponse } from '@ethersproject/providers'
import { maxAmountSpend } from '../../utils/maxAmountSpend'

import { CloseIcon, TYPE } from '../../theme'
import CurrencyInputPanel from '../../components/CurrencyInputPanel'
import { LoadingView, SubmittedView } from '../../components/ModalViews'
import { TokenAmount } from '@amaterasu-fi/sdk'
import { useTokenBalance } from '../../state/wallet/hooks'
import { PIT_INTERFACE } from '../../constants/abis/pit'
import { Col, Divider, Row } from 'antd'
import { ButtonErrorPit } from './StakePanel'

export const UnstakePanel = () => {
  const { account, chainId } = useActiveWeb3React()
  const pitToken = usePitToken()
  const userLiquidityStaked: TokenAmount | undefined = useTokenBalance(
    account ?? undefined,
    pitToken,
    'balanceOf',
    PIT_INTERFACE
  )

  // track and parse user input
  const [typedValue, setTypedValue] = useState('')
  const { parsedAmount, error } = useDerivedUnstakeInfo(typedValue, userLiquidityStaked)

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [failed, setFailed] = useState<boolean>(false)
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    setFailed(false)
  }, [])

  const govToken = useGovernanceToken()
  const pitSettings = chainId ? PIT_SETTINGS[chainId] : undefined
  const pit = usePitContract()

  async function onWithdraw() {
    if (pit && userLiquidityStaked) {
      setAttempting(true)

      const formattedAmount = `0x${parsedAmount?.raw.toString(16)}`
      const estimatedGas = await pit.estimateGas.leave(formattedAmount)

      await pit
        .leave(formattedAmount, {
          gasLimit: calculateGasMargin(estimatedGas)
        })
        .then((response: TransactionResponse) => {
          addTransaction(response, {
            summary: `Withdraw x${govToken?.symbol} from ${pitSettings?.name}`
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
    }
  }

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userLiquidityStaked)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))

  const handleMax = useCallback(() => {
    maxAmountInput && onUserInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserInput])

  return (
    <>
      {!attempting && !hash && !failed && (
        <>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            showMaxButton={!atMaxAmount}
            currency={pitToken}
            label={''}
            isPit={true}
            disableCurrencySelect={true}
            overrideSelectedCurrencyBalance={userLiquidityStaked}
            customBalanceText={'Available to withdraw: '}
            id="stake-liquidity-token"
          />
          <Divider />
          <Row gutter={24} style={{ fontSize: '14px' }} justify={'space-around'}>
            <Col className="gutter-row" span={12}>
              <ButtonErrorPit disabled={!!error} error={!!error && !!parsedAmount} onClick={onWithdraw}>
                {error ?? 'Withdraw'}
              </ButtonErrorPit>
            </Col>
          </Row>
        </>
      )}
      {attempting && !hash && !failed && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <Col>
            <TYPE.largeHeader>
              Withdrawing x{govToken?.symbol} from {pitSettings?.name}
            </TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              {parsedAmount?.toSignificant(4)} x{govToken?.symbol}
            </TYPE.body>
          </Col>
        </LoadingView>
      )}
      {attempting && hash && !failed && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <Col>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              Withdraw {parsedAmount?.toSignificant(4)} x{govToken?.symbol}
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
