import { WelcomePrompt } from '../components/WelcomePrompt'
import React, { useContext } from 'react'
import { RouterContext } from '../App'

export const LandingPage = () => {
  const router = useContext(RouterContext)
  return <div className="w-screen h-screen flex items-center">
    <WelcomePrompt onStart={() => router.goto('main')} />
  </div>
}
