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

    const user = users.where({
      "_openid": OPENID
    })

    const {
      name,
      sex,
      age,
      secondsToRest,
      secondsToWork
    } = event.settings

    return await user.update({
      data: {
        name,
        sex,
        age,
        secondsToRest,
        secondsToWork
      }
    })
  } catch (e) {
    console.error(e)
  }
}