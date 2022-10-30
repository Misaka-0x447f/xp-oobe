import React, { useState } from 'react'
import { ArrowSort28Regular, Delete28Regular, ImageMultiple28Regular, Save28Regular } from '@fluentui/react-icons'
import { Button, Rating } from '@douyinfe/semi-ui'
import { config } from '../utils/config'

export const MainPage = () => {
  const [data, setData] = useState<Map<string, number>>(new Map())
  return (<div className="w-screen h-screen flex flex-col">
    <div className={['h-12 w-full bg-blue-500 flex justify-end items-stretch sticky',
      '[&>button.semi-button.semi-button-tertiary]:text-white',
      '[&>button.semi-button.semi-button-tertiary]:h-full'].join(' ')}>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<Delete28Regular/>}/>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<ArrowSort28Regular/>}/>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<Save28Regular/>}/>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<ImageMultiple28Regular/>}/>
    </div>
    {config.v1.sections.map((section) => {
      const ratingConfig = config.v1.rating
      return <div key={section.displayName}>
        <div className={'bg-blue-700 h-12 flex items-center w-full px-4 box-border'}>{section.displayName}</div>
        {section.items.map((item) => {
          return <div key={item} className={'flex h-12 px-4 box-border items-center justify-between'}>
            <span>{item}</span>
            {ratingConfig.ratingType === 'star' &&
              <Rating className={'stroke-white'} allowClear={ratingConfig.allowClear} allowHalf={ratingConfig.allowHalf} count={ratingConfig.count}
                      value={data.get(item) ?? 0} onChange={(num) => { setData(d => new Map(d.set(item, num))) }}/>}
          </div>
        })}
      </div>
    })}
  </div>)
}
