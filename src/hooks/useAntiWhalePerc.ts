import { useMemo } from 'react'
import { TokenAmount } from '@amaterasu-fi/sdk'
import { useGovTokenContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'
import useGovernanceToken from './useGovernanceToken'

export default function useAntiWhalePerc(): Record<string, any> | undefined {
  const govToken = useGovernanceToken()
  const govTokenContract = useGovTokenContract()

  const maxTransferAmount = useSingleCallResult(govTokenContract, 'maxTransferAmount')?.result?.[0]
  const maxTransferAmountRate = useSingleCallResult(govTokenContract, 'maxTransferAmountRate')?.result?.[0]

  return useMemo(() => {
    return maxTransferAmount && govToken && maxTransferAmountRate
      ? {
          maxTransferAmount: maxTransferAmount && govToken && new TokenAmount(govToken, maxTransferAmount),
          maxTransferAmountPerc: maxTransferAmountRate && maxTransferAmountRate / 100
        }
      : undefined
  }, [govTokenContract, govToken, maxTransferAmount, maxTransferAmountRate])
}
