import React, { useContext, useState } from 'react'
import { RouterContext } from '../App'
import { useBeforeMount } from '../utils/hooks'

export const CheckIP = () => {
  const router = useContext(RouterContext)
  const [failed, setFailed] = useState(false)
  useBeforeMount(() => {
    (async () => {
      const res = await fetch('https://ip.misaka.org').catch(() => {
        setFailed(true)
      })
      const data = await res?.json().catch(() => {
        setFailed(true)
      })
      if (data.geo.country === 'CN') {
        window.location.href = 'https://misaka.org/451'
        return
      }
      router.goto('landing', {})
    })()
  })
  return <div className="w-screen h-screen flex items-center">
    <div className={'m-8'}>
      <div className={'text-3xl font-mono'}>Project xp-oobe</div>
      <div className={'text-xl font-mono mb-2'}>https://xp.misaka.org/</div>
      {failed
        ? <div style={{
          color: '#f80',
          fontSize: 18
        }}>区域服务不可用，因此无法检查您的区域，请刷新重试。</div>
        : <div>正在检查您的区域。</div>}
    </div>
  </div>
}
