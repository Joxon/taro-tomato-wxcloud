import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import {
  AtGrid,
  AtAvatar,
  AtModal,
  AtModalHeader,
  AtModalContent,
  AtTabs,
  AtTabsPane,
  AtInput,
  AtButton
} from 'taro-ui'
import { FontAwesome } from 'taro-icons'

import { ITab, IClassUser } from './index.d'
import { DEFAULT_CLASSMATES } from './constants'

import TOMATO_PNG from './images/tomato.png'
import { getUserFields } from '../../utils'

import './class.scss'

enum EJoinMode {
  'JOIN' = 0,
  'CREATE' = 1
}

interface IState {
  userHasJoinedClass: boolean
  userIsOwner: boolean

  joinMode: EJoinMode
  classIdToJoin: string
  classNameToCreate: string

  classId: string
  className: string
  classmates: IClassUser[]
}

const TABLIST: ITab[] = [{ title: '已有班级号？' }, { title: '未创建班级？' }]

export default class Class extends Component<{}, IState> {
  config: Taro.Config = {
    enablePullDownRefresh: true
  }

  static defaultState: IState = {
    userHasJoinedClass: true,
    userIsOwner: false,
    joinMode: EJoinMode.JOIN,
    classIdToJoin: '',
    classNameToCreate: '',
    classId: '加载中...',
    className: '加载中...',
    classmates: DEFAULT_CLASSMATES
  }

  state: IState = Class.defaultState

  handleTabSwitching (index: number) {
    this.setState({
      joinMode: index as EJoinMode
    })
  }

  handleClassIdInput (classIdToJoin: string) {
    this.setState({ classIdToJoin })
  }

  handleClassNameInput (classNameToCreate: string) {
    this.setState({ classNameToCreate })
  }

  getClass () {
    Taro.showLoading({
      title: '获取班级信息...',
      mask: true
    })
    getUserFields({ classId: true })
      .then(fields => {
        const classId = (fields as any).classId as string
        if (classId === '' || classId === null || classId === undefined) {
          this.setState({ userHasJoinedClass: false })
          throw Error(
            'getClass: classId is invalid. Maybe user has not joined a class.'
          )
        } else {
          return classId
        }
      })
      .then(classId => {
        const aClass = {
          id: classId
        }
        return Taro.cloud.callFunction({
          name: 'getClass',
          data: { class: aClass }
        }) as Promise<Taro.cloud.ICloud.CallFunctionResult>
      })
      .then(res => {
        Taro.hideLoading()
        const result = res.result as any
        const len = result.data.length
        if (len === 0) {
          this.setState({ userHasJoinedClass: false })
        } else if (len === 1) {
          const aClass = result.data[0] as any
          this.setState({
            userHasJoinedClass: true,
            userIsOwner: aClass.thisUserIsOwner,
            classId: aClass._id,
            className: aClass.name,
            classmates: aClass.classmates
          })
        } else {
          throw Error('getClass: invalid result.data.length = ' + len)
        }
      })
      .catch(err => {
        Taro.hideLoading()
        console.error(err)
      })
  }

  onPullDownRefresh () {
    this.getClass()
  }

  componentDidMount () {
    this.getClass()
  }

  componentDidShow () {
    this.getClass()
  }

  callClassFunction (
    verb: 'add' | 'edit' | 'delete' | 'join' | 'leave',
    verbName: string
  ) {
    const handleError = (error: any) => {
      Taro.hideLoading()
      Taro.showToast({ title: `${verbName}失败：${error}`, icon: 'none' })
      console.error(error)
      return false
    }

    // 防止用户重复点击
    Taro.showLoading({
      title: '处理中...',
      mask: true
    })

    // 准备数据
    let aClass: any = {}
    if (verb === 'add') {
      aClass.name = this.state.classNameToCreate
    } else if (verb === 'join') {
      aClass.id = this.state.classIdToJoin
    } else {
      aClass.id = this.state.classId
    }

    // 提交数据
    return (
      (Taro.cloud.callFunction({
        name: `${verb}Class`,
        data: {
          class: aClass
        }
      }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
        // 收到响应
        .then(res => {
          const result = res.result as any
          if (result === null || result.stats === undefined) {
            handleError(res)
          }

          if (
            (verb === 'add' && result.stats.updated === 1) ||
            (verb === 'join' && result.stats.updated === 1) ||
            (verb === 'leave' && result.stats.updated === 1) ||
            (verb === 'delete' && result.stats.removed === 1)
          ) {
            // 响应格式正确
            Taro.showToast({
              title: `${verbName}成功`,
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

  addClass () {
    const { classNameToCreate } = this.state
    if (classNameToCreate === '') {
      Taro.showToast({
        title: '班级名不能为空',
        icon: 'none'
      })
      return
    }
    this.callClassFunction('add', '创建').then(succeeded => {
      if (succeeded) {
        this.getClass()
      }
    })
  }

  joinClass () {
    // sample: 96c1cbbe5ccec2d30c8018613e361140
    const { classIdToJoin } = this.state
    const isUUID = /^[0-9a-z]{32}$/
    if (!isUUID.test(classIdToJoin)) {
      Taro.showToast({
        title: '班级号不合法',
        icon: 'none'
      })
      return
    }
    this.callClassFunction('join', '加入').then(succeeded => {
      if (succeeded) {
        this.getClass()
      }
    })
  }

  leaveClass () {
    Taro.showModal({
      title: '离开',
      content: '确认离开班级？',
      success: res => {
        if (res.confirm) {
          this.callClassFunction('leave', '离开').then(succeeded => {
            if (succeeded) {
              setTimeout(() => {
                Taro.navigateBack()
              }, 1000)
            }
          })
        }
      }
    })
  }

  deleteClass () {
    Taro.showModal({
      title: '删除',
      content: '确认删除班级？所有同学都会被强制离开。',
      success: res => {
        if (res.confirm) {
          this.callClassFunction('delete', '删除').then(succeeded => {
            if (succeeded) {
              setTimeout(() => {
                Taro.navigateBack()
              }, 1000)
            }
          })
        }
      }
    })
  }

  shareClass () {
    console.log(this.state.classId)
  }

  render () {
    const { joinMode, ...user } = this.state
    return (
      <View className='class-wrapper'>
        <AtModal
          className='join-class'
          isOpened={!user.userHasJoinedClass}
          closeOnClickOverlay={false}
        >
          <AtModalHeader>加入班级</AtModalHeader>
          <AtModalContent>
            <AtTabs
              current={joinMode}
              tabList={TABLIST}
              onClick={this.handleTabSwitching}
            >
              <AtTabsPane current={joinMode} index={EJoinMode.JOIN}>
                <AtInput
                  name='classId'
                  placeholder='要加入的班级号码'
                  onChange={this.handleClassIdInput}
                  value={user.classIdToJoin}
                />
                <AtButton onClick={this.joinClass}>立即加入</AtButton>
              </AtTabsPane>
              <AtTabsPane current={joinMode} index={EJoinMode.CREATE}>
                <AtInput
                  name='className'
                  placeholder='要创建的班级名字'
                  onChange={this.handleClassNameInput}
                  value={user.classNameToCreate}
                />
                <AtButton onClick={this.addClass}>立即创建</AtButton>
              </AtTabsPane>
            </AtTabs>
          </AtModalContent>
        </AtModal>

        <View hidden={!user.userHasJoinedClass}>
          <View className='top-view container'>
            <View className='share-button-view' onClick={this.shareClass}>
              <FontAwesome
                family='solid'
                name='share-alt'
                size={20}
                color='#333'
              />
            </View>
            <View className='avatar-view'>
              <AtAvatar text='班级' />
            </View>
            <View className='text-view'>
              <Text className='text-normal'>{user.className}\n</Text>
              <Text className='text-small'>班级号：{user.classId}\n</Text>
            </View>
            <View className='leave-button-view'>
              <View hidden={user.userIsOwner}>
                <AtButton size='small' onClick={this.leaveClass}>
                  离开班级
                </AtButton>
              </View>
              <View hidden={!user.userIsOwner}>
                <Text className='text-small'>
                  您是本班的建立者，可删除本班\n
                </Text>
                <AtButton size='small' onClick={this.deleteClass}>
                  删除班级
                </AtButton>
              </View>
            </View>
          </View>

          <View className='grid-view container'>
            <AtGrid
              hasBorder={false}
              columnNum={4}
              data={user.classmates.map(classmate => ({
                image: TOMATO_PNG,
                value: classmate.name
              }))}
            />
          </View>
        </View>
      </View>
    )
  }
}
