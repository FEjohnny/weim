/**
 * 统一配置文件
 * 包含腾讯IM的一些配置
 * 所有请求URL必须写在这里
  */

// 腾讯IM相关配置
export const LOGIN_IM_OPTIONS = {
    isAccessFormalEnv: true, // 是否访问正式环境，默认访问正式，选填
    isLogOn: false // 是否开启控制台打印日志,默认开启，选填
};

// 历史消息每次拉去的条数, 腾讯IM最大值为15，大于15会报错
export const REQUEST_MSG_COUNT = 15;

// 加密密钥
export const PRIVATE_KEY = 'kdiei9232c#*@';

// base url
export const BASE_URL = 'http://dev.dlgim.jobchat.cn/api/';

// 获取会话双方的identifier和token信息(post)
export const REQUEST_IDENTIFIER_TOKEN = 'startc2c';

