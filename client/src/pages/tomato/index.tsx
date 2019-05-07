import Taro, { Component } from '@tarojs/taro'
import { View, Text } from '@tarojs/components'
import { AtGrid, AtAvatar, AtList, AtListItem, AtSearchBar } from 'taro-ui'
import { Item } from 'taro-ui/@types/grid'

import { IRecord } from './index.d'
import { DEFAULT_RECORDS } from './constants'
import { getUserFields } from '../../utils'

import TOMATO_PNG from './images/tomato.png'
import './index.scss'

interface IState {
  records: IRecord[]
  tomato: number
  searchKeyword: string
}

const gridData: Item[] = [
  {
    image: TOMATO_PNG,
    value: '兑换奖励'
  },
  {
    image: TOMATO_PNG,
    value: '日常奖惩'
  }
]

export default class Tomato extends Component<{}, IState> {
  config: Taro.Config = {
    enablePullDownRefresh: true
  }

  static defaultState: IState = {
    records: DEFAULT_RECORDS,
    tomato: 0,
    searchKeyword: ''
  }

  state: IState = Tomato.defaultState
  records: IRecord[]

  getInfo () {
    getUserFields({ records: true, tomato: true }).then(fields => {
      const records = (fields as any).records as IRecord[]
      const tomato = (fields as any).tomato as number
      if (records.length === 0) {
        this.setState({
          tomato,
          records: [
            {
              tomato: 0,
              reason: '暂无记录',
              timestamp: new Date().valueOf()
            }
          ]
        })
      } else {
        this.setState({ records, tomato })
      }
      // 保存当前记录，后续可以过滤
      this.records = records
    })
  }

  onPullDownRefresh () {
    this.getInfo()
  }

  componentDidMount () {
    this.getInfo()
  }

  componentDidShow () {
    this.getInfo()
  }

  handleGridClick (_item: Item, index: number) {
    if (index === 0) {
      this.$preload('mode', 'reward')
    } else if (index === 1) {
      this.$preload('mode', 'daily')
    }
    Taro.navigateTo({ url: 'list' })
  }

  handleSearchBarChange (value: string) {
    this.setState({
      searchKeyword: value
    })
    if (value === '') {
      this.setState({ records: this.records })
    }
  }

  handleSearchBarClick () {
    const { searchKeyword: key } = this.state
    const searchKeyword = key.toString()
    const isOnThisDay = (record: IRecord) => {
      if (/^\d{8}$/.test(searchKeyword)) {
        const year = parseInt(searchKeyword.substr(0, 4)) // year: 1970-
        const month = parseInt(searchKeyword.substr(4, 2)) - 1 // month: 0-11
        const day = parseInt(searchKeyword.substr(6, 2)) // day: 1-31
        const thisDay = new Date(year, month, day).valueOf()
        const nextDay = new Date(year, month, day + 1).valueOf()
        return thisDay <= record.timestamp && record.timestamp < nextDay
      }
    }
    const records = this.records.filter(
      record =>
        record.reason.includes(searchKeyword) ||
        record.tomato.toString().includes(searchKeyword) ||
        isOnThisDay(record)
    )
    this.setState({ records })
  }

  render () {
    return (
      <View className='tomato-wrapper'>
        <View className='top-view'>
          <View className='info'>
            <View className='avatar'>
              <AtAvatar size='large' circle image={TOMATO_PNG} />
            </View>
            <View className='tomato'>
              <Text>小番茄：{this.state.tomato}个</Text>
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
          <AtSearchBar
            value={this.state.searchKeyword}
            placeholder='可搜索内容、日期（如20190101）'
            onChange={this.handleSearchBarChange}
            onActionClick={this.handleSearchBarClick}
          />
          <AtList>
            {this.state.records.map(record => (
              <AtListItem
                key={record.timestamp}
                title={
                  record.type === 'harvest'
                    ? '收获'
                    : record.type === 'punish'
                      ? '惩罚'
                      : record.type === 'redeem'
                        ? '兑换'
                        : ''
                }
                note={record.reason}
                extraText={new Date(record.timestamp)
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
