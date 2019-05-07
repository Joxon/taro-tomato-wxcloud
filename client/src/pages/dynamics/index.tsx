import Taro, { Component } from '@tarojs/taro'
import { View, Button, OpenData, Text } from '@tarojs/components'
import { AtGrid, AtList, AtListItem } from 'taro-ui'
import { Item } from 'taro-ui/@types/grid'

import { IPost } from './index.d'
import { DEFAULT_POSTS } from './constants'
import { getUserFields, getClassFields } from '../../utils'

import TOMATO_PNG from './images/tomato.png'
import './index.scss'

interface IState {
  userName: string
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
    userName: '加载中...',
    posts: DEFAULT_POSTS,
    userInfoAuthorized: true
  }

  state: IState = Dynamics.defaultState

  getUserName () {
    getUserFields({ name: true }).then(fields => {
      const userName = (fields as any).name as string
      this.setState({ userName })
    })
  }

  getPosts () {
    getUserFields({ classId: true })
      .then(fields => {
        const classId = (fields as any).classId as string
        if (classId === '' || classId === null || classId === undefined) {
          throw Error(
            'getPosts: classId is invalid. Maybe user has not joined a class.'
          )
        } else {
          return classId
        }
      })
      .then(classId => {
        return getClassFields(classId, { posts: true })
      })
      .then(fields => {
        const posts = (fields as any).posts as IPost[]
        if (!Array.isArray(posts)) {
          throw Error('getPosts: "posts" is not an array')
        }
        if (posts.length === 0) {
          throw Error('getPosts: no post in "posts"')
        } else {
          this.setState({ posts })
        }
      })
      .catch(e => {
        console.error(e)
        this.setState({
          posts: [
            {
              userName: '',
              content: '暂无班级动态',
              timestamp: new Date().valueOf()
            }
          ]
        })
      })
  }

  onPullDownRefresh () {
    this.getUserName()
    this.getPosts()
  }

  componentDidMount () {
    this.getUserName()
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
    this.getUserName()
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
              <Text>{this.state.userName}</Text>
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
                extraText={new Date(post.timestamp)
                  .toISOString()
                  .split('T')[0]
                  .replace(/-/g, '')} // yyyymmdd
              />
            ))}
          </AtList>
        </View>
      </View>
    )
  }
}
