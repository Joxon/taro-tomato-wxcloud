import { IRecord, IListItem } from '../index.d'

export const DEFAULT_RECORDS: IRecord[] = [
  {
    type: 'harvest',
    tomato: 10,
    reason: '加载中...',
    timestamp: 0
  },
  {
    type: 'redeem',
    tomato: 10,
    reason: '加载中...',
    timestamp: 1
  },
  {
    type: 'punish',
    tomato: 10,
    reason: '加载中...',
    timestamp: 2
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
