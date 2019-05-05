import { IRecord, IListItem } from '../index.d'

export const DEFAULT_RECORDS: IRecord[] = [
  {
    tomato: 10,
    reason: '加载中...',
    timestamp: 0
  }
]

export const DEFAULT_REWARD_ITEMS: IListItem[] = [
  {
    id: '0',
    name: '加载中...',
    tomato: -10
  }
]

export const DEFAULT_DAILY_ITEMS: IListItem[] = [
  {
    id: '0',
    name: '加载中...',
    tomato: 10
  }
]

export const DEFAULT_ITEM: IListItem = {
  id: '0',
  name: '加载中...',
  tomato: 10
}
