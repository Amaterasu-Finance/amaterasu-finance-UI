import { Fraction, JSBI } from '@amaterasu-fi/sdk'

export default function calculateApy(apr: Fraction): number | undefined {
  const nTimes = 1000
  if (apr.greaterThan('0')) {
    const aprTime = Number(
      apr
        .divide(JSBI.BigInt(1000))
        .add('1')
        .toSignificant(10)
    )
    return Math.pow(aprTime, nTimes) - 1
  }
  return 0
}
