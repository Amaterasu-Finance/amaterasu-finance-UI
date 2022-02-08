import React from 'react'
import { TYPE } from '../../theme'
import getTimePeriods from 'utils/getTimePeriods'

const WithdrawalFeeTimer: React.FC<{ secondsRemaining: number | null }> = ({ secondsRemaining }) => {
  const { hours, minutes, seconds } = getTimePeriods(secondsRemaining)

  return (
    <TYPE.white fontSize={15}>
      {hours && hours}h : {minutes && minutes}m : {seconds && seconds}s
    </TYPE.white>
  )
}

export default WithdrawalFeeTimer
