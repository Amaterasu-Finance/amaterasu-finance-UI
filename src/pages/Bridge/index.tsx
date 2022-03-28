import React from 'react'
import { AutoColumn } from '../../components/Column'
import styled from 'styled-components'
import { RouteComponentProps } from 'react-router-dom'
import { RowBetween } from '../../components/Row'
import { ButtonPrimary } from '../../components/Button'
import { ExternalLink, TYPE } from '../../theme'

const PageWrapper = styled(AutoColumn)`
  max-width: 720px;
  width: 100%;
`

const DataRow = styled(RowBetween)`
  justify-content: center;
  gap: 12px;

  ${({ theme }) => theme.mediaWidth.upToSmall`
    flex-direction: column;
    gap: 12px;
  `};
`

export default function Bridge({
  match: {
    params: { currencyIdA, currencyIdB }
  }
}: RouteComponentProps<{ currencyIdA: string; currencyIdB: string }>) {
  return (
    <PageWrapper gap="lg" justify="center">
      <DataRow>
        <ExternalLink href={'https://rainbowbridge.app/transfer'} width={'500px'}>
          <ButtonPrimary>
            <TYPE.largeHeader>
              RainbowBridge
              <br />
              <TYPE.subHeader>Bridge from Near & Ethereum</TYPE.subHeader>
            </TYPE.largeHeader>
          </ButtonPrimary>
        </ExternalLink>
      </DataRow>
      <DataRow>
        <ExternalLink href={'https://synapseprotocol.com/?inputCurrency=USDC&outputCurrency=USDC'} width={'500px'}>
          <ButtonPrimary>
            <TYPE.largeHeader>
              Synapse
              <br />
              <TYPE.subHeader>Bridge USDC & USDT</TYPE.subHeader>
            </TYPE.largeHeader>
          </ButtonPrimary>
        </ExternalLink>
      </DataRow>

      <DataRow>
        <ExternalLink href={'https://app.multichain.org/#/router'} width={'500px'}>
          <ButtonPrimary>
            <TYPE.largeHeader>
              MultiChain
              <br />
              <TYPE.subHeader>Bridge from Avalanche, BSC, Harmony, Polygon</TYPE.subHeader>
            </TYPE.largeHeader>
          </ButtonPrimary>
        </ExternalLink>
      </DataRow>
    </PageWrapper>
  )
}
