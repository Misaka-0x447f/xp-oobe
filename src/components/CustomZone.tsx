import React, { useState } from 'react'
import { SectionTitle } from './SectionTitle'
import { RatingXpStar, XpStar } from './RatingXpStar'
import { cloneDeep } from 'lodash'
import { useTopZIndex } from '../utils/useTopZIndex'
import { Input, Button as FluentButton } from '@fluentui/react-components'

export interface CustomZoneValue {
  title: string
  payload: XpStar
}

export const CustomZone = ({
  value,
  onChange
}: { value: CustomZoneValue[], onChange: (payload: CustomZoneValue[]) => void }) => {
  const [visible, setVisible] = useState(false)
  const [newItemValue, setNewItemValue] = useState('')
  const [zIndex] = useTopZIndex('custom-zone', [visible])
  const add = () => {
    onChange(value.concat({
      title: newItemValue,
      payload: {
        book: 0,
        star: 0
      }
    }))
    setVisible(false)
    setNewItemValue('')
  }
  return <div>
    <SectionTitle title={'自定义'} />
    {value.map((el, index) => {
      // index for item is persisted
      return <RatingXpStar
        title={el.title} key={`${el.title}${index}`} isEven={index % 2 === 0} value={el.payload}
        onChange={(payload) => {
          const res = cloneDeep(value)
          res[index] = { ...res[index], payload }
          onChange(res)
        }}/>
    })}
    {visible && <div className={'bg-blue-900 p-4 flex flex-col absolute top-0'} style={{ zIndex }}>
      <div className={'text-xl'}>添加自定义条目</div>
      <div>由于 url 以及二维码中能承载的信息量有限，不建议填写超过 10 个字。自定义描述也别想了。写得太多的话不对二维码扫不出来负责。</div>
      <Input value={newItemValue} />
      <FluentButton onClick={() => {
        setNewItemValue('')
      }}>取消</FluentButton>
      <FluentButton appearance={'primary'} onClick={add}>好</FluentButton>
    </div>}
  </div>
}
