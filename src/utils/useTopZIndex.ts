import { first, last, uniqueId } from 'lodash'
import { useEffect, useState } from 'react'
import { useMixedState } from './hooks'

let startAt = 1000
const inUseList: Array<{ index: number, key: string, comment?: string }> = []
export const setStartingZIndex = (index: number) => (startAt = index)

/**
 * @author 447f.misaka@outlook.com
 * @param key             key to reduce leak happen. must be
 *                        identical with the comment in
 *                        method 'free'
 * @param comment         a comment from allocator may helps
 *                        diagnostic problem.
 * @param placeToBottom   place the new layer to the bottom
 *                        of every existing layer
 */
export const zAlloc = ({
  key,
  placeToBottom = false,
  comment
}: {
  key: string
  placeToBottom?: boolean
  comment?: string
}) => {
  if (placeToBottom) {
    const index = (first(inUseList)?.index ?? startAt) - 1
    inUseList.unshift({ index, key, comment })
    return index
  } else {
    const index = (last(inUseList)?.index ?? startAt) + 1
    inUseList.push({ index, key, comment })
    return index
  }
}

/**
 * @author 447f.misaka@outlook.com
 * advance usage only.
 */
export const zFree = ({
  key,
  zIndex,
  comment = ''
}: {
  key: string
  zIndex: number
  comment?: string
}) => {
  const findResult = inUseList.findIndex(el => el.index === zIndex && el.key === key)
  if (findResult === -1) {
    throw new Error(
      `Assertion Error [ZIndexManager]: index ${zIndex} cannot be released because it does not exist. key string: '${key}', comment string: '${comment}'.`
    )
  }
  inUseList.splice(findResult, 1)
}

/**
 * @author 447f.misaka@outlook.com
 * Get always-on-top zIndex.
 * @param key   key to identify your component.
 * @param deps  when deps update we reallocate an index. e.g. use ['visible']
 *              as your dep, so every time visible change we do it once.
 */
export const useTopZIndex = <T>(key: string, deps: readonly T[]) => {
  const [uid] = useState(uniqueId)
  const [zIndex, setZIndex, zIndexRef] = useMixedState(-1)
  useEffect(() => {
    const i = `${key} - ${uid}`
    setZIndex(zAlloc({ key: i, comment: `setup or update allocate - ${uid}` }))
    return () => {
      // clearly know what I am doing
      zFree({ key: i, zIndex: zIndexRef.current, comment: `before update free - ${uid}` })
    }
    // clearly know what I am doing
  }, deps)
  return [zIndex, zIndexRef] as const
}
