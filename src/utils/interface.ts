// every ASCII char that will not be encoded in URL.
// DO NOT modify this string since this will break data reading and writing.
import { config } from './config'
import * as localforage from 'localforage'

export const digits = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_~!\'()*-.'.split('')
export const convertBase = (value: string, fromBase: number, toBase: number) => {
  const fromRange = digits.slice(0, fromBase)
  const toRange = digits.slice(0, toBase)

  let decValue = value.split('').reverse().reduce((carry, digit, index) => {
    if (!fromRange.includes(digit)) throw new Error(`Invalid digit ${digit} for base ${fromBase}`)
    carry += fromRange.indexOf(digit) * (Math.pow(fromBase, index))
    return carry
  }, 0)

  let newValue = ''
  while (decValue > 0) {
    newValue = toRange[decValue % toBase] + newValue
    decValue = (decValue - (decValue % toBase)) / toBase
  }
  return newValue !== '' ? newValue : '0'
}

export interface Data {
  protocolVersion: string
  items: Array<[string, number]>
}

// data should be a string where each single
// char is a digit, in the sequence of the above digit const:
// 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz_~!'()*-.
export const encodeAndSave = async (data: Data) => {
  const bitSize = config[data.protocolVersion].bitSize
  const encoded = `${data.protocolVersion},${data.items.map(item => convertBase(item[1].toString(), bitSize, digits.length)).join('')}`
  await localforage.setItem('data', encoded)
  const url = new URL(window.location.href)
  url.searchParams.set('d', encoded)
  return {
    url,
    data: encoded
  }
}

export const decodeOrLoad = async () => {
  const encoded = new URLSearchParams(window.location.search).get('d') ?? await localforage.getItem('data')
  if (!encoded) return undefined
  const [protocolVersion, ...sections] = encoded.split(',')
  if (!config[protocolVersion]) throw new Error(`Invalid protocol version: ${protocolVersion}`)
  const bitSize = config[protocolVersion].bitSize
  return sections.map(section => convertBase(section, digits.length, bitSize))
}
