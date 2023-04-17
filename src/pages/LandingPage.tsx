import React, { useContext } from 'react'
import { RouterContext } from '../App'
import { useBeforeMount } from '../utils/hooks'
import { read } from '../utils/interface'
import { Button } from '@fluentui/react-components'
import { ArrowCircleRight24Regular, CloudArrowDown24Regular, FormNew24Regular } from '@fluentui/react-icons'

export const LandingPage = () => {
  const router = useContext(RouterContext)
  const [importedData, setImportedData] = React.useState<undefined | string>(undefined)
  const [localData, setLocalData] = React.useState<undefined | string>(undefined)
  useBeforeMount(() => {
    const data = read()
    setImportedData(data.import?.split('.')?.[1])
    setLocalData(data.local?.split('.')?.[1])
  })
  return <div className="w-screen h-screen flex items-center">
    <div className={'m-8'}>
      <div className={'text-3xl font-mono'}>Project xp-oobe (resume-demo)</div>
      <div className={'text-xl font-mono'}>https://xp-resume-demo.misaka.org/</div>
      <div>本项目旨在帮助您制作一份您对《明日方舟》中干员的喜爱程度的表单并便于分享给他人。*filtered*</div>
      {(() => {
        if (!!importedData && importedData !== localData) {
          return <>
            <div className={'h-8'}></div>
            <div>检测到本地草稿与链接/二维码中的数据不匹配。点击“导入”按钮，导入链接/二维码中的数据。</div>
            <div className={'h-2'}></div>
            <div className={'flex'}>
              <Button appearance={'primary'} size={'large'} icon={<CloudArrowDown24Regular/>}
                      onClick={() => router.goto('main', { newDocument: false })}>导入数据</Button>
              <span className={'w-2'}></span>
              <Button appearance={'secondary'} size={'large'} icon={<FormNew24Regular/>}
                      onClick={() => router.goto('main', { newDocument: true })}>新建表单</Button>
            </div>
          </>
        } else {
          return <>
            <div className={'h-8'}></div>
            {!!localData && <>
              <div>检测到本地有草稿。点击“开始”按钮继续编辑。</div>
              <div className={'h-2'}></div>
            </>}
            <Button appearance={'primary'} size={'large'} icon={<ArrowCircleRight24Regular/>}
                    onClick={() => router.goto('main', { newDocument: false })}>开始编辑</Button></>
        }
      })()}
    </div>
  </div>
}
