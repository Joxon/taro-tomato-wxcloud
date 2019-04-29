import { ITask } from '../pages/schedule/index.d'
import { IListItem, IRecord } from '../pages/tomato/index.d'
import { TAge, TSex } from '../pages/dynamics/index.d'

export interface IUser {
  _id: string
  _openid: string

  // schedule
  tasks: ITask[]
  secondsToRest: number
  secondsToWork: number

  // tomato
  records: IRecord[]
  dailyItems: IListItem[]
  rewardItems: IListItem[]
  tomato: number

  // dynamics
  age: TAge
  sex: TSex
  classId: string
}
