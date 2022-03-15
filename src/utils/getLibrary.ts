import { Web3Provider } from '@ethersproject/providers'
import { Blockchain } from '@amaterasu-fi/sdk'
import { BLOCKCHAIN } from '../connectors'

export default function getLibrary(provider: any): Web3Provider {
  const library = new Web3Provider(provider, 'any')
  switch (BLOCKCHAIN) {
    case Blockchain.MTV:
      library.pollingInterval = 2000
      break
    case Blockchain.HARMONY:
      library.pollingInterval = 500
      break
    default:
      library.pollingInterval = 2000
      break
  }
  return library
}
