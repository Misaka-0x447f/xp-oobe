import React, { useState } from 'react'
import {
  ArrowSort28Regular,
  BookQuestionMark24Filled, Delete28Regular, ImageMultiple28Regular, Open24Regular, Save28Regular
} from '@fluentui/react-icons'
import { Button, Rating, Notification } from '@douyinfe/semi-ui'
import { config } from '../utils/config'
import { isUndefined } from 'lodash'
import { TooltipButton } from '../components/TooltipButton'
import { Progress } from '@fluentui/react-components/unstable'
import { Button as FluentButton } from '@fluentui/react-components'
import * as htmlToImage from 'html-to-image'
import { sleep } from '../utils/lang'

export const MainPage = () => {
  const [data, setData] = useState<Map<string, number>>(new Map())
  const [screenShotUrl, setScreenShotUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(0)

  const screenshot = async () => {
    setLoading(val => val + 1)
    await sleep(500)
    const el = document.querySelector('#answer-zone') as HTMLElement
    if (!el) {
      Notification.error({ content: '无法执行截图，因为找不到目标元素' })
      return
    }
    const png = await htmlToImage.toBlob(el, { backgroundColor: '#242424', style: { width: '120px' } })
      .finally(() => setLoading(val => val - 1))
    if (!png) {
      Notification.error({ content: '生成截图失败。' })
      return
    }
    const url = URL.createObjectURL(png)
    setScreenShotUrl(url)
  }

  const getRank = (item: string) => {
    const value = data.get(item)
    if (isUndefined(value)) {
      return {
        star: 0,
        question: 0
      }
    }
    return {
      star: value >= 2 ? value - 1 : 0,
      question: value === 1 ? 1 : 0,
      desc: ['', '未知', '绝不', '不喜欢', '一般', '喜欢', '最爱'][value]
    }
  }
  return (<div className="w-screen h-screen flex flex-col">
    <div className={['h-12 w-full bg-blue-500 flex justify-end items-stretch sticky',
      '[&>button.semi-button.semi-button-tertiary]:text-white',
      '[&>button.semi-button.semi-button-tertiary]:h-full',
      ...(['h-12', 'w-12'].map(el => `[&>div]:${el}`))].join(' ')}>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<Delete28Regular/>}/>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<ArrowSort28Regular/>}/>
      <Button theme='borderless' type='tertiary' size={'large'} icon={<Save28Regular/>}/>
      <TooltipButton loading={!!loading} active={!!screenShotUrl} onClick={() => {
        if (screenShotUrl) {
          setScreenShotUrl(null)
        } else {
          void screenshot()
        }
      }}>
        <ImageMultiple28Regular/>
      </TooltipButton>
    </div>
    {!!loading && <Progress thickness={'large'} shape={'rectangular'}/>}
    {config.v1.sections.map((section) => {
      return <div key={section.displayName} id={'answer-zone'}>
        <div className={'bg-blue-700 h-12 flex items-center w-full px-4 box-border'}>{section.displayName}</div>
        {section.items.map((item) => {
          return <div key={item} className={'flex h-12 px-4 box-border items-center justify-between'}>
            <span className={'pb-1'}>{item}</span>
            {config.v1.ratingType === 'xp-star' &&
              <div className={'flex items-center justify-center'}>
                <span className={'opacity-50 pb-1 pr-2'}>{getRank(item).desc}</span>
                <Rating className={'stroke-[rgba(255,255,255,0.2)]'} character={<BookQuestionMark24Filled/>} count={1}
                        value={getRank(item).question} onChange={(num) => {
                          setData(d => new Map(d.set(item, num)))
                        }}/>
                <Rating className={'stroke-[rgba(255,255,255,0.2)]'} allowClear count={5}
                        value={getRank(item).star} onChange={(num) => {
                          setData(d => new Map(d.set(item, num ? num + 1 : 0)))
                        }}/>
              </div>
            }
          </div>
        })}
      </div>
    })}
    {!!screenShotUrl && <div className={'absolute bg-blue-900 mt-12 w-full h-[calc(100vh-3rem)] p-4 flex flex-col box-border'}>
      <span>结果截图已经就绪。</span>
      <span>点击下面的打开按钮，长按<span className={'text-yellow-500'}>空白处</span>或点击浏览器自带的分享按钮，选择保存即可保存截图。</span>
      <div className={'my-4'}>
        <FluentButton appearance={'primary'} size={'large'} icon={<Open24Regular />}
                      onClick={() => window.open(screenShotUrl)}>
          打开
        </FluentButton>
      </div>
      <a className={'text-white decoration-solid'} href={screenShotUrl} target='_blank'
         rel="noreferrer">如果上面的按钮没有反应，请长按此处并选择保存...</a>
      <div className={'pt-12'}>
        <FluentButton onClick={() => setScreenShotUrl(null)}>完成</FluentButton>
      </div>
    </div>}
  </div>)
}
