import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'

import TaskCard from '../TaskCard'
import { ITask, TWeekday, THour } from '../../index.d'
import { WEEKDAYS, TIME, RECENT_WEEKDAYS } from '../../constants'
import { parseHourToString } from '../../utils'

import './index.scss'

interface IProps {
  tasks: ITask[]
}

export default class WeekView extends Component<IProps, {}> {
  // 此处要加static，否则微信端报错
  static defaultProps: IProps = {
    tasks: []
  }

  readonly ROWS_HOUR: THour[] = TIME[0]

  readonly COLS_WDAY: TWeekday[] = WEEKDAYS.map(day => day.weekday)

  render () {
    const { tasks } = this.props
    return (
      <View className='week-view'>
        <View className='header'>
          <View className='header-left' />
          <View className='header-right'>
            {WEEKDAYS.map(wDay => (
              <View
                className={`header-right-column ${
                  wDay.weekday === RECENT_WEEKDAYS[0].weekday
                    ? 'header-today'
                    : 'header-not-today'
                }`}
                key={wDay.weekday}
              >
                <View>{wDay.weekdayName}</View>
                <View>
                  {
                    RECENT_WEEKDAYS.filter(
                      rDay => rDay.weekday === wDay.weekday
                    )[0].date
                  }
                </View>
              </View>
            ))}
          </View>
        </View>

        <View className='content'>
          {this.ROWS_HOUR.map(hour => (
            <View className='content-row' key={hour}>
              <View className='time-cell'>{`${parseHourToString(
                hour
              )} 点`}</View>

              <View className='tasks-row'>
                {this.COLS_WDAY.map(wday => (
                  <View className='task-cell' key={wday + hour}>
                    {tasks.map(task =>
                      task.weekday === wday && task.startHour === hour ? (
                        <View
                          className='task-card'
                          key={task.id}
                        >
                          <TaskCard task={task} showStartTime={false} />
                        </View>
                      ) : (
                        ''
                      )
                    )}
                  </View>
                ))}
              </View>
            </View>
          ))}
        </View>
      </View>
    )
  }
}
