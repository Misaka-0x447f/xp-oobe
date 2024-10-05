import { difference, isUndefined } from 'lodash'
import type { XpStar } from '../components/RatingXpStar'
import { Notification } from '@douyinfe/semi-ui'

export interface GroupEntry {
  displayName: string
  items: string[]
}

export interface DescEntry {
  desc: string
  backgroundColor: string
  sortBehavior: 'top' | 'hidden'
  shareBehavior?: 'hidden'
}

export interface CustomZoneEntry {
  customZone: true
  sortBehavior: 'top' | 'hidden'
}

export interface PlainItem {
  label: string
  group: string
}

export const isPlainItem = (data: PlainItem | CustomZoneEntry | DescEntry | GroupEntry): data is PlainItem => 'label' in data
export const isGroupEntry = (data: PlainItem | CustomZoneEntry | DescEntry | GroupEntry): data is GroupEntry => 'items' in data
export const isDescEntry = (data: PlainItem | CustomZoneEntry | DescEntry | GroupEntry): data is DescEntry => 'desc' in data
export const isCustomZoneEntry = (data: PlainItem | CustomZoneEntry | DescEntry | GroupEntry): data is CustomZoneEntry => 'customZone' in data

export interface Config {
  [protocolVersion: string]: {
    // how large is one item. starting at 1 bit.
    bitSize: number
    ratingType: 'xp-star'
    // to extend items, add new sections instead
    // just appending last array to prevent data lost.
    itemsGroup: string[][]
    sections: Array<GroupEntry | DescEntry | CustomZoneEntry>
    descs?: Record<string, string>
  }
}

export const getDesc = (p: XpStar | undefined) => {
  if (isUndefined(p)) {
    return '未知'
  }
  return [['', '试过'][p.book], ['未知', '绝不', '拒绝', '中立', '接受', '喜爱'][p.star]].filter(el => el)
    .join('，')
}

const data = {
  itemsGroup: [[
    ['多人', '深喉', '口交', '颜射', '乳交', '后入', '内射', '拉珠', '扩张(阴道)', '扩张(肛门)', '拳交(阴道)', '拳交(肛门)', '塞子(小)', '塞子(中)', '塞子(大)', '灌肠', '异物塞入', '食物塞入', '炮机', '电动玩具塞入', '双玩具塞入', '吹潮失禁', '强制高潮', '控制高潮', '拒绝高潮', '多次高潮', '文爱', 'Dirty Talk'],
    ['k8', 'k9', '马具', '面具', '模仿叫声', '笼子关押', '项圈/镣铐', '饲养(短期)', '饲养(长期)', '被用脚喂食', '宠物式进食', '服务(常规)', '服务(使用嘴)', '爬行', '舔足', '舔鞋', '舔性器官', '踩踏', '出行', '禁言', '坐脸', '坐身体', '插件尾巴'],
    ['功能性绳缚', '美观绳缚', '乳头摩擦绳缚', '性器官摩擦绳缚', '胶带捆绑', '保鲜膜捆绑', '木质拘束器', '皮质拘束器', '金属拘束器', '拘束衣', '单手套', '全身悬吊', '平衡悬吊', '倒立悬吊', '鞭打柱', '十字架', 'X 字架', '手铐/脚铐', '颈腰脚连铐', '睡袋拘束', '真空床', '驷马', '分腿器', '露出(郊野)', '露出(公开)', '公开绳缚表演'],
    ['制服', '西装', '正太', '叔叔', '幼女', '阿姨', '同性', '异性', '手部', '颜值', '臀部', '足部', '肌肉'],
    ['角色扮演', '审讯', '绑架', '强暴', '囚犯', '医疗', '教育', '怪物入侵', '婴儿', '烹饪', '服务员', '女仆', '物品扮演'],
    ['SP(轻度)', 'SP(中度)', 'SP(重度)', '掌掴(无痕迹)', '掌掴(有痕迹)', '口球', '衣物堵嘴', '充气口球', '阴茎/条形口塞', '胶条封嘴', '拉扯头发', '皮带', '藤条', '木棒', '戒尺', '散鞭', '马鞭', '蛇鞭', '毛刷', '手心', '脚心', '其他搔痒', '腹部拳击', '其他拳击', '咬', '虐待性器官', '器具吸乳', '乳夹', '乳夹(承重)', '阴夹', '滴蜡', '电击按摩', '冰块', '冰块插入', '木马', '走绳结'],
    ['全时主奴', '佩戴饰品(隐蔽)', '佩戴饰品(明显)', '视觉控制', '听觉控制', '如厕隔离', '食物控制', '睡眠控制', '衣着控制', '行为控制', '体重控制', '强制运动', '强制服药', '性交控制(短期)', '性交控制(长期)', '剃毛(阴部)', '剃毛(全身)'],
    ['拍照(无脸)', '拍照(露脸)', '视频(无脸)', '视频(露脸)', '多主', '多奴', '奴下奴'],
    ['郊野', '公开', '露出奴役', '露出流放', '露出性爱', '露出爱抚', '露阴(向主人)', '露阴(向陌生人)'],
    ['脏话侮辱', '语言侮辱', '人格侮辱', '思维控制', '视觉控制', '网络控制', '语言管教', '网络公调', '视频表演', '观看成人电影'],
    ['昆虫', '兽交', '兽交(多个)', '人兽同交', '兽虐'],
    ['灌肠(惩罚目的)', '精液', '“圣水”', '“黄金”', '“圣水”浴', '厕后舔肛', '排便', '放尿'],
  ].flat(),
  // extended before publish
  ['视觉控制(隐蔽)', '视觉控制(明显)', '排泄控制'],
  // extended at 2023-04-10
  ['呼吸控制(无道具)', '限制颈部血液流动'],
  // extended at 2023-11-06
  ['呼吸控制(面罩)', '呼吸控制(软性材料)', '穿刺/上环', '纹身贴', '永久纹身', '临时锁', '长期锁'],
  // extended at 2024-10-05
  ['高跟鞋', '情趣服装', '日式捆绑', '自缚']
  ],
  sections: [
    {
      desc: '提醒：每一项都不是必填，不填也可代表拒绝回答。本站无服务器，所有数据保存在你的浏览器上，因此请记得自己按保存。',
      backgroundColor: '#333',
      sortBehavior: 'top',
      shareBehavior: 'hidden'
    },
    {
      displayName: '性偶',
      items: ['多人', '深喉', '口交', '颜射', '乳交', '后入', '内射', '拉珠', '扩张(阴道)', '扩张(肛门)', '拳交(阴道)', '拳交(肛门)', '塞子(小)', '塞子(中)', '塞子(大)', '灌肠', '异物塞入', '食物塞入', '炮机', '电动玩具塞入', '双玩具塞入', '吹潮失禁', '强制高潮', '控制高潮', '拒绝高潮', '多次高潮', '文爱', 'Dirty Talk']
    },
    {
      displayName: '宠物化',
      items: ['k8', 'k9', '马具', '面具', '模仿叫声', '笼子关押', '项圈/镣铐', '纹身贴', '长期锁', '饲养(短期)', '饲养(长期)', '被用脚喂食', '宠物式进食', '服务(常规)', '服务(使用嘴)', '爬行', '舔足', '舔鞋', '舔性器官', '踩踏', '出行', '禁言', '坐脸', '坐身体', '插件尾巴']
    },
    {
      displayName: '捆绑/拘束/装饰',
      items: ['功能性绳缚', '美观绳缚', '日式捆绑', '乳头摩擦绳缚', '性器官摩擦绳缚', '胶带捆绑', '保鲜膜捆绑', '木质拘束器', '皮质拘束器', '金属拘束器', '拘束衣', '高跟鞋', '情趣服装', '自缚', '单手套', '全身悬吊', '平衡悬吊', '倒立悬吊', '鞭打柱', '十字架', 'X 字架', '手铐/脚铐', '颈腰脚连铐', '睡袋拘束', '真空床', '驷马', '分腿器', '露出(郊野)', '露出(公开)', '公开绳缚表演']
    },
    {
      displayName: '兴趣',
      items: ['制服', '西装', '正太', '叔叔', '幼女', '阿姨', '同性', '异性', '手部', '颜值', '臀部', '足部', '肌肉']
    },
    {
      displayName: '角色扮演',
      items: ['角色扮演', '审讯', '绑架', '强暴', '囚犯', '医疗', '教育', '怪物入侵', '婴儿', '烹饪', '服务员', '女仆', '物品扮演']
    },
    {
      displayName: '玩法/道具',
      items: ['SP(轻度)', 'SP(中度)', 'SP(重度)', '掌掴(无痕迹)', '掌掴(有痕迹)', '口球', '衣物堵嘴', '充气口球', '阴茎/条形口塞', '胶条封嘴', '拉扯头发', '临时锁', '皮带', '藤条', '木棒', '戒尺', '散鞭', '马鞭', '蛇鞭', '毛刷', '手心', '脚心', '其他搔痒', '腹部拳击', '其他拳击', '咬', '虐待性器官', '器具吸乳', '乳夹', '乳夹(承重)', '阴夹', '滴蜡', '电击按摩', '冰块', '冰块插入', '木马', '走绳结', '呼吸控制(无道具)', '呼吸控制(面罩)', '呼吸控制(软性材料)', '限制颈部血液流动']
    },
    {
      displayName: '身体控制',
      items: ['全时主奴', '佩戴饰品(隐蔽)', '佩戴饰品(明显)', '视觉控制(隐蔽)', '视觉控制(明显)', '听觉控制', '如厕隔离', '食物控制', '排泄控制', '睡眠控制', '衣着控制', '行为控制', '体重控制', '强制运动', '强制服药', '性交控制(短期)', '性交控制(长期)', '剃毛(阴部)', '剃毛(全身)']
    },
    {
      displayName: '社交',
      items: ['拍照(无脸)', '拍照(露脸)', '视频(无脸)', '视频(露脸)', '多主', '多奴', '奴下奴']
    },
    {
      displayName: '露出',
      items: ['郊野', '公开', '露出奴役', '露出流放', '露出性爱', '露出爱抚', '露阴(向主人)', '露阴(向陌生人)']
    },
    {
      desc: '注意：前方进入深水区，可能引起不适',
      backgroundColor: '#f80',
      sortBehavior: 'hidden'
    },
    {
      displayName: '精神控制',
      items: ['脏话侮辱', '语言侮辱', '人格侮辱', '思维控制', '网络控制', '语言管教', '网络公调', '视频表演', '观看成人电影']
    },
    {
      displayName: '动物',
      items: ['昆虫', '兽交', '兽交(多个)', '人兽同交', '兽虐']
    },
    {
      displayName: '代谢',
      items: ['灌肠(惩罚目的)', '排泄控制', '精液', '“圣水”', '“黄金”', '“圣水”浴', '厕后舔肛', '排便', '放尿']
    },
    {
      displayName: '损伤或永久痕迹',
      items: ['穿刺/上环', '永久纹身']
    }
  ] as Config[string]['sections'],
  descs: {
    k8: '猫化',
    k9: '犬化',
    公开绳缚表演: '例如聚会',
    正太: '仅限幻想作品',
    幼女: '仅限幻想作品',
    同性: '以性别认同为准',
    异性: '以性别认同为准',
    烹饪: '别当真，很多词是 AI 自动补全的。',
    婴儿: 'ABDL',
    露出性爱: '建议遵守法律法规和公序良俗。',
    强制服药: '仅信任',
    '佩戴饰品(隐蔽)': '小徽章/手环/项链/项圈',
    '佩戴饰品(明显)': '有明显铭牌的项圈等',
    'SP(轻度)': '当天或次日无痕迹',
    'SP(中度)': '痕迹持续半周',
    'SP(重度)': '痕迹持续一到三周',
    电击按摩: '请遵守电击器使用规范，否则可能导致死亡',
    冰块插入: '视体质可能导致死亡',
    '视觉控制(隐蔽)': '隐形眼镜/不透光墨镜'
  }
}

export const configs: Config = {
  v1: {
    bitSize: 12,
    ratingType: 'xp-star',
    ...data
  }
}

// validate
for (const config of Object.values(configs)) {
  let errorFlag = false
  const { sections, descs, itemsGroup } = config
  let sectionsItem: string[] = []
  for (const section of sections) {
    if ('items' in section) {
      sectionsItem = sectionsItem.concat(section.items)
    }
  }
  const itemsGroupItem: string[] = itemsGroup.flat()
  if (difference(sectionsItem, itemsGroupItem).length > 0) {
    console.error(`[Config validator] difference(sectionsItem, itemsGroupItem) should be [], got [${difference(sectionsItem, itemsGroupItem).join(',')}]`)
    errorFlag = true
  }
  const descsError: string[] = []
  for (const key of Object.keys(descs ?? {})) {
    if (!sectionsItem.includes(key)) {
      descsError.push(key)
    }
  }
  if (descsError.length) {
    console.error(`[Config validator] the following descs keys is not in sectionsItem: [${descsError.join(',')}]`)
    errorFlag = true
  }
  if (errorFlag) {
    Notification.error({
      duration: 0,
      content: '配置文件无效，需要开发人员处理。请在控制台查看错误信息。'
    })
  }
}
