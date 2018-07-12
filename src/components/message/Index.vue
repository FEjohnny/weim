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
            <!--展示商品 属于本地添加的一个消息体start-->
            <div v-if="msg.type === 'customGoods' " class="show-good-wrap">
                <img class="goods-img" :src="msg.content.goodsImageUrl" alt="商品图片">
                <p class="name">{{msg.content.goodsName}}</p>
                <p class="price"><span>￥</span>{{msg.content.goodsPrice}}</p>
                <p class="send-good-btn"><span @click="handleSendGoodsMsg">发送商品</span></p>
            </div>
            <!--展示商品 属于本地添加的一个消息体end-->
            <div v-else>
                <!--头像start-->
                <img v-if="msg.isSend"
                     :src="loginInfo.headurl"
                     class="head" alt="头像">
                <img v-else
                     :src="loginInfo.Seller_logo"
                     class="head" alt="头像">
                <!--头像start-->
                <!--消息内容start-->
                <div class="msg"
                     :class="{msgImg:msg.type == typeImage,goods:msg.type == typeCustom}">
                    <span v-if="msg.type == typeText"
                          v-html="convertTextMsgToHtml(msg.content)"></span>
                    <span v-else-if="msg.type == typeImage"
                          @click="viewHdPic((msg.content.getImage(imageLarge)).getUrl())"
                          v-html="convertImageMsgToHtml(msg.content)"></span>
                    <a v-else-if="msg.type == typeCustom"
                       :href="convertGoodsMsg(msg.content, 'oringinUrl')"
                       class="goods-wrap">
                        <img class="goods-img"
                             :src="convertGoodsMsg(msg.content, 'goodsImageUrl')"
                             alt="商品图片">
                        <span class="name">{{convertGoodsMsg(msg.content, 'goodsName')}}</span>
                        <span class="price">
                            <span>￥</span>{{convertGoodsMsg(msg.content, 'goodsPrice')}}
                        </span>
                    </a>
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
        <!--上传图片start-->
        <div class="item own" v-if="uploadOptions.size > 0">
            <img :src="loginInfo.headurl" class="head" alt="头像">
            <!--消息内容start-->
            <div class="msg msgImg upload-item">
                <span class="upload-state">
                    <i>{{uploadOptions.progress}}</i>
                    <span class="float" :style="{height:uploadOptions.progress}"></span>
                    <span class="default-img"></span>
                </span>
            </div>
        </div>
        <!--上传图片end-->
        <!--图片预览start-->
        <div class="img-preview" :class="{show:imgPreviewUrl}" @click="hidePreview">
            <div>
                <img :src="imgPreviewUrl" alt="">
            </div>
        </div>
        <!--图片预览end-->
    </div>
</template>

<script>
    import { mapState, mapActions } from 'vuex';
    import LoadingCircle from '@/components/LoadingCircle';
    import webim from '../../imLibs/webim';
    import emotionsToImg from '../../emotions/name_to_face_normal';

    export default {
        name: 'Index',
        props: ['messagesLists'],
        data() {
            return {
                typeImage: webim.MSG_ELEMENT_TYPE.IMAGE,
                typeText: webim.MSG_ELEMENT_TYPE.TEXT,
                typeCustom: webim.MSG_ELEMENT_TYPE.CUSTOM,
                imageLarge: webim.IMAGE_TYPE.LARGE,
                imgPreviewUrl: ''
            };
        },
        computed: {
            ...mapState('chat', ['loginInfo', 'uploadOptions'])
        },
        methods: {
            ...mapActions('chat', ['sendMessage', 'sendGoodsMsg']),
            // 发送商品消息
            handleSendGoodsMsg() {
                this.sendGoodsMsg();
                setTimeout(() => {
                    document.documentElement.scrollTop = 9999999;
                    document.body.scrollTop = 9999999;
                }, 300);
            },
            // 重新发送消息
            sendMsgAgain(msg) {
                if (msg.type === 'TIMCustomElem') {
                    this.sendGoodsMsg(msg);
                } else {
                    this.sendMessage({ message: msg });
                }
                setTimeout(() => {
                    document.documentElement.scrollTop = 9999999;
                    document.body.scrollTop = 9999999;
                }, 300);
            },
            // 解析自定义商品消息
            convertGoodsMsg(content, parse) {
                let data;
                if (content.getData()) {
                    data = JSON.parse(content.getData());
                } else {
                    return '';
                }
                if (data[parse]) {
                    return data[parse];
                } else if (data.Body && data.Body[parse]) {
                    return data.Body[parse];
                }
                return '';
            },
            // 解析文本消息，表情元素
            convertTextMsgToHtml(content) {
                let html = content.getText();
                const matches = html.match(/\[[^\]]+\]/g);
                if (matches && matches.length > 0) {
                    for (let i = 0; i < matches.length; i += 1) {
                        if (emotionsToImg[matches[i]]) {
                            let name = emotionsToImg[matches[i]].split('.')[0];
                            if (/@/.test(name)) {
                                name = name.split('@')[0];
                            }
                            html = html.replace(matches[i], `<i class="icon_emotion emotion_${name}" ></i>`);
                        }
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
            // 预览图片
            viewHdPic(url) {
                this.imgPreviewUrl = url;
                document.body.style.overflow = 'hidden';
            },
            // 取消预览图片
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
            transition: left 200ms, right 200ms;
            &.upload-item{
                padding: 6px;
            }
            &.goods{
                background: #ffffff!important;
                &:before {
                    border-left: 12px solid #ffffff!important;
                    border-right: 0px solid #ffffff!important;
                    border-top: 14px solid transparent;
                    border-bottom: 14px solid transparent;
                }
            }
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
            .goods-wrap{
                position: relative;
                display: block;
                padding-left: 135px;
                text-decoration: none;
                .goods-img{
                    width: 120px;
                    height: 120px;
                    position: absolute;
                    left: 0;
                    top: 0;
                }
                .name{
                    font-size: 28px;
                    color: #2E2E2E;
                    overflow: hidden;
                    text-overflow: ellipsis;
                    white-space: nowrap;
                    padding-bottom: 36px;
                }
                .price{
                    display: inline;
                    font-size: 36px;
                    color: #FF6A00;
                    span{
                        display: inline;
                        font-size: 24px;
                    }
                }
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
    .upload-state{
        font-size: 24px;
        color: #ffffff;
        position: relative;
        line-height: 1em;
        z-index: 0;
        &:before{
            content: '上传中';
            zoom: 1;
            position: absolute;
            z-index: 12;
            left: 50%;
            top: 40%;
            transform: translate(-50%,-50%);
        }
        i{
            position: absolute;
            z-index: 12;
            left: 50%;
            top: 50%;
            font-style: normal;
            transform: translate(-50%,-50%);
        }
        .float{
            content: '';
            zoom: 1;
            position: absolute;
            left: 0;
            height: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,.7);
            z-index: 11;
        }
        .default-img{
            display: block;
            width: 200px;
            height: 300px;
        }
    }
    @keyframes handleScale {
        from {
            transform: scale(0,0);
        } to {
            transform: scale(1,1);
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
        transition: transform 200ms;
        transform: scale(0,0);
        transform-origin: 50% 50%;
        &.show{
            transform: scale(1,1);
        }
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
    .show-good-wrap{
        padding: 24px 24px 24px 168px;
        box-sizing: border-box;
        position: relative;
        background: #ffffff;
        .goods-img{
            width: 120px;
            height: 120px;
            position: absolute;
            top: 24px;
            left: 24px;
        }
        .name{
            font-size: 28px;
            color: #394043;
            letter-spacing: 0.5px;
            line-height: 34px;
            height: 68px;
            overflow: hidden;
        }
        .price{
            margin: 20px 0 30px;
            font-size: 36px;
            color: #FF6A00;
            line-height: 36px;
        }
        .send-good-btn{
            text-align: center;
            span{
                font-size: 28px;
                color: #FF6A00;
                line-height: 56px;
                display: inline-block;
                border: 2px solid #FF6A00;
                border-radius: 8px;
                padding: 0 55px;
            }
        }
    }
</style>
