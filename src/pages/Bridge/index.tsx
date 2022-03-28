import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
// import { RowBetween } from '../../components/Row'
// import { ButtonPrimary } from '../../components/Button'
import { ExternalLink, TYPE } from '../../theme'
import { DataCard } from '../../components/earn/styled'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const CustomCard = styled(DataCard)`
  background: linear-gradient(
    60deg,
    ${({ theme }) => theme.customCardGradientStart} 25%,
    ${({ theme }) => theme.customCardGradientEnd} 100%
  );
  overflow: hidden;
  padding: 1.5rem;
  margin-bottom: 25px;
  cursor: pointer;
`

// const DataRow = styled(RowBetween)`
//   justify-content: center;
//   gap: 12px;
//   width: auto;
//   cursor: pointer;
//   ${({ theme }) => theme.mediaWidth.upToSmall`
//     flex-direction: column;
//     gap: 12px;
//   `};
// `

export default function Bridge({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  return (
    <PageWrapper gap="lg" justify="center">
      <CustomCard>
        <ExternalLink href={'https://rainbowbridge.app/transfer'}>
          <TYPE.largeHeader>
            RainbowBridge
            <br />
            <TYPE.subHeader>Bridge from Near & Ethereum</TYPE.subHeader>
          </TYPE.largeHeader>
        </ExternalLink>
      </CustomCard>
      <CustomCard>
        <ExternalLink href={'https://synapseprotocol.com/?inputCurrency=USDC&outputCurrency=USDC'} width={'500px'}>
          <TYPE.largeHeader>
            Synapse
            <br />
            <TYPE.subHeader>Bridge USDC & USDT</TYPE.subHeader>
          </TYPE.largeHeader>
        </ExternalLink>
      </CustomCard>

      <CustomCard>
        <ExternalLink href={'https://app.multichain.org/#/router'} width={'500px'}>
          <TYPE.largeHeader>
            MultiChain
            <br />
            <TYPE.subHeader>Bridge from Avalanche, BSC, Harmony, Polygon</TYPE.subHeader>
          </TYPE.largeHeader>
        </ExternalLink>
      </CustomCard>
    </PageWrapper>
  )
}
