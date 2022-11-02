import { Config, config } from './config'
import qrcodeSrc from '~/assets/qrcode.png'

export interface ShareSheetData {
  protocolVersion: 'v1'
  items: Map<string, { book: number, star: number }>
}

const readImage = async (src: string) => await new Promise<HTMLImageElement>((resolve, reject) => {
  const img = new Image()
  img.addEventListener('load', () => {
    resolve(img)
  }, false)
  img.src = src
  setTimeout(() => reject(new Error('Image loading timeout')), 10000)
})

const getFont = (size: number, fontFamily = 'Inter, Avenir, Helvetica, Arial, sans-serif') => `${size}px ${fontFamily}`

export const generateShareSheet = async (data: ShareSheetData) => {
  const canvas = document.createElement('canvas')
  const items = config[data.protocolVersion].sections.reduce<Array<Config[string]['sections'][0] | string>>((acc, cur) => {
    if ('items' in cur) {
      acc.push(cur)
      acc.push(...cur.items)
    } else acc.push(cur)
    return acc
  }, [])
  const columnCount = 5
  const columnWidth = 400
  const lineHeight = 72
  const numPerColumn = Math.ceil(items.length / columnCount)
  const bannerHeight = 300

  canvas.width = columnCount * columnWidth
  canvas.height = bannerHeight + numPerColumn * lineHeight

  const [qrcode] = await Promise.all([readImage(qrcodeSrc)])

  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#242424'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = getFont(36)
  ctx.textBaseline = 'middle'
  const qrcodeSize = 200
  const qrPadding = (bannerHeight - qrcodeSize) / 2
  ctx.drawImage(qrcode, qrPadding, qrPadding, qrcodeSize, qrcodeSize)
  ctx.fillText('扫描二维码在线查看结果。', qrPadding * 2 + qrcodeSize, bannerHeight / 2 - 24)
  ctx.font = getFont(24)
  ctx.fillText('或访问 xp-oobe.misaka.org，开始制作你的 xp 镜像。', qrPadding * 2 + qrcodeSize, bannerHeight / 2 + 24)

  return canvas
}
