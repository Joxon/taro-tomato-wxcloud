import Taro, { Component } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtTabs, AtTabsPane } from 'taro-ui'
import { FontAwesome } from 'taro-icons'

// import {
//   MaterialIcons,
//   MaterialCommunityIcons,
//   Ionicons,
//   FontAwesome,
// } from 'taro-icons'

import { TWeekday, ITask, ITab } from './index.d'
import TaskView from './components/TaskView'
import WeekView from './components/WeekView'
import { RECENT_WEEKDAYS } from './constants'
import { getUserFields } from '../../utils'

import './index.scss'

enum EViewMode {
  'TASK_VIEW' = 0,
  'WEEK_VIEW' = 1
}

interface IState {
  today: TWeekday
  viewMode: EViewMode
  tasks: ITask[]
}

const TABLIST: ITab[] = [{ title: '日程视图' }, { title: '一周视图' }]

export default class Schedule extends Component<{}, IState> {
  config: Taro.Config = {
    enablePullDownRefresh: true
  }

  static defaultState: IState = {
    today: RECENT_WEEKDAYS[0].weekday,
    viewMode: EViewMode.TASK_VIEW,
    tasks: []
  }

  state: IState = Schedule.defaultState

  getTasks () {
    getUserFields({ tasks: true }).then(fields => {
      const tasks = (fields as any).tasks as ITask[]
      this.setState({ tasks })
    })
  }

  onPullDownRefresh () {
    this.getTasks()
  }

  componentDidMount () {
    this.getTasks()
  }

  // 添加任务后返回本页面，自动刷新
  componentDidShow () {
    this.getTasks()
  }

  handleViewSwitching (index: number) {
    this.setState({
      viewMode: index as EViewMode
    })
  }

  navigateToTaskAdd () {
    this.$preload({ mode: 'add' })
    Taro.navigateTo({ url: 'task' })
  }

  render () {
    const { viewMode, tasks } = this.state

    return (
      <View className='schedule-wrapper'>
        <AtTabs
          current={viewMode}
          tabList={TABLIST}
          onClick={this.handleViewSwitching}
        >
          <AtTabsPane current={viewMode} index={EViewMode.TASK_VIEW}>
            <TaskView tasks={tasks} />
          </AtTabsPane>
          <AtTabsPane current={viewMode} index={EViewMode.WEEK_VIEW}>
            <WeekView tasks={tasks} />
          </AtTabsPane>
        </AtTabs>

        <View className='add-button' onClick={this.navigateToTaskAdd}>
          <FontAwesome
            family='solid'
            name='plus-circle'
            size={40}
            color='#ff0000'
          />
        </View>
      </View>
    )
  }
  // <MaterialIcons name='add-circle' size={50} color='#ff0000' />
  // <MaterialIcons name='settings' size={24} color='#000000' />
  // <MaterialCommunityIcons name='account' size={32} color='#000000' />
  // <Ionicons name='ios-woman' size={32} color='pink' />
  // <FontAwesome family='brands' name='weixin' size={32} />
}
