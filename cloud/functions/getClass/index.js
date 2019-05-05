const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const classes = db.collection('classes')

exports.main = async(event, context) => {
  try {
    const {
      OPENID
    } = cloud.getWXContext()

    const result = await classes.where({
      "_id": event.class.id
    }).get()

    const len = result.data.length
    if (len !== 1) {
      throw Error('getUser: invalid data.length = ', len)
    }

    // 返回当前用户是否班级所有者
    result.data[0].thisUserIsOwner = OPENID === result.data[0].ownerId
    return result
  } catch (e) {
    console.error(e)
  }
}