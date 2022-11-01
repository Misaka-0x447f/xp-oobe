import React, { useState } from 'react'
import {
  BookCompass24Filled, Clipboard3Day24Filled, Delete28Regular,
  FastForward24Filled, ImageMultiple28Regular, Save28Regular
} from '@fluentui/react-icons'
import { Rating, Notification } from '@douyinfe/semi-ui'
import { config } from '../utils/config'
import { isUndefined } from 'lodash'
import { TooltipButton } from '../components/TooltipButton'
import { Progress } from '@fluentui/react-components/unstable'
import { Button as FluentButton } from '@fluentui/react-components'
import * as htmlToImage from 'html-to-image'
import { sleep } from '../utils/lang'
import { clear, decodeOrLoad, encodeAndSave } from '../utils/interface'
import { useBeforeMount, useMixedState } from '../utils/hooks'

export const MainPage = () => {
  const [data, setData, dataRef] = useMixedState<Map<string, { book: number, star: number }>>(new Map())
  const [screenShotUrl, setScreenShotUrl] = useState<string | null>(null)
  const [saveUrl, setSaveUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(0)
  const [confirmClearVisible, setConfirmClearVisible] = useState(false)
  const [screenShotVisible, setScreenShotVisible] = useState(false)

  const screenshot = async () => {
    setLoading(val => val + 1)
    await sleep(500)
    const el = document.querySelector('#answer-zone') as HTMLElement
    if (!el) {
      Notification.error({ content: '无法执行截图，因为找不到目标元素。' })
      return
    }
    const png = await htmlToImage.toPng(el, { backgroundColor: '#242424', style: { width: '120px' } })
      .finally(() => setLoading(val => val - 1))
    if (!png) {
      Notification.error({ content: '生成截图失败。' })
      return
    }
    setScreenShotUrl(png)
  }

  const save = async () => {
    if (saveUrl) {
      setSaveUrl(null)
      return
    }
    const res = await update()
    setSaveUrl(res.url.toString())
  }

  const update = async () => await encodeAndSave({
    protocolVersion: 'v1',
    items: Array.from(dataRef.current.entries()).map(item => [item[0], item[1].book * 6 + item[1].star])
  })

  useBeforeMount(async () => {
    const data = await decodeOrLoad()
    setData(new Map(data?.map(item => [item[0], { book: Math.floor(item[1] / 6), star: item[1] % 6 }]) ?? []))
  })

  const getDesc = (item: string) => {
    const value = data.get(item)
    if (isUndefined(value)) {
      return ''
    }
    return [['', '试过'][value.book], ['', '绝不', '不喜欢', '一般', '喜欢', '最爱'][value.star]].filter(el => el)
      .join('，')
  }
  return (<div className="w-screen h-screen flex flex-col">
    <div className={['h-12 w-full bg-blue-500 flex justify-end items-stretch sticky top-0 z-10',
      '[&>button.semi-button.semi-button-tertiary]:text-white',
      '[&>button.semi-button.semi-button-tertiary]:h-full'].join(' ')}>
      <TooltipButton onClick={() => setConfirmClearVisible(c => !c)} active={confirmClearVisible}
                     activeTheme={'bg-orange-900'}>
        <Delete28Regular/>
      </TooltipButton>
      {/* <Button theme='borderless' type='tertiary' size={'large'} icon={<ArrowSort28Regular/>}/> */}
      <TooltipButton loading={!!loading} active={screenShotVisible} onClick={() => {
        setScreenShotVisible(b => !b)
        setScreenShotUrl(null)
      }}>
        <ImageMultiple28Regular/>
      </TooltipButton>
      <TooltipButton onClick={async () => await save()} active={!!saveUrl}><Save28Regular/></TooltipButton>
    </div>
    {!!loading && <Progress thickness={'large'} shape={'rectangular'}/>}
    <div className={'bg-[#242424]'}>
      {config.v1.sections.map((section) => {
        return <div key={section.displayName} id={'answer-zone'}>
          <div className={'bg-blue-700 h-12 flex items-center w-full px-4 box-border'}>{section.displayName}</div>
          {section.items.map((item) => {
            return <div key={item} className={'flex h-12 px-4 box-border items-center justify-between'}>
              <span className={'pb-1'}>{item}</span>
              {config.v1.ratingType === 'xp-star' &&
                <div className={'flex items-center justify-center'}>
                  <span className={'opacity-50 pb-1 pr-2'}>{getDesc(item)}</span>
                  <Rating className={'stroke-[rgba(255,255,255,0.2)]'} character={<BookCompass24Filled/>} count={1}
                          value={data.get(item)?.book ?? 0} onChange={(num) => {
                            setData(d => new Map(d.set(item, { book: num, star: data.get(item)?.star ?? 0 })))
                            void update()
                          }}/>
                  <Rating className={'stroke-[rgba(255,255,255,0.2)]'} allowClear count={5}
                          value={data.get(item)?.star ?? 0} onChange={(num) => {
                            setData(d => new Map(d.set(item, { book: data.get(item)?.book ?? 0, star: num })))
                            void update()
                          }}/>
                </div>
              }
            </div>
          })}
        </div>
      })}
    </div>
    {confirmClearVisible && <div className={'absolute bg-orange-900 mt-12 w-full p-4 flex flex-col box-border'}>
      <span className={'text-xl'}>确实要清空内容吗？</span>
      <div className={'flex mt-2'}>
        <FluentButton className={'mr-2'} style={{ backgroundColor: 'rgba(239, 68, 68)' }} icon={<Delete28Regular/>}
                      onClick={() => {
                        setData(new Map())
                        clear()
                        setConfirmClearVisible(false)
                      }}>清空</FluentButton>
        <div className={'w-2'}></div>
        <FluentButton onClick={() => setConfirmClearVisible(false)}>取消</FluentButton>
      </div>
    </div>}
    {screenShotVisible &&
      <div className={'absolute bg-blue-900 mt-12 w-full h-[calc(100vh-3rem)] p-4 flex flex-col box-border'}>
        {!screenShotUrl && <>
          <span className={'text-base mb-4'}>注意：为了保持截图生成零成本，截图将在本地生成。由于技术限制，点击下面的生成按钮后网页会<span
            className={'text-2xl text-yellow-500'}>无反应 5~30 秒</span>，请耐心等待。
          </span>
          <FluentButton style={{ backgroundColor: 'rgba(239, 68, 68)' }} icon={<FastForward24Filled/>}
                        onClick={screenshot} disabled={!!loading}>生成</FluentButton>
        </>}
        {screenShotUrl && <>
          <span>结果截图已经就绪。</span>
          <span>长按下面的图片（iOS 需要长按<span
            className={'text-yellow-500'}>图片空白处</span>）选择保存即可保存截图。</span>
          <img className={'max-h-48 object-cover object-left-top my-4'}
               style={{ maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 60%, transparent 100%)' }}
               alt={'result screenshot'} src={screenShotUrl}/>
          <a className={'text-orange-200 decoration-solid'} href={screenShotUrl} target='_blank'
             rel="noreferrer" download={'xp-oobe.png'}>如果上面的方法没有成功，请点击此处下载...</a>
          <div className={'pt-12'}>
            <FluentButton onClick={() => {
              setScreenShotVisible(false)
              setScreenShotUrl(null)
            }}>完成</FluentButton>
          </div>
        </>}
      </div>}
    {!!saveUrl && <div className={'absolute bg-blue-900 mt-12 w-full p-4 flex flex-col box-border'}>
      <div className={'text-xl'}>你的副本已准备就绪并可供复制。</div>
      <div>使用该副本的链接即可返回此页面。</div>
      <div className={'flex items-center mt-4'}>
        <FluentButton onClick={() => {
          navigator.clipboard.writeText(saveUrl).then(() => {
            Notification.open({
              content: '已经复制到剪贴板。'
            })
          })
        }} icon={<Clipboard3Day24Filled/>}/>
        <span className={'text-white font-mono ml-4'}>{saveUrl}</span>
      </div>
    </div>}
  </div>)
}
