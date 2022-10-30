export interface Config {
  [protocolVersion: string]: {
    // how large is one item. range: 1-71
    bitSize: number
    rating: {
      ratingType: 'star'
      count: number
      allowClear?: boolean
      allowHalf?: boolean
      description?: string
    }
    items: string[]
    sections: Array<{
      displayName: string
      items: string[]
    }>
  }
}

export const config: Config = {
  v1: {
    bitSize: 6,
    rating: {
      ratingType: 'star',
      count: 5,
      allowClear: true,
      allowHalf: false,
      description: '再次点击星星可取消评分'
    },
    items: ['轮奸'],
    sections: [
      {
        displayName: '性奴',
        items: ['多人性交', '深喉', '口交']
      }
    ]
  }
}
