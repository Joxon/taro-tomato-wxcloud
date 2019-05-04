import Taro, { Component, Config } from '@tarojs/taro'
import { View, Label } from '@tarojs/components'
import { AtButton, AtForm, AtInput, AtInputNumber } from 'taro-ui'

import { IListItem } from './index.d'
import { addRecord } from '../../utils'

type TEditMode = 'add' | 'edit'
type TItemMode = 'reward' | 'daily'

interface IState {
  editMode: TEditMode
  itemMode: TItemMode
  name: string
  tomato: number
}

interface IPreload extends IListItem {
  editMode: TEditMode
  itemMode: TItemMode
}

export default class TomatoItem extends Component<{}, IState> {
  config: Config = {
    navigationBarTitleText: '表项详情'
  }

  static defaultState: IState = {
    editMode: 'add',
    itemMode: 'daily',
    name: '',
    tomato: 10
  }

  state: IState = TomatoItem.defaultState
  preload: IPreload

  componentWillMount () {
    this.preload = this.$router.preload as IPreload
    const { editMode, itemMode } = this.preload
    if (editMode === 'edit') {
      const { name, tomato } = this.preload

      // 日常模式下，UI与数据层相同
      // 奖励模式下，UI显示正数，数据层为负
      const tomatoPositive = +Math.abs(tomato)

      this.setState({
        editMode: 'edit',
        itemMode,
        name,
        tomato: itemMode === 'reward' ? tomatoPositive : tomato
      })
    } else if (editMode === 'add') {
      this.setState({
        editMode: 'add',
        itemMode,
        name: '',
        tomato: 10
      })
    }
  }

  callItemFunction (verb: 'add' | 'edit' | 'delete', verbName: string): void {
    const handleError = (error: any) => {
      Taro.hideLoading()
      Taro.showToast({ title: `${verbName}失败：${error}`, icon: 'none' })
      console.error(error)
    }

    // 防止用户重复点击
    Taro.showLoading({
      title: '处理中...',
      mask: true
    })

    // 准备数据
    const { editMode, itemMode, ...ui } = this.state
    const { name, tomato: tomatoNumOrStr } = ui
    const id =
      editMode === 'add' ? new Date().valueOf().toString() : this.preload.id
    const tomatoNum =
      typeof tomatoNumOrStr === 'string'
        ? parseInt(tomatoNumOrStr)
        : tomatoNumOrStr
    const tomato = itemMode === 'reward' ? -Math.abs(tomatoNum) : tomatoNum
    const item: IListItem = {
      id,
      name,
      tomato
    }

      // 提交数据
    ;(Taro.cloud.callFunction({
      name: `${verb}Item`,
      data: {
        item,
        itemMode
      }
    }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
      // 收到响应
      .then(response => {
        if ((response.result as any).stats.updated === 1) {
          // 响应格式正确
          Taro.showToast({
            title: `${verbName}成功`,
            icon: 'success',
            duration: 1000
          })
          setTimeout(() => {
            Taro.navigateBack()
          }, 1000)
        } else {
          // 响应格式错误
          handleError(response)
        }
      })
      // 请求出错
      .catch(error => handleError(error))
  }

  onRecord () {
    let { itemMode, name, tomato } = this.state

    const type =
      itemMode === 'reward'
        ? 'redeem' // 兑换奖励
        : tomato > 0
          ? 'harvest' // 日常奖励
          : 'punish' // 日常惩罚

    const reason =
      itemMode === 'reward'
        ? `兑换了【${name}】`
        : tomato > 0
          ? `完成了【${name}】`
          : `因为【${name}】了`

    tomato =
      itemMode === 'reward'
        ? -Math.abs(tomato) // UI存的是正数
        : tomato

    const timestamp = new Date().valueOf()

    addRecord({
      type,
      reason,
      tomato,
      timestamp
    }).then(ms => {
      if (typeof ms === 'number') {
        setTimeout(() => Taro.navigateBack({ delta: 2 }), ms as number)
      }
    })
  }

  onDelete () {
    Taro.showModal({
      title: '删除',
      content: '确定删除这个表项？',
      success: res => {
        if (res.confirm) {
          this.callItemFunction('delete', '删除')
        }
      }
    })
  }

  onSubmit () {
    const { editMode, itemMode, ...item } = this.state
    if (item.name === '') {
      Taro.showToast({ title: '表项名不能为空', icon: 'none' })
      return
    }

    // 准备请求
    const verb = editMode
    const verbName = editMode === 'add' ? '添加' : '修改'
    this.callItemFunction(verb, verbName)
  }

  onReset () {
    this.setState({ name: '', tomato: 10 })
  }

  handleNameInput (name: string) {
    this.setState({ name })
  }

  handleTomatoInputNumber (tomato: number) {
    const t = this.state.itemMode === 'reward' ? +Math.abs(tomato) : tomato
    this.setState({ tomato: t })
  }

  render () {
    const { editMode, itemMode, ...item } = this.state

    const { itemType, itemVerb } =
      itemMode === 'daily'
        ? { itemType: '奖惩', itemVerb: '记录' }
        : { itemType: '奖励', itemVerb: '兑换' }

    const itemNameInput = (
      <AtInput
        name='itemName'
        title={itemType + '名称'}
        type='text'
        placeholder='起个名字吧~'
        value={item.name}
        onChange={this.handleNameInput}
      />
    )

    const itemTomatoInputNumber = (
      <View className='at-input'>
        <View className='at-input__container'>
          <Label className='at-input__title'>
            {itemMode === 'daily' ? '番茄奖惩' : '番茄消耗'}
          </Label>
          <AtInputNumber
            className='at-input__input'
            type='digit'
            min={itemMode === 'daily' ? -100 : 10}
            max={100}
            step={5}
            value={itemMode === 'daily' ? item.tomato : Math.abs(item.tomato)}
            onChange={this.handleTomatoInputNumber}
          />
        </View>
      </View>
    )

    const buttons =
      editMode === 'add' ? (
        <View>
          <AtButton type='primary' formType='submit'>
            添加{itemType}
          </AtButton>
          <AtButton type='secondary' formType='reset'>
            重新填写
          </AtButton>
        </View>
      ) : (
        <View>
          <AtButton type='primary' formType='submit'>
            保存{itemType}
          </AtButton>
          <AtButton type='secondary' onClick={this.onRecord}>
            {itemVerb + itemType}
          </AtButton>
          <AtButton type='secondary' onClick={this.onDelete}>
            删除{itemType}
          </AtButton>
        </View>
      )

    return (
      <AtForm
        className='form'
        onSubmit={this.onSubmit.bind(this)}
        onReset={this.onReset.bind(this)}
      >
        {itemNameInput}
        {itemTomatoInputNumber}
        {buttons}
      </AtForm>
    )
  }
}
