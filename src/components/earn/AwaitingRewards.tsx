import React, { useMemo } from 'react'
import { AutoColumn } from '../../components/Column'
import { JSBI } from '@amaterasu-fi/sdk'
import { TYPE } from '../../theme'
// import { useBlockNumber } from '../../state/application/hooks'
import { useSingleCallResult } from '../../state/multicall/hooks'
import { useMasterBreederContract } from '../../hooks/useContract'
// import useBlockchain from '../../hooks/useBlockchain'
// import getBlockchainBlockTime from '../../utils/getBlockchainBlockTime'
import { BlueCard } from '../../components/Card'
import useGovernanceToken from '../../hooks/useGovernanceToken'
import useCurrentBlockTimestamp from '../../hooks/useCurrentBlockTimestamp'

const MINUTE = 60
const HOUR = MINUTE * 60
const DAY = HOUR * 24

export default function AwaitingRewards() {
  // const blockchain = useBlockchain()
  // const blockTime = getBlockchainBlockTime(blockchain)
  const masterBreederContract = useMasterBreederContract()
  const govToken = useGovernanceToken()

  const rewardsStartTime = useSingleCallResult(masterBreederContract, 'startTime').result?.[0]
  const currentTimestamp = useCurrentBlockTimestamp()

  const rewardsStarted = useMemo<boolean>(() => {
    return rewardsStartTime && currentTimestamp
      ? JSBI.greaterThanOrEqual(JSBI.BigInt(currentTimestamp), JSBI.BigInt(rewardsStartTime))
      : false
  }, [rewardsStartTime, currentTimestamp])

  const blocksLeftUntilRewards = useMemo<number>(() => {
    return rewardsStartTime && currentTimestamp ? rewardsStartTime - currentTimestamp.toNumber() : 0
  }, [rewardsStartTime, currentTimestamp])

  const secondsToRewards = !rewardsStarted ? blocksLeftUntilRewards : 0
  let startingAt = secondsToRewards
  const days = (startingAt - (startingAt % DAY)) / DAY
  startingAt -= days * DAY
  const hours = (startingAt - (startingAt % HOUR)) / HOUR
  startingAt -= hours * HOUR
  const minutes = (startingAt - (startingAt % MINUTE)) / MINUTE
  startingAt -= minutes * MINUTE
  const seconds = startingAt

  return (
    <>
      {rewardsStartTime && blocksLeftUntilRewards && !rewardsStarted && (
        <BlueCard>
          <AutoColumn gap="10px">
            <TYPE.link fontWeight={400} color={'primaryText1'}>
              <span role="img" aria-label="wizard-icon" style={{ marginRight: '8px' }}>
                💡
              </span>
              <b>{govToken?.symbol}</b> rewards haven&apos;t started yet - they will be activated at block{' '}
              <b>{rewardsStartTime?.toLocaleString()}</b>. There are <b>{blocksLeftUntilRewards}</b> time left until the
              rewards start.
              <br />
              <br />
              Expected start:{' '}
              <b>
                {days ? `${days} ${days === 1 ? 'day' : 'days'}, ` : ''}
                {hours ? `${hours} ${hours === 1 ? 'hour' : 'hours'}, ` : ''}
                {minutes ? `${minutes} ${minutes === 1 ? 'minute' : 'minutes'} ` : ''}
                {seconds
                  ? `${minutes && minutes > 0 ? 'and ' : ''}${seconds} ${seconds === 1 ? 'second' : 'seconds'}`
                  : ''}
              </b>{' '}
              from now.
              <br />
              <br />
              You can deposit your LP tokens now if you want to, and you&apos;ll start earning rewards at time{' '}
              <b>{rewardsStartTime?.toLocaleString()}</b> and thereafter.
            </TYPE.link>
          </AutoColumn>
        </BlueCard>
      )}
    </>
  )
}
