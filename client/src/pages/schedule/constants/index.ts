import { ITask, IDay, THour, TMinute } from '../index.d'

export const DEFAULT_TASKS: ITask[] = [
  {
    id: '1',
    name: '写作业',
    weekday: 'Sat',
    startHour: '08',
    endHour: '10',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '2',
    name: '读书',
    weekday: 'Sat',
    startHour: '11',
    endHour: '11',
    startMinute: '00',
    endMinute: '30',
    tomatoBonus: 10
  },
  {
    id: '3',
    name: '篮球班',
    weekday: 'Sat',
    startHour: '15',
    endHour: '17',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '4',
    name: '篮球班',
    weekday: 'Sun',
    startHour: '15',
    endHour: '17',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '5',
    name: '读书',
    weekday: 'Mon',
    startHour: '20',
    endHour: '21',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '6',
    name: '读书',
    weekday: 'Tue',
    startHour: '20',
    endHour: '21',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '7',
    name: '读书',
    weekday: 'Wed',
    startHour: '20',
    endHour: '21',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '8',
    name: '读书',
    weekday: 'Thu',
    startHour: '20',
    endHour: '21',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '9',
    name: '读书',
    weekday: 'Fri',
    startHour: '20',
    endHour: '21',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  },
  {
    id: '10',
    name: '测试',
    weekday: 'Fri',
    startHour: '00',
    endHour: '23',
    startMinute: '00',
    endMinute: '00',
    tomatoBonus: 10
  }
]

export const DEFAULT_TASK: ITask = {
  id: '',
  name: '',
  weekday: 'Mon',
  startHour: '08',
  startMinute: '00',
  endHour: '09',
  endMinute: '00',
  tomatoBonus: 10
}

export const WEEKDAYS: IDay[] = [
  {
    weekdayName: '周一',
    weekday: 'Mon'
  },
  {
    weekdayName: '周二',
    weekday: 'Tue'
  },
  {
    weekdayName: '周三',
    weekday: 'Wed'
  },
  {
    weekdayName: '周四',
    weekday: 'Thu'
  },
  {
    weekdayName: '周五',
    weekday: 'Fri'
  },
  {
    weekdayName: '周六',
    weekday: 'Sat'
  },
  {
    weekdayName: '周日',
    weekday: 'Sun'
  }
]

export const TIME: [THour[], TMinute[]] = [
  [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23'
  ],
  [
    '00',
    '01',
    '02',
    '03',
    '04',
    '05',
    '06',
    '07',
    '08',
    '09',
    '10',
    '11',
    '12',
    '13',
    '14',
    '15',
    '16',
    '17',
    '18',
    '19',
    '20',
    '21',
    '22',
    '23',
    '24',
    '25',
    '26',
    '27',
    '28',
    '29',
    '30',
    '31',
    '32',
    '33',
    '34',
    '35',
    '36',
    '37',
    '38',
    '39',
    '40',
    '41',
    '42',
    '43',
    '44',
    '45',
    '46',
    '47',
    '48',
    '49',
    '50',
    '51',
    '52',
    '53',
    '54',
    '55',
    '56',
    '57',
    '58',
    '59'
  ]
]

// 获取未来一周，包括今天
const getRecentWeekdays: () => IDay[] = () => {
  const weekdays: IDay[] = []

  const d = new Date()

  // !!getDay返回0-6
  // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getDay#Return_value
  // An integer number, between 0 and 6,
  // corresponding to the day of the week for the given date,
  // according to local time:
  // 0 for Sunday, 1 for Monday, 2 for Tuesday, and so on.

  const todaysIndexTemp = d.getDay() - 1
  const todaysIndex = todaysIndexTemp === -1 ? 6 : todaysIndexTemp
  const weekLength = 7

  for (let i = 0; i < weekLength; ++i) {
    const day = WEEKDAYS[(i + todaysIndex) % weekLength]

    const daysMonth = d.getMonth() + 1 // getMonth返回0-11
    const daysDay = d.getDate() // getDate返回1-31

    day.date = `${daysMonth}-${daysDay}`
    weekdays.push(day)

    d.setDate(d.getDate() + 1)
  }

  return weekdays
}

export const RECENT_WEEKDAYS: IDay[] = getRecentWeekdays()
