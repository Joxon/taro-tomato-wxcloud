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

    const result = await user.field({
      records: true,
      tomato: true
    }).get()

    const len = result.data.length
    if (len === 1) {
      // 计算剩余的番茄积分不能小于0
      // 小程序端：res.result === null
      const record = event.record
      const tomato = parseInt(result.data[0].tomato) + parseInt(record.tomato)
      if (tomato < 0) {
        return
      }

      // 番茄积分为正，可以添加记录
      const records = result.data[0].records
      // 最新的记录在最前
      records.unshift(record)

      return await user.update({
        data: {
          records,
          tomato
        }
      })
    } else {
      throw Error('addRecord: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}