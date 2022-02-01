import { Blockchain, Currency, ETHER, BINANCE_COIN, MTV } from '@amaterasu-fi/sdk'

export default function getBlockchainAdjustedCurrency(
  blockchain: Blockchain,
  currency: Currency | undefined
): Currency | undefined {
  if (!currency) return currency
  if (currency !== ETHER) return currency
  switch (blockchain) {
    case Blockchain.BINANCE_SMART_CHAIN:
      return BINANCE_COIN
    case Blockchain.MTV:
      return MTV
    default:
      return ETHER
  }
}
