const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')
const classes = db.collection('classes')

exports.main = async(event, context) => {
  try {
    // 准备用户记录
    const {
      OPENID
    } = cloud.getWXContext()
    const user = users.where({
      "_openid": OPENID
    })
    // 尝试获取用户记录
    const recResult = await user.field({
      records: true,
      name: true
    }).get()
    const len = recResult.data.length
    if (len !== 1) {
      throw Error('addClass: invalid recResult.data.length = ', len)
    }
    // 转换为班级记录
    const userName = recResult.data[0].name
    const posts = recResult.data[0].records.map(record => ({
      uid: OPENID,
      userName,
      timestamp: record.timestamp,
      content: record.reason
    }))
    // 用户传入班级名称
    const name = event.class.name
    // 默认配置
    const newClass = {
      name,
      ownerId: OPENID,
      classmates: [{
        id: OPENID,
        name: userName
      }],
      posts
    }
    // 添加新班级
    const addResult = await classes.add({
      data: newClass
    })
    // 拿到数据库分配的班级Id
    const newClassId = addResult._id
    // 关联用户和班级
    return await users.where({
      "_openid": OPENID
    }).update({
      data: {
        classId: newClassId
      }
    })
  } catch (e) {
    console.error(e)
  }
}