import { Button } from '@fluentui/react-components'
import { ArrowCircleRight24Regular } from '@fluentui/react-icons'
import React from 'react'

export const WelcomePrompt = (props: { onStart: () => void }) => {
  return <div className={'m-8'}>
    <div className={'text-3xl font-mono'}>Project xp-oobe</div>
    <div>本项目旨在帮助您快速识别并栅格化您的 xp 以供未来使用。</div>
    <div className={'h-8'}></div>
    <Button appearance={'primary'} size={'large'} icon={<ArrowCircleRight24Regular />} onClick={props.onStart}>开始</Button>
  </div>
}
