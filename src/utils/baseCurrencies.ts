import { ChainId, Currency, ETHER, MTV, WETH } from '@amaterasu-fi/sdk'
import { NETWORK_CHAIN_ID } from '../connectors'

export default function baseCurrencies(chainId: ChainId | undefined): Currency[] {
  const currencies: Currency[] = []

  if (chainId) {
    switch (chainId) {
      case 62621:
        currencies.push(MTV)
        currencies.push(WETH[chainId])
        break
      default:
        currencies.push(MTV)
        currencies.push(WETH[chainId])
        break
    }
  } else {
    currencies.push(ETHER)
    currencies.push(WETH[NETWORK_CHAIN_ID as ChainId])
  }

  return currencies
}
