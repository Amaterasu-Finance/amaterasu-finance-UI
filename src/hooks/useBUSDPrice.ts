import { Currency, currencyEquals, JSBI, Token, Price, WETH, ChainId } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import { PairState, usePairs } from '../data/Reserves'
import { useActiveWeb3React } from '.'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import getToken from '../utils/getToken'

/**
 * Returns the price in BUSD of the input currency
 * @param currency currency to compute the BUSD price of
 */
export default function useBUSDPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React()
  console.log('useBUSDPrice')
  const wrapped = wrappedCurrency(currency, chainId)
  console.log('useBUSDPrice wrapped', wrapped)
  const usdTicker = chainId !== ChainId.MTV_MAINNET ? 'tUSDC' : 'tUSDC'
  console.log('useBUSDPrice usdTicker', usdTicker)
  const usd: Token | undefined = getToken(chainId, usdTicker)
  console.log('useBUSDPrice usd', usd)

  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && wrapped && currencyEquals(WETH[chainId], wrapped) ? undefined : currency,
        chainId ? WETH[chainId] : undefined
      ],
      [usd && wrapped?.equals(usd) ? undefined : wrapped, usd],
      [chainId ? WETH[chainId] : undefined, usd]
    ],
    [chainId, currency, wrapped, usd]
  )

  console.log('useBUSDPrice tokenPairs', tokenPairs)

  const [[ethPairState, ethPair], [busdPairState, busdPair], [busdEthPairState, busdEthPair]] = usePairs(tokenPairs)

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined
    }
    // handle weth/eth
    if (wrapped.equals(WETH[chainId])) {
      if (busdPair) {
        const price = busdPair.priceOf(WETH[chainId])
        return usd ? new Price(currency, usd, price.denominator, price.numerator) : undefined
      } else {
        return undefined
      }
    }

    // handle busd
    if (usd && wrapped.equals(usd)) {
      return usd ? new Price(usd, usd, '1', '1') : undefined
    }

    const ethPairETHAmount = ethPair?.reserveOf(WETH[chainId])
    const ethPairETHBUSDValue: JSBI =
      ethPairETHAmount && busdEthPair ? busdEthPair.priceOf(WETH[chainId]).quote(ethPairETHAmount).raw : JSBI.BigInt(0)

    console.log('useBUSDPrice ethPairETHAmount', ethPairETHAmount)
    console.log('useBUSDPrice ethPairETHBUSDValue', ethPairETHBUSDValue)
    // all other tokens
    // first try the usd pair
    if (
      usd &&
      busdPairState === PairState.EXISTS &&
      busdPair &&
      busdPair.reserveOf(usd).greaterThan(ethPairETHBUSDValue)
    ) {
      const price = busdPair.priceOf(wrapped)
      return usd ? new Price(currency, usd, price.denominator, price.numerator) : undefined
    }
    if (ethPairState === PairState.EXISTS && ethPair && busdEthPairState === PairState.EXISTS && busdEthPair) {
      if (usd && busdEthPair.reserveOf(usd).greaterThan('0') && ethPair.reserveOf(WETH[chainId]).greaterThan('0')) {
        const ethUsdcPrice = busdEthPair.priceOf(usd)
        const currencyEthPrice = ethPair.priceOf(WETH[chainId])
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert()
        return new Price(currency, usd, usdcPrice.denominator, usdcPrice.numerator)
      }
    }
    return undefined
  }, [chainId, usd, currency, ethPair, ethPairState, busdEthPair, busdEthPairState, busdPair, busdPairState, wrapped])
}
