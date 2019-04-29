import Taro from '@tarojs/taro'

import { IUser } from './index.d'

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
