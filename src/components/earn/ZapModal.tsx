import React, { useState, useCallback } from 'react'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import ProgressCircles from '../ProgressSteps'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { Token, CurrencyAmount } from '@amaterasu-fi/sdk'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useFarmZapperContract } from '../../hooks/useContract'
import { useApproveCallback, ApprovalState } from '../../hooks/useApproveCallback'
// import { StakingInfo, useDerivedStakeInfo } from '../../state/stake/hooks'
//import { wrappedCurrencyAmount } from '../../utils/wrappedCurrency'
import { TransactionResponse } from '@ethersproject/providers'
import { useTransactionAdder } from '../../state/transactions/hooks'
import { LoadingView, SubmittedView } from '../ModalViews'
// import { ZERO_ADDRESS } from '../../constants'
// import { BlueCard } from '../Card'
// import { ColumnCenter } from '../Column'
import { calculateGasMargin } from '../../utils'
import { useDerivedStakeInfo } from '../../state/vault/hooks'
import CurrencyLogo from '../CurrencyLogo'
import { darken } from 'polished'
import { useCurrencyBalances } from '../../state/wallet/hooks'
import { PROTOCOLS_MAINNET } from '../../constants/protocol'
import { StakingInfo } from '../../state/stake/hooks'

const StyledTokenName = styled.span<{ active?: boolean }>`
  ${({ active }) => (active ? '  margin: 0 0.25rem 0 0.75rem;' : '  margin: 0 0.25rem 0 0.25rem;')}
  font-size:  ${({ active }) => (active ? '20px' : '16px')};
`
const CurrencySelect = styled.button<{ selected: boolean }>`
  align-items: center;
  height: 2.2rem;
  font-size: 20px;
  min-width: 80px;
  font-weight: 500;
  background: linear-gradient(
    60deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  color: ${({ selected, theme }) => (selected ? theme.text1 : theme.white)};
  border-radius: 8px;
  box-shadow: ${({ selected }) => (selected ? 'none' : '0px 6px 10px rgba(0, 0, 0, 0.075)')};
  outline: none;
  cursor: pointer;
  user-select: none;
  border: none;
  padding: 0 0.5rem;
  opacity: ${({ selected, theme }) => (selected ? '40%' : '100%')};
  :focus,
  :hover {
    background-color: ${({ selected, theme }) => (selected ? theme.bg2 : darken(0.05, theme.primary1))};
  }
`
const Aligner = styled.span`
  display: flex;
  align-items: center;
  justify-content: space-between;
`

const ContentWrapper = styled(AutoColumn)`
  width: 100%;
  padding: 1rem;
`

interface StakingModalProps {
  isOpen: boolean
  onDismiss: () => void
  stakingInfo: StakingInfo
}

export default function ZapModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account, library } = useActiveWeb3React()

  // track and parse user input
  const SLIPPAGE_FACTOR = 950 // TODO - make this user input. Currently 5%.
  const [typedValue, setTypedValue] = useState('')
  const currencyA = stakingInfo.tokens[0]
  const currencyB = stakingInfo.tokens[1]
  const balances = useCurrencyBalances(account ?? undefined, [currencyA, currencyB])

  // state for pending and submitted txn views
  const addTransaction = useTransactionAdder()
  const [attempting, setAttempting] = useState<boolean>(false)
  const [hash, setHash] = useState<string | undefined>()
  const [failed, setFailed] = useState<boolean>(false)
  const [currency, setCurrency] = useState<Token>(currencyA)
  const [userTokens, setUserTokens] = useState<CurrencyAmount | undefined>(balances[0])
  const wrappedOnDismiss = useCallback(() => {
    setHash(undefined)
    setAttempting(false)
    setFailed(false)
    onDismiss()
  }, [onDismiss])

  const zapper = useFarmZapperContract()
  const { parsedAmount, error } = useDerivedStakeInfo(typedValue, currency, userTokens)

  // approval data for stake
  const deadline = useTransactionDeadline()
  const [signatureData, setSignatureData] = useState<{ v: number; r: string; s: string; deadline: number } | null>(null)
  const [approval, approveCallback] = useApproveCallback(parsedAmount, zapper?.address)

  async function onZap() {
    setAttempting(true)
    if (currency && account && zapper && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const formattedAmount = `0x${parsedAmount.raw.toString(16)}`

        //   function zapInTokenAndStake(
        //       address _from,
        //       uint256 amount,
        //       address _to,
        //       address routerAddr,
        //       address _recipient,
        //       address[] memory path0,
        //       address[] memory path1,
        //       uint256 vaultPid,
        //       uint256 slippageFactor
        // ) external {
        const estimatedGas = await zapper.estimateGas.zapInTokenAndStake(
          currency.address,
          formattedAmount,
          stakingInfo.stakedAmount.token.address,
          PROTOCOLS_MAINNET.Amaterasu.routerAddress,
          account,
          [stakingInfo.tokens[1].address, stakingInfo.tokens[0].address],
          [stakingInfo.tokens[0].address, stakingInfo.tokens[1].address],
          stakingInfo.pid,
          SLIPPAGE_FACTOR
        )

        await zapper
          .zapInTokenAndStake(
            currency.address,
            formattedAmount,
            stakingInfo.stakedAmount.token.address,
            PROTOCOLS_MAINNET.Amaterasu.routerAddress,
            account,
            [stakingInfo.tokens[1].address, stakingInfo.tokens[0].address],
            [stakingInfo.tokens[0].address, stakingInfo.tokens[1].address],
            stakingInfo.pid,
            SLIPPAGE_FACTOR,
            {
              gasLimit: calculateGasMargin(estimatedGas)
            }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Zap into ${stakingInfo.name} Farm`
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

  // wrapped onUserInput to clear signatures
  const onUserInput = useCallback((typedValue: string) => {
    setSignatureData(null)
    setTypedValue(typedValue)
  }, [])

  // used for max input button
  const maxAmountInput = maxAmountSpend(userTokens)
  const atMaxAmount = Boolean(maxAmountInput && parsedAmount?.equalTo(maxAmountInput))
  const handleMax = useCallback(() => {
    !userTokens && setUserTokens(balances[0])
    const _userTokens = userTokens ?? balances[0]
    const maxAmountInputSpend = maxAmountSpend(_userTokens)
    maxAmountInputSpend && onUserInput(maxAmountInputSpend.toExact())
  }, [parsedAmount, onUserInput, userTokens, balances])

  async function onAttemptToApprove() {
    if (!library || !deadline) throw new Error('missing dependencies')
    if (!parsedAmount) throw new Error('missing liquidity amount')

    return approveCallback()
  }

  return (
    <Modal isOpen={isOpen} onDismiss={wrappedOnDismiss} maxHeight={90}>
      {!attempting && !hash && !failed && (
        <ContentWrapper gap="lg">
          <RowBetween>
            <TYPE.largeHeader>Zap into {stakingInfo.name} Farm</TYPE.largeHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          <RowBetween style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-around' }}>
            <TYPE.mediumHeader>Choose Token to Zap</TYPE.mediumHeader>
          </RowBetween>
          <RowBetween style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-around' }}>
            <CurrencySelect
              selected={currency === currencyA}
              className="open-currency-select-button"
              onClick={() => {
                setCurrency(currencyA)
                balances && balances[0] && setUserTokens(balances[0])
              }}
            >
              <Aligner>
                <CurrencyLogo currency={currencyA} size={'24px'} />
                <StyledTokenName className="token-symbola-container" active={Boolean(currency === currencyA)}>
                  {(currencyA && currencyA.symbol && currencyA.symbol.length > 20
                    ? currencyA.symbol.slice(0, 4) +
                      '...' +
                      currencyA.symbol.slice(currencyA.symbol.length - 5, currencyA.symbol.length)
                    : currencyA?.symbol) || 'selectToken'}
                </StyledTokenName>
              </Aligner>
            </CurrencySelect>
            <CurrencySelect
              selected={currency === currencyB}
              className="open-currency-select-button"
              onClick={() => {
                setCurrency(currencyB)
                balances && balances[1] && setUserTokens(balances[1])
              }}
            >
              <Aligner>
                <CurrencyLogo currency={currencyB} size={'24px'} />
                <StyledTokenName className="token-symbolb-container" active={Boolean(currency === currencyB)}>
                  {(currencyB && currencyB.symbol && currencyB.symbol.length > 20
                    ? currencyB.symbol.slice(0, 4) +
                      '...' +
                      currencyB.symbol.slice(currencyB.symbol.length - 5, currencyB.symbol.length)
                    : currencyB?.symbol) || 'selectToken'}
                </StyledTokenName>
              </Aligner>
            </CurrencySelect>
          </RowBetween>
          <CurrencyInputPanel
            value={typedValue}
            onUserInput={onUserInput}
            onMax={handleMax}
            disableCurrencySelect={true}
            showMaxButton={!atMaxAmount}
            currency={currency}
            label={''}
            customBalanceText={'Available: '}
            id="zap-token"
          />

          <RowBetween>
            <ButtonConfirmed
              mr="0.5rem"
              onClick={onAttemptToApprove}
              confirmed={approval === ApprovalState.APPROVED || signatureData !== null}
              disabled={approval !== ApprovalState.NOT_APPROVED || signatureData !== null}
            >
              Approve
            </ButtonConfirmed>
            <ButtonError
              disabled={!!error || (signatureData === null && approval !== ApprovalState.APPROVED)}
              error={!!error && !!parsedAmount}
              onClick={onZap}
            >
              {error ?? '⚡ Zap In ⚡'}
            </ButtonError>
          </RowBetween>
          <ProgressCircles steps={[approval === ApprovalState.APPROVED || signatureData !== null]} disabled={true} />
        </ContentWrapper>
      )}
      {attempting && !hash && !failed && (
        <LoadingView onDismiss={wrappedOnDismiss}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Zapping Into Vault</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              {parsedAmount?.toSignificant(4)} {currency && currency.symbol}
            </TYPE.body>
          </AutoColumn>
        </LoadingView>
      )}
      {attempting && hash && !failed && (
        <SubmittedView onDismiss={wrappedOnDismiss} hash={hash}>
          <AutoColumn gap="12px" justify={'center'}>
            <TYPE.largeHeader>Transaction Submitted</TYPE.largeHeader>
            <TYPE.body fontSize={20}>
              Zapped {parsedAmount?.toSignificant(4)} {currency && currency.symbol}
            </TYPE.body>
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
    </Modal>
  )
}
