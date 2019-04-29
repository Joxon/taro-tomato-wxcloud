const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')

exports.main = async(event, context) => {
  // *********************************************
  // 可获取的三种字段
  // APPID：本小程序在微信服务器上的标识
  // OPENID：用户在本小程序中的唯一标识
  // UNIONID：用户在本开发者的多个服务中的唯一标识
  // *********************************************
  // const {
  //   APPID,
  //   OPENID,
  //   UNIONID
  // } = cloud.getWXContext()

  const {
    OPENID
  } = cloud.getWXContext()

  // 登录流程
  // 1. 用户打开小程序，触发服务端调用login
  // 2. 服务端收到OPENID，检索数据库中是否已存在该OPENID
  // 2a. 若不存在，则新建一条默认记录，以OPENID作为主键，并返回
  // 2b. 若存在，则返回已存在的记录

  // SQL             vs NoSQL
  // 数据库/database == 数据库/database
  // 表格/table      == 集合/collection
  // 行/row          == 记录，文档/record, document
  // 列/column       == 字段/field

  // collection.doc(_id)，其中只能查询_id，自定义字段请用where
  try {
    const result = await users.where({
      "_openid": OPENID
    }).get()

    const len = result.data.length
    if (len === 1) {
      // 命中一条记录，自动登录
      return result
    } else if (len === 0) {
      // 没有命中记录，自动注册
      // 默认配置
      const defaultData = {
        _openid: OPENID,
        age: '3',
        classId: null,
        dailyItems: [{
          name: '睡懒觉',
          tomato: -10
        }],
        records: [],
        rewardItems: [{
          name: '看电视一小时',
          tomato: -10
        }],
        secondsToRest: 300,
        secondsToWork: 1800,
        sex: 'M',
        tasks: [],
        tomato: 0
      }
      // 添加新用户信息，不等待添加完成
      users.add({
        data: defaultData
      })
      // 直接返回默认配置，无需再次查询数据库
      return {
        data: [defaultData],
        errMsg: 'login: new user registered'
      }
    } else {
      throw Error('login: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}