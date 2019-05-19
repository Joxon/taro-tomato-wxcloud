import Taro, { Component, Config } from '@tarojs/taro'
import { View, Picker, Label } from '@tarojs/components'
import { PickerSelectorProps } from '@tarojs/components/types/Picker'
import { BaseEventOrig } from '@tarojs/components/types/common'
import { AtButton, AtForm, AtInput } from 'taro-ui'
// import { observer, inject } from '@tarojs/mobx'

import { TSex, TAge } from './index.d'
import {
  AGES,
  SEXNAMES,
  MINUTES_TO_REST,
  MINUTES_TO_WORK,
  SEXES
} from './constants'
import { getUserFields } from '../../utils'

interface IProps {
  store: any
}

interface IState {
  name: string
  sexIndex: number
  age: TAge
  minutesToRest: number
  minutesToWork: number
}

interface ISettings {
  name: string
  sex: TSex
  age: TAge
  secondsToRest: number
  secondsToWork: number
}

// @inject('store')
// @observer
export default class Settings extends Component<IProps, IState> {
  config: Config = {
    navigationBarTitleText: '我的设定'
  }

  static defaultState: IState = {
    name: '加载中...',
    sexIndex: 0,
    age: '3',
    minutesToRest: 5,
    minutesToWork: 25
  }

  state: IState = Settings.defaultState

  getSettings () {
    Taro.showLoading({
      title: '加载用户信息...',
      mask: true
    })
    getUserFields({
      name: true,
      sex: true,
      age: true,
      secondsToRest: true,
      secondsToWork: true
    })
      .then((fields: ISettings) => {
        Taro.hideLoading()
        this.setState({
          name: fields.name,
          sexIndex: fields.sex === 'M' ? 0 : 1,
          age: fields.age,
          minutesToRest: fields.secondsToRest / 60,
          minutesToWork: fields.secondsToWork / 60
        })
      })
      .catch(err => {
        Taro.hideLoading()
        Taro.showToast({
          title: `加载失败，发生错误${err}`,
          icon: 'none'
        })
        console.error(err)
      })
    // 小程序不支持finally
    // .finally(() => Taro.hideLoading())
  }

  componentDidMount () {
    this.getSettings()
  }

  editSettings () {
    const handleError = (error: any) => {
      Taro.hideLoading()
      Taro.showToast({ title: `保存设定失败：${error}`, icon: 'none' })
      console.error(error)
      return false
    }

    // 防止用户重复点击
    Taro.showLoading({
      title: '处理中...',
      mask: true
    })

    // 准备数据
    const { name, age, minutesToRest, minutesToWork, sexIndex } = this.state
    const sex: TSex = SEXES[sexIndex]
    const settings: ISettings = {
      name,
      sex,
      age,
      secondsToRest: minutesToRest * 60,
      secondsToWork: minutesToWork * 60
    }

    // 提交数据
    return (
      (Taro.cloud.callFunction({
        name: `editSettings`,
        data: { settings }
      }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
        // 收到响应
        .then(res => {
          const result = res.result as any
          if (result === null || result.stats === undefined) {
            handleError(res)
          }
          // 1代表有变化，0代表设置与上次相同
          if (result.stats.updated === 1 || result.stats.updated === 0) {
            // 响应格式正确
            Taro.showToast({
              title: `保存设定成功`,
              icon: 'success',
              duration: 1000
            })
            return true
          } else {
            handleError(res)
          }
        })
        // 请求出错
        .catch(handleError)
    )
  }

  // @param event: CommonEvent
  onSubmit () {
    const { name } = this.state
    if (name === '') {
      Taro.showToast({
        title: '用户名不能为空',
        icon: 'none'
      })
      return
    }

    this.editSettings().then(succeeded => {
      if (succeeded) {
        setTimeout(() => {
          Taro.navigateBack()
        }, 1000)
      }
    })
  }

  handleNameInput (name: string) {
    this.setState({ name })
  }

  handleSexPicker (event: BaseEventOrig<PickerSelectorProps>) {
    const val: number = event.detail.value
    this.setState({
      sexIndex: val
    })
  }

  handleAgePicker (event: BaseEventOrig<PickerSelectorProps>) {
    const val: number = event.detail.value
    this.setState({ age: val.toString() as TAge })
  }

  handleMinutesToRestPicker (event: BaseEventOrig<PickerSelectorProps>) {
    const val: number = event.detail.value
    const minutesToRest = MINUTES_TO_REST[val]
    this.setState({ minutesToRest })
  }

  handleMinutesToWorkPicker (event: BaseEventOrig<PickerSelectorProps>) {
    const val: number = event.detail.value
    const minutesToWork = MINUTES_TO_WORK[val]
    this.setState({ minutesToWork })
  }

  render () {
    const { ...user } = this.state

    const userNameInput = (
      <AtInput
        name='userName'
        title='昵称'
        type='text'
        placeholder='给自己起个名字吧~'
        value={user.name}
        onChange={this.handleNameInput}
      />
    )

    const sexPicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>性别</Label>
          <Picker
            className='at-input__input'
            mode='selector'
            range={SEXNAMES}
            value={user.sexIndex}
            onChange={this.handleSexPicker}
          >
            {SEXNAMES[user.sexIndex]}
          </Picker>
        </View>
      </View>
    )

    const agePicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>年龄</Label>
          <Picker
            className='at-input__input'
            mode='selector'
            range={AGES}
            value={parseInt(user.age)}
            onChange={this.handleAgePicker}
          >
            {user.age}岁
          </Picker>
        </View>
      </View>
    )

    const minutesToRestPicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>休息时长</Label>
          <Picker
            className='at-input__input'
            mode='selector'
            range={MINUTES_TO_REST}
            value={MINUTES_TO_REST.indexOf(user.minutesToRest)}
            onChange={this.handleMinutesToRestPicker}
          >
            {user.minutesToRest}分钟
          </Picker>
        </View>
      </View>
    )

    const minutesToWorkPicker = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>工作时长</Label>
          <Picker
            className='at-input__input'
            mode='selector'
            range={MINUTES_TO_WORK}
            value={MINUTES_TO_WORK.indexOf(user.minutesToWork)}
            onChange={this.handleMinutesToWorkPicker}
          >
            {user.minutesToWork}分钟
          </Picker>
        </View>
      </View>
    )

    const buttons = (
      <View>
        <AtButton type='primary' formType='submit'>
          保存修改
        </AtButton>
      </View>
    )

    return (
      <AtForm className='form' onSubmit={this.onSubmit}>
        {userNameInput}
        {sexPicker}
        {agePicker}
        {minutesToWorkPicker}
        {minutesToRestPicker}
        {buttons}
      </AtForm>
    )
  }
}
