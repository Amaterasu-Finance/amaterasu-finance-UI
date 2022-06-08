import { Fraction, Percent, ProtocolName, Trade, TradeType } from '@amaterasu-fi/sdk'
import React, { Fragment, useContext } from 'react'
import styled, { ThemeContext } from 'styled-components'
// import { Field } from '../../state/swap/actions'
import { useUserSlippageTolerance } from '../../state/user/hooks'
import { TYPE } from '../../theme'
import { warningSeverity } from '../../utils/prices'
import { AutoColumn } from '../Column'
// import QuestionHelper from '../QuestionHelper'
import { RowBetween } from '../Row'
// import FormattedPriceImpact from './FormattedPriceImpact'
// import SwapRoute from './SwapRoute'
import useBlockchain from '../../hooks/useBlockchain'
import getBlockchainAdjustedCurrency from '../../utils/getBlockchainAdjustedCurrency'
// import { useActiveWeb3React } from '../../hooks'
// import { PIT_SETTINGS } from '../../constants'
import { Flex } from 'rebass'
import { unwrappedToken } from '../../utils/wrappedCurrency'
import { ChevronRight } from 'react-feather'
import { ErrorText } from './styleds'
import { ALLOWED_PRICE_IMPACT_MEDIUM, ONE_BIPS } from '../../constants'
import { Col } from 'antd'
import { StableTrade } from '../../state/swap/hooks'

const Break = styled.div`
  width: 100%;
  background-color: rgba(255, 255, 255, 0.2);
  height: 1px;
`

const CenteredCol = styled(Col)`
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
`

const HidingCol = styled(Col)`
  display: flex;
  text-align: center;
  justify-content: center;
  align-items: center;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    display: none;
  `};
`

const AdvancedDetailsFooter = styled.div<{ show: boolean }>`
  padding-top: 0.5rem;
  padding-bottom: 0.5rem;
  margin-top: 0.25rem;
  width: 100%;
  max-width: 600px;
  border-radius: 20px;
  color: ${({ theme }) => theme.text2};
  background-color: ${({ theme }) => theme.bg3};
  z-index: -1;

  transform: ${({ show }) => (show ? 'translateY(0%)' : 'translateY(-100%)')};
  transition: transform 300ms ease-in-out;
`

function FormattedDelta({ delta }: { delta?: Percent }) {
  const sev = delta && delta.lessThan(ONE_BIPS) ? 0 : warningSeverity(ALLOWED_PRICE_IMPACT_MEDIUM)
  return (
    <ErrorText fontWeight={500} fontSize={14} severity={sev}>
      {delta ? (delta.lessThan(ONE_BIPS) ? 'Best' : `-${delta.toFixed(2)}%`) : '-'}
    </ErrorText>
  )
}

function SwapRoute({ trade }: { trade: Trade | StableTrade }) {
  const theme = useContext(ThemeContext)
  const fontSize = trade.route.path.length > 3 ? 12 : 14
  return (
    <Flex flexWrap="wrap" width="100%" justifyContent="center" alignItems="center">
      {trade.route.path.map((token, i, path) => {
        const isLastItem: boolean = i === path.length - 1
        const currency = unwrappedToken(token)
        return (
          <Fragment key={i}>
            <Flex>
              <TYPE.black fontSize={fontSize} color={theme.text1}>
                {currency.symbol}
              </TYPE.black>
            </Flex>
            {isLastItem ? null : <ChevronRight size={fontSize - 2} color={theme.text2} />}
          </Fragment>
        )
      })}
    </Flex>
  )
}

function titleCase(str: string): string {
  return str
    .split(' ')
    .map(word => word[0].toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

function TradeHeader({ tradeType }: { tradeType: TradeType | undefined }) {
  const theme = useContext(ThemeContext)
  return (
    <>
      <AutoColumn style={{ padding: '0 16px' }}>
        <RowBetween>
          <Col xs={6}>
            <TYPE.black fontSize={16} color={theme.text1}>
              Protocol
            </TYPE.black>
          </Col>
          <HidingCol xs={0} sm={9}>
            <TYPE.black color={theme.text1} fontSize={16}>
              Route
            </TYPE.black>
          </HidingCol>
          <CenteredCol xs={15} sm={6}>
            <TYPE.black color={theme.text1} fontSize={16}>
              Amount {tradeType === 0 ? 'Out' : ' In'}
            </TYPE.black>
          </CenteredCol>
          <CenteredCol xs={3}>
            <TYPE.black color={theme.text1} fontSize={16}>
              Diff
            </TYPE.black>
          </CenteredCol>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

function TradeSummary({
  trade,
  allowedSlippage,
  baseTrade
}: {
  trade: Trade | StableTrade
  allowedSlippage: number
  baseTrade: Trade | StableTrade
}) {
  const theme = useContext(ThemeContext)
  // const { chainId } = useActiveWeb3React()
  const blockchain = useBlockchain()

  // const { priceImpactWithoutFee, realizedLPFee } = computeTradePriceBreakdown(trade)
  const isExactIn = trade.tradeType === TradeType.EXACT_INPUT
  // const slippageAdjustedAmounts = computeSlippageAdjustedAmounts(trade, allowedSlippage)

  const delta = isExactIn
    ? new Fraction('1').subtract(trade.outputAmount.divide(baseTrade.outputAmount)).multiply('100')
    : trade.inputAmount
        .divide(baseTrade.inputAmount)
        .subtract('1')
        .multiply('100')
  const tradeInputCurrency = getBlockchainAdjustedCurrency(blockchain, trade.inputAmount.currency)
  const tradeOutputCurrency = getBlockchainAdjustedCurrency(blockchain, trade.outputAmount.currency)

  const name = trade instanceof Trade ? titleCase(ProtocolName[trade.protocol]) : trade.stablePool.stableSwapName ?? ''
  let fontSize = 14
  if (name.length > 12) {
    fontSize = 11
  }

  return (
    <>
      <AutoColumn style={{ padding: '0 16px' }}>
        <RowBetween>
          <Col xs={6}>
            <TYPE.black fontSize={fontSize} color={theme.text1}>
              {name}
            </TYPE.black>
          </Col>
          <HidingCol xs={0} sm={9}>
            <SwapRoute trade={trade} />
          </HidingCol>
          <CenteredCol xs={15} sm={6}>
            <TYPE.black color={theme.text1} fontSize={14}>
              {isExactIn
                ? `${trade.outputAmount.toSignificant(4)} ${tradeOutputCurrency?.symbol}` ?? '-'
                : `${trade.inputAmount.toSignificant(4)} ${tradeInputCurrency?.symbol}` ?? '-'}
            </TYPE.black>
          </CenteredCol>
          <CenteredCol xs={3}>
            <FormattedDelta delta={delta} />
          </CenteredCol>
        </RowBetween>
      </AutoColumn>
    </>
  )
}

export interface AllSwapDetailsProps {
  allTrades?: (Trade | StableTrade | null)[]
}

export function AllSwapDetails({ allTrades }: AllSwapDetailsProps) {
  const [allowedSlippage] = useUserSlippageTolerance()
  const baseTrade = allTrades && allTrades[0]
  // console.log('allTrades', allTrades)

  return (
    <>
      {/* eslint-disable-next-line react/jsx-key */}
      {allTrades && baseTrade && (
        <AdvancedDetailsFooter show={true}>
          <AutoColumn gap="0px">
            <TradeHeader tradeType={allTrades[0]?.tradeType} />
            <Break />
            {allTrades.map(
              trade => trade && <TradeSummary trade={trade} allowedSlippage={allowedSlippage} baseTrade={baseTrade} />
            )}
          </AutoColumn>
        </AdvancedDetailsFooter>
      )}
    </>
  )
}
