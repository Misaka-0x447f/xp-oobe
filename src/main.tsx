import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import 'uno.css'
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <FluentProvider theme={teamsDarkTheme}>
    <App/>
  </FluentProvider>
)
