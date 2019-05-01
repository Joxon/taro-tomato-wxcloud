import Taro from '@tarojs/taro'

import { IUser } from './index.d'
import { IRecord } from '../pages/tomato/index.d'

export function getUser (): Promise<IUser | void> {
  return (Taro.cloud.callFunction({
    name: 'getUser',
    data: {}
  }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
    .then(response => {
      const result = response.result as any
      const user = result.data[0] as IUser
      return user
    })
    .catch(err => console.error(err))
}

interface IFields {
  [field: string]: boolean
}

export function getUserFields (fields: IFields): Promise<object | void> {
  return (Taro.cloud.callFunction({
    name: 'getUserFields',
    data: { fields }
  }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
    .then(response => {
      const result = response.result as any
      const userFields = result.data[0] as object
      return userFields
    })
    .catch(err => console.error(err))
}

export function addRecord (record: IRecord): Promise<number | void> {
  const handleError = (error: any) => {
    Taro.hideLoading()
    console.error(error)
    Taro.showModal({
      title: '错误',
      content: `添加记录失败：${error}。是否重试？`,
      success: res => {
        if (res.confirm) {
          addRecord(record)
        }
      }
    })
  }

  // 防止用户重复点击
  Taro.showLoading({
    title: '处理中...',
    mask: true
  })

  // 提交数据
  return (
    (Taro.cloud.callFunction({
      name: `addRecord`,
      data: { record }
    }) as Promise<Taro.cloud.ICloud.CallFunctionResult>)
      // 收到响应
      .then(response => {
        const msToWait = 1000
        if (response.result === null) {
          Taro.showToast({
            title: `小番茄不足`,
            icon: 'none',
            duration: msToWait
          })
        } else if ((response.result as any).stats.updated === 1) {
          // 响应格式正确
          Taro.showToast({
            title: `添加记录成功`,
            icon: 'success',
            duration: msToWait
          })
        } else {
          // 响应格式错误
          handleError(response)
        }
        return msToWait
      })
      // 请求出错
      .catch(error => handleError(error))
  )
}
