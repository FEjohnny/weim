import Vue from 'vue';
import webim from '@/imLibs/webim';
import * as config from '../config';
import * as types from './mutation-types';
import * as timeFormate from '@/util/timeFormate';
import msgFormate from '@/util/msgFormate';

export default {
    namespaced: true,
    state: {
        accountMode: 0, // 帐号模式，0-表示独立模式，1-表示托管模式
        wxInfo: { // 用户从商场进入聊天页带过来的信息
            openId: '', // 用户openId
            mallId: '', // 店铺id  5b39c3261e663f47311e30e1
            oringinUrl: '', // 来源链接
            goodsId: '', // 商品id
            goodsName: '', // 商品名称
            goodsPrice: '', // 商品价格
            goodsImageUrl: '' // 商品图片
        },
        loginInfo: { // 会话双方的信息和token信息
            SdkAppId: '', // 用户所属应用id,必填
            Seller_identifier: '', // 卖家客服的identifier
            Seller_logo: '', // 卖家客服的头像
            Seller_name: '', // 卖家客服的名称
            UserSig: '', // 买家账号的UserSig
            access_token: '', // token
            accountType: '', // 用户所属应用帐号类型，必填
            expire_in: '', // token过期时间
            identifier: '', // 买家账号的identifier
            refresh_token: '', // 刷新token
            refresh_token_expire_in: '' // 刷新token过期时间
        },
        messagesLists: [], // 消息数组，结构为[Msg]
        historyMessagesLists: [], // 消息数组，结构为[Msg]
        lastedShowTime: '', // 保存最新消息的展示时间
        // 用于下次向前拉取历史消息
        lastMsg: {
            time: 0, // 最前一条消息的时间，，第一次拉取好友历史消息时，必须传 0
            key: '' // 最前一条消息的消息Key，用于下次向前拉取历史消息
        },
        // 上传图片参数
        uploadOptions: {
            size: 0, // 总大小
            uploadedSize: 0, // 已上传大小
            progress: 0, // 上传进度“10%”
            url: '' // 图片本地预览地址
        }
    },
    gettter: {},
    mutations: {
        // 设置wxinfo
        [types.SET_WXINFO](state, payload) {
            console.log('链接地址上的url参数');
            console.log(payload);
            // `openId=okmGDuIEV-HYe0uF_xD4SoQLoomc&mallId=5a0059671e663f7fef78683f&oringinUrl=http://www.baidu.com&goodsId=20&goodsName=日版冠军墨镜超级牛逼&goodsPrice=115&goodsImageUrl=http://f0.topitme.com/0/05/be/11269838091bfbe050o.jpg`
            state.wxInfo = payload;
        },
        // 更新会话双方的信息和token信息
        [types.UPDATE_LOGIN_INFO](state, payload) {
            state.loginInfo = payload;
        },
        // 更新用户登录IM服务器之后的头像和昵称
        [types.UPDATE_WX_INFO](state, payload) {
            // 将空格和换行符转换成HTML标签
            state.loginInfo.identifierNick = webim.Tool.formatText2Html(payload.identifierNick) ||
                webim.Tool.formatText2Html(payload.identifier);
            state.loginInfo.headurl = webim.Tool.formatText2Html(payload.headurl) ||
                'https://www.jobchat.cn/static/home/images/icon_custom_default.png';
        },
        // 拉取历史消息，unshift到消息列表中
        [types.APPEND_HISTORY_MESSAGES_INTO_LISTS](state, payload) {
            // payload数组是最新的消息在最后面
            const msg = timeFormate.historyMsgTimeFormate(payload);
            state.messagesLists = msg.concat(state.messagesLists);
            state.historyMessagesLists = msg.concat(state.historyMessagesLists);
        },
        // 往消息列表新增一条消息
        [types.PUSH_NEW_MESSAGE_INTO_LISTS](state, payload) {
            const msg = payload;
            const res = timeFormate.newMsgTimeFormate(msg.time, state.lastedShowTime, 'single');
            msg.showTime = res.showTime;
            state.lastedShowTime = res.lastedShowTime;
            state.messagesLists.push(msg);
            state.historyMessagesLists.push(msg);
        },
        // 更新最前一条消息的时间和key信息
        [types.UPDATE_LAST_MESSAGE_TIME_KEY](state, payload) {
            state.lastMsg = payload;
        },
        // 更新某一条消息的发送状态
        [types.UPDATE_MSG_SENDING_STATUS](state, payload) {
            for (let i = state.messagesLists.length; i > 0; i += 1) {
                if (state.messagesLists[i - 1].seq === payload.seq) {
                    state.messagesLists[i - 1].sending = payload.sending;
                    break;
                }
            }
        },
        // 删除某一条消息
        [types.DELETE_MSG_SEND_FAILED](state, payload) {
            for (let i = state.messagesLists.length; i > 0; i += 1) {
                if (state.messagesLists[i - 1].seq === payload.seq) {
                    state.messagesLists.splice(i - 1, 1);
                    break;
                }
            }
        },
        // 上传图片状态size更新
        [types.UPDATE_UPLOAD_IMG_SIZE](state, payload) {
            state.uploadOptions.size = payload;
        },
        // 上传图片状态更新已上传的大小以及百分比
        [types.UPDATE_UPLOAD_IMG_UPLOADED](state, payload) {
            const options = payload;
            options.size = state.uploadOptions.size;
            state.uploadOptions = options;
        },
        // 上传图片，更新预览图片地址
        [types.UPDATE_UPLOAD_IMG_URL](state, payload) {
            state.uploadOptions.url = payload;
        },
        // 设置商品信息
        [types.SET_GOODS_INFO](state, payload) {
            const goods = payload;
            const res = timeFormate.newMsgTimeFormate(goods.time, state.lastedShowTime, 'single');
            goods.showTime = res.showTime;
            state.lastedShowTime = res.lastedShowTime;
            state.messagesLists.push(goods);
        },
        // 拉取历史消息，unshift到历史消息列表中
        [types.APPEND_HISTORY_MESSAGES_INTO_HISTORY_LISTS](state, payload) {
            // payload数组是最新的消息在最后面
            const msg = timeFormate.historyMsgTimeFormate(payload);
            state.historyMessagesLists = msg.concat(state.historyMessagesLists);
        }
    },
    actions: {
        // 设置商品信息
        setGoodsInfo({ commit, state }) {
            commit(types.SET_GOODS_INFO, {
                content: state.wxInfo,
                time: new Date().getTime() / 1000,
                showTime: '',
                seq: '',
                type: 'customGoods' // 消息类型
            });
        },
        // setWxInfo
        setWxInfo({ commit }, wxInfo) {
            commit(types.SET_WXINFO, wxInfo);
        },
        // 获取会话双方的identifier和token信息
        getIdentifierToken({ commit, state }) {
            return new Promise((resolve, reject) => {
                const { openId, mallId } = state.wxInfo;
                Vue.http.post(config.REQUEST_IDENTIFIER_TOKEN, {
                    openId, mallId
                }).then((loginInfo) => {
                    // 更新会话双方的信息和token信息
                    commit(types.UPDATE_LOGIN_INFO, loginInfo);
                    console.log('获取会话双方的identifier和token信息');
                    console.log(loginInfo);
                    resolve(loginInfo);
                }).catch((error) => {
                    reject(error);
                });
            });
        },
        // 登录腾讯IM聊天服务器
        loginIm({ commit, state }, listeners) {
            // 监听事件
            const loginInfo = {
                sdkAppID: state.loginInfo.SdkAppId, // 用户所属应用id,必填
                identifier: state.loginInfo.identifier, // 当前用户ID,必须是否字符串类型，必填
                accountType: state.loginInfo.accountType, // 用户所属应用帐号类型，必填
                userSig: state.loginInfo.UserSig, // 当前用户身份凭证，必须是字符串类型，必填
                identifierNick: '', // 当前用户昵称，不用填写，登录接口会返回用户的昵称，如果没有设置，则返回用户的id
                headurl: '' // 当前用户默认头像，选填，如果设置过头像，则可以通过拉取个人资料接口来得到头像信息
            };
            return new Promise((resolve, reject) => {
                webim.login(
                    loginInfo, listeners, config.LOGIN_IM_OPTIONS,
                    (res) => {
                        // 登录成功，更新用户昵称和头像
                        commit(types.UPDATE_WX_INFO, res);
                        console.log('======================IM服务器登录成功==========================');
                        console.log(res);
                        resolve(res);
                    }, (err) => {
                        console.log('======================IM服务器登录失败==========================');
                        console.log(err.ErrorInfo);
                        reject(err);
                    }
                );
            });
        },
        // 监听连接状态回调变化事件
        onConnNotify({ commit }, resp) {
            let info;
            switch (resp.ErrorCode) {
            case webim.CONNECTION_STATUS.ON:
                console.log(`建立连接成功: ${resp.ErrorInfo}`);
                break;
            case webim.CONNECTION_STATUS.OFF:
                info = `连接已断开，无法收到新消息，请检查下你的网络是否正常: ${resp.ErrorInfo}`;
                console.log(info);
                break;
            case webim.CONNECTION_STATUS.RECONNECT:
                info = `连接状态恢复正常: ${resp.ErrorInfo}`;
                console.log(info);
                break;
            default:
                console.log(`未知连接状态: = ${resp.ErrorInfo}`);
                break;
            }
        },
        // IE9(含)以下浏览器用到的jsonp回调函数，
        jsonpCallback({ commit }, rspData) {
            webim.setJsonpLastRspData(rspData);
        },
        // 监听新消息(私聊，普通群(非直播聊天室)消息，全员推送消息)事件，必填
        onMsgNotify({ commit, state }, newMsgList) {
            // newMsgList 为新消息数组，结构为[Msg]
            console.log('收到新消息');
            console.log(newMsgList);
            let newMsg; // 一条新消息对象
            let selSess; // 当前消息所属聊天对象
            let selToID; // 当前消息所属聊天对象的id,即消息的接收者
            // let selType; // 当前消息所属聊天对象的type, 私聊或者群聊

            // 获取所有聊天会话
            // const sessMap = webim.MsgStore.sessMap();
            Object.keys(newMsgList).forEach((key) => {
                newMsg = newMsgList[key];
                selToID = newMsg.getSession().id();
                // selType = selSess.type();

                if (selToID === state.loginInfo.Seller_identifier) {
                    selSess = newMsg.getSession();
                    // 在聊天窗体中新增一条消息
                    commit(types.PUSH_NEW_MESSAGE_INTO_LISTS, {
                        content: newMsg.getElems()[0].getContent(),
                        isSend: newMsg.getIsSend(),
                        time: newMsg.getTime(),
                        showTime: '',
                        seq: newMsg.getSeq(),
                        type: newMsg.getElems()[0].getType() // 消息类型
                    });
                }
            });
            // 消息已读上报，以及设置会话自动已读标记
            webim.setAutoRead(selSess, true, true);
        },
        // 发送文本（表情）消息,
        // message可能是普通文本，或者文本+表情，也可能是发送失败的消息展示体
        sendMessage({ commit, state }, { message }) {
            let msgContent;
            // 重新发送消息
            if (typeof message === 'object') {
                msgContent = message.content;
                // 本地删除之前发送失败的消息
                commit(types.DELETE_MSG_SEND_FAILED, message);
            } else {
                msgContent = message;
            }

            if (!state.loginInfo.Seller_identifier) {
                alert('你还没有选中好友或者群组，暂不能聊天');
                return;
            }
            // 获取消息内容长度
            const msgLen = webim.Tool.getStrBytes(msgContent);
            if (msgContent.length < 1) {
                return;
            }
            const maxLen = webim.MSG_MAX_LENGTH.C2C;
            const errInfo = `消息长度超出限制(最多${Math.round(maxLen / 3)}个汉字)`;
            if (msgLen > maxLen) {
                console.log(errInfo);
                return;
            }
            // 会话对象Session
            // 'C2C': 'C2C', //私聊
            // 'GROUP': 'GROUP' //群聊
            const selType = 'C2C';
            const selSess = new webim.Session(
                selType, // 会话类型， 包括群聊和私聊，具体参考webim.SESSION_TYPE常量对象，必填
                state.loginInfo.Seller_identifier, // 对方id , 群聊时，为群id；私聊时，对方帐号，必填
                state.loginInfo.Seller_name, // 对方名称，群聊时，为群名称；私聊时，为对方昵称，暂未使用，选填
                '', // 对方头像url，暂未使用，选填
                Math.round(new Date().getTime() / 1000) // 当前会话中的最新消息的时间戳，unix timestamp格式，暂未使用，选填
            );

            const isSend = true; // 是否为自己发送
            const seq = -1; // 消息序列，-1表示sdk自动生成，用于去重
            const random = Math.round(Math.random() * 4294967296); // 消息随机数，用于去重
            const msgTime = Math.round(new Date().getTime() / 1000); // 消息时间戳
            let subType; // 消息子类型
            if (selType === webim.SESSION_TYPE.C2C) {
                subType = webim.C2C_MSG_SUB_TYPE.COMMON;
            } else {
                // webim.GROUP_MSG_SUB_TYPE.COMMON-普通消息,
                // webim.GROUP_MSG_SUB_TYPE.LOVEMSG-点赞消息，优先级最低
                // webim.GROUP_MSG_SUB_TYPE.TIP-提示消息(不支持发送，用于区分群消息子类型)，
                // webim.GROUP_MSG_SUB_TYPE.REDPACKET-红包消息，优先级最高
                subType = webim.GROUP_MSG_SUB_TYPE.COMMON;
            }
            // 消息对象Msg
            const msg = new webim.Msg(
                selSess, // 消息所属的会话(e.g:我与好友A的C2C会话，我与群组G的GROUP会话) webim.Session
                isSend, // 消息是否为自己发送标志: true：表示是我发出消息, false：表示是发给我的消息
                seq, // 消息序列号，用于消息判重
                random, // 消息随机数，用于消息判重
                msgTime, // 消息时间戳，unix timestamp格式
                state.loginInfo.identifier, // 消息发送者帐号
                subType, // 消息子类型
                state.loginInfo.identifierNick // 消息发送者昵称，用户没有设置昵称时，则为发送者帐号
            );

            // 解析文本和表情
            const textObj = new webim.Msg.Elem.Text(msgContent);
            msg.addText(textObj);
            msg.PushInfo = {
                PushFlag: 0,
                Desc: '测试离线推送内容', // 离线推送内容
                Ext: '测试离线推送透传内容', // 离线推送透传内容
                AndroidInfo: {
                    Sound: 'android.mp3' // 离线推送声音文件路径。
                },
                ApnsInfo: {
                    Sound: 'apns.mp3', // 离线推送声音文件路径。
                    BadgeMode: 1
                }
            };

            msg.PushInfoBoolean = true; // 是否开启离线推送push同步
            msg.sending = 1;
            msg.originContent = msgContent;

            // 将消息发送到自己的窗口
            // 如果是群里就不需要，会收到自己发的消息
            const showMsg = {
                content: msg.getElems()[0].getContent(),
                isSend: msg.getIsSend(),
                time: msg.getTime(),
                showTime: '',
                seq: msg.getSeq(),
                sending: 'sending', // 正在发送中，标识消息是否发送成功
                type: msg.getElems()[0].getType() // 消息类型
            };
            commit(types.PUSH_NEW_MESSAGE_INTO_LISTS, showMsg);
            // 发送消息
            webim.sendMsg(msg, () => {
                // 消息发送成功
                showMsg.sending = 'success';
                commit(types.UPDATE_MSG_SENDING_STATUS, showMsg);
                webim.Tool.setCookie(`tmpmsg_${state.loginInfo.Seller_identifier}`, '', 0);
            }, (err) => {
                console.log(err);
                // 消息发送失败
                showMsg.sending = 'failed';
                commit(types.UPDATE_MSG_SENDING_STATUS, showMsg);
            });
        },
        // 发送图片消息
        sendPicMessage({ commit, state }, images) {
            if (!state.loginInfo.Seller_identifier) {
                alert('你还没有选中好友或者群组，暂不能聊天');
                return;
            }
            const selType = 'C2C';
            const selSess = new webim.Session(
                selType, // 会话类型， 包括群聊和私聊，具体参考webim.SESSION_TYPE常量对象，必填
                state.loginInfo.Seller_identifier, // 对方id , 群聊时，为群id；私聊时，对方帐号，必填
                state.loginInfo.Seller_name, // 对方名称，群聊时，为群名称；私聊时，为对方昵称，暂未使用，选填
                '', // 对方头像url，暂未使用，选填
                Math.round(new Date().getTime() / 1000) // 当前会话中的最新消息的时间戳，unix timestamp格式，暂未使用，选填
            );
            const msg = new webim.Msg(selSess, true);
            const imagesObj = new webim.Msg.Elem.Images(images.File_UUID);
            for (let i = 0; i < images.URL_INFO.length; i += 1) {
                const img = images.URL_INFO[i];
                let type;
                switch (img.PIC_TYPE) {
                case 1: // 原图
                    type = 1; // 原图
                    break;
                case 2: // 小图（缩略图）
                    type = 3; // 小图
                    break;
                case 4: // 大图
                    type = 2; // 大图
                    break;
                default:
                    break;
                }
                const newImg = new webim.Msg.Elem.Images.Image(
                    type,
                    img.PIC_Size,
                    img.PIC_Width,
                    img.PIC_Height,
                    img.DownUrl
                );
                imagesObj.addImage(newImg);
            }
            msg.addImage(imagesObj);
            commit(types.UPDATE_UPLOAD_IMG_SIZE, 0);
            commit(types.UPDATE_UPLOAD_IMG_UPLOADED, {
                uploadedSize: 0,
                progress: 0
            });
            // 将消息发送到自己的窗口
            const showMsg = {
                content: msg.getElems()[0].getContent(),
                isSend: msg.getIsSend(),
                time: msg.getTime(),
                showTime: '',
                seq: msg.getSeq(),
                sending: 'sending', // 正在发送中，标识消息是否发送成功
                type: msg.getElems()[0].getType() // 消息类型
            };
            commit(types.PUSH_NEW_MESSAGE_INTO_LISTS, showMsg);
            webim.sendMsg(msg, () => {
                // 消息发送成功
                showMsg.sending = 'success';
                commit(types.UPDATE_MSG_SENDING_STATUS, showMsg);
                webim.Tool.setCookie(`tmpmsg_${state.loginInfo.Seller_identifier}`, '', 0);
            }, (err) => {
                console.log(err);
                // 消息发送失败
                showMsg.sending = 'failed';
                commit(types.UPDATE_MSG_SENDING_STATUS, showMsg);
            });
        },
        // 发送商品消息
        sendGoodsMsg({ commit, state }) {
            if (!state.loginInfo.Seller_identifier) {
                alert('你还没有选中好友或者群组，暂不能聊天');
                return;
            }
            const selType = 'C2C';
            const selSess = new webim.Session(
                selType, // 会话类型， 包括群聊和私聊，具体参考webim.SESSION_TYPE常量对象，必填
                state.loginInfo.Seller_identifier, // 对方id , 群聊时，为群id；私聊时，对方帐号，必填
                state.loginInfo.Seller_name, // 对方名称，群聊时，为群名称；私聊时，为对方昵称，暂未使用，选填
                '', // 对方头像url，暂未使用，选填
                Math.round(new Date().getTime() / 1000) // 当前会话中的最新消息的时间戳，unix timestamp格式，暂未使用，选填
            );
            const msg = new webim.Msg(selSess, true);
            const data = {
                Type: 'GOODS',
                Body: {
                    oringinUrl: state.wxInfo.oringinUrl,
                    goodsId: state.wxInfo.goodsId,
                    goodsName: state.wxInfo.goodsName,
                    goodsPrice: state.wxInfo.goodsPrice,
                    goodsImageUrl: state.wxInfo.goodsImageUrl
                }
            };
            const customObj = new webim.Msg.Elem.Custom(JSON.stringify(data), state.wxInfo.goodsName, '');
            msg.addCustom(customObj);
            // 将消息发送到自己的窗口
            const showMsg = {
                content: msg.getElems()[0].getContent(),
                isSend: msg.getIsSend(),
                time: msg.getTime(),
                showTime: '',
                seq: msg.getSeq(),
                sending: 'sending', // 正在发送中，标识消息是否发送成功
                type: msg.getElems()[0].getType() // 消息类型
            };
            commit(types.PUSH_NEW_MESSAGE_INTO_LISTS, showMsg);
            // 调用发送消息接口
            webim.sendMsg(msg, () => {
                // 消息发送成功
                showMsg.sending = 'success';
                commit(types.UPDATE_MSG_SENDING_STATUS, showMsg);
                webim.Tool.setCookie(`tmpmsg_${state.loginInfo.Seller_identifier}`, '', 0);
            }, (err) => {
                console.log(err);
                // 消息发送失败
                showMsg.sending = 'failed';
                commit(types.UPDATE_MSG_SENDING_STATUS, showMsg);
            });
        },
        // 获取 C2C 历史消息
        getLastC2CHistoryMsgs({ commit, state }) {
            const options = {
                Peer_Account: state.loginInfo.Seller_identifier, // 好友帐号
                MaxCnt: config.REQUEST_MSG_COUNT, // 拉取消息条数
                LastMsgTime: state.lastMsg.time, // 最近的消息时间，即从这个时间点向前拉取历史消息
                MsgKey: state.lastMsg.key
            };
            return new Promise((resolve, reject) => {
                webim.getC2CHistoryMsgs(
                    options,
                    (resp) => {
                        console.log('获取到的历史消息');
                        console.log(resp);
                        const res = resp;
                        const preId = state.messagesLists[0] ? state.messagesLists[0].seq : ''; // 获取当前最后一条消息的标识，用于加载消息后重新定位滚动条
                        if (res.MsgList.length > 0) {
                            // 保留服务器返回的最近消息时间和消息Key,用于下次向前拉取历史消息
                            commit(types.UPDATE_LAST_MESSAGE_TIME_KEY, {
                                time: res.LastMsgTime,
                                key: res.MsgKey
                            });
                            // 解析消息
                            const _temp = [];
                            res.MsgList.forEach((msg) => {
                                // 把解析的消息更新到消息列表中
                                _temp.push({
                                    content: msg.getElems()[0].getContent(), // 解析消息
                                    isSend: msg.getIsSend(), // 是否是自己发的消息
                                    time: msg.getTime(), // 消息发送的时间
                                    showTime: '', // 格式化后的展示时间
                                    seq: msg.getSeq(), // 标识该消息
                                    type: msg.getElems()[0].getType() // 消息类型
                                });
                            });
                            commit(types.APPEND_HISTORY_MESSAGES_INTO_LISTS, _temp);
                        }
                        if (preId) {
                            res.preId = preId;
                            res.scrollTop = true;
                        } else {
                            res.preId = state.messagesLists[state.messagesLists.length - 1] ?
                                state.messagesLists[state.messagesLists.length - 1].seq : '';
                            res.scrollDown = true;
                        }
                        resolve(res);
                    },
                    (error) => {
                        reject(error);
                    }
                );
            });
        },
        // 上传图片
        uploadPic({ commit, state }, { file, onProgressCallBack }) {
            // 图片预览，手机上性能消耗太大,暂时关闭
            // const reader = new FileReader();
            // reader.onload = function (evt) {
            //     commit(types.UPDATE_UPLOAD_IMG_URL, evt.target.result);
            // };
            // reader.readAsDataURL(file);
            // 业务类型，1-发群图片，2-向好友发图片
            const businessType = webim.UPLOAD_PIC_BUSSINESS_TYPE.C2C_MSG;
            // 封装上传图片请求
            const opt = {
                file: file, // 图片对象
                onProgressCallBack: onProgressCallBack, // 上传图片进度条回调函数
                // abortButton: document.getElementById('upd_abort'), // 停止上传图片按钮
                From_Account: state.loginInfo.identifier, // 发送者帐号
                To_Account: state.loginInfo.Seller_identifier, // 接收者
                businessType: businessType // 业务类型
            };
            // 更新上传图片状态，总大小
            commit(types.UPDATE_UPLOAD_IMG_SIZE, file.size);
            return new Promise((resolve, reject) => {
                // 上传图片
                webim.uploadPic(opt, (resp) => {
                    resolve(resp);
                }, (err) => {
                    reject(err);
                });
            });
        },
        // 上传图片进度回调函数
        onProgressCallBack({ commit, state }, uploadedSize) {
            commit(types.UPDATE_UPLOAD_IMG_UPLOADED, {
                uploadedSize: uploadedSize,
                progress: `${Math.floor(uploadedSize / state.uploadOptions.size) * 100}%`
            });
        },
        // 重置上传状态参数
        resetUploadOptions({ commit }) {
            commit(types.UPDATE_UPLOAD_IMG_SIZE, 0);
            commit(types.UPDATE_UPLOAD_IMG_UPLOADED, {
                uploadedSize: 0,
                progress: 0
            });
        },
        // 消息已读通知
        onMsgReadedNotify(notify) {
            console.log(`收到已读通知${notify}`);
            // var sessMap = webim.MsgStore.sessMap()[webim.SESSION_TYPE.C2C + notify.From_Account];
            // if (sessMap) {
            //     var msgs = _.clone(sessMap.msgs());
            //     var rm_msgs = _.remove(msgs, function (m) {
            //         return m.time <= notify.LastReadTime
            //     });
            //     var unread = sessMap.unread() - rm_msgs.length;
            //     unread = unread > 0 ? unread : 0;
            //     //更新sess的未读数
            //     sessMap.unread(unread);
            //     // console.debug('更新C2C未读数:',notify.From_Account,unread);
            //     //更新页面的未读数角标
            //     if (unread > 0) {
            //         $("#badgeDiv_" + notify.From_Account).text(unread).show();
            //     } else {
            //         $("#badgeDiv_" + notify.From_Account).val("").hide();
            //     }
            // }
        },
        // 被其他登录实例踢下线
        onKickedEventCall() {
            const confirm = window.confirm('您的账号在其他地方登陆，您已被迫下线,是否立即重新登陆');
            if (confirm) {
                location.reload();
            }
        },
        // 获取7天以外的聊天记录
        getHistoryMessagesFromIdouzi({ commit, state }) {
            return new Promise((resolve, reject) => {
                Vue.http.post(config.REQUEST_HISTORY_MSG, {
                    MsgTime: state.lastMsg.time,
                    identifier: state.loginInfo.Seller_identifier,
                    access_token: state.loginInfo.access_token
                }).then((resp) => {
                    console.log('从idouzi获取到的历史消息');
                    console.log(resp);
                    const preId = state.historyMessagesLists[0] ? state.historyMessagesLists[0].seq : ''; // 获取当前最后一条消息的标识，用于加载消息后重新定位滚动条
                    const res = {
                        msgLists: []
                    };
                    // session
                    const selSess = new webim.Session(
                        'C2C', // 会话类型， 包括群聊和私聊，具体参考webim.SESSION_TYPE常量对象，必填
                        state.loginInfo.Seller_identifier, // 对方id , 群聊时，为群id；私聊时，对方帐号，必填
                        state.loginInfo.Seller_name, // 对方名称，群聊时，为群名称；私聊时，为对方昵称，暂未使用，选填
                        '', // 对方头像url，暂未使用，选填
                        Math.round(new Date().getTime() / 1000)
                    );
                    if (resp instanceof Array && resp.length > 0) {
                        // 按照腾讯云解析消息格式为Msg格式
                        res.msgLists = msgFormate(resp, selSess, state.loginInfo.identifier);
                        console.log('解析后的消息体');
                        console.log(res);
                        // 保留服务器返回的最近消息时间和消息Key,用于下次向前拉取历史消息
                        commit(types.UPDATE_LAST_MESSAGE_TIME_KEY, {
                            time: res.msgLists[res.msgLists.length - 1].MsgTime,
                            key: state.lastMsg.key
                        });
                        // 解析消息
                        const _temp = [];
                        res.msgLists.forEach((msg) => {
                            // 把解析的消息更新到消息列表中
                            _temp.push({
                                content: msg.getElems()[0].getContent(), // 解析消息
                                isSend: msg.getIsSend(), // 是否是自己发的消息
                                time: msg.getTime(), // 消息发送的时间
                                showTime: '', // 格式化后的展示时间
                                seq: msg.getSeq(), // 标识该消息
                                type: msg.getElems()[0].getType() // 消息类型
                            });
                        });
                        commit(types.APPEND_HISTORY_MESSAGES_INTO_HISTORY_LISTS, _temp);
                    }
                    if (preId) {
                        res.preId = preId;
                        res.scrollTop = true;
                    } else {
                        const hLen = state.historyMessagesLists.length;
                        res.preId = state.historyMessagesLists[hLen - 1] ?
                            state.historyMessagesLists[hLen - 1].seq : '';
                        res.scrollDown = true;
                    }
                    resolve(res);
                }).catch((error) => {
                    reject(error);
                });
            });
        }
    }
};
