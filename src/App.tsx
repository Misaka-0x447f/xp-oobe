import React, { useState } from 'react'
import { LandingPage } from './pages/LandingPage'
import { MainPage } from './pages/MainPage'

export type Pages = 'main' | 'landing'
export const RouterContext = React.createContext({
  goto: (_: Pages): void => { throw new Error('router not available') }
})

const App = () => {
  const [page, setPage] = useState<Pages>('landing')
  return <>
    <RouterContext.Provider value={{ goto: (page) => { setPage(page) } }}>
      {page === 'landing' && <LandingPage />}
      {page === 'main' && <MainPage />}
    </RouterContext.Provider>
  </>
}

export default App
