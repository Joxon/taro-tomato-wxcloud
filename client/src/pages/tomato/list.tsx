import Taro, { Component, Config } from '@tarojs/taro'
import { View } from '@tarojs/components'
import { AtList, AtListItem } from 'taro-ui'
import { FontAwesome } from 'taro-icons'

import { getUserFields } from '../../utils'
import { IListItem } from './index.d'

import './list.scss'

type TListMode = 'reward' | 'daily'

interface IState {
  items: IListItem[]
}

interface IPreload {
  mode: TListMode
}
export default class TomatoList extends Component<{}, IState> {
  config: Config = {
    navigationBarTitleText: '番茄列表'
  }

  static defaultState: IState = {
    items: []
  }

  state: IState = TomatoList.defaultState
  preload: IPreload

  getItems () {
    const { mode } = this.preload
    if (mode === 'daily') {
      getUserFields({ dailyItems: true }).then(fields => {
        const dailyItems = (fields as any).dailyItems as IListItem[]
        this.setState({ items: dailyItems })
      })
    } else if (mode === 'reward') {
      getUserFields({ rewardItems: true }).then(fields => {
        const rewardItems = (fields as any).rewardItems as IListItem[]
        this.setState({ items: rewardItems })
      })
    }
  }

  componentWillMount () {
    this.preload = this.$router.preload
    this.getItems()
  }

  componentDidMount () {
    this.getItems()
  }

  componentDidShow () {
    this.getItems()
  }

  navigateToItemEdit (item: IListItem) {
    this.$preload({
      ...item,
      editMode: 'edit',
      itemMode: this.preload.mode
    })
    Taro.navigateTo({
      url: 'item'
    })
  }

  navigateToItemAdd () {
    this.$preload({
      editMode: 'add',
      itemMode: this.preload.mode
    })
    Taro.navigateTo({
      url: 'item'
    })
  }

  render () {
    return (
      <View className='list-wrapper'>
        <AtList>
          {this.state.items.map((item, index) => (
            <AtListItem
              key={index + item.name}
              onClick={this.navigateToItemEdit.bind(this, item)}
              arrow='right'
              title={item.name}
              extraText={`${item.tomato > 0 ? '奖励' : '消耗'} ${Math.abs(
                item.tomato
              )} 番茄`}
            />
          ))}
        </AtList>
        <View className='add-button' onClick={this.navigateToItemAdd}>
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
}
