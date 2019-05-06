const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const classes = db.collection('classes')
const users = db.collection('users')

exports.main = async(event, context) => {
  try {
    // 获取用户ID
    const {
      OPENID
    } = cloud.getWXContext()
    // 小程序端传入班级ID
    const classId = event.class.id
    // 修改用户班级号
    const user = users.where({
      "_openid": OPENID
    })
    const updateUserClassIdResult = await user.update({
      data: {
        "classId": classId
      }
    })
    if (updateUserClassIdResult.stats.updated !== 1) {
      throw Error('joinClass: failed to update user\'s classId to ' + classId)
    }
    // 修改班级成员和动态
    // 先获取当前成员和动态
    const aClass = classes.doc(classId)
    // 注意，此处是doc.get，而不是collection.get
    // 所以只会返回一条记录
    // 后续不需要data[0]
    const getClassmatesResult = await aClass.field({
      classmates: true,
      posts: true
    }).get()
    if (getClassmatesResult.errMsg !== 'document.get:ok') {
      throw Error('joinClass: failed to get classmates and posts')
    }
    const {
      classmates,
      posts
    } = getClassmatesResult.data
    // 再获取用户名
    // 注意，此处是collection.get，而不是doc.get
    // 后续需要data[0]
    const getUserNameResult = await user.field({
      name: true,
      records: true
    }).get()
    if (getUserNameResult.data.length !== 1) {
      throw Error('joinClass: failed to get userName')
    }
    const {
      name,
      records
    } = getUserNameResult.data[0]
    // 加入成员和动态
    classmates.push({
      id: OPENID,
      name
    })
    posts.push(...records.map(record => ({
      content: record.reason,
      timestamp: record.timestamp,
      uid: OPENID,
      userName: name
    })))
    posts.sort((a, b) => (b.timestamp - a.timestamp))
    // sort()是原地算法，不产生副本，直接修改原函数
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/sort
    // 此处排序使得时间戳大的排前面，最近的动态会放在头部
    // 更新班级
    return await aClass.update({
      data: {
        classmates,
        posts
      }
    })
  } catch (e) {
    console.error(e)
  }
}