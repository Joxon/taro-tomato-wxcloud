import Taro, { Component } from '@tarojs/taro'
import { View, Button, OpenData } from '@tarojs/components'
import { AtGrid, AtList, AtListItem } from 'taro-ui'
import { Item } from 'taro-ui/@types/grid'

import { IPost } from './index.d'
import { DEFAULT_POSTS } from './constants'

import TOMATO_PNG from './images/tomato.png'
import './index.scss'

interface IState {
  posts: IPost[]
  userInfoAuthorized: boolean
}

const gridData: Item[] = [
  {
    image: TOMATO_PNG,
    value: '我的设定'
  },
  {
    image: TOMATO_PNG,
    value: '我的班级'
  }
]

export default class Dynamics extends Component<{}, IState> {
  config: Taro.Config = {
    enablePullDownRefresh: true
  }

  static defaultState: IState = {
    posts: DEFAULT_POSTS,
    userInfoAuthorized: true
  }

  state: IState = Dynamics.defaultState

  getPosts () {
    ;(Taro.cloud.callFunction({
      name: 'getPosts',
      data: {}
    }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
      .then(res => {
        const result = res.result as any
        const posts = result.data[0] as IPost[]
        this.setState({ posts })
      })
      .catch(err => {
        console.error(err)
      })
  }

  onPullDownRefresh () {
    this.getPosts()
  }

  componentDidMount () {
    this.getPosts()
    Taro.getSetting({
      success: (res: any) => {
        this.setState({
          userInfoAuthorized: res.authSetting['scope.userInfo']
        })
      }
    })
  }

  componentDidShow () {
    this.getPosts()
  }

  handleGridClick (_item: Item, index: number) {
    if (index === 0) {
      Taro.navigateTo({ url: 'settings' })
    } else if (index === 1) {
      Taro.navigateTo({ url: 'class' })
    }
  }

  render () {
    return (
      <View className='dynamics-wrapper'>
        <View className='top-view'>
          <View className='info'>
            <View className='avatar'>
              <View className='at-avatar at-avatar--large at-avatar--circle'>
                <OpenData type='userAvatarUrl' />
              </View>
            </View>
            <View className='user-name'>
              <Button
                open-type='getUserInfo'
                hidden={this.state.userInfoAuthorized}
              >
                点击登录
              </Button>
              <OpenData type='userNickName' />
            </View>
          </View>
          <View className='buttons'>
            <AtGrid
              onClick={this.handleGridClick}
              mode='rect'
              columnNum={2}
              data={gridData}
            />
          </View>
        </View>
        <View className='list-view'>
          <View className='title'>- 班级动态 -</View>
          <AtList>
            {this.state.posts.map(post => (
              <AtListItem
                key={post.timestamp}
                title={post.userName}
                note={post.content}
                extraText={post.timestamp.toString()}
              />
            ))}
          </AtList>
        </View>
      </View>
    )
  }
}
