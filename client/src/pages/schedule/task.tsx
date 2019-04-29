import Taro, { Component, Config } from '@tarojs/taro'
import { View, Picker, Label } from '@tarojs/components'
import {
  PickerTimeProps,
  PickerSelectorProps
} from '@tarojs/components/types/Picker'
import { BaseEventOrig } from '@tarojs/components/types/common'
import { AtButton, AtForm, AtInput, AtInputNumber } from 'taro-ui'

import { THour, TMinute, ITask } from './index.d'
import { DEFAULT_TASK, WEEKDAYS } from './constants'
import { parseTimeToNumber } from './utils'

type TPageMode = 'add' | 'edit'

interface IState {
  mode: TPageMode // task
  name: string // ITask
  weekdayName: string // task
  weekdayIndex: number // task
  startTime: string // hh:mm, task
  endTime: string // hh:mm, task
  tomatoBonus: number // ITask
  submitButtonClicked: boolean // task
}

export default class TaskPage extends Component<{}, IState> {
  config: Config = {
    navigationBarTitleText: '任务详情'
  }

  static defaultState: IState = {
    mode: 'add',
    name: DEFAULT_TASK.name,
    weekdayName: '周一',
    weekdayIndex: 0,
    startTime: `${DEFAULT_TASK.startHour}:${DEFAULT_TASK.startMinute}`,
    endTime: `${DEFAULT_TASK.endHour}:${DEFAULT_TASK.endMinute}`,
    tomatoBonus: DEFAULT_TASK.tomatoBonus,
    submitButtonClicked: false
  }

  state: IState = TaskPage.defaultState

  task: ITask = DEFAULT_TASK

  componentWillMount () {
    // console.log('params: ')
    // console.log(this.$router.params)
    // console.log('preload: ')
    // console.log(this.$router.preload)

    const preload = this.$router.preload
    if (preload.mode === 'edit') {
      const weekdayIndex = WEEKDAYS.map(day => day.weekday).indexOf(
        preload.weekday
      )
      const weekdayName = WEEKDAYS[weekdayIndex].weekdayName
      const startTime = `${preload.startHour}:${preload.startMinute}`
      const endTime = `${preload.endHour}:${preload.endMinute}`

      this.setState({
        ...preload,
        weekdayIndex,
        weekdayName,
        startTime,
        endTime
      })
    }
  }

  addTask () {
    ;(Taro.cloud.callFunction({
      name: 'addTask',
      data: { task: this.task }
    }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
      .then(response => {
        this.setState({ submitButtonClicked: false })
        if ((response.result as any).stats.updated === 1) {
          Taro.showToast({
            title: `添加成功`,
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        } else {
          Taro.showToast({ title: `添加失败，请重试`, icon: 'none' })
          console.error(response)
        }
      })
      .catch(err => console.error(err))
  }

  editTask () {}

  deleteTask () {}

  // @param event: CommonEvent
  onSubmit () {
    const { mode, ...task } = this.state
    if (task.name === '') {
      Taro.showToast({ title: '任务名不能为空', icon: 'none' })
      return
    }

    this.setState({ submitButtonClicked: true })
    if (mode === 'add') {
      this.addTask()
    } else if (mode === 'edit') {
      this.editTask()
    }
  }

  // @param event: CommonEvent
  onReset () {
    this.task = DEFAULT_TASK
    this.setState(TaskPage.defaultState)
  }

  handleNameInput (name: string) {
    this.task.name = name
    this.setState({ name })
  }

  handleWeekdayPicker (event: BaseEventOrig<PickerSelectorProps>) {
    const val: number = event.detail.value

    this.task.weekday = WEEKDAYS[val].weekday
    this.setState({
      weekdayIndex: val,
      weekdayName: WEEKDAYS[val].weekdayName
    })
  }

  handleStartTimePicker (event: BaseEventOrig<PickerTimeProps>) {
    const startTime: string = event.detail.value
    const startTimeNum = parseTimeToNumber(startTime)

    if (startTimeNum >= 2300 || startTimeNum < 500) {
      Taro.showToast({
        title: '该休息了，重选个时间吧~',
        icon: 'none',
        duration: 2000
      })
      return
    }

    const startTimeParts = startTime.split(':')
    const startHour: THour = startTimeParts[0] as THour
    const startMinute: TMinute = startTimeParts[1] as TMinute
    const endMinute: TMinute = ((parseInt(startMinute, 10) + 30) % 60)
      .toString()
      .padStart(2, '0') as TMinute
    const endHour: THour =
      parseInt(endMinute) < parseInt(startMinute)
        ? ((parseInt(startHour) + 1).toString().padStart(2, '0') as THour)
        : startHour
    const endTime = `${endHour}:${endMinute}`

    this.task.startHour = startHour
    this.task.startMinute = startMinute
    this.task.endHour = endHour
    this.task.endMinute = endMinute
    this.setState({
      startTime,
      endTime
    })
  }

  handleEndTimePicker (event: BaseEventOrig<PickerTimeProps>) {
    const endTime = event.detail.value
    const startTimeNum = parseTimeToNumber(this.state.startTime)
    const endTimeNum = parseTimeToNumber(endTime)

    if (endTimeNum < startTimeNum) {
      Taro.showToast({
        title: '结束时间不能早于开始时间哦~',
        icon: 'none',
        duration: 2000
      })
    } else if (endTimeNum >= 2300 || endTimeNum < 500) {
      Taro.showToast({
        title: '该休息了，重选个时间吧~',
        icon: 'none',
        duration: 2000
      })
    } else {
      const endTimeParts = endTime.split(':')
      const endHour = endTimeParts[0] as THour
      const endMinute = endTimeParts[1] as TMinute

      this.task.endHour = endHour
      this.task.endMinute = endMinute
      this.setState({ endTime })
    }
  }

  handleTomatoInputNumber (tomatoBonus: number) {
    this.task.tomatoBonus = tomatoBonus
    this.setState({ tomatoBonus })
  }

  render () {
    const { mode, submitButtonClicked, ...task } = this.state

    const taskNameInput = (
      <AtInput
        name='taskName'
        title='任务名称'
        type='text'
        placeholder='给任务起个名字吧~'
        value={task.name}
        onChange={this.handleNameInput}
      />
    )

    const taskWeekdayPicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>任务周次</Label>
          <Picker
            className='at-input__input'
            mode='selector'
            range={WEEKDAYS.map(day => day.weekdayName)}
            value={task.weekdayIndex}
            onChange={this.handleWeekdayPicker}
          >
            {task.weekdayName}
          </Picker>
        </View>
      </View>
    )

    const taskStartTimePicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>开始时间</Label>
          <Picker
            className='at-input__input'
            mode='time'
            value={task.startTime}
            onChange={this.handleStartTimePicker}
          >
            {task.startTime}
          </Picker>
        </View>
      </View>
    )

    const taskEndTimePicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>结束时间</Label>
          <Picker
            className='at-input__input'
            mode='time'
            value={task.endTime}
            onChange={this.handleEndTimePicker}
          >
            {task.endTime}
          </Picker>
        </View>
      </View>
    )

    const taskTomatoInputNumber = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>番茄奖励</Label>
          <AtInputNumber
            className='at-input__input'
            type='digit'
            min={10}
            max={100}
            step={10}
            value={task.tomatoBonus}
            onChange={this.handleTomatoInputNumber}
          />
        </View>
      </View>
    )

    const buttons =
      mode === 'add' ? (
        <View>
          <AtButton
            type='primary'
            formType='submit'
            loading={submitButtonClicked}
          >
            添加任务
          </AtButton>
          <AtButton type='secondary' formType='reset'>
            重新填写
          </AtButton>
        </View>
      ) : (
        <View>
          <AtButton
            type='primary'
            formType='submit'
            loading={submitButtonClicked}
          >
            保存任务
          </AtButton>
          <AtButton type='secondary'>删除任务</AtButton>
        </View>
      )

    return (
      <AtForm
        className='form'
        onSubmit={this.onSubmit.bind(this)}
        onReset={this.onReset.bind(this)}
      >
        {taskNameInput}
        {taskWeekdayPicker}
        {taskStartTimePicker}
        {taskEndTimePicker}
        {taskTomatoInputNumber}
        {buttons}
      </AtForm>
    )
  }
}
