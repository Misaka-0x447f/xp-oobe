import React, { ComponentProps, useState } from 'react'
import { CheckIP } from './pages/CheckIP'
import { LandingPage } from './pages/LandingPage'
import { MainPage } from './pages/MainPage'

export const Pages = {
  checkIp: CheckIP,
  landing: LandingPage,
  main: MainPage
}
type PageNames = keyof typeof Pages

export const RouterContext = React.createContext({
  goto: <T extends PageNames, >(_: T, __: ComponentProps<typeof Pages[T]>): void => { throw new Error('router not available') }
})

const App = () => {
  const [page, setPage] = useState<PageNames>('checkIp')
  const [args, setArgs] = useState<any>(null)
  return <>
    <RouterContext.Provider value={{ goto: (page, arg) => { setPage(page); setArgs(arg) } }}>
      {React.createElement(Pages[page], args)}
    </RouterContext.Provider>
  </>
}

export default App
