import React from 'react'

export const SectionTitle = (p: { title: string }) => {
  return <div className={'bg-blue-700 h-12 flex items-center w-full px-4 box-border'}>{p.title}</div>
}
