export interface Config {
  [protocolVersion: string]: {
    // how large is one item. range: 1-70
    bitSize: number
    ratingType: 'xp-star'
    items: string[]
    sections: Array<{
      displayName: string
      items: string[]
    }>
  }
}

export const config: Config = {
  v1: {
    bitSize: 7,
    ratingType: 'xp-star',
    items: ['多人性交', '深喉', '口交'],
    sections: [
      {
        displayName: '性奴',
        items: ['多人性交', '深喉', '口交']
      }
    ]
  }
}
