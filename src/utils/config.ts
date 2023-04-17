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
  return [['', '拥有'][p.book], ['未知', '厌恶', '路人', '一般', '喜欢', '最爱'][p.star]].filter(el => el)
    .join('，')
}

const data = {
  itemsGroup: [[
    ['断罪者', '战车', '闪击', '霜华', '灰烬', '九色鹿', '罗小黑', '麒麟X夜刀', '火龙S黑角', 'U-Official'],
    ['夜刀', '芬', '香草', '翎羽', '讯使', '清道夫', '红豆', '凛冬', '德克萨斯', '推进之王', '格拉尼', '桃金娘', '苇草', '风笛', '极境', '贾维', '豆苗', '嵯峨', '琴柳', '野鬃', '焰尾', '夜半', '晓歌', '伺夜', '谜图', '伊内丝'],
    ['Castle-3', '玫兰莎', '杜宾', '缠丸', '霜叶', '艾丝黛尔', '慕斯', '芙兰卡', '因陀罗', '拉普兰德', '幽灵鲨', '银灰', '暴行', '月见夜', '猎蜂', '斯卡蒂', '泡普卡', '诗怀雅', '陈', '星极', '赫拉格', '炎客', '布洛卡', '煌', '宴', '柏喙', '刻刀', '铸铁', '断崖', '棘刺', '燧石', '芳汀', '史尔特尔', '鞭刃', '杰克', '升变阿米娅', '山', '赤冬', '帕拉斯', '龙舌兰', '羽毛笔', '耀骑士临光', '艾丽妮', '百炼嘉维尔', '玛恩纳', '海沫', '达格达', '石英', '重岳', '铎铃', '仇白', '休谟斯', '摩根'],
    ['巡林者', '克洛丝', '安德切尔', '杰西卡', '流星', '白雪', '蓝毒', '白金', '陨星', '普罗旺斯', '守林人', '能天使', '空爆', '黑', '红云', '送葬人', '梅', '安比尔', '灰喉', '慑砂', 'W', '早露', '安哲拉', '酸糖', '四月', '奥斯塔', '迷迭香', '松果', '空弦', '熔泉', '假日威龙陈', '远牙', '正义骑士号', '寒芒克洛丝', '菲亚梅塔', '埃拉托', '承曦格雷伊', '鸿雪', '铅踝', '子月', '截云', '泰拉大陆调查团'],
    ['黑角', '卡缇', '米格鲁', '角峰', '蛇屠箱', '古米', '临光', '雷蛇', '可颂', '火神', '星熊', '塞雷娅', '斑点', '坚雷', '拜松', '吽', '年', '石棉', '森蚺', '泡泡', '瑕光', '泥岩', '暴雨', '灰毫', '极光', '暮落', '号角', '车尔尼', '斥罪', '火哨', '洋灰'],
    ['Lancet-2', '芙蓉', '安赛尔', '末药', '嘉维尔', '调香师', '白面鸮', '赫默', '华法琳', '闪灵', '夜莺', '苏苏洛', '锡兰', '微风', '清流', '亚叶', '絮雨', '图耶', '凯尔希', '桑葚', '蜜莓', '褐果', '流明', '濯尘芙蓉', '明椒', '焰影苇草'],
    ['梓兰', '深海色', '地灵', '梅尔', '初雪', '真理', '空', '安洁莉娜', '格劳克斯', '麦哲伦', '巫恋', '月禾', '波登可', '铃兰', '稀音', '浊心斯卡蒂', '罗比菈塔', '灵知', '令', '夏栎', '海蒂', '掠风', '但书', '白铁'],
    ['杜林', '12F', '炎熔', '史都华德', '夜烟', '远山', '阿米娅', '天火', '伊芙利特', '艾雅法拉', '夜魔', '格雷伊', '莫斯提马', '惊蛰', '刻俄柏', '苦艾', '莱恩哈特', '卡达', '蜜蜡', '特米米', '薄绿', '爱丽丝', '炎狱炎熔', '夕', '异客', '深靛', '卡涅利安', '布丁', '蚀清', '耶拉', '澄闪', '洛洛', '黑键', '星源', '至简', '雪绒', '和弦', '林'],
    ['砾', '暗索', '阿消', '红', '崖心', '狮蝎', '食铁兽', '伊桑', '槐琥', '雪雉', '阿', '傀影', 'THRM-EX', '温蒂', '孑', '罗宾', '卡夫卡', '乌有', '歌蕾蒂娅', '贝娜', '绮良', '水月', '老鲤', '见行者', '风丸', '归溟幽灵鲨', '多萝西', '缄默德克萨斯']
  ].flat()],
  sections: [
    {
      desc: '提醒：每一项都不是必填，不填也可代表拒绝回答。本站无后端，所有数据保存在本地。',
      backgroundColor: '#333',
      sortBehavior: 'top',
      shareBehavior: 'hidden'
    },
    {
      displayName: '联动/特别活动',
      items: ['断罪者', '战车', '闪击', '霜华', '灰烬', '九色鹿', '罗小黑', '麒麟X夜刀', '火龙S黑角', 'U-Official']
    },
    {
      displayName: '先锋',
      items: ['夜刀', '芬', '香草', '翎羽', '讯使', '清道夫', '红豆', '凛冬', '德克萨斯', '推进之王', '格拉尼', '桃金娘', '苇草', '风笛', '极境', '贾维', '豆苗', '嵯峨', '琴柳', '野鬃', '焰尾', '夜半', '晓歌', '伺夜', '谜图', '伊内丝']
    },
    {
      displayName: '近卫',
      items: ['Castle-3', '玫兰莎', '杜宾', '缠丸', '霜叶', '艾丝黛尔', '慕斯', '芙兰卡', '因陀罗', '拉普兰德', '幽灵鲨', '银灰', '暴行', '月见夜', '猎蜂', '斯卡蒂', '泡普卡', '诗怀雅', '陈', '星极', '赫拉格', '炎客', '布洛卡', '煌', '宴', '柏喙', '刻刀', '铸铁', '断崖', '棘刺', '燧石', '芳汀', '史尔特尔', '鞭刃', '杰克', '升变阿米娅', '山', '赤冬', '帕拉斯', '龙舌兰', '羽毛笔', '耀骑士临光', '艾丽妮', '百炼嘉维尔', '玛恩纳', '海沫', '达格达', '石英', '重岳', '铎铃', '仇白', '休谟斯', '摩根']
    },
    {
      displayName: '狙击',
      items: ['巡林者', '克洛丝', '安德切尔', '杰西卡', '流星', '白雪', '蓝毒', '白金', '陨星', '普罗旺斯', '守林人', '能天使', '空爆', '黑', '红云', '送葬人', '梅', '安比尔', '灰喉', '慑砂', 'W', '早露', '安哲拉', '酸糖', '四月', '奥斯塔', '迷迭香', '松果', '空弦', '熔泉', '假日威龙陈', '远牙', '正义骑士号', '寒芒克洛丝', '菲亚梅塔', '埃拉托', '承曦格雷伊', '鸿雪', '铅踝', '子月', '截云', '泰拉大陆调查团']
    },
    {
      displayName: '重装',
      items: ['黑角', '卡缇', '米格鲁', '角峰', '蛇屠箱', '古米', '临光', '雷蛇', '可颂', '火神', '星熊', '塞雷娅', '斑点', '坚雷', '拜松', '吽', '年', '石棉', '森蚺', '泡泡', '瑕光', '泥岩', '暴雨', '灰毫', '极光', '暮落', '号角', '车尔尼', '斥罪', '火哨', '洋灰']
    },
    {
      displayName: '医疗',
      items: ['Lancet-2', '芙蓉', '安赛尔', '末药', '嘉维尔', '调香师', '白面鸮', '赫默', '华法琳', '闪灵', '夜莺', '苏苏洛', '锡兰', '微风', '清流', '亚叶', '絮雨', '图耶', '凯尔希', '桑葚', '蜜莓', '褐果', '流明', '濯尘芙蓉', '明椒', '焰影苇草']
    },
    {
      displayName: '辅助',
      items: ['梓兰', '深海色', '地灵', '梅尔', '初雪', '真理', '空', '安洁莉娜', '格劳克斯', '麦哲伦', '巫恋', '月禾', '波登可', '铃兰', '稀音', '浊心斯卡蒂', '罗比菈塔', '灵知', '令', '夏栎', '海蒂', '掠风', '但书', '白铁']
    },
    {
      displayName: '术师',
      items: ['杜林', '12F', '炎熔', '史都华德', '夜烟', '远山', '阿米娅', '天火', '伊芙利特', '艾雅法拉', '夜魔', '格雷伊', '莫斯提马', '惊蛰', '刻俄柏', '苦艾', '莱恩哈特', '卡达', '蜜蜡', '特米米', '薄绿', '爱丽丝', '炎狱炎熔', '夕', '异客', '深靛', '卡涅利安', '布丁', '蚀清', '耶拉', '澄闪', '洛洛', '黑键', '星源', '至简', '雪绒', '和弦', '林']
    },
    {
      displayName: '特种',
      items: ['砾', '暗索', '阿消', '红', '崖心', '狮蝎', '食铁兽', '伊桑', '槐琥', '雪雉', '阿', '傀影', 'THRM-EX', '温蒂', '孑', '罗宾', '卡夫卡', '乌有', '歌蕾蒂娅', '贝娜', '绮良', '水月', '老鲤', '见行者', '风丸', '归溟幽灵鲨', '多萝西', '缄默德克萨斯']
    }
  ] as Config[string]['sections'],
  descs: {
    战车: 'TACHANKA',
    闪击: 'BLITZ',
    霜华: 'FROST',
    灰烬: 'ASH'
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
