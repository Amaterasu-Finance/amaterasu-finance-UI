import { Currency, currencyEquals, JSBI, Token, Price } from '@amaterasu-fi/sdk'
import { useMemo } from 'react'
import { PairState, usePairs } from '../data/Reserves'
import { useActiveWeb3React } from '.'
import { wrappedCurrency } from '../utils/wrappedCurrency'
import getToken from '../utils/getToken'

/**
 * Returns the price by going through Token <> AURORA <> USDC
 * @param currency currency to compute the price of
 */
export default function useAuroraPrice(currency?: Currency): Price | undefined {
  const { chainId } = useActiveWeb3React()
  const wrapped = wrappedCurrency(currency, chainId)
  const usd: Token | undefined = getToken(chainId, 'USDC')
  const aurora: Token | undefined = getToken(chainId, 'AURORA')

  const tokenPairs: [Currency | undefined, Currency | undefined][] = useMemo(
    () => [
      [
        chainId && aurora && wrapped && currencyEquals(aurora, wrapped) ? undefined : currency,
        chainId ? aurora : undefined
      ],
      [usd && wrapped?.equals(usd) ? undefined : wrapped, usd],
      [chainId ? aurora : undefined, usd]
    ],
    [chainId, currency, wrapped, usd]
  )

  const [[ethPairState, ethPair], [busdPairState, busdPair], [busdEthPairState, busdEthPair]] = usePairs(tokenPairs)

  return useMemo(() => {
    if (!currency || !wrapped || !chainId) {
      return undefined
    }
    // handle weth/eth
    if (aurora && wrapped.equals(aurora)) {
      if (busdPair) {
        const price = busdPair.priceOf(aurora)
        return usd && price.greaterThan('0') ? new Price(currency, usd, price.denominator, price.numerator) : undefined
      } else {
        return undefined
      }
    }

    // handle busd
    if (usd && wrapped.equals(usd)) {
      return usd ? new Price(usd, usd, '1', '1') : undefined
    }

    const ethPairETHAmount = aurora && ethPair?.reserveOf(aurora)
    const ethPairETHBUSDValue: JSBI =
      usd && aurora && ethPairETHAmount && busdEthPair && busdEthPair.reserveOf(usd).greaterThan('0')
        ? busdEthPair.priceOf(aurora).quote(ethPairETHAmount).raw
        : JSBI.BigInt(0)

    // all other tokens
    // first try the usd pair
    if (
      usd &&
      busdPairState === PairState.EXISTS &&
      busdPair &&
      busdPair.reserveOf(usd).greaterThan(ethPairETHBUSDValue)
    ) {
      const price = busdPair.priceOf(wrapped)
      return usd && price.greaterThan('0') ? new Price(currency, usd, price.denominator, price.numerator) : undefined
    }
    if (ethPairState === PairState.EXISTS && ethPair && busdEthPairState === PairState.EXISTS && busdEthPair) {
      if (usd && aurora && busdEthPair.reserveOf(usd).greaterThan('0') && ethPair.reserveOf(aurora).greaterThan('0')) {
        const ethUsdcPrice = busdEthPair.priceOf(usd)
        const currencyEthPrice = ethPair.priceOf(aurora)
        const usdcPrice = ethUsdcPrice.multiply(currencyEthPrice).invert()
        return new Price(currency, usd, usdcPrice.denominator, usdcPrice.numerator)
      }
    }
    return undefined
  }, [chainId, usd, currency, ethPair, ethPairState, busdEthPair, busdEthPairState, busdPair, busdPairState, wrapped])
}
