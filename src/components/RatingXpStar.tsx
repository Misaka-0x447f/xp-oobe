import { configs, getDesc } from '../utils/config'
import { Rating } from '@douyinfe/semi-ui'
import { AddCircle24Filled, BookCompass24Filled, DeleteDismiss24Filled } from '@fluentui/react-icons'
import React from 'react'

export interface XpStar {
  book: number
  star: number
}

export const RatingXpStar = ({
  value,
  onChange,
  title,
  desc,
  isEven,
  onNewItem,
  onRemoveItem
}: { value: XpStar | undefined, onChange: (payload: XpStar) => void, title: string, desc?: string, isEven: boolean, onNewItem?: () => void, onRemoveItem?: () => void }) => {
  if (configs.v1.ratingType !== 'xp-star') throw new Error('Assertion Error: unsupported type')
  return <div
    className={['flex h-12 px-4 box-border items-center justify-between', isEven && 'bg-[#303030]'].join(' ')}>
    <div className={'flex flex-col'}>
      <span className={'pb-1'}>{title}</span>
      <span
        className={'mt-[-0.25rem] pr-4 text-gray-400 text-xs'}>{desc}</span>
    </div>
    {(() => {
      if (onNewItem) {
        return <div onClick={onNewItem} className={'flex items-center justify-center hover:brightness-150'}>
          <AddCircle24Filled/>
          <span>添加自定义项目...</span>
        </div>
      }
      return <div className={'flex items-center justify-center'}>
        <span className={'opacity-50 pb-1 pr-2'}>{getDesc(value)}</span>
        {onRemoveItem && <DeleteDismiss24Filled onClick={onRemoveItem} />}
        <Rating className={'stroke-[rgba(255,255,255,0.2)]'} character={<BookCompass24Filled/>}
                count={1}
                value={value?.book ?? 0} onChange={(num) => {
                  onChange({ book: num, star: value?.star ?? 0 })
                }}/>
        <Rating className={'stroke-[rgba(255,255,255,0.2)]'} allowClear count={5}
                value={value?.star ?? 0} onChange={(num) => {
                  onChange({ book: value?.book ?? 0, star: num })
                }}/>
      </div>
    })()}
  </div>
}
