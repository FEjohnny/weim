import webim from '@/imLibs/webim';
/**
 * 将原始消息结构，解析为Msg对象的消息体
 * @param msgLists  从idouzi服务器拉去的消息数组
 * @param sess 当前会话session
 * @param curIdentifier 当前用户的Identifier
 * @returns {Array}
 */
const msgFormate = function (msgLists, sess, curIdentifier) {
    const msgObjList = [];
    for (const i in msgLists) {
        const msgInfo = msgLists[i];
        let isSendMsg;
        let id;
        let headUrl;

        if (msgInfo.From_Account === curIdentifier) { // 当前用户发送的消息
            isSendMsg = true;
            id = msgInfo.To_Account; // 读取接收者信息
            headUrl = '';
        } else { // 当前用户收到的消息
            isSendMsg = false;
            id = msgInfo.From_Account; // 读取发送者信息
            headUrl = '';
        }
        const msg = new webim.Msg(sess, isSendMsg,
                                  msgInfo.MsgSeq, msgInfo.MsgRandom,
                                  msgInfo.MsgTimeStamp, msgInfo.From_Account);
        let msgBody = null;
        let msgContent = null;
        let msgType = null;
        for (const mi in msgInfo.MsgBody) {
            msgBody = msgInfo.MsgBody[mi];
            msgType = msgBody.MsgType;
            switch (msgType) {
            case webim.MSG_ELEMENT_TYPE.TEXT:
                msgContent = new webim.Msg.Elem.Text(msgBody.MsgContent.Text);
                break;
            case webim.MSG_ELEMENT_TYPE.FACE:
                msgContent = new webim.Msg.Elem.Face(
                    msgBody.MsgContent.Index,
                    msgBody.MsgContent.Data
                );
                break;
            case webim.MSG_ELEMENT_TYPE.IMAGE:
                msgContent = new webim.Msg.Elem.Images(
                    msgBody.MsgContent.UUID,
                    msgBody.MsgContent.ImageFormat
                );
                for (const j in msgBody.MsgContent.ImageInfoArray) {
                    const tempImg = msgBody.MsgContent.ImageInfoArray[j];
                    msgContent.addImage(
                        new webim.Msg.Elem.Images.Image(
                            tempImg.Type,
                            tempImg.Size,
                            tempImg.Width,
                            tempImg.Height,
                            tempImg.URL
                        )
                    );
                }
                break;
            case webim.MSG_ELEMENT_TYPE.SOUND:
                if (msgBody.MsgContent) {
                    msgContent = new webim.Msg.Elem.Sound(
                        msgBody.MsgContent.UUID,
                        msgBody.MsgContent.Second,
                        msgBody.MsgContent.Size,
                        msgInfo.From_Account,
                        msgInfo.To_Account,
                        msgBody.MsgContent.Download_Flag,
                        webim.SESSION_TYPE.C2C
                    );
                } else {
                    msgType = webim.MSG_ELEMENT_TYPE.TEXT;
                    msgContent = new webim.Msg.Elem.Text('[语音消息]下载地址解析出错');
                }
                break;
            case webim.MSG_ELEMENT_TYPE.LOCATION:
                msgContent = new webim.Msg.Elem.Location(
                    msgBody.MsgContent.Longitude,
                    msgBody.MsgContent.Latitude,
                    msgBody.MsgContent.Desc
                );
                break;
            case webim.MSG_ELEMENT_TYPE.FILE:
            case `${webim.MSG_ELEMENT_TYPE.FILE} `:
                msgType = webim.MSG_ELEMENT_TYPE.FILE;
                if (msgBody.MsgContent) {
                    msgContent = new webim.Msg.Elem.File(
                        msgBody.MsgContent.UUID,
                        msgBody.MsgContent.FileName,
                        msgBody.MsgContent.FileSize,
                        msgInfo.From_Account,
                        msgInfo.To_Account,
                        msgBody.MsgContent.Download_Flag,
                        webim.SESSION_TYPE.C2C
                    );
                } else {
                    msgType = webim.MSG_ELEMENT_TYPE.TEXT;
                    msgContent = new webim.Msg.Elem.Text('[文件消息下载地址解析出错]');
                }
                break;
            case webim.MSG_ELEMENT_TYPE.CUSTOM:
                msgType = webim.MSG_ELEMENT_TYPE.CUSTOM;
                msgContent = new webim.Msg.Elem.Custom(
                    msgBody.MsgContent.Data,
                    msgBody.MsgContent.Desc,
                    msgBody.MsgContent.Ext
                );
                break;
            default:
                msgType = webim.MSG_ELEMENT_TYPE.TEXT;
                msgContent = new webim.Msg.Elem.Text(`web端暂不支持${msgBody.MsgType}消息`);
                break;
            }
            msg.elems.push(new webim.Msg.Elem(msgType, msgContent));
        }
        msgObjList.push(msg);
    } // for loop
    return msgObjList;
};
export default msgFormate;
