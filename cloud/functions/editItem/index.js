const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const users = db.collection('users')

exports.main = async (event, context) => {
  try {
    const {
      OPENID
    } = cloud.getWXContext()

    const user = users.where({
      "_openid": OPENID
    })

    const {
      itemMode
    } = event

    const result = itemMode === 'reward' ?
      await user.field({
        rewardItems: true
      }).get() :
      await user.field({
        dailyItems: true
      }).get()

    const len = result.data.length
    if (len === 1) {
      const items = itemMode === 'reward' ?
        result.data[0].rewardItems :
        result.data[0].dailyItems

      const itemNew = event.item

      const itemIndex = items.findIndex(item => item.id === itemNew.id)
      items[itemIndex] = itemNew

      return itemMode === 'reward' ?
        await user.update({
          data: {
            rewardItems: items
          }
        }) :
        await user.update({
          data: {
            dailyItems: items
          }
        })
    } else {
      throw Error('addItem: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}