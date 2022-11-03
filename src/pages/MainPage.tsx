import React, { useEffect, useMemo, useState } from 'react'
import {
  BookCompass24Filled, Clipboard3Day24Filled, Delete28Regular,
  ImageMultiple28Regular, Save28Regular
} from '@fluentui/react-icons'
import { Rating, Notification } from '@douyinfe/semi-ui'
import { Config, config, getDesc } from '../utils/config'
import { TooltipButton } from '../components/TooltipButton'
import { Progress } from '@fluentui/react-components/unstable'
import { Button as FluentButton, Spinner } from '@fluentui/react-components'
import { clear, decodeOrLoad, encodeAndSave } from '../utils/interface'
import { useBeforeMount, useMixedState } from '../utils/hooks'
import { generateShareSheet } from '../utils/shareSheet'
import { sleep } from '../utils/lang'
import { isString } from 'lodash'

export const MainPage = () => {
  const [data, setData, dataRef] = useMixedState<Map<string, { book: number, star: number }>>(new Map())
  const [screenShotUrl, setScreenShotUrl] = useState<string | null>(null)
  const [saveUrl, setSaveUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(0)
  const [confirmClearVisible, setConfirmClearVisible] = useState(false)
  const [screenShotVisible, setScreenShotVisible] = useState(false)
  const entries = useMemo(() => {
    return config.v1.sections.reduce<Array<Config[string]['sections'][0] | string>>((acc, cur) => {
      if ('items' in cur) {
        acc.push(cur)
        acc.push(...cur.items)
      } else acc.push(cur)
      return acc
    }, [])
  }, [])
  const [cur, setCur] = useState(100)
  const step = 10
  const listContainerRef = React.createRef<HTMLDivElement>()

  useEffect(() => {
    const onScroll = (e: Event) => {
      if (!e?.target) return
      // @ts-expect-error
      if (e.target.scrollTop > (e.target.scrollHeight - e.target.offsetHeight * 2)) {
        setCur(cur => Math.min(cur + step, entries.length))
      }
    }
    listContainerRef.current?.addEventListener('scroll', onScroll)
    return () =>
      listContainerRef.current?.removeEventListener('scroll', onScroll)
  }, [])

  const screenshot = async () => {
    setLoading(val => val + 1)
    await sleep(1500)
    const canvas = await generateShareSheet({
      protocolVersion: 'v1',
      items: data
    }, (await update()).url.toString()).finally(() => setLoading(val => val - 1))
    if (!canvas) {
      Notification.error({ content: '生成截图失败：浏览器支持。' })
      return
    }
    const png = canvas.toDataURL('image/png')
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

  useBeforeMount(() => {
    decodeOrLoad()
      .then((data) => setData(new Map(data?.items.map(item => [item[0], { book: Math.floor(item[1] / 6), star: item[1] % 6 }]) ?? [])))
  })

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
        if (screenShotVisible) {
          setScreenShotUrl(null)
        } else {
          screenshot()
        }
        setScreenShotVisible(b => !b)
      }}>
        <ImageMultiple28Regular/>
      </TooltipButton>
      <TooltipButton onClick={async () => await save()} active={!!saveUrl}><Save28Regular/></TooltipButton>
    </div>
    {!!loading && <Progress thickness={'large'} shape={'rectangular'}/>}
    <div className={'bg-[#242424] h-full overflow-scroll'} id={'answer-zone'} ref={listContainerRef}>
      {entries.slice(0, cur).map((entry, index) => {
        if (isString(entry)) {
          return <div key={`${entry}-${index}`} className={'flex h-12 px-4 box-border items-center justify-between'}>
            <div className={'flex flex-col'}>
              <span className={'pb-1'}>{entry}</span>
              <span className={'mt-[-0.25rem] pr-4 text-gray-400 text-xs'}>{config.v1.descs?.[entry]}</span>
            </div>
            {config.v1.ratingType === 'xp-star' &&
              <div className={'flex items-center justify-center'}>
                <span className={'opacity-50 pb-1 pr-2'}>{getDesc(data.get(entry))}</span>
                <Rating className={'stroke-[rgba(255,255,255,0.2)]'} character={<BookCompass24Filled/>} count={1}
                        value={data.get(entry)?.book ?? 0} onChange={(num) => {
                          setData(d => new Map(d.set(entry, { book: num, star: data.get(entry)?.star ?? 0 })))
                          void update()
                        }}/>
                <Rating className={'stroke-[rgba(255,255,255,0.2)]'} allowClear count={5}
                        value={data.get(entry)?.star ?? 0} onChange={(num) => {
                          setData(d => new Map(d.set(entry, { book: data.get(entry)?.book ?? 0, star: num })))
                          void update()
                        }}/>
              </div>
            }
          </div>
        }
        if ('desc' in entry) {
          return <div key={`${entry.desc}-${index}`}
                      style={{ backgroundColor: entry.backgroundColor }}
                      className={'h-12 flex items-center w-full px-4 box-border'}>{entry.desc}</div>
        }

        return <div key={`${entry.displayName}-${index}`}>
          <div className={'bg-blue-700 h-12 flex items-center w-full px-4 box-border'}>{entry.displayName}</div>
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
      <div className={'absolute bg-blue-900 mt-12 w-full min-h-[calc(100vh-3rem)] p-4 flex flex-col box-border'}>
        {!screenShotUrl && <div className={'flex'}>
          <Spinner appearance={'inverted'} size={'small'}/>
          <span className={'text-lg ml-2'}>正在生成分享海报。这可能需要几秒钟的时间，具体取决于您的计算机配置。</span>
        </div>}
        {screenShotUrl && <>
          <span className={'text-lg'}>分享海报已生成。</span>
          <a className={'text-orange-200 decoration-solid'} href={screenShotUrl} target='_blank'
             rel="noreferrer" download={'xp-oobe.png'}>点击此处下载。</a>
          <span>如果不能下载，长按下面的图片（iOS 需要长按<span
            className={'text-yellow-500'}>图片空白处</span>）选择保存即可保存截图。</span>
          <img className={'max-h-128 object-cover object-left-top my-4'}
               style={{ maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 60%, transparent 100%)' }}
               alt={'result screenshot'} src={screenShotUrl}/>
          <div className={'pt-12'}>
            <FluentButton onClick={() => {
              setScreenShotVisible(false)
              setScreenShotUrl(null)
            }}>完成</FluentButton>
          </div>
        </>}
      </div>}
    {!!saveUrl && <div className={'absolute bg-blue-900 mt-12 w-full p-4 flex flex-col box-border'}>
      <div className={'text-xl'}>你的 xp 镜像已准备就绪并可供复制。</div>
      <div>使用该链接即可返回此页面，并在以后修改你的结果。记得以后回来看看，也许也会新增一些条目。</div>
      <div className={'flex items-center mt-4'}>
        <FluentButton onClick={() => {
          navigator.clipboard.writeText(saveUrl).then(() => {
            Notification.open({
              content: '已经复制到剪贴板。'
            })
          })
        }} icon={<Clipboard3Day24Filled/>}/>
        <span className={'text-white font-mono ml-2'}>{saveUrl}</span>
      </div>
    </div>}
  </div>)
}
