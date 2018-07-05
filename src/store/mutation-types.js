/**
 * 使用常量替代 mutation 事件类型,可对整个 app 包含的 mutation 一目了然
 */

// 更新会话双方的信息和token信息
export const UPDATE_LOGIN_INFO = 'UPDATE_LOGIN_INFO';

// 更新用户登录IM服务器之后的头像和昵称
export const UPDATE_WX_INFO = 'UPDATE_WX_INFO';

// 拉取历史消息，append到消息列表中
export const APPEND_HISTORY_MESSAGES_INTO_LISTS = 'APPEND_HISTORY_MESSAGES_INTO_LISTS';

// 新增一条消息到消息列表中
export const PUSH_NEW_MESSAGE_INTO_LISTS = 'PUSH_NEW_MESSAGE_INTO_LISTS';

// 更新最前一条消息的时间和key信息
export const UPDATE_LAST_MESSAGE_TIME_KEY = 'UPDATE_LAST_MESSAGE_TIME_KEY';

// 更新某一条消息的发送状态
export const UPDATE_MSG_SENDING_STATUS = 'UPDATE_MSG_SENDING_STATUS';

// 删除某条发送失败的消息
export const DELETE_MSG_SEND_FAILED = 'DELETE_MSG_SEND_FAILED';

export default null;
