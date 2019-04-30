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
      // console.log('tasks', tasks)

      const task = event.task
      // console.log('event', event)
      // console.log('task', task)

      tasks.push(task)
      // console.log('tasks', tasks)

      return await user.update({
        data: {
          tasks
        }
      })

      // const result2 = await user.update({
      //   tasks
      // })
      // if (result2.stats.updated === 1) {
      //   return 'ok'
      // } else {
      //   return 'err'
      // }

    } else {
      throw Error('addTask: invalid data.length = ', len)
    }
  } catch (e) {
    console.error(e)
  }
}