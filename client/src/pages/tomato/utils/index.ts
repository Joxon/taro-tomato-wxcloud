import { IRecord } from '../index.d'

export function toTitleString (record: IRecord): string {
  let title = ''
  const tomato = Math.abs(record.tomato)
  switch (record.type) {
    case 'harvest':
      title = `收获 + ${tomato} 番茄`
      break
    case 'punish':
      title = `惩罚 - ${tomato} 番茄`
      break
    case 'redeem':
      title = `兑换 - ${tomato} 番茄`
      break
    default:
      break
  }
  return title
}
