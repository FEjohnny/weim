<template>
    <div>
        <div v-for="(msg, key) in messagesLists"
             :key="key"
             class="item"
             :id="msg.seq"
             :class="{own:msg.isSend}">
            <!--消息时间start-->
            <div class="time" v-if="msg.showTime">
                <span>{{ msg.showTime }}</span>
            </div>
            <!--消息时间end-->
            <div>
                <!--头像start-->
                <img v-if="msg.isSend"
                     :src="loginInfo.headurl"
                     onerror="this.src='https://www.jobchat.cn/static/home/images/icon_custom_default.png'"
                     class="head" alt="头像">
                <img v-else
                     :src="loginInfo.Seller_logo"
                     onerror="this.src='https://www.jobchat.cn/static/home/images/icon_custom_default.png'"
                     class="head" alt="头像">
                <!--头像start-->
                <!--消息内容start-->
                <div class="msg" :class="{msgImg:msg.type == typeImage}">
                    <span v-if="msg.type == typeText"
                          v-html="convertTextMsgToHtml(msg.content)"></span>
                    <span v-else
                          @click="viewHdPic((msg.content.getImage(imageLarge)).getUrl())"
                          v-html="convertImageMsgToHtml(msg.content)"></span>
                </div>
                <!--消息内容end-->
                <!--发送新消息的发送中状态-->
                <LoadingCircle v-if="msg.sending === 'sending'" class="message-sending" />
                <!--发送消息失败，显示重发按钮-->
                <i @click="sendMsgAgain(msg)"
                   v-if="msg.sending === 'failed'"
                   class="send-again-btn"></i>
            </div>
        </div>
        <div class="img-preview" v-show="imgPreviewUrl" @click="hidePreview">
            <div>
                <img :src="imgPreviewUrl" alt="">
            </div>
        </div>
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import LoadingCircle from '@/components/LoadingCircle';
    import webim from '../../imLibs/webim';
    import emotionsToImg from '../../emotions/name_to_face_normal';

    export default {
        name: 'Index',
        data() {
            return {
                typeImage: webim.MSG_ELEMENT_TYPE.IMAGE,
                typeText: webim.MSG_ELEMENT_TYPE.TEXT,
                imageLarge: webim.IMAGE_TYPE.LARGE,
                imgPreviewUrl: ''
            };
        },
        computed: {
            ...mapState('chat', ['messagesLists', 'loginInfo'])
        },
        methods: {
            ...mapActions('chat', ['sendMessage']),
            // 重新发送消息
            sendMsgAgain(msg) {
                this.sendMessage({ message: msg });
                setTimeout(() => {
                    document.documentElement.scrollTop = 9999999;
                    document.body.scrollTop = 9999999;
                }, 300);
            },
            // 解析文本消息，表情元素
            convertTextMsgToHtml(content) {
                let html = content.getText();
                const matches = html.match(/\[[^\]]+\]/g);
                if (matches && matches.length > 0) {
                    for (let i = 0; i < matches.length; i += 1) {
                        let name = emotionsToImg[matches[i]].split('.')[0];
                        if (/@/.test(name)) {
                            name = name.split('@')[0];
                        }
                        html = html.replace(matches[i], `<i class="icon_emotion emotion_${name}" ></i>`);
                    }
                }
                return html;
            },
            // 解析图片消息元素
            convertImageMsgToHtml(content) {
                const smallImage = content.getImage(webim.IMAGE_TYPE.SMALL); // 小图
                let bigImage = content.getImage(webim.IMAGE_TYPE.LARGE); // 大图
                let oriImage = content.getImage(webim.IMAGE_TYPE.ORIGIN); // 原图
                if (!bigImage) {
                    bigImage = smallImage;
                }
                if (!oriImage) {
                    oriImage = smallImage;
                }
                // 计算图片大小
                const imgW = smallImage.getWidth() || oriImage.getWidth();
                const imgH = smallImage.getHeight() || oriImage.getHeight();
                let showW;
                let showH;
                if (imgW >= imgH) {
                    showW = imgW > 200 ? 200 : imgW;
                    showH = imgH * (showW / imgW);
                } else {
                    showH = imgH > 200 ? 200 : imgH;
                    showW = imgW * (showH / imgH);
                }
                const _style = `display: block;width:${showW === 0 ? '100px' : `${showW}px`};height: ${showH === 0 ? '100px' : `${showH}px`}`;
                return `<img src="${smallImage.getUrl()}#${bigImage.getUrl()}#${oriImage.getUrl()}"
                        style="${_style}" />`;
            },
            viewHdPic(url) {
                this.imgPreviewUrl = url;
                document.body.style.overflow = 'hidden';
            },
            hidePreview() {
                this.imgPreviewUrl = '';
                document.body.style.overflow = 'auto';
            }
        },
        mounted() {
        },
        components: {
            LoadingCircle
        }
    };
</script>

<style scoped lang="less">
    /*头像到边缘的距离*/
    @side-dis: 24px;
    /*消息距离头像的距离*/
    @to-head-dis: 28px;
    /*消息之间的距离*/
    @message-dis: 32px;
    /*消息框的最大宽度*/
    @msg-box-max-width: 446px;
    .item {
        margin-top: @message-dis;
        position: relative;
        overflow: hidden;
        .time{
            margin-bottom: 32px;
            text-align: center;
            span{
                font-size: 22px;
                color: #FFFFFF;
                letter-spacing: 0;
                line-height: 26px;
                display: inline-block;
                background: #D8D8D8;
                border-radius: 8px;
                padding: 7px 20px;
            }
        }
        .head {
            float: left;
            margin-left: @side-dis;
            width: 80px;
            height: 80px;
            border-radius: 50%;
        }
        .msg {
            float: left;
            margin-left: @to-head-dis;
            max-width: @msg-box-max-width;
            font-size: 32px;
            padding: 20px;
            word-break: break-all;
            color: #394043;
            letter-spacing: 0;
            background: #FFFFFF;
            border: 1px solid #CCCCCC;
            border-radius: 16px;
            position: relative;
            line-height: 45px;
            &:before {
                content: '';
                zoom: 1;
                display: block;
                width: 0px;
                height: 0px;
                position: absolute;
                top: 28px;
                left: -12px;
                border-right: 12px solid #dddddd;
                border-left: 0px solid #dddddd;
                border-top: 14px solid transparent;
                border-bottom: 14px solid transparent;

            }
            &:after {
                content: '';
                zoom: 1;
                display: block;
                width: 0px;
                height: 0px;
                position: absolute;
                top: 28px;
                left: -10px;
                border-right: 12px solid #ffffff;
                border-left: 0px solid #ffffff;
                border-top: 14px solid transparent;
                border-bottom: 14px solid transparent;
            }
            span{
                display: block;
                max-width: 100%;
            }
        }
        &.own {
            .head {
                float: right;
                margin-right: @side-dis;
                margin-left: 0;
            }
            .msg {
                background: #008AFF;
                color: #ffffff;
                float: right;
                margin-right: @to-head-dis;
                &:before {
                    right: -11px;
                    left: auto;
                    border-left: 12px solid #008AFF;
                    border-right: 0px solid #008AFF;
                    border-top: 14px solid transparent;
                    border-bottom: 14px solid transparent;
                }
                &:after {
                    right: -10px;
                    left: auto;
                    border-left: 12px solid transparent;
                    border-right: 0px solid transparent;
                    border-top: 14px solid transparent;
                    border-bottom: 14px solid transparent;
                }
                img{
                    max-width: 100%;
                }
            }
        }
        .message-sending{
            float: right;
            position: relative;
            top: 23px;
        }
        .send-again-btn{
            width: 40px;
            height: 40px;
            padding: 23px;
            float: right;
            position: relative;
            left: 23px;
            &:after{
                content: '';
                zoom: 1;
                display: block;
                width: 40px;
                height: 40px;
                position: absolute;
                left: 23px;
                right: 23px;
                background: url("../../assets/icon_send_again.png") no-repeat;
                background-size: 100% 100%;
            }
        }
    }
    .img-preview{
        position: fixed;
        z-index: 1000;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        background: #333333;
        overflow-y: scroll;
        justify-content: center;
        justify-items: center;
        display: flex;
        flex-direction: column;
        div{
            text-align: center;
            img{
                width: auto;
                height: auto;
                flex-grow: 1;
                max-width: 100%;
                max-height: 100%;
            }
        }
    }
</style>
