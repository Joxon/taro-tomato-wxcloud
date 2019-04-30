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

    const result = await user.field({
      tasks: true
    }).get()

    const len = result.data.length
    if (len === 1) {
      const tasks = result.data[0].tasks
      const taskToDelete = event.task

      const taskIndex = tasks.findIndex(task => task.id === taskToDelete.id)
      tasks.splice(taskIndex, 1)

      return await user.update({
        data: {
          tasks
        }
      })

    } else {
      throw Error('deleteTask: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}