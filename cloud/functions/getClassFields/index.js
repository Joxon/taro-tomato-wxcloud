const cloud = require('wx-server-sdk')

cloud.init({
  env: 'dev-i1tq4'
})
const db = cloud.database()
const classes = db.collection('classes')

exports.main = async(event, context) => {
  try {
    const id = event.class.id

    const fields = event.fields

    const result = await classes.where({
      "_id": id
    }).field(fields).get()

    const len = result.data.length
    if (len !== 1) {
      throw Error('getClassFields: invalid data.length = ', len)
    }

    return result
  } catch (e) {
    console.error(e)
  }
}