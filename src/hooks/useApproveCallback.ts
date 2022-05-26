import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { CurrencyAmount, DEFAULT_CURRENCIES, PROTOCOLS, TokenAmount, Trade, TradeType } from '@amaterasu-fi/sdk'
import { useCallback, useMemo } from 'react'
import { useTokenAllowance } from '../data/Allowances'
// import { getTradeVersion, useV1TradeExchangeAddress } from '../dataata/V1'
// import { Field } from '../state/swap/actions'
import { useHasPendingApproval, useTransactionAdder } from '../state/transactions/hooks'
// import { computeSlippageAdjustedAmounts } from '../utils/prices'
// import { Version } from './VersionuseToggledVersion'
import { calculateGasMargin, useRouterContractAddress } from '../utils'
import { useTokenContract } from './useContract'
import { useActiveWeb3React } from './index'
import { StableTrade } from '../state/swap/hooks'

export enum ApprovalState {
  UNKNOWN,
  NOT_APPROVED,
  PENDING,
  APPROVED
}

// returns a variable indicating the state of the approval and a function which approves if necessary or early returns
export function useApproveCallback(
  amountToApprove?: CurrencyAmount,
  spender?: string
): [ApprovalState, () => Promise<void>] {
  const { account } = useActiveWeb3React()
  const token = amountToApprove instanceof TokenAmount ? amountToApprove.token : undefined
  const currentAllowance = useTokenAllowance(token, account ?? undefined, spender)
  const pendingApproval = useHasPendingApproval(token?.address, spender)

  // check the current approval status
  const approvalState: ApprovalState = useMemo(() => {
    if (!amountToApprove || !spender) return ApprovalState.UNKNOWN
    if (DEFAULT_CURRENCIES.includes(amountToApprove.currency)) return ApprovalState.APPROVED
    // we might not have enough data to know whether or not we need to approve
    if (!currentAllowance) return ApprovalState.UNKNOWN

    // amountToApprove will be defined if currentAllowance is
    return currentAllowance.lessThan(amountToApprove)
      ? pendingApproval
        ? ApprovalState.PENDING
        : ApprovalState.NOT_APPROVED
      : ApprovalState.APPROVED
  }, [amountToApprove, currentAllowance, pendingApproval, spender])

  const tokenContract = useTokenContract(token?.address)
  const addTransaction = useTransactionAdder()

  const approve = useCallback(async (): Promise<void> => {
    if (approvalState !== ApprovalState.NOT_APPROVED) {
      console.error('approve was called unnecessarily')
      return
    }
    if (!token) {
      console.error('no token')
      return
    }

    if (!tokenContract) {
      console.error('tokenContract is null')
      return
    }

    if (!amountToApprove) {
      console.error('missing amount to approve')
      return
    }

    if (!spender) {
      console.error('no spender')
      return
    }

    let useExact = false
    const estimatedGas = await tokenContract.estimateGas.approve(spender, MaxUint256).catch(() => {
      // general fallback for tokens who restrict approval amounts
      useExact = true
      return tokenContract.estimateGas.approve(spender, amountToApprove.raw.toString())
    })

    return tokenContract
      .approve(spender, useExact ? amountToApprove.raw.toString() : MaxUint256, {
        gasLimit: calculateGasMargin(estimatedGas)
      })
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Approve ' + amountToApprove.currency.symbol,
          approval: { tokenAddress: token.address, spender: spender }
        })
      })
      .catch((error: Error) => {
        console.debug('Failed to approve token', error)
        throw error
      })
  }, [approvalState, token, tokenContract, amountToApprove, spender, addTransaction])

  return [approvalState, approve]
}

export function useRouterAddressFromTrade(trade?: Trade | StableTrade | null): string | undefined {
  const nativeRouterAddress = useRouterContractAddress()
  if (!trade) {
    return undefined
  }
  const isNormalTrade = trade instanceof Trade
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  let routerAddress = (trade && isNormalTrade && PROTOCOLS[trade.protocol].routerAddress) ?? nativeRouterAddress
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-expect-error
  routerAddress = isNormalTrade ? routerAddress : trade.stablePool.minterAddress
  return routerAddress
}

// wraps useApproveCallback in the context of a swap
export function useApproveCallbackFromTrade(trade?: Trade | StableTrade | null, allowedSlippage = 0) {
  const routerAddress = useRouterAddressFromTrade(trade)
  const inputAmount = trade?.tradeType === TradeType.EXACT_INPUT ? trade.inputAmount : trade?.outputAmount
  return useApproveCallback(inputAmount, routerAddress)
}
