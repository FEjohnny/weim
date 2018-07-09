<template>
    <div class="chat-container">
        <!--展示消息-->
        <div class="messages-wrap"
             ref="scrollContainer"
             @click="handleFocus">
            <mt-loadmore
                :top-method="getHistoryMessages"
                :top-all-loaded="allLoaded"
                :topDistance="50"
                :maxDistance="70"
                class="loadmore-wrapper"
                :class="{'dialog-open': showEmoticon || showMedia}"
                @top-status-change="handleTopChange"
                ref="loadmore">
                <!--查看更多历史记录按钮，从腾讯IM加载不到消息就显示这个按钮-->
                <router-link
                     v-if="messagesLists.length > 0 && allLoaded"
                     to="/history"
                     class="more-messages">查看更多历史记录</router-link>
                <!--消息start-->
                <Message :messagesLists="messagesLists"></Message>
                <!--消息end-->
                <!--下拉加载状态start-->
                <div slot="top" class="mint-loadmore-top">
                    <div v-if="!allLoaded">
                        <span v-show="topStatus === 'pull'">↓查看更多消息</span>
                        <span v-show="topStatus === 'drop'">↑释放查看更多</span>
                        <span v-show="topStatus === 'loading'">加载中...</span>
                    </div>
                    <div v-else>
                        <span>没啦，别拉了</span>
                    </div>
                </div>
                <!--下拉加载状态end-->
            </mt-loadmore>
        </div>
        <!--底部聊天输入框和表情，文件选择-->
        <div class="footer">
            <!--聊天栏-->
            <div class="top">
                <div class="message-wrapper">
                    <span>{{message}}</span>
                    <textarea v-model="message"
                              ref="messageInput"
                              class="message-input"
                              @click="handleFocus"
                              @focus="handleFocus">
                    </textarea>
                </div>
                <i class="icon icon-emation" @click="toggleEmoticon"></i>
                <i class="icon icon-add" @click="toggleMedia"></i>
                <span class="send-message-btn" @click="handleSend">发送</span>
            </div>
            <!--表情start-->
            <div class="emoticons-wrap" :class="{show:showEmoticon}">
                <swiper :options="swiperOption" class="emoticons-content" ref="mySwiper">
                    <!-- slides -->
                    <swiper-slide v-for="(item, index) in emotions"
                                  :key="index"
                                  class="emotions-wrapper">
                        <span  v-for="(emotion,key) in item"
                               @click="addEmotion(emotion[0])"
                               :key="key">
                            <i class="icon_emotion"
                               :class="`emotion_${emotion[1]}`"></i>
                        </span>
                    </swiper-slide>
                    <!-- Optional controls -->
                    <div class="swiper-pagination" slot="pagination"></div>
                </swiper>
            </div>
            <!--表情end-->
            <!--发送图片start-->
            <div class="emoticons-wrap" :class="{show:showMedia}">
                <ul class="upload-file-wrap">
                    <li class="item">
                        <label for="uploadImgDefault">
                            <input @change="uploadChange"
                                   type="file" id="uploadImgDefault" accept="image/*">
                            <span class="icon icon_upload_img"></span>
                            <span class="text">照片</span>
                        </label>
                    </li>
                    <li class="item">
                        <label for="uploadImgCamera">
                            <input @change="uploadChange"
                                   type="file" id="uploadImgCamera"
                                   accept="image/*" capture="camcorder">
                            <span class="icon icon_camera"></span>
                            <span class="text">拍照</span>
                        </label>
                    </li>
                </ul>
            </div>
            <!--发送图片end-->
        </div>
        <!--加载中-->
        <LoadingPage v-if="loadingText" :loadingText="loadingText"></LoadingPage>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import { swiper, swiperSlide } from 'vue-awesome-swiper';
    import Message from '@/components/message';
    import LoadingPage from '@/components/LoadingPage';
    import emotionJson from '../emotions/name_to_face_normal';

    export default {
        name: 'Index',
        data() {
            return {
                message: '', // 消息框输入的消息
                swiperOption: {
                    pagination: {
                        el: '.swiper-pagination',
                        dynamicBullets: true
                    }
                },
                showEmoticon: false, // 显示选择表情
                showMedia: false, // 显示上传图片等
                topStatus: '',
                allLoaded: false,
                emotions: [], // 所有表情，每一个元素的格式：['[微笑]', 011]
                loadingText: '' // 加载状态文字
            };
        },
        created() {
            const vm = this;
            // 获取用户信息
            this.loadingText = '连接客服中...';
            this.getIdentifierToken().then(() => {
                // 并登陆腾旭IM聊天服务器
                vm.loginIm({
                    onConnNotify: vm.onConnNotify,
                    jsonpCallback: vm.jsonpCallback,
                    onMsgNotify: vm.onMessageNotify,
                    onKickedEventCall: vm.onKickedEventCall,
                    onC2cEventNotifys: { // 监听C2C系统消息通道
                        '92': vm.onMsgReadedNotify, // 消息已读通知,
                        '96': null
                    }
                }).then(() => {
                    // 获取历史消息
                    this.loadingText = '获取历史聊天记录中...';
                    vm.getHistoryMessages();
                }).catch((err) => {
                    this.loadingText = '登录失败';
                    alert(`登录IM服务器失败：${err.ErrorInfo}`);
                });
            }).catch((err) => {
                this.loadingText = '获取token失败';
                alert(`获取token失败：${err.ErrorInfo}`);
            });
            // 解析表情元素
            const _tempEmotions = [];
            const EACHPAGEMAX = 23; // 每页最多显示的表情数24
            let _emotions = [];
            Object.keys(emotionJson).forEach((item) => {
                if (_emotions.length < EACHPAGEMAX) {
                    let emotionPicName = emotionJson[item].split('.')[0];
                    if (/@/.test(emotionPicName)) {
                        emotionPicName = emotionPicName.split('@')[0];
                    }
                    _emotions.push([item, emotionPicName]);
                } else {
                    _emotions.push(['删除', 'emotion_del_normal']);
                    _tempEmotions.push(_emotions);
                    _emotions = [];
                }
            });
            this.emotions = _tempEmotions;
        },
        mounted() {},
        components: {
            swiper, swiperSlide, Message, LoadingPage
        },
        computed: {
            ...mapState('chat', ['loginInfo', 'wxInfo', 'messagesLists']),
            swiper() {
                return this.$refs.mySwiper.swiper;
            }
        },
        methods: {
            ...mapActions('chat', [
                'getIdentifierToken',
                'loginIm',
                'onConnNotify',
                'jsonpCallback',
                'onMsgNotify',
                'sendMessage',
                'sendPicMessage',
                'getLastC2CHistoryMsgs',
                'uploadPic',
                'onProgressCallBack',
                'resetUploadOptions',
                'onMsgReadedNotify',
                'onKickedEventCall'
            ]),
            // 监听新消息
            onMessageNotify(newMsgList) {
                this.onMsgNotify(newMsgList);
                setTimeout(() => {
                    this.scrollTopBottom();
                }, 100);
            },
            // 上传照片
            uploadChange(e) {
                const _this = this;
                const file = e.target.files[0];
                console.log(file);
                if (!file) {
                    return;
                } else if (!/image.(png|jpg|jpeg|bmp)/.test(file.type)) {
                    alert('图片格式错误');
                    return;
                } else if (file.size > 10 * 1024 * 1024) { // 图片不能大于1M
                    alert('图片大小不能大于5M');
                    return;
                }
                this.showMedia = false;
                this.showEmoticon = false;
                this.uploadPic({
                    file: file,
                    onProgressCallBack: _this.onProgressCallBack
                }).then((res) => {
                    // 上传成功，发送图片
                    console.log('图片上传成功');
                    _this.sendPicMessage(res);
                    setTimeout(() => {
                        _this.scrollTopBottom();
                    }, 300);
                }).catch((err) => {
                    alert(`图片上传失败:${err.ErrorInfo}`);
                    _this.resetUploadOptions();
                });
            },
            // 添加表情
            addEmotion(emotionsName) {
                if (emotionsName !== '删除') {
                    const msg = this.message + emotionsName;
                    this.message = msg;
                } else {
                    // 操作删除按钮,匹配输入的消息是否以‘[微笑]’表情格式结尾
                    const _match = this.message.match(/\[[^\]]+\]$/);
                    if (_match && _match.length > 0) {
                        this.message = this.message.slice(0, _match.index);
                    } else {
                        this.message = this.message.slice(0, this.message.length - 1);
                    }
                }
            },
            // 发送消息
            handleSend() {
                // 收起弹窗
                this.showMedia = false;
                this.showEmoticon = false;
                const msg = this.message;
                this.message = ''; // 清空聊天输入框
                this.sendMessage({ message: msg });
                setTimeout(() => {
                    this.scrollTopBottom();
                }, 300);
            },
            // 滚动到页面底部通用方法
            scrollTopBottom() {
                document.documentElement.scrollTop = 9999999;
                document.body.scrollTop = 9999999;
            },
            // 显示或者收起表情
            toggleEmoticon() {
                this.scrollTopBottom();
                this.showEmoticon = !this.showEmoticon;
                this.showMedia = false;
            },
            // 显示或者收起发送文件
            toggleMedia() {
                this.scrollTopBottom();
                this.showMedia = !this.showMedia;
                this.showEmoticon = false;
            },
            // 输入框获得焦点时，收起下面的表情或者上传区域
            handleFocus() {
                this.showMedia = false;
                this.showEmoticon = false;
            },
            // 获取历史消息方法
            getHistoryMessages() {
                const _this = this;
                // 加载更多数据 是否还有更多
                if (!_this.allLoaded) {
                    this.getLastC2CHistoryMsgs().then((res) => {
                        // 是否还有历史消息可以拉取，1-表示没有，0-表示有
                        this.loadingText = '';
                        const complete = res.Complete;
                        // 返回的消息条数，小于或等于请求的消息条数，小于的时候，说明没有历史消息可拉取了
                        // const retMsgCount = res.MsgCount;
                        if (complete === 1) {
                            _this.allLoaded = true;
                        }
                        _this.$refs.loadmore.onTopLoaded();
                        let preEle;
                        let scrollTop;
                        if (res.scrollTop && res.preId) { // 拉去历史记录后，保持滚动条的位置
                            preEle = document.getElementById(res.preId);
                            scrollTop = preEle.offsetTop - ((Number(document.documentElement.style.fontSize.replace('px', '')) / 75) * 32);
                            document.documentElement.scrollTop = scrollTop;
                            document.body.scrollTop = scrollTop;
                        } else if (res.scrollDown && res.preId) { // 首次历史消息，滚到底部
                            _this.scrollTopBottom();
                        }
                    }).catch((err) => {
                        console.log(`拉取历史消息出错:${err.ErrorInfo}`);
                    });
                } else {
                    this.loadingText = '';
                    this.$refs.loadmore.onTopLoaded();
                }
            },
            handleTopChange(status) {
                this.topStatus = status;
            }
        }
    };
</script>

<style lang="less" scoped>
    .chat-container {
        .loadmore-wrapper{
            padding-bottom: 132px;
            &.dialog-open{
                padding-bottom: 492px;
            }
        }
        .footer {
            position: fixed;
            bottom: 0;
            left: 0;
            right: 0;
            background: #F6F6F8;
            .top {
                padding: 14px 144px 14px 156px;
                position: relative;
                box-sizing: border-box;
                z-index: 100;
                .message-wrapper {
                    position: relative;
                    .message-input, span {
                        line-height: 50px;
                        font-size: 28px;
                        padding: 10px;
                        color: #394043;
                        outline: none;
                        border-radius: 16px;
                        box-sizing: border-box;
                        word-break: break-all;
                        width: 100%;
                    }
                    span {
                        display: block;
                        visibility: hidden;
                        min-height: 72px;
                        max-height: 201px;
                    }
                    .message-input {
                        overflow: hidden;
                        position: absolute;
                        top: 0;
                        left: 0;
                        height: 100%;
                        resize: none;
                        overflow-y: visible;
                        background: #FFFFFF;
                        border: 1px solid #E5E5E5;
                        box-shadow: none;
                        outline: none;
                        -webkit-appearance: none;
                        -webkit-tap-highlight-color: rbga(0, 0, 0, 0);
                    }
                }
                .icon {
                    width: 48px;
                    height: 48px;
                    position: absolute;
                    bottom: 26px;
                    display: block;
                    &.icon-emation {
                        left: 20px;
                        background: url("../assets/icon_emotion.png") no-repeat;
                        background-size: 100% 100%;
                    }
                    &.icon-add {
                        left: 88px;
                        background: url("../assets/icon_add.png") no-repeat;
                        background-size: 100% 100%;
                    }
                }
                .send-message-btn {
                    background: #008AFF;
                    border-radius: 8px;
                    display: inline-block;
                    width: 104px;
                    height: 72px;
                    line-height: 72px;
                    font-size: 32px;
                    color: #FFFFFF;
                    position: absolute;
                    bottom: 14px;
                    right: 20px;
                    text-align: center;
                }
            }
            .emoticons-wrap {
                height: 0px;
                border-top: 1px solid #CCCCCC;
                transition: height 0.3s ease-in-out;
                &.show{
                    height: 360px;
                }
                .emoticons-content {
                    height: 100%;
                }
                .upload-file-wrap{
                    padding: 40px 0 0 72px;
                    .item{
                        list-style-type: none;
                        margin-right: 68px;
                        display: inline-block;
                        label{
                            display: inline-block;
                            width: 120px;
                            input{
                                display: none;
                            }
                            .icon{
                                display: block;
                                height: 120px;
                                &.icon_upload_img{
                                    background: url("../assets/icon_upload_img.png") no-repeat;
                                    background-size: 100% 100%;
                                }
                                &.icon_camera{
                                    background: url("../assets/icon_camera.png") no-repeat;
                                    background-size: 100% 100%;
                                }
                            }
                            .text{
                                display: block;
                                padding-top: 16px;
                                text-align: center;
                                font-size: 24px;
                                color: #9C9FA1;
                                letter-spacing: 0;
                            }
                        }
                    }
                }
            }
        }
    }
    .more-messages{
        text-decoration: none;
        display: block;
        text-align: center;
        padding: 30px 0 10px;
        font-size: 28px;
        color: #008AFF;
    }
    .icon_down{
        transition: transform 0.2s;
    }
    .icon_rotate{
        transform: rotate(180deg);
    }
    .emotions-wrapper{
        display: flex;
        flex-wrap: wrap;
        padding: 23px;
        box-sizing: border-box;
        span{
            display: block;
            width: 82px;
            height: 82px;
            line-height: 82px;
            text-align: center;
            i{
                width: 50px;
                height: 50px;
                &.emotion_emotion_del_normal{
                    height: 38px!important;
                }
            }
        }
    }
</style>
