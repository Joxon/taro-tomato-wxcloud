import Taro from '@tarojs/taro'

// https://github.com/Jeepeng/taro-icons#readme
// import 'taro-icons/scss/MaterialIcons.scss' // 112KB
// import 'taro-icons/scss/MaterialCommunityIcons.scss' // 495KB
// import 'taro-icons/scss/Ionicons.scss' // 134KB
import 'taro-icons/scss/FontAwesome.scss' // 322KB

// https://nervjs.github.io/taro-ui-theme-preview/
// https://taro-ui.aotu.io/#/docs/introduction
// https://taro-ui.aotu.io/#/docs/customizetheme
// !!微信开发者工具->调试基础库需要大于2.2.3
// import 'taro-ui/dist/style/index.scss' // 默认样式
// import './assets/styles/taro-ui.css' // 自定义样式，单文件版本
// import './assets/styles/custom-theme.scss' // 自定义样式，开发版本

// import { Provider } from '@tarojs/mobx'
// import store from './store'

import Index from './pages/index/index'
import './app.scss'

// const storeProp = {
//   store
// }

class App extends Taro.Component {
  config: Taro.Config = {
    window: {
      backgroundTextStyle: 'light',
      navigationBarBackgroundColor: '#ff0000',
      navigationBarTitleText: '小番茄',
      navigationBarTextStyle: 'white'
      // navigationStyle: 'custom'
    },
    // app.json pages中的route，会依照设置的顺序进行编译检查，
    // 只要有错误的page，访问下面的page就会报楼主说的错误，
    // 所以 @Sincere Xie说的位置往前移动，是可以解决的，只要移动到没有错误的page页面。
    pages: [
      'pages/schedule/index',
      'pages/schedule/clock',
      'pages/schedule/task',
      'pages/tomato/index',
      'pages/tomato/list',
      'pages/tomato/item',
      'pages/dynamics/index',
      'pages/dynamics/settings',
      'pages/dynamics/class'
    ],
    tabBar: {
      list: [
        {
          iconPath: 'assets/images/tasks-off.png',
          selectedIconPath: 'assets/images/tasks-on.png',
          pagePath: 'pages/schedule/index',
          text: '日程'
        },
        {
          iconPath: 'assets/images/seedling-off.png',
          selectedIconPath: 'assets/images/seedling-on.png',
          pagePath: 'pages/tomato/index',
          text: '番茄'
        },
        {
          iconPath: 'assets/images/user-friends-off.png',
          selectedIconPath: 'assets/images/user-friends-on.png',
          pagePath: 'pages/dynamics/index',
          text: '动态'
        }
      ],
      color: '#333333',
      selectedColor: '#fa8072',
      backgroundColor: '#ffffff',
      borderStyle: 'white'
    },
    cloud: true
  }

  componentDidMount () {
    if (process.env.TARO_ENV === 'weapp') {
      // https://developers.weixin.qq.com/miniprogram/dev/wxcloud/guide/console.html
      // 在用户管理中会显示使用云能力的小程序的访问用户列表，默认以访问时间倒叙排列
      // 访问时间的触发点是在小程序端调用 wx.cloud.init 方法，且其中的 traceUser 参数传值为 true。
      Taro.cloud.init({
        env: 'dev-i1tq4',
        traceUser: true
      })
      ;(Taro.cloud.callFunction({
        name: 'login',
        data: {}
      }) as Promise<Taro.cloud.ICloud.CallFunctionResult>).then(res => {
        if (res.result === 'login: new user registered') {
          Taro.showModal({
            title: '欢迎',
            content:
              '欢迎使用小番茄！' +
              '在这里，您可以为孩子制定未来一周的计划，并用“番茄钟”提高孩子的工作效率。' +
              '另外，您还可以使用“小番茄”，为孩子提供激励。' +
              '更多功能，期待您的体验~'
          })
        }
      })
    }
  }

  componentDidShow () {}

  componentDidHide () {}

  componentDidCatchError () {}

  render () {
    return (
      // 注意传参是可能包括多个store的object
      // 如<Provider store={{ store1, store2, ... }}>
      // <Provider store={storeProp}>
      <Index />
      // </Provider>
    )
  }
}

Taro.render(<App />, document.getElementById('app'))
