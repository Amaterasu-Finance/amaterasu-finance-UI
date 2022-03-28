import React from 'react'
import styled from 'styled-components'
import Settings from '../Settings'
import { RowBetween } from '../Row'
import { TYPE } from '../../theme'

const StyledSwapHeader = styled.div`
  padding: 12px 1rem 0px 1.5rem;
  margin-bottom: -4px;
  width: 100%;
  max-width: 420px;
  color: ${({ theme }) => theme.text2};
`

export default function SwapHeader() {
  return (
    <StyledSwapHeader>
      <RowBetween style={{ padding: '1rem 1rem 0 1rem' }}>
        <TYPE.black color={'#212429'}>...</TYPE.black>
        <TYPE.black fontWeight={500} fontSize={'20px'}>
          Swap
        </TYPE.black>
        <Settings />
      </RowBetween>
    </StyledSwapHeader>
  )
}
