import React, { useState, useRef, useEffect } from 'react'
import styled, { css } from 'styled-components'
import { TYPE } from '../../theme'
import { CaretDownFilled } from '@ant-design/icons'
import Logo from '../Logo'

const DropDownHeader = styled.div`
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0px 16px;
  box-shadow: ${({ theme }) => theme.secondary3};
  border: 1px solid ${({ theme }) => theme.primary4};
  border-radius: 16px;
  background: ${({ theme }) => theme.bg1};
  transition: border-radius 0.15s;
`

const DropDownListContainer = styled.div`
  min-width: 136px;
  height: 0;
  position: absolute;
  overflow: hidden;
  background: ${({ theme }) => theme.bg2};
  z-index: 10;
  transition: transform 0.15s, opacity 0.15s;
  transform: scaleY(0);
  transform-origin: top;
  opacity: 0;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 168px;
  `};
`

const DropDownContainer = styled.div<{ isOpen: boolean; width: number; height: number; }>`
  cursor: pointer;
  width: ${({ width }) => width}px;
  position: relative;
  background: ${({ theme }) => theme.primary2};
  border-radius: 16px;
  height: 40px;
  min-width: 136px;
  ${({ theme }) => theme.mediaWidth.upToSmall`
    min-width: 168px;
  `};

  ${props => props.isOpen && css`
      ${DropDownHeader} {
        border-bottom: 1px solid ${({ theme }) => theme.bg3};
        box-shadow: ${({ theme }) => theme.secondary3};
        border-radius: 16px 16px 0 0;
      }

      ${DropDownListContainer} {
        height: auto;
        transform: scaleY(1);
        opacity: 1;
        border: 1px solid ${({ theme }) => theme.bg3};
        border-top-width: 0;
        border-radius: 0 0 16px 16px;
      }
    `}

  svg {
    position: absolute;
    right: 16px;
    top: 50%;
    transform: translateY(-50%);
  }
`

const StyledLogo = styled(Logo)<{ size: string }>`
  width: ${({ size }) => size};
  height: ${({ size }) => size};
  border-radius: ${({ size }) => size};
  box-shadow: 0px 6px 10px rgba(0, 0, 0, 0.075);
  background-color: ${({ theme }) => theme.white};
`

const DropDownList = styled.ul`
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  z-index: 10;
`

const ListItem = styled.li`
  list-style: none;
  padding: 8px 16px;
  &:hover {
    background: ${({ theme }) => theme.bg1};
  }
`

// eslint-disable-next-line prettier/prettier
export type {
  SelectProps,
  OptionProps
}

interface SelectProps {
  options: OptionProps[]
  onChange?: (option: OptionProps) => void
}

interface OptionProps {
  label: string
  value: any
  img?: any
}

const OldSelect: React.FunctionComponent<SelectProps> = ({ options, onChange }) => {
  const containerRef = useRef(null)
  const dropdownRef = useRef(null)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(options[0])
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 })

  const toggling = () => setIsOpen(!isOpen)

  const onOptionClicked = (option: OptionProps) => () => {
    setSelectedOption(option)
    setIsOpen(false)

    if (onChange) {
      onChange(option)
    }
  }

  useEffect(() => {
    setContainerSize({
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      width: dropdownRef.current.offsetWidth, // Consider border
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      height: dropdownRef.current.offsetHeight
    });
  }, [])

  return (
    <DropDownContainer
      isOpen={isOpen}
      ref={containerRef}
      {...containerSize}>
      {containerSize.width !== 0 && (
        <DropDownHeader onClick={toggling}>
          <TYPE.white>{selectedOption.label}</TYPE.white>
        </DropDownHeader>
      )}
      <CaretDownFilled
        color='text'
        onClick={toggling} />
      <DropDownListContainer>
        <DropDownList ref={dropdownRef}>
          {options.map(option =>
            option.label === selectedOption.label ? null :
              <ListItem
                onClick={onOptionClicked(option)}
                key={option.label}>
                <TYPE.white>
                  {option.img && <StyledLogo
                    size={'19px'}
                    srcs={[option.img]}
                    alt={option.label}
                    style={{ marginRight: '8px'}}
                  />}
                  {option.label}
                </TYPE.white>
              </ListItem>
          )}
        </DropDownList>
      </DropDownListContainer>
    </DropDownContainer>
  )
}

export default OldSelect
