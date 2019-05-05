export type TRecord = 'harvest' | 'redeem' | 'punish'

export interface IRecord {
  type?: TRecord
  tomato: number
  reason: string
  timestamp: number
}

export interface IListItem {
  id: string
  name: string
  tomato: number
}
