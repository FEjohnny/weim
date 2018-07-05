// 把axios封装成插件使用

import axios from 'axios';
import qs from 'qs';
import { HmacSHA1 } from 'crypto-js';
import Base64 from 'crypto-js/enc-base64';
import utf8 from 'crypto-js/enc-utf8';
import * as config from '../config';

// 请求拦截器
axios.interceptors.request.use((params) => {
    const _params = params;

    // 时间戳
    const timestamp = parseInt((new Date().getTime()) / 1000, 10);
    // 五位随机整数
    const nonce = parseInt(Math.random() * 100000, 10);
    // 加密签名
    const hashDigest = HmacSHA1(`Version=1.0&agent=wx&nonce=${nonce}&timestamp=${timestamp}`, config.PRIVATE_KEY).toString();
    const sign = Base64.stringify(utf8.parse(hashDigest));
    // 接口前缀
    _params.url = config.BASE_URL + _params.url;
    // 所有接口后面添加统一参数
    // agent设备类型，nonce随机数，5位数字，timestamp时间戳，sign接口签名
    _params.url += `?Version=1.0
                        &agent=wx
                        &nonce=${nonce}
                        &timestamp=${timestamp}
                        &sign=${sign}`;
    _params.url = _params.url.replace(/\s*|\n*/g, '');

    // 判断是否是post请求，如果是，需要使用Qs转换请求参数
    if (_params.method === 'post') {
        _params.data = qs.stringify(_params.data);
    }
    return _params;
}, (error) => {
    // 对请求错误做些什么
    return Promise.reject(error);
});

// 响应拦截器
axios.interceptors.response.use((response) => {
    const data = response.data;
    const status = data.code;
    const msg = data.msg;

    if (status === '0') {
        return data.data;
    }
    else if (status === -1) { // 未登录
        // Message(msg);
        setTimeout(() => {
            window.location.href = '/user/login';
        }, 1000);
    }
    else {
        // Message(msg);
        return Promise.reject(msg);
    }
}, (error) => {
    // 对响应错误做点什么
    return Promise.reject(error);
});

export default {
    install(vue, name = 'http') {
        // Object.defineProperty(Vue.prototype, name, {
        //     value: axios
        // });
        vue[name] = axios;
    }
};

