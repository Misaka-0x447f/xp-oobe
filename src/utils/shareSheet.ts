import { configs, getDesc, isPlainItem } from './config'
import emptyBookSrc from '~/assets/empty-book.svg'
import emptyStarSrc from '~/assets/empty-star.svg'
import fillBookSrc from '~/assets/fill-book.svg'
import fillStarSrc from '~/assets/fill-star.svg'
import * as QRCode from 'qrcode'
import { rule, sort } from './sort'

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

const getQRCode = async (text: string, size: number) => {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  await QRCode.toCanvas(canvas, text)
  return canvas
}

const fillText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number, align = 'start' as 'start' | 'end' | 'left' | 'right' | 'center', baseline = 'middle' as 'top' | 'hanging' | 'middle' | 'alphabetic' | 'ideographic' | 'bottom') => {
  ctx.textAlign = align
  ctx.textBaseline = baseline
  ctx.fillText(text, x, y)
}

export const generateShareSheet = async (data: ShareSheetData, url: string, sortRule: keyof typeof rule) => {
  const canvas = document.createElement('canvas')
  const items = sort(configs[data.protocolVersion].sections.filter(el => !('shareBehavior' in el) || el.shareBehavior !== 'hidden'), rule[sortRule], data.items)
  const columnCount = 4
  const columnWidth = 800
  const columnGap = 24
  const lineHeight = 72
  const rowCount = Math.ceil(items.length / columnCount)
  const bannerHeight = 300
  const qrcodeSize = 200

  canvas.width = columnCount * columnWidth + (columnCount - 1) * columnGap
  canvas.height = bannerHeight + rowCount * lineHeight

  const [qrcode, emptyBook, emptyStar, fillBook, fillStar] = await Promise.all([getQRCode(url, qrcodeSize), readImage(emptyBookSrc), readImage(emptyStarSrc), readImage(fillBookSrc), readImage(fillStarSrc)])

  const ctx = canvas.getContext('2d')
  if (!ctx) return null
  ctx.fillStyle = '#242424'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.fillStyle = '#fff'
  ctx.font = getFont(48)
  // magic number
  const qrPadding = (bannerHeight - qrcodeSize) / 3
  const qrX = canvas.width - qrcodeSize - qrPadding * 2
  ctx.drawImage(qrcode, qrX, qrPadding)
  fillText(ctx, '扫描二维码在线查看或导入结果', qrX - qrPadding, bannerHeight / 2 - 24, 'right')
  ctx.font = getFont(36)
  fillText(ctx, '或访问 xp-resume-demo.misaka.org，开始制作你的 xp 镜像', qrX - qrPadding, bannerHeight / 2 + 24, 'right')

  const starColumnWidth = 60
  const contentPaddingLeft = 16

  for (const [index, item] of items.entries()) {
    const row = index % rowCount
    const column = Math.floor(index / rowCount)
    const x = column * columnWidth + column * columnGap
    const y = bannerHeight + row * lineHeight
    if (isPlainItem(item)) {
      ctx.fillStyle = index % 2 === 0 ? '#303030' : '#242424'
      ctx.fillRect(x, y, columnWidth, lineHeight)
      ctx.font = getFont(24)
      ctx.fillStyle = '#fff'
      fillText(ctx, item.label, x + contentPaddingLeft, y + lineHeight / 2)
      const { book = 0, star = 0 } = data.items.get(item.label) ?? {}
      const desc = getDesc({ book, star })
      ctx.drawImage(book ? fillBook : emptyBook, x + columnWidth - starColumnWidth * 6, y + 12, 48, 48)
      for (let i = 0; i < 5; i++) {
        ctx.drawImage(i < star ? fillStar : emptyStar, x + columnWidth - starColumnWidth * (5 - i), y + 12, 48, 48)
      }
      ctx.fillStyle = 'rgba(255, 255, 255, 0.5)'
      fillText(ctx, desc, x + columnWidth - starColumnWidth * 6 - ctx.measureText(desc).width - contentPaddingLeft, y + lineHeight / 2)
    } else if ('desc' in item) {
      ctx.font = getFont(24)
      ctx.fillStyle = 'backgroundColor' in item ? item.backgroundColor : '#1d4ed8'
      ctx.fillRect(x, y, columnWidth, lineHeight)
      ctx.fillStyle = '#fff'
      fillText(ctx, item.desc, x + contentPaddingLeft, y + lineHeight / 2)
    } else {
      throw new Error(`Unrecognizable item: ${JSON.stringify(item)}`)
    }
  }

  return canvas
}
