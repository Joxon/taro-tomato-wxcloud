const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')
const classes = db.collection('classes')

exports.main = async(event, context) => {
  try {
    const {
      OPENID
    } = cloud.getWXContext()

    const user = users.where({
      "_openid": OPENID
    })

    const result = await user.field({
      records: true,
      tomato: true,
      classId: true,
      name: true
    }).get()

    const len = result.data.length
    if (len !== 1) {
      throw Error('addRecord: invalid data.length = ' + len)
    }

    // 计算剩余的番茄积分不能小于0
    // 小程序端：res.result === null
    const record = event.record
    const userData = result.data[0]
    const tomato = parseInt(userData.tomato) + parseInt(record.tomato)
    if (tomato < 0) {
      return
    }

    // 番茄积分为正，可以添加记录
    const {
      records
    } = userData
    // 最新的记录在最前
    records.unshift(record)

    // 若有班级，更新班级动态
    const {
      classId
    } = userData
    if (classId !== null && classId !== '') {
      // 获取当前班级动态
      const userClass = classes.doc(classId)
      const getPostsResult = await userClass.field({
        posts: true
      }).get()

      const {
        posts
      } = getPostsResult.data

      // 获取用户名
      const {
        name
      } = userData

      // 添加动态
      posts.unshift({
        content: record.reason,
        timestamp: record.timestamp,
        uid: OPENID,
        userName: name
      })

      // 更新班级
      const updateClassPostsResult = await userClass.update({
        data: {
          posts
        }
      })
      if (updateClassPostsResult.stats.updated !== 1) {
        throw Error('addRecord: failed to update posts of user\'s class')
      }
    }

    // 更新用户数据
    return await user.update({
      data: {
        records,
        tomato
      }
    })
  } catch (e) {
    console.error(e)
  }
}