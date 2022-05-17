import React, { useState, useCallback } from 'react'
import useTransactionDeadline from '../../hooks/useTransactionDeadline'
import Modal from '../Modal'
import { AutoColumn, ColumnCenter } from '../Column'
import styled from 'styled-components'
import { RowBetween } from '../Row'
import { TYPE, CloseIcon } from '../../theme'
import { ButtonConfirmed, ButtonError } from '../Button'
import ProgressCircles from '../ProgressSteps'
import CurrencyInputPanel from '../CurrencyInputPanel'
import { Token, CurrencyAmount, Currency } from '@amaterasu-fi/sdk'
import { useActiveWeb3React } from '../../hooks'
import { maxAmountSpend } from '../../utils/maxAmountSpend'
import { useZapperContract } from '../../hooks/useContract'
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
import { VaultsInfo, useDerivedStakeInfo } from '../../state/vault/hooks'
import CurrencyLogo from '../CurrencyLogo'
import { darken } from 'polished'
import { useCurrencyBalances } from '../../state/wallet/hooks'
import { BlueCard } from '../Card'
import { CURVE_POOLS_MAINNET } from '../../constants/curvePools'
import { ProtocolName } from '../../constants/protocol'

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
  stakingInfo: VaultsInfo
  currencies: Currency[] | undefined
}

export function is3PoolToken(symbol: string): boolean {
  return ['DAI', 'USDC', 'USDT'].includes(symbol)
}

export function get3PoolIndex(symbol: string): number {
  switch (symbol) {
    case 'DAI':
      return 0
    case 'USDC':
      return 1
    case 'USDT':
      return 2
    default:
      return 0
  }
}

export function get3PoolTriIndex(symbol: string): number {
  switch (symbol) {
    case 'USDC':
      return 0
    case 'USDT':
      return 1
    case 'USN':
      return 2
    default:
      return 0
  }
}

export default function ZapModal({ isOpen, onDismiss, stakingInfo }: StakingModalProps) {
  const { account, library } = useActiveWeb3React()

  // track and parse user input
  const SLIPPAGE_FACTOR = 950 // TODO - make this user input. Currently 5%.
  const [typedValue, setTypedValue] = useState('')
  const currencyA = stakingInfo.tokens[0]
  const currencyB = stakingInfo.tokens[1]
  const balances = useCurrencyBalances(account ?? undefined, stakingInfo.tokens)

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

  const zapper = useZapperContract()
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
          stakingInfo.lp.address,
          stakingInfo.lp.protocol.routerAddress,
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
            stakingInfo.lp.address,
            stakingInfo.lp.protocol.routerAddress,
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
              summary: `Zap into Vault`
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

  async function onZap3pool() {
    setAttempting(true)
    if (currency && account && zapper && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const formattedAmount = `0x${parsedAmount.raw.toString(16)}`

        //   function zapIn3PoolAndStake(
        //     address _from, // token to zap in
        //     uint256 amount, // amount
        //     address _to, // lp token for 3pool
        //     address lpMinterAddress, // contract address that can mint the lp tokens
        //     address _recipient, // user to deposit into vault for
        //     uint256 _fromIndex, // index of from token on 3pool
        //     uint256 vaultPid // pool id for vault
        // ) external {
        const index = get3PoolIndex(currency.symbol ?? '')
        const estimatedGas = await zapper.estimateGas.zapIn3PoolAndStake(
          currency.address,
          formattedAmount,
          stakingInfo.lp.address,
          stakingInfo.lp.minterAddress,
          account,
          index,
          stakingInfo.pid
        )

        await zapper
          .zapIn3PoolAndStake(
            currency.address,
            formattedAmount,
            stakingInfo.lp.address,
            stakingInfo.lp.minterAddress,
            account,
            index,
            stakingInfo.pid,
            {
              gasLimit: calculateGasMargin(estimatedGas)
            }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Zap into Vault`
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

  async function onZap3poolTri() {
    setAttempting(true)
    if (currency && account && zapper && parsedAmount && deadline) {
      if (approval === ApprovalState.APPROVED) {
        const formattedAmount = `0x${parsedAmount.raw.toString(16)}`

        //   function zapIn3PoolAndStake(
        //     address _from, // token to zap in
        //     uint256 amount, // amount
        //     address _to, // lp token for 3pool
        //     address lpMinterAddress, // contract address that can mint the lp tokens
        //     address _recipient, // user to deposit into vault for
        //     uint256 _fromIndex, // index of from token on 3pool
        //     uint256 vaultPid // pool id for vault
        // ) external {
        const index = get3PoolTriIndex(currency.symbol ?? '')
        const estimatedGas = await zapper.estimateGas.zapIn3PoolTriAndStake(
          currency.address,
          formattedAmount,
          stakingInfo.lp.address,
          stakingInfo.lp.minterAddress,
          account,
          index,
          stakingInfo.pid
        )

        await zapper
          .zapIn3PoolTriAndStake(
            currency.address,
            formattedAmount,
            stakingInfo.lp.address,
            stakingInfo.lp.minterAddress,
            account,
            index,
            stakingInfo.pid,
            {
              gasLimit: calculateGasMargin(estimatedGas)
            }
          )
          .then((response: TransactionResponse) => {
            addTransaction(response, {
              summary: `Zap into Vault`
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

  async function onZap2pool() {
    setAttempting(true)
    if (currency && account && zapper && parsedAmount && deadline) {
      // console.log('is3PoolToken', is3PoolToken(currency.symbol ?? ''))
      // console.log('index3Pool', get3PoolIndex(currency.symbol ?? ''))
      if (approval === ApprovalState.APPROVED) {
        const formattedAmount = `0x${parsedAmount.raw.toString(16)}`
        // 2 possibilities - either zap into the 3pool first or just straight into the 2pool
        if (is3PoolToken(currency.symbol ?? '')) {
          //   function zapIn2PoolAndStake(
          //     address _from, // token to zap in
          //     uint256 amount, // amount
          //     address _3poolAddress, // lp token for 3pool
          //     uint256 _fromIndex, // index of `_from` on 3pool
          //     address _3poolMinterAddress, // contract address that can mint the lp tokens
          //     address _2poolAddress, // final lp token for vault
          //     address _2poolMinterAddress, // contract address that can mint the lp tokens
          //     uint256 _3poolIndex, // index of the 3pool on the final lp token
          //     address _recipient, // user to deposit into vault for
          //     uint256 vaultPid // pool id for vault
          // ) external {
          const index3Pool = get3PoolIndex(currency.symbol ?? '')
          const index = 1
          console.log('symbol index', currency.symbol, index)
          const estimatedGas = await zapper.estimateGas.zapIn2PoolAndStake(
            currency.address,
            formattedAmount,
            CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT.address,
            index3Pool,
            CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT.minterAddress,
            stakingInfo.lp.address,
            stakingInfo.lp.minterAddress,
            index,
            account,
            stakingInfo.pid
          )

          await zapper
            .zapIn2PoolAndStake(
              currency.address,
              formattedAmount,
              CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT.address,
              index3Pool,
              CURVE_POOLS_MAINNET.ROSE_DAI_USDC_USDT.minterAddress,
              stakingInfo.lp.address,
              stakingInfo.lp.minterAddress,
              index,
              account,
              stakingInfo.pid,
              {
                gasLimit: calculateGasMargin(estimatedGas)
              }
            )
            .then((response: TransactionResponse) => {
              addTransaction(response, {
                summary: `Zap into Vault`
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
          //   function zapIn2PoolNoJumpAndStake(
          //     address _from, // token to zap in
          //     uint256 amount, // amount
          //     address _to, // lp token for 2pool
          //     address lpMinterAddress, // contract address that can mint the lp tokens
          //     address _recipient, // user to deposit into vault for
          //     uint256 _fromIndex, // index of from token on 2pool
          //     uint256 vaultPid // pool id for vault
          // ) external {
          const index = 0 // always 0 for non-3pool tokens
          console.log('symbol index', currency.symbol, index)
          const estimatedGas = await zapper.estimateGas.zapIn2PoolNoJumpAndStake(
            currency.address,
            formattedAmount,
            stakingInfo.lp.address,
            stakingInfo.lp.minterAddress,
            account,
            index,
            stakingInfo.pid
          )

          await zapper
            .zapIn2PoolNoJumpAndStake(
              currency.address,
              formattedAmount,
              stakingInfo.lp.address,
              stakingInfo.lp.minterAddress,
              account,
              index,
              stakingInfo.pid,
              {
                gasLimit: calculateGasMargin(estimatedGas)
              }
            )
            .then((response: TransactionResponse) => {
              addTransaction(response, {
                summary: `Zap into Vault`
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
            <TYPE.largeHeader>Zap into {stakingInfo.lp.name} Vault</TYPE.largeHeader>
            <CloseIcon onClick={wrappedOnDismiss} />
          </RowBetween>
          {stakingInfo.lp.isCurve && (
            <RowBetween>
              <ColumnCenter>
                <BlueCard>
                  <AutoColumn gap="10px">
                    <TYPE.link fontWeight={400} color={'primaryText1'} textAlign="center">
                      📢 <b> Note:</b> <b>{stakingInfo.lp.protocol.name}</b> collects a <b>0.04%</b> deposit fee when
                      entering this pool. Amaterasu has no control over it.
                    </TYPE.link>
                  </AutoColumn>
                </BlueCard>
              </ColumnCenter>
            </RowBetween>
          )}
          <RowBetween style={{ alignItems: 'center', display: 'flex', justifyContent: 'space-around', margin: '0' }}>
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
            {stakingInfo.tokens[2] && (
              <CurrencySelect
                selected={currency === stakingInfo.tokens[2]}
                className="open-currency-select-button"
                onClick={() => {
                  setCurrency(stakingInfo.tokens[2])
                  balances && balances[2] && setUserTokens(balances[2])
                }}
              >
                <Aligner>
                  <CurrencyLogo currency={stakingInfo.tokens[2]} size={'24px'} />
                  <StyledTokenName className="token-symbolb-container" active={Boolean(currency === currencyB)}>
                    {(stakingInfo.tokens[2] && stakingInfo.tokens[2].symbol && stakingInfo.tokens[2].symbol.length > 20
                      ? stakingInfo.tokens[2].symbol.slice(0, 4) +
                        '...' +
                        stakingInfo.tokens[2].symbol.slice(
                          stakingInfo.tokens[2].symbol.length - 5,
                          stakingInfo.tokens[2].symbol.length
                        )
                      : stakingInfo.tokens[2]?.symbol) || 'selectToken'}
                  </StyledTokenName>
                </Aligner>
              </CurrencySelect>
            )}
            {stakingInfo.tokens[3] && (
              <CurrencySelect
                selected={currency === stakingInfo.tokens[3]}
                className="open-currency-select-button"
                onClick={() => {
                  setCurrency(stakingInfo.tokens[3])
                  balances && balances[3] && setUserTokens(balances[3])
                }}
              >
                <Aligner>
                  <CurrencyLogo currency={stakingInfo.tokens[3]} size={'24px'} />
                  <StyledTokenName className="token-symbolb-container" active={Boolean(currency === currencyB)}>
                    {(stakingInfo.tokens[3] && stakingInfo.tokens[3].symbol && stakingInfo.tokens[3].symbol.length > 20
                      ? stakingInfo.tokens[3].symbol.slice(0, 4) +
                        '...' +
                        stakingInfo.tokens[3].symbol.slice(
                          stakingInfo.tokens[3].symbol.length - 5,
                          stakingInfo.tokens[3].symbol.length
                        )
                      : stakingInfo.tokens[3]?.symbol) || 'selectToken'}
                  </StyledTokenName>
                </Aligner>
              </CurrencySelect>
            )}
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
              onClick={
                stakingInfo.lp.isCurve
                  ? stakingInfo.lp.protocol.name === ProtocolName.TRISOLARIS
                    ? onZap3poolTri
                    : stakingInfo.lp.urlName === 'stables'
                    ? onZap3pool
                    : onZap2pool
                  : onZap
              }
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
