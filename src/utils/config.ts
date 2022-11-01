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
    bitSize: 12,
    ratingType: 'xp-star',
    items: ['多人性交', '深喉', '口交', '颜射', '乳交', '后入', '内射', '拉珠', '扩张', '塞子(小)', '塞子(中)', '塞子(大)', '阴道扩张', '阴道拳交', '肛门拳交'],
    sections: [
      {
        displayName: '性偶',
        items: ['多人性交', '深喉', '口交', '颜射', '乳交', '后入', '内射', '拉珠', '扩张', '塞子(小)', '塞子(中)', '塞子(大)', '阴道扩张', '阴道拳交', '肛门拳交']
      }
    ]
  }
}
