import { useMemo } from 'react'
import { Fraction, TokenAmount } from '@amaterasu-fi/sdk'
import useBUSDPrice from './useBUSDPrice'
import usePitToken from './usePitToken'
import useGovernanceToken from 'hooks/useGovernanceToken'
import { usePitContract } from './useContract'
import { useSingleCallResult } from '../state/multicall/hooks'

export default function usePitTVL(): Fraction | undefined {
  const govToken = useGovernanceToken()
  const govTokenBusdPrice = useBUSDPrice(govToken)
  const pit = usePitToken()

  const pitContract = usePitContract()
  const pitGovBalance = useSingleCallResult(pitContract, 'balanceOfThis')?.result?.[0]
  const pitGovTokenBalance = govToken && new TokenAmount(govToken, pitGovBalance ?? '0')

  return useMemo(() => {
    return govTokenBusdPrice && pitGovTokenBalance
      ? pitGovTokenBalance?.multiply(govTokenBusdPrice?.adjusted)
      : undefined
  }, [govToken, govTokenBusdPrice, pit, pitGovBalance])
}
