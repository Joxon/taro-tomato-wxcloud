const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')

exports.main = async(event, context) => {
  const {
    OPENID
  } = cloud.getWXContext()

  try {
    const result = await users.where({
      "_openid": OPENID
    }).get()

    const len = result.data.length
    if (len === 1) {
      return result
    } else {
      throw Error('getUser: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}