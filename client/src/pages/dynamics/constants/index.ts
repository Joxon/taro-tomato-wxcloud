import { IPost, TAge, TSex, TSexName, IClassUser } from '../index.d'

export const DEFAULT_POSTS: IPost[] = [
  {
    userName: '加载中...',
    content: '加载中...',
    timestamp: 0
  }
]

export const SEXES: TSex[] = ['M', 'F']

export const SEXNAMES: TSexName[] = ['男', '女']

export const AGES: TAge[] = [
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15'
]

export const MINUTES_TO_REST: number[] = [3, 4, 5, 6]

export const MINUTES_TO_WORK: number[] = [15, 20, 25, 30]

export const DEFAULT_CLASSMATES: IClassUser[] = [
  {
    id: '',
    name: '加载中...'
  }
]
