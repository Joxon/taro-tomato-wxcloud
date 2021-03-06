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
      tasks: true
    }).get()

    const len = result.data.length
    if (len === 1) {
      const tasks = result.data[0].tasks
      const taskNew = event.task

      // 修改原数组
      // items[items.findIndex(el => el.id === item.id)] = item;
      // 新建一个数组
      // items.map(el=> el.id === item.id? item : el)
      const taskIndex = tasks.findIndex(task => task.id === taskNew.id)
      tasks[taskIndex] = taskNew

      return await user.update({
        data: {
          tasks
        }
      })

    } else {
      throw Error('editTask: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}