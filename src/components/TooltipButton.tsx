import React, { ReactNode } from 'react'
import { Spinner } from '@fluentui/react-components'

export const TooltipButton = (props: { children: ReactNode, onClick?: () => void, active?: boolean, loading?: boolean }) => {
  return <div className={['[@media(any-hover:hover){&:hover}]:bg-blue-400 w-12 h-12 flex items-center justify-center cursor-pointer', !!props.active && 'bg-blue-900'].join(' ')} onClick={() => !props.loading && props.onClick?.()}>
    {props.loading ? <Spinner appearance={'inverted'} size={'small'}/> : props.children}
  </div>
}
