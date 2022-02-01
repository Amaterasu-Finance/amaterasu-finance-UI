import { ChainId, Token, WETH, TOKENS } from '@amaterasu-fi/sdk'

export default function getTokenWithDefault(chainId: ChainId | undefined, symbol: string): Token | undefined {
  if (chainId === undefined) return undefined
  symbol = symbol.toUpperCase()

  switch (symbol) {
    case 'WETH':
    case 'WBNB':
    case 'WMTV':
      return WETH[chainId]
    default:
      return TOKENS[chainId].firstBySymbol(symbol)
  }
}
