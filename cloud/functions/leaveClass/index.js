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
        "classId": null
      }
    })
    if (updateUserClassIdResult.stats.updated !== 1) {
      throw Error('joinClass: failed to update user\'s classId to null')
    }
    // 修改班级成员和动态
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
    // 删除成员和相关动态并更新班级
    return await aClass.update({
      data: {
        classmates: classmates.filter(classmate => classmate.id !== OPENID),
        posts: posts.filter(post => post.uid !== OPENID)
      }
    })
  } catch (e) {
    console.error(e)
  }
}