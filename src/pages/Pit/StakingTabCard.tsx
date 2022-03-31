import React, { useState } from 'react'
import { Card } from 'antd'
import { StakePanel } from './StakePanel'
import { UnstakePanel } from './UnstakePanel'

const contentList: any = {
  stake: <StakePanel />,
  unstake: <UnstakePanel />
}

const tabList = [
  {
    key: 'stake',
    tab: 'Stake'
  },
  {
    key: 'unstake',
    tab: 'Unstake'
  }
]

export const StakingTabCard = () => {
  const [activeTabKey, setActiveTabKey] = useState('stake')
  const onTabChange = (key: any) => {
    setActiveTabKey(key)
  }
  return (
    <>
      <Card
        style={{ width: '100%', borderRadius: '8px', background: '#212429' }}
        tabList={tabList}
        activeTabKey={activeTabKey}
        tabBarExtraContent={<a href="#">Get IZA</a>}
        onTabChange={(key: any) => {
          onTabChange(key)
        }}
      >
        {contentList[activeTabKey]}
      </Card>
    </>
  )
}
