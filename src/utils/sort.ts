import { config, Config } from './config'
import { flattenDeep, groupBy, isArray, isEqual, isString, omit, uniq } from 'lodash'
import { Notification } from '@douyinfe/semi-ui'
import { selectCase } from './lang'

export const rule: Record<string, Array<[RuleKeyword, 'asc' | 'desc']>> = {
  '按类别(默认顺序)': [['category', 'asc']],
  '按类别(倒序)': [['category', 'desc']],
  '按评分(从高到低)': [['rate', 'desc']],
  '按评分(从低到高)': [['rate', 'asc']],
  // '先按类别(默认顺序)，再按评分(从高到低)': [['category', 'asc'], ['rate', 'asc']],
  // '先按类别(默认顺序)，然后尝试过优先，再按评分(从高到低)': [['category', 'asc'], ['experienced', 'desc'], ['rate', 'asc']],
  尝试过优先: [['experienced', 'desc']],
  未尝试过优先: [['experienced', 'asc']]
}
type RuleKeyword = 'category' | 'rate' | 'experienced'
type SortSource = Array<Config[string]['sections'][number] | string>
type SortResult = SortSource | SortResult[]

const isPlainSource = (data: SortResult): data is SortSource => data.some(el => !isArray(el))

const sortByCategory = (input: SortResult, dir: 'asc' | 'desc') => {
  if (isPlainSource(input)) {
    return input.filter(el => !isString(el)).sort((alice, bob) => {
      return (config.v1.sections.findIndex(el => isEqual(el, alice)) - config.v1.sections.findIndex(el => isEqual(el, bob))) * { asc: 1, desc: -1 }[dir]
    }).map(el => {
      if (!isString(el) && 'items' in el) { return [el, ...el?.items] }
      return [el]
    })
  }
  Notification.error({ content: '不支持的排序方式' })
  throw new Error('不支持的排序方式')
}

const sortByRate = (input: SortResult, dir: 'asc' | 'desc', data: Map<string, { book: number, star: number }>): SortResult => {
  if (isPlainSource(input)) {
    const values = groupBy(uniq(input.filter(isString)), el => data.get(el)?.star ?? 0)
    return dir === 'asc' ? Object.values(omit(values, 0)).concat(values[0]) : Object.values(values).reverse()
  }
  return input.map(el => sortByRate(el, dir, data))
}

const sortByExperienced = (input: SortResult, dir: 'asc' | 'desc', data: Map<string, { book: number, star: number }>): SortResult => {
  if (isPlainSource(input)) {
    const res = Object.values(groupBy(uniq(input.filter(isString)), el => data.get(el)?.book ?? 0))
    return dir === 'asc' ? res : res.reverse()
  }
  return input.map(el => sortByRate(el, dir, data))
}

export const sort = (source: SortSource, rule: Array<[RuleKeyword, 'asc' | 'desc']>, data: Map<string, { book: number, star: number }>) => {
  let res: SortResult = source
  for (const [keyword, dir] of rule) {
    selectCase([keyword === 'category', () => { res = sortByCategory(res, dir) }],
      [keyword === 'rate', () => { res = sortByRate(res, dir, data) }],
      [keyword === 'experienced', () => { res = sortByExperienced(res, dir, data) }])
  }
  return flattenDeep(res)
}
