import { Fraction, JSBI } from '@amaterasu-fi/sdk'

export default function calculateApy(apr: Fraction): number | undefined {
  const nTimes = 1000
  if (apr.greaterThan('0')) {
    const aprTime = Number(
      apr
        .divide(JSBI.BigInt(nTimes))
        .add('1')
        .toSignificant(10)
    )
    return Math.pow(aprTime, nTimes) - 1
  }
  return 0
}

export function calculateApyNumber(apr: number): number | undefined {
  const nTimes = 1000
  if (apr > 0) {
    const aprTime = 1 + apr / nTimes
    return Math.pow(aprTime, nTimes) - 1
  }
  return 0
}

export function calculateDailyApy(apr: Fraction): number | undefined {
  const nTimes = 1000
  if (apr.greaterThan('0')) {
    const aprTime = Number(
      apr
        .divide(JSBI.BigInt(nTimes))
        .add('1')
        .toSignificant(10)
    )
    return Math.pow(aprTime, nTimes / 365) - 1
  }
  return 0
}

export function calculateDailyApyNumber(apr: number): number | undefined {
  const nTimes = 1000
  if (apr > 0) {
    const aprTime = 1 + apr / nTimes
    return Math.pow(aprTime, nTimes / 365) - 1
  }
  return 0
}
