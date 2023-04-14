import {
  Config,
  CustomZoneEntry,
  DescEntry,
  isCustomZoneEntry,
  isDescEntry, isGroupEntry, isPlainItem,
  PlainItem
} from './config'
import { groupBy } from 'lodash'
import { selectCase } from './lang'

// TODO: secondary sort rule
export const rule: Record<string, [[RuleKeyword, 'asc' | 'desc']]> = {
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
type SortResult = Array<PlainItem | DescEntry | CustomZoneEntry>

const sortAsIs = (input: SortResult, dir: 'asc' | 'desc'): SortResult => {
  const getGroupName = (el: PlainItem | DescEntry | CustomZoneEntry) => {
    if (isCustomZoneEntry(el) || isDescEntry(el)) return el.sortBehavior
    return el.group
  }
  // TODO: groupBy order is not guaranteed
  const groupResult = groupBy(input, getGroupName)
  for (const [key, value] of Object.entries(groupResult)) {
    if (value.every(isPlainItem)) groupResult[key].unshift({ backgroundColor: '#1d4ed8', desc: value[0].group, sortBehavior: 'hidden' })
  }
  let sortResult = Object.entries(groupResult).filter(el => el[0] !== 'hidden')
  if (dir === 'desc') sortResult = sortResult.reverse()
  return sortResult.map(el => el[1]).flat(1).sort((alice, bob) => {
    if ('sortBehavior' in alice && alice.sortBehavior === 'top') return -1
    if ('sortBehavior' in bob && bob.sortBehavior === 'top') return 1
    return 0
  })
}

const sortByRate = (input: SortResult, dir: 'asc' | 'desc', data: Map<string, { book: number, star: number }>): SortResult => {
  const getPriority = (el: PlainItem | DescEntry | CustomZoneEntry) => {
    if (isCustomZoneEntry(el) || isDescEntry(el)) return -1
    return data.get(el.label)?.star ?? 0
  }
  return input.filter(el => !('sortBehavior' in el) || el.sortBehavior !== 'hidden').sort((alice, bob) => {
    if ('sortBehavior' in alice && alice.sortBehavior === 'top') return -1
    if ('sortBehavior' in bob && bob.sortBehavior === 'top') return 1
    return (getPriority(alice) - getPriority(bob)) * { asc: 1, desc: -1 }[dir]
  })
}

const sortByExperienced = (input: SortResult, dir: 'asc' | 'desc', data: Map<string, { book: number, star: number }>): SortResult => {
  const getPriority = (el: PlainItem | DescEntry | CustomZoneEntry) => {
    if (isCustomZoneEntry(el) || isDescEntry(el)) return -1
    return data.get(el.label)?.book ?? 0
  }
  return input.filter(el => !('sortBehavior' in el) || el.sortBehavior !== 'hidden')
    .sort((alice, bob) => {
      if ('sortBehavior' in alice && alice.sortBehavior === 'top') return -1
      if ('sortBehavior' in bob && bob.sortBehavior === 'top') return 1
      return (getPriority(alice) - getPriority(bob)) * { asc: 1, desc: -1 }[dir]
    })
}

// TODO: secondary sort rule
export const sort = (source: Config[string]['sections'], rule: [[RuleKeyword, 'asc' | 'desc']], data: Map<string, { book: number, star: number }>): Array<PlainItem | DescEntry | CustomZoneEntry> => {
  let res: SortResult = []
  for (const el of source) {
    if (isGroupEntry(el)) {
      res = res.concat(el.items.map<PlainItem>(item => ({ label: item, group: el.displayName })))
    } else {
      res.push(el)
    }
  }
  for (const [keyword, dir] of rule) {
    selectCase([keyword === 'category', () => { res = sortAsIs(res, dir) }],
      [keyword === 'rate', () => { res = sortByRate(res, dir, data) }],
      [keyword === 'experienced', () => { res = sortByExperienced(res, dir, data) }])
  }
  return res
}
