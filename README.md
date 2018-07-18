# 项目概述
 基于腾讯IM的即时通讯、客服聊天系统。
 
# 系统基本流程
```
  1. 从商城进入该客服系统。
  
  2. 首页加载完成，显示loading状态，同时加载所需资源并实时更新加载状态。
  
  3. 资源加载完成，进入index页面，/src/pages/Index.vue组件开始初始化。
  
  4. /src/pages/Index.vue组件的created阶段解析url上面的参数和读取后端通过action返回的一些参数，获得一个完整的wxInfo，将wxInfo更新到store的state中。
  
  5. 用获取到的wxInfo请求乐运营服务器startc2c接口，获取登录腾讯IM需要的账号信息和商家的客服账号。
  
  6. 登录腾讯IM，创建一个与商家客服的会话,并尝试获取最新（第一页）聊天记录。
  
  8. 展示聊天页面，用户即可开始与连接的客服聊天了。
```  

# 使用到的主要技术
1. vue 前端mvvm框架[参考链接](https://cn.vuejs.org/)

2. vue-router 基于vue的前端路由管理器[参考链接](https://router.vuejs.org/zh/installation.html)
3. vuex 基于vue的状态管理[参考链接](https://vuex.vuejs.org/zh/guide/)
4. vue-cli 基于vue的前端脚手架工具[参考链接](https://github.com/vuejs/vue-cli)
5. mint-ui 基于vue的移动端UI组件库[参考链接](https://github.com/ElemeFE/mint-ui)
6. flexible + px2rem-loader 移动端弹性布局解决方案[参考链接](http://hjingren.cn/2017/06/16/%E5%9F%BA%E4%BA%8Evue-cli%E9%85%8D%E7%BD%AE%E7%A7%BB%E5%8A%A8%E7%AB%AF%E8%87%AA%E9%80%82%E5%BA%94/)，
因此所有界面元素的尺寸必须按照750设计稿标注的像素大小来书写，程序会自动转换成rem单位
7. 腾讯云通信Web Sdk [参考链接](https://cloud.tencent.com/document/product/269/1594)

# 基础指令
``` bash
# install dependencies
npm install

# serve with hot reload at localhost:8080
npm run dev

# build for production with minification
npm run build

# build for production and view the bundle analyzer report
npm run build --report

# run unit tests
npm run unit

# run e2e tests
npm run e2e

# run all tests
npm test
```
# 目录结构说明（主要描述核心src目录，它包含了整个系统的所有源码和资源）
1. App.vue: web app的根组件。

2. config.js: 统一配置文件，包含腾讯IM的一些配置和所有请求URL的配置。
3. main.js: 项目启动的入口文件。
1. assets目录：图片、icon目录。
2. components： vue组件目录。
``` 
 # message/index.vue：聊天列表组件，接受一个messageLists数组，会渲染出一个聊天列表。
 
 # LoadingCircle.vue: 加载中状态，引用它会显示一个菊花形状的icon，主要用在发送消息的发送中状态。
 
 # LoadingPage.vue： 加载状态，首次进入应用时，加载资源完成、登录聊天服务器、获取历史聊天记录完成前会展示这个组件。
```
3. emotions： 表情目录，其中normal包含了所有的表情图片，name_to_face_normal.json是表情文本到表情图片的映射文件。
4. imLibs： 腾讯IM的sdk目录。
5. pages: 放置页面的目录。
```
# Index.vue: 聊天页面。
# History.vue: 历史聊天记录页面。
```
6. plugins： vue插件目录。
```
# axios.js: 主要功能是将axios(发送http请求)封装成Vue的插件，方便在项目中通过Vue（Vue.http)对象调用。
```
7. router： 前端路由配置目录。index.js包含了系统所有的前端路由，以及路由对应的页面。
8. store： 状态管理目录。
```
# chat.js: 一个store。
# index.js: 将分割的store模块合并。
# mutation-types.js: 所有的mutations都需要定义在这个文件中，方便统一管理。
```
9. style： css样式目录。
```
# emotions.less: 表情样式。
# mint-ui-used.css: mint-ui组件中使用到的样式，单独提取，然后修改以符合该系统的使用（主要是将里面的尺寸都乘以2）。
# swiper.css: swiper组件需要用到的样式，单独提取，然后修改以符合该系统的使用（主要是将里面的尺寸都乘以2）。
```
10. util：工具目录。
```
# analysisUrlParams.js: 解析url参数。
# msgFormate.js: 乐运营服务器获取的7天以外聊天记录，是比较原始的消息对象，需要用该工具转换成符合我们解析消息所需的Msg对象。
# timeFormate.js: 处理消息列表中时间的显示方式。
```
