const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const classes = db.collection('classes')
const users = db.collection('users')

exports.main = async(event, context) => {
  try {
    // 小程序端传入班级ID
    const classId = event.class.id
    // 班级成员解除关联
    const updateResult = await users.where({
      "classId": classId
    }).update({
      data: {
        "classId": null
      }
    })
    if (updateResult.stats.updated === 0){
      throw Error('deleteClass: failed to unlink classmates')
    }
    // 删除班级
    return await classes.doc(classId).remove()

  } catch (e) {
    console.error(e)
  }
}