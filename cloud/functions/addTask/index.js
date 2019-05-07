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

    // 获取用户当前的任务列表
    const result = await user.field({
      tasks: true
    }).get()

    const len = result.data.length
    if (len !== 1) {
      throw Error('addTask: invalid data.length = ' + len)
    }

    const tasks = result.data[0].tasks

    // 获取用户待添加的任务
    const task = event.task

    // 添加到任务列表
    tasks.push(task)

    return await user.update({
      data: {
        tasks
      }
    })
  } catch (e) {
    console.error(e)
  }
}