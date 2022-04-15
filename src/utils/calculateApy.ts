import { Fraction, JSBI } from '@amaterasu-fi/sdk'

export default function calculateApy(apr: Fraction): Fraction | undefined {
  const nTimes = JSBI.BigInt(1000)
  if (apr.greaterThan('0')) {
    const aprTime = apr.divide(nTimes).add('1')
    return new Fraction(
      JSBI.exponentiate(aprTime.numerator, nTimes),
      JSBI.exponentiate(aprTime.denominator, nTimes)
    ).subtract('1')
  }

  return new Fraction(JSBI.BigInt(0), JSBI.BigInt(1))
}
