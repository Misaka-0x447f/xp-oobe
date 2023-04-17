import React, { memo, useMemo, useState } from 'react'
import {
  BookInformation24Regular, ChevronCircleDown24Regular, Clipboard3Day24Filled,
  Save28Regular, ShareAndroid24Regular, TagReset24Regular, TextSortAscending24Regular
} from '@fluentui/react-icons'
import { Notification, Select } from '@douyinfe/semi-ui'
import { Config, configs, isPlainItem, PlainItem } from '../utils/config'
import { TooltipButton } from '../components/TooltipButton'
import { Progress } from '@fluentui/react-components/unstable'
import { Button as FluentButton, Spinner } from '@fluentui/react-components'
import { clear, decodeOrLoad, encodeAndSave } from '../utils/interface'
import { useBeforeMount, useMixedState } from '../utils/hooks'
import { generateShareSheet } from '../utils/shareSheet'
import { sleep } from '../utils/lang'
import { rule, sort } from '../utils/sort'
import { SectionTitle } from '../components/SectionTitle'
import type { XpStar } from '../components/RatingXpStar'
import { RatingXpStar } from '../components/RatingXpStar'
import { CustomZone, CustomZoneValue } from '../components/CustomZone'
import { isEqual } from 'lodash'

export type Entry = Config[string]['sections'][0] | PlainItem

const getEntryKey = (entry: Entry) => {
  if (isPlainItem(entry)) {
    return `${entry.label}-${entry.group}`
  }
  if ('desc' in entry) {
    return `desc-${entry.desc}`
  }
  if ('customZone' in entry) {
    return 'customZone'
  }
  return `displayName-${entry.displayName}`
}

const MainPageEntry = memo(({
  entry,
  index,
  data,
  setData,
  saveCallback,
  children
}: { entry: Entry, data: Map<string, XpStar>, index: number, setData: React.Dispatch<React.SetStateAction<Map<string, XpStar>>>, saveCallback: () => void, children: React.ReactNode }) => {
  return <div>
    {(() => {
      if (isPlainItem(entry)) {
        return <RatingXpStar
          title={entry.label} desc={configs.v1.descs?.[entry.label]} isEven={index % 2 === 0}
          value={data.get(entry.label)}
          onChange={(newVal) => {
            setData(d => new Map(d.set(entry.label, newVal)))
            saveCallback()
          }}/>
      }
      if ('desc' in entry) {
        return <div style={{ backgroundColor: entry.backgroundColor }}
                    className={'h-12 flex items-center w-full px-4 box-border'}>{entry.desc}</div>
      }
      if ('customZone' in entry) {
        return children
      }
      return <SectionTitle title={entry.displayName}/>
    })()}
  </div>
}, (prev, next) => {
  if ('label' in prev.entry && 'label' in next.entry) {
    return prev.data.get(prev.entry.label) === next.data.get(next.entry.label)
  }
  return isEqual(prev.data, next.data)
})
MainPageEntry.displayName = 'MainPageEntry'

export const MainPage = (props: { newDocument: boolean }) => {
  const [data, setData, dataRef] = useMixedState<Map<string, XpStar>>(new Map())
  const [customData, setCustomData] = useState<CustomZoneValue[]>([])
  const [screenShotUrl, setScreenShotUrl] = useState<string | null>(null)
  const [saveUrl, setSaveUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(0)
  const [confirmClearVisible, setConfirmClearVisible] = useState(false)
  const [screenShotVisible, setScreenShotVisible] = useState(false)
  const [sortVisible, setSortVisible] = useState(false)
  const [sortRule, setSortRule] = useState<keyof typeof rule>('按职业(默认顺序)')
  const [aboutVisible, setAboutVisible] = useState(false)
  const entries = useMemo(() => {
    return sort(configs.v1.sections, rule[sortRule], data)
  }, [data, sortRule])

  const screenshot = async () => {
    setLoading(val => val + 1)
    await sleep(1500)
    const canvas = await generateShareSheet({
      protocolVersion: 'v1',
      items: data
    }, (await update()).url.toString(), sortRule).finally(() => setLoading(val => val - 1))
    if (!canvas) {
      Notification.error({ content: '生成截图失败：浏览器不支持。' })
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

  const sortOptions = useMemo(() => Object.keys(rule).map(key => ({ label: key, value: key })), [])

  useBeforeMount(() => {
    if (!props.newDocument) {
      decodeOrLoad()
        .then((data) => setData(new Map(data?.items.map(item => [item[0], {
          book: Math.floor(item[1] / 6),
          star: item[1] % 6
        }]) ?? [])))
        .then(update)
    }
  })

  return (<div className="w-screen h-screen flex flex-col">
    <div className={['w-full bg-blue-500 flex justify-between align-center sticky box-border pl-1.3 pr-3',
      '[&>button.semi-button.semi-button-tertiary]:text-white',
      '[&>button.semi-button.semi-button-tertiary]:h-full'].join(' ')}>
      <TooltipButton onClick={() => setAboutVisible(b => !b)}
                     active={aboutVisible}>
        <BookInformation24Regular className={'h-6'}/><span>关于</span></TooltipButton>
      <div className={'flex-1'}></div>
      <TooltipButton onClick={() => setConfirmClearVisible(b => !b)} active={confirmClearVisible}
                     activeTheme={'bg-orange-900'}>
        <TagReset24Regular className={'h-6'}/>
        <span>重置</span>
      </TooltipButton>
      <TooltipButton onClick={() => setSortVisible(b => !b)} active={sortVisible}>
        <TextSortAscending24Regular/>
        <span>排序</span>
      </TooltipButton>
      <TooltipButton loading={!!loading} active={screenShotVisible} onClick={() => {
        if (screenShotVisible) {
          setScreenShotUrl(null)
        } else {
          screenshot()
        }
        setScreenShotVisible(b => !b)
      }}>
        <ShareAndroid24Regular className={'h-6'}/>
        <span>截图</span>
      </TooltipButton>
      <TooltipButton onClick={async () => await save()}
                     active={!!saveUrl}><Save28Regular className={'h-6'}/><span>保存</span></TooltipButton>
    </div>
    <div className={'w-full box-border'}>
      {!!loading && <Progress thickness={'large'} shape={'rectangular'}/>}
      {aboutVisible && <div className={'bg-blue-900 p-4 flex flex-col'}>
        <div className={'text-xl'}>关于</div>
        <div>本站无后端，所有数据保存在本地浏览器上。</div>
        <div>项目地址/bug 反馈：
          <a className={'text-orange-200 decoration-solid'} href={'https://github.com/Misaka-0x447f/xp-oobe'}
             target={'_blank'} rel="noreferrer">https://github.com/Misaka-0x447f/xp-oobe</a>
        </div>
      </div>}
      {confirmClearVisible && <div className={'bg-orange-900 p-4 flex flex-col'}>
        <span className={'text-xl'}>确实要重置表单吗？</span>
        <div className={'flex mt-2'}>
          <FluentButton className={'mr-2'} style={{ backgroundColor: 'rgba(239, 68, 68)' }}
                        icon={<TagReset24Regular/>}
                        onClick={() => {
                          setData(new Map())
                          clear()
                          setConfirmClearVisible(false)
                        }}>重置</FluentButton>
          <div className={'w-2'}></div>
          <FluentButton onClick={() => setConfirmClearVisible(false)}>取消</FluentButton>
        </div>
      </div>}
      {sortVisible && <div className={'bg-blue-900 p-4 flex flex-col'}>
        <div className={'flex items-center justify-between'}>
          <Select optionList={sortOptions} insetLabel='排序方式' value={sortRule}
                  onChange={(v) => setSortRule(v as string)} triggerRender={() =>
            <div className={'truncate flex items-center cursor-pointer'}>
              <span className={'text-lg mr-4'}>{sortRule}</span>
              <ChevronCircleDown24Regular/>
            </div>
          }/>
          <FluentButton appearance={'primary'} onClick={() => {
            setSortVisible(false)
          }}>完成</FluentButton>
        </div>
      </div>}
      {screenShotVisible &&
        <div className={'bg-blue-900 min-h-[calc(100vh-3rem)] p-4 flex flex-col'}>
          {!screenShotUrl && <div className={'flex'}>
            <Spinner appearance={'inverted'} size={'small'}/>
            <span
              className={'text-lg ml-2'}>正在生成分享海报。这可能需要几秒钟的时间，具体取决于您的计算机配置。</span>
          </div>}
          {screenShotUrl && <>
            <div className={'flex justify-between'}>
              <div className={'flex flex-col'}>
                <span className={'text-lg'}>分享海报已生成。</span>
                <a className={'text-orange-200 decoration-solid'} href={screenShotUrl} target='_blank'
                   rel="noreferrer" download={'xp-resume-demo.misaka.org.png'}>点击此处下载。</a>
                <span>如果不能下载，长按下面的图片（iOS 需要长按<span
                  className={'text-yellow-500'}>图片空白处</span>）选择保存即可保存截图。</span>
              </div>
              <div>
                <FluentButton appearance={'primary'} onClick={() => {
                  setScreenShotVisible(false)
                  setScreenShotUrl(null)
                }}>完成</FluentButton>
              </div>
            </div>
            <img className={'max-h-[60vh] object-cover object-left-top my-4'}
                 style={{ maskImage: 'linear-gradient(to bottom, rgba(0, 0, 0, 1.0) 60%, transparent 100%)' }}
                 alt={'result screenshot'} src={screenShotUrl}/>
          </>}
        </div>}
      {!!saveUrl && <div className={'bg-blue-900 p-4 flex flex-col'}>
        <div className={'text-xl'}>你的结果已准备就绪并可供复制。</div>
        <div>使用该链接即可返回此页面，并在以后修改你的结果或查看新增的条目。</div>
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
    </div>
    <div className={'flex-1 bg-[#242424] h-full'} id={'answer-zone'}>
      {entries.map(
        (entry, index) =>
          <MainPageEntry key={getEntryKey(entry)} entry={entry} index={index} data={data} setData={setData}
                         saveCallback={update}>
            <CustomZone value={customData} onChange={setCustomData}/>
          </MainPageEntry>
      )}
    </div>
  </div>)
}
