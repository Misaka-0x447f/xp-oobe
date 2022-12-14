import React, { useMemo, useState } from 'react'
import {
  BookCompass24Filled, BookInformation24Regular, ChevronCircleDown24Regular, Clipboard3Day24Filled,
  Save28Regular, ShareAndroid24Regular, TagReset24Regular, TextSortAscending24Regular
} from '@fluentui/react-icons'
import { Rating, Notification, Select } from '@douyinfe/semi-ui'
import { Config, config, getDesc } from '../utils/config'
import { TooltipButton } from '../components/TooltipButton'
import { Progress } from '@fluentui/react-components/unstable'
import { Button as FluentButton, Spinner } from '@fluentui/react-components'
import { clear, decodeOrLoad, encodeAndSave } from '../utils/interface'
import { useBeforeMount, useMixedState } from '../utils/hooks'
import { generateShareSheet } from '../utils/shareSheet'
import { sleep } from '../utils/lang'
import { isString } from 'lodash'
import { rule, sort } from '../utils/sort'
import { FixedSizeList as VirtualizedList } from 'react-window'
import AutoSizer from 'react-virtualized-auto-sizer'
import { remToPx } from '../utils/dom'

export const MainPage = (props: { newDocument: boolean }) => {
  const [data, setData, dataRef] = useMixedState<Map<string, { book: number, star: number }>>(new Map())
  const [screenShotUrl, setScreenShotUrl] = useState<string | null>(null)
  const [saveUrl, setSaveUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(0)
  const [confirmClearVisible, setConfirmClearVisible] = useState(false)
  const [screenShotVisible, setScreenShotVisible] = useState(false)
  const [sortVisible, setSortVisible] = useState(false)
  const [sortRule, setSortRule] = useState<keyof typeof rule>('按类别(默认顺序)')
  const [aboutVisible, setAboutVisible] = useState(false)
  const entries = useMemo(() => {
    return sort(config.v1.sections.reduce<Array<Config[string]['sections'][0] | string>>((acc, cur) => {
      if ('items' in cur) {
        acc.push(cur)
        acc.push(...cur.items)
      } else acc.push(cur)
      return acc
    }, []), rule[sortRule], data)
  }, [data, sortRule])

  const screenshot = async () => {
    setLoading(val => val + 1)
    await sleep(1500)
    const canvas = await generateShareSheet({
      protocolVersion: 'v1',
      items: data
    }, (await update()).url.toString(), sortRule).finally(() => setLoading(val => val - 1))
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

  const sortOptions = useMemo(() => Object.keys(rule).map(key => ({ label: key, value: key })), [])

  useBeforeMount(() => {
    if (!props.newDocument) {
      decodeOrLoad()
        .then((data) => setData(new Map(data?.items.map(item => [item[0], { book: Math.floor(item[1] / 6), star: item[1] % 6 }]) ?? [])))
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
        <div>tips: 本站域名有 xp-oobe.misaka.org 和 xp.misaka.org 两个，但出于浏览器限制以及太懒了不想做的原因，这两个站数据不在你的本地设备上互通，请人工迁移数据，具体方法就是点保存，把域名改了，再导入。</div>
        <div>当前阶段开发目标(2022/11/22 更新)</div>
        <div className={'ml-6'}>
          <li>自定义 xp 及打分（也许不能保存）</li>
          <li>按多个维度排序的功能（先按类别，再按星级）</li>
          <li>添加马里亚纳海沟区</li>
          <li>pc 长项目</li>
          <li>手机长项目排版问题</li>
          <li>分享海报二维码尺寸问题</li>
        </div>
        <div>作者：御坂云见#17535 <a href={'https://twitter.com/MisakaKumomi'}>[twitter]</a></div>
        <div>测试：fuzhu</div>
        <div>项目地址/bug 反馈：
          <a className={'text-orange-200 decoration-solid'} href={'https://github.com/Misaka-0x447f/xp-oobe'}
             target={'_blank'} rel="noreferrer">https://github.com/Misaka-0x447f/xp-oobe</a>
        </div>
        <div>用户意见群（全球）：<a className={'text-orange-200 decoration-solid'} href={'https://t.me/+jzo6ZFZ8365kNDc9'}
                                 target={'_blank'} rel="noreferrer">https://t.me/+jzo6ZFZ8365kNDc9</a></div>
        <div className={'flex items-center'}>用户意见群（中国大陆）：<a target={'_blank'} href={'https://jq.qq.com/?_wv=1027&k=iqKi6zeR'} rel="noreferrer"><img
          src={'http://pub.idqqimg.com/wpa/images/group.png'} alt={'xp-oobe-join-group'} title={'xp-oobe'}/></a>483446768</div>
      </div>}
      {confirmClearVisible && <div className={'bg-orange-900 p-4 flex flex-col'}>
        <span className={'text-xl'}>确实要重置表单吗？</span>
        <div className={'flex mt-2'}>
          <FluentButton className={'mr-2'} style={{ backgroundColor: 'rgba(239, 68, 68)' }} icon={<TagReset24Regular/>}
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
            <span className={'text-lg ml-2'}>正在生成分享海报。这可能需要几秒钟的时间，具体取决于您的计算机配置。</span>
          </div>}
          {screenShotUrl && <>
            <div className={'flex justify-between'}>
              <div className={'flex flex-col'}>
                <span className={'text-lg'}>分享海报已生成。</span>
                <a className={'text-orange-200 decoration-solid'} href={screenShotUrl} target='_blank'
                   rel="noreferrer" download={'xp-oobe.png'}>点击此处下载。</a>
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
    </div>
    <div className={'flex-1 bg-[#242424] h-full'} id={'answer-zone'}>
      <AutoSizer>
        {(sizeInfo) =>
          <VirtualizedList {...sizeInfo} itemCount={entries.length} itemSize={remToPx(12 / 4)}>
            {({ index, style }) => {
              const entry = entries[index]
              return <div style={style}>
                {(() => {
                  if (isString(entry)) {
                    return <div key={`${entry}-${index}`}
                                className={['flex h-12 px-4 box-border items-center justify-between', index % 2 === 0 && 'bg-[#303030]'].join(' ')}>
                      <div className={'flex flex-col'}>
                        <span className={'pb-1'}>{entry}</span>
                        <span className={'mt-[-0.25rem] pr-4 text-gray-400 text-xs'}>{config.v1.descs?.[entry]}</span>
                      </div>
                      {config.v1.ratingType === 'xp-star' &&
                        <div className={'flex items-center justify-center'}>
                          <span className={'opacity-50 pb-1 pr-2'}>{getDesc(data.get(entry))}</span>
                          <Rating className={'stroke-[rgba(255,255,255,0.2)]'} character={<BookCompass24Filled/>}
                                  count={1}
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
                    <div
                      className={'bg-blue-700 h-12 flex items-center w-full px-4 box-border'}>{entry.displayName}</div>
                  </div>
                })()}
              </div>
            }}
          </VirtualizedList>
        }
      </AutoSizer>
    </div>
  </div>)
}
