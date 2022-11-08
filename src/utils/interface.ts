// every ASCII char that will not be encoded in URL.
// DO NOT modify this string since this will break data reading and writing.
import { config } from './config'
import { Notification } from '@douyinfe/semi-ui'

// dot is used for splitter
export const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_*-'.split('')
export const convertBase = (value: string, fromBase: number, toBase: number) => {
  const fromRange = digits.slice(0, fromBase)
  const toRange = digits.slice(0, toBase)
  const bigToBase = BigInt(toBase)

  let decValue = value.split('').reverse().reduce((carry, digit, index) => {
    if (!fromRange.includes(digit)) {
      clear()
      Notification.error({ content: '检测到数据损坏。正在清空数据...' })
      setTimeout(() => window.location.reload(), 3000)
      throw new Error(`Invalid digit ${digit} for base ${fromBase}`)
    }
    carry += BigInt(fromRange.indexOf(digit)) * (BigInt(fromBase) ** BigInt(index))
    return carry
  }, BigInt(0))

  let newValue = ''
  while (decValue > 0) {
    newValue = toRange[Number(decValue % bigToBase)] + newValue
    decValue = (decValue - (decValue % bigToBase)) / bigToBase
  }
  return newValue !== '' ? newValue : '0'
}

export interface Data {
  protocolVersion: string
  items: Array<[string, number]>
}

// data should be a string where each single
// char is a digit, in the sequence of the above digit const:
// 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_~'()*-
export const encodeAndSave = async (data: Data) => {
  const sourceBitSize = config[data.protocolVersion].bitSize
  const mapItems = (items: string[]) => items.map(listItem => convertBase((data.items.find(el => el[0] === listItem)?.[1] ?? 0).toString(), 10, sourceBitSize)).reverse().join('')
  const dataSequences = config[data.protocolVersion].itemsGroup.map(items => mapItems(items))
  const encoded = `${data.protocolVersion}.${dataSequences.map(dataSequence => convertBase(dataSequence, sourceBitSize, digits.length)).join('.')}`
  if (encoded.split('.')[1] === '0') {
    localStorage.removeItem('data')
    const url = new URL(window.location.href)
    url.searchParams.delete('d')
    window.history.replaceState({}, 'title', url.toString())
    return {
      url,
      string: encoded
    }
  } else {
    localStorage.setItem('data', encoded)
    const url = new URL(window.location.href)
    url.searchParams.set('d', encoded)
    window.history.replaceState({}, 'title', url.toString())
    return {
      url,
      string: encoded
    }
  }
}

export const read = () => {
  const res = { import: new URLSearchParams(window.location.search).get('d'), local: localStorage.getItem('data') }
  return {
    ...res,
    any: res.import ?? res.local
  }
}

export const clear = () => {
  localStorage.removeItem('data')
  const url = new URL(window.location.href)
  url.searchParams.delete('d')
  window.history.pushState({}, '', url.toString())
}

export const decodeOrLoad = async (): Promise<Data | undefined> => {
  const encoded = read().any
  if (!encoded) return undefined
  const [protocolVersion, ...itemsGroup] = encoded.split('.')
  if (!config[protocolVersion]) throw new Error(`Invalid protocol version: ${protocolVersion}`)
  const sourceBitSize = config[protocolVersion].bitSize
  const decodedGroups = itemsGroup.map((items) => convertBase(items, digits.length, sourceBitSize))
  if (config.v1.itemsGroup.length !== decodedGroups.length) {
    clear()
    Notification.error({ content: '检测到数据损坏。正在清空数据...' })
    setTimeout(() => window.location.reload(), 3000)
    throw new Error('Invalid data')
  }
  return {
    protocolVersion,
    // @ts-expect-error
    items: decodedGroups.map((item, indexInGroup) => Array.from(item).reverse().map((digit, indexInString) => [config.v1.itemsGroup[indexInGroup][indexInString], parseInt(convertBase(digit, sourceBitSize, 10))] as const)).flat()
  }
}
