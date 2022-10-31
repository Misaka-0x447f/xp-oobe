import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'
import { FluentProvider, teamsDarkTheme } from '@fluentui/react-components'
import 'uno.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <FluentProvider theme={teamsDarkTheme}>
    <App/>
  </FluentProvider>
)
