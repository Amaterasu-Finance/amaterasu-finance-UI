import { ProtocolName, Trade, TradeType } from '@amaterasu-fi/sdk'
import React, { useContext } from 'react'
import { ThemeContext } from 'styled-components'
import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { computeSlippageAdjustedAmounts, computeTradePriceBreakdown } from '../../utils/prices'
import { AutoColumn } from '../Column'
import QuestionHelper from '../QuestionHelper'
import { RowBetween, RowFixed } from '../Row'
import FormattedPriceImpact from './FormattedPriceImpact'
import SwapRoute from './SwapRoute'
import useBlockchain from '../../hooks/useBlockchain'
import getBlockchainAdjustedCurrency from '../../utils/getBlockchainAdjustedCurrency'
import { useActiveWeb3React } from '../../hooks'
import { PIT_SETTINGS } from '../../constants'
import { StableTrade } from '../../state/swap/hooks'

function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function TradeSummary({ trade, allowedSlippage }: { trade: Trade | StableTrade; allowedSlippage: number }) {
  const { chainId } = useActiveWeb3React()
  const pitSettings = chainId ? PIT_SETTINGS[chainId] : undefined
  const blockchain = useBlockchain()

  const theme = useContext(ThemeContext)
  const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const tradeInputCurrency = getBlockchainAdjustedCurrency(blockchain, trade.inputAmount.currency)
  const tradeOutputCurrency = getBlockchainAdjustedCurrency(blockchain, trade.outputAmount.currency)
  const name = trade instanceof Trade ? titleCase(ProtocolName[trade.protocol]) : trade.stablePool.stableSwapName ?? ''

  return (
    <>
      <AutoColumn style={{ padding: '0 16px' }}>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              {isExactIn ? 'Minimum received' : 'Maximum sold'}
            </TYPE.black>
            <QuestionHelper text="Your transaction will revert if there is a large, unfavorable price movement before it is confirmed." />
          </RowFixed>
          <RowFixed>
            <TYPE.black color={theme.text1} fontSize={14}>
              {isExactIn
                ? `${slippageAdjustedAmounts[Field.OUTPUT]?.toSignificant(4)} ${tradeOutputCurrency?.symbol}` ?? '-'
                : `${slippageAdjustedAmounts[Field.INPUT]?.toSignificant(4)} ${tradeInputCurrency?.symbol}` ?? '-'}
            </TYPE.black>
          </RowFixed>
        </RowBetween>
        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Price Impact
            </TYPE.black>
            <QuestionHelper text="The difference between the market price and estimated price due to trade size." />
          </RowFixed>
          <FormattedPriceImpact priceImpact={priceImpactWithoutFee} />
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Liquidity Provider Fee
            </TYPE.black>
            <QuestionHelper
              text={`A portion of each trade (0.25%) goes to liquidity providers and ${pitSettings?.name} stakers as a protocol incentive.`}
            />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text1}>
            {realizedLPFee ? `${realizedLPFee.toSignificant(4)} ${tradeInputCurrency?.symbol}` : '-'}
          </TYPE.black>
        </RowBetween>

        <RowBetween>
          <RowFixed>
            <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
              Protocol
            </TYPE.black>
            <QuestionHelper text={`We check all Protocols to get users the best price on every trade!`} />
          </RowFixed>
          <TYPE.black fontSize={14} color={theme.text1}>
            {name}
          </TYPE.black>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AdvancedSwapDetailsProps {
  trade?: Trade | StableTrade
}

export function AdvancedSwapDetails({ trade }: AdvancedSwapDetailsProps) {
  const theme = useContext(ThemeContext)

  const [allowedSlippage] = useUserSlippageTolerance()

  const showRoute = Boolean(trade && trade.route.path.length > 1)

  return (
    <AutoColumn gap="0px">
      {trade && (
        <>
          <TradeSummary trade={trade} allowedSlippage={allowedSlippage} />
          {showRoute && (
            <>
              <RowBetween style={{ padding: '0 16px' }}>
                <span style={{ display: 'flex', alignItems: 'center' }}>
                  <TYPE.black fontSize={14} fontWeight={400} color={theme.text2}>
                    Route
                  </TYPE.black>
                  <QuestionHelper text="Routing through these tokens resulted in the best price for your trade." />
                </span>
                <SwapRoute trade={trade} />
              </RowBetween>
            </>
          )}
        </>
      )}
    </AutoColumn>
  )
}
