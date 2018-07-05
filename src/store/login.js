import Vue from 'vue';
import webim from '../imLibs/webim';
import { REQUEST_IDENTIFIER_TOKEN, LOGIN_IM_OPTIONS } from '../config';
import * as types from './mutation-types';

export default {
    namespaced: true,
    state: {
        accountMode: 0, // 帐号模式，0-表示独立模式，1-表示托管模式
        wxInfo: { // 用户从商场进入聊天页带过来的信息
            unionId: 'oTBn-at2RQSHdBoJQYFSdnZo8BBQ', // 用户unionID
            openId: 'aLVPpjqs9Bhvzwcj5A-vTYAX3GLc', // 用户openId
            wxName: '买家01', // 用户微信名称
            logo: 'https://www.jobchat.cn/static/home/images/icon_custom_default.png', // 用户头像
            shopId: 13 // 店铺id  16
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
        }
    },
    gettter: {},
    mutations: {
        // 更新会话双方的信息和token信息
        [types.UPDATE_LOGIN_INFO](state, payload) {
            state.loginInfo = payload;
        },
        // 更新用户登录IM服务器之后的头像和昵称
        [types.UPDATE_WX_INFO](state, payload) {
            // 将空格和换行符转换成HTML标签
            state.loginInfo.identifierNick = webim.Tool.formatText2Html(payload.identifierNick) ||
                webim.Tool.formatText2Html(payload.identifier);
            state.loginInfo.headurl = webim.Tool.formatText2Html(payload.headurl);
        }
    },
    actions: {
        // 获取会话双方的identifier和token信息
        getIdentifierToken({ commit, state }) {
            return new Promise((resolve, reject) => {
                const { openId, shopId, unionId } = state.wxInfo;
                Vue.http.post(REQUEST_IDENTIFIER_TOKEN, {
                    openId, shopId, unionId
                }).then((loginInfo) => {
                    // 更新会话双方的信息和token信息
                    commit(types.UPDATE_LOGIN_INFO, loginInfo);
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
                    loginInfo, listeners, LOGIN_IM_OPTIONS,
                    (res) => {
                        // 登录成功，更新用户昵称和头像
                        commit(types.UPDATE_WX_INFO, res);
                        console.log('======================IM服务器登录成功==========================');
                        resolve(res);
                    }, (err) => {
                        console.log('======================IM服务器登录失败==========================');
                        console.log(err.ErrorInfo);
                        reject(err);
                    }
                );
            });
        }
    }
};
