import { ChainId } from '@amaterasu-fi/sdk'
import MULTICALL_ABI from './abi.json'

const MULTICALL_NETWORKS: { [chainId in ChainId]: string } = {
  [ChainId.MTV_MAINNET]: '0x1bb4a0A4eB6367b97A8f26E8D552928acFe3B197'
}

export { MULTICALL_ABI, MULTICALL_NETWORKS }
