const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')

exports.main = async(event, context) => {
  try {
    const {
      OPENID
    } = cloud.getWXContext()

    const fields = event.fields

    const result = await users.where({
      "_openid": OPENID
    }).field(fields).get()

    const len = result.data.length
    if (len === 1) {
      return result
    } else {
      throw Error('getUserFields: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}