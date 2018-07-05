// 解析消息工具类
import webim from '../imLibs/webim';
import emotionsToImg from '../emotions/name_to_face_normal.json';

// 解析文本消息元素
function convertTextMsgToHtml(content) {
    let text = content.getText();
    const matches = text.match(/\[[^\]]+\]/g);
    if (matches && matches.length > 0) {
        for (let i = 0; i < matches.length; i += 1) {
            let name = emotionsToImg[matches[i]].split('.')[0];
            if (/@/.test(name)) {
                name = name.split('@')[0];
            }
            text = text.replace(matches[i], `<i class="icon_emotion emotion_${name}" ></i>`);
        }
    }
    return text;
}
// 解析表情消息元素
function convertFaceMsgToHtml(content) {
    const index = content.getIndex();
    const data = content.getData();
    let url = null;
    const emotion = webim.Emotions[index];
    if (emotion && emotion[1]) {
        url = emotion[1];
    }
    if (url) {
        return `<img src="${url}"/>`;
    }
    return data;
}
// 解析图片消息元素
function convertImageMsgToHtml(content) {
    const smallImage = content.getImage(webim.IMAGE_TYPE.SMALL); // 小图
    let bigImage = content.getImage(webim.IMAGE_TYPE.LARGE); // 大图
    let oriImage = content.getImage(webim.IMAGE_TYPE.ORIGIN); // 原图
    if (!bigImage) {
        bigImage = smallImage;
    }
    if (!oriImage) {
        oriImage = smallImage;
    }
    return `<img src="${smallImage.getUrl()}#${bigImage.getUrl()}#${oriImage.getUrl()}"
            style="CURSOR: hand;max-width: 100%;display: block" id="${content.getImageId()}"
             bigImgUrl="${bigImage.getUrl()}" onclick="imageClick(this)" />`;
}
// 解析语音消息元素
function convertSoundMsgToHtml(content) {
    // const second = content.getSecond(); // 获取语音时长
    const downUrl = content.getDownUrl();
    if (webim.BROWSER_INFO.type === 'ie' && parseInt(webim.BROWSER_INFO.ver, 10) <= 8) {
        return `[这是一条语音消息]demo暂不支持 IE8(含)以下浏览器播放语音,语音URL:${downUrl}`;
    }
    return `<audio src="${downUrl}" controls="controls" onplay="onChangePlayAudio(this)" preload="none"></audio>`;
}
// 解析文件消息元素
function convertFileMsgToHtml(content) {
    const fileSize = Math.round(content.getSize() / 1024);
    return `<a href="${content.getDownUrl()}" title="单击下载文件" ><i class="glyphicon glyphicon-file">&nbsp;${content.getName()}(${fileSize}KB)</i></a>`;
}
// 解析位置消息元素
function convertLocationMsgToHtml(content) {
    return `经度=${content.getLongitude()},纬度=${content.getLatitude()},描述=${content.getDesc()}`;
}
// 解析自定义消息元素
function convertCustomMsgToHtml(content) {
    const data = content.getData();
    const desc = content.getDesc();
    const ext = content.getExt();
    return `data=${data}, desc=${desc}, ext=${ext}`;
}

// 解析函数
const convertMsgtoHtml = function (msg) {
    let html = '';
    let elem;
    let type;
    let content;
    const elems = msg.getElems(); // 获取消息包含的元素数组
    Object.keys(elems).forEach((i) => {
        elem = elems[i];
        type = elem.getType(); // 获取元素类型
        content = elem.getContent(); // 获取元素对象
        switch (type) {
        case webim.MSG_ELEMENT_TYPE.TEXT:
            html += convertTextMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.FACE:
            html += convertFaceMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.IMAGE:
            html += convertImageMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.SOUND:
            html += convertSoundMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.FILE:
            html += convertFileMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.LOCATION: // 暂不支持地理位置
            html += convertLocationMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.CUSTOM:
            html += convertCustomMsgToHtml(content);
            break;
        case webim.MSG_ELEMENT_TYPE.GROUP_TIP:
            // html += convertGroupTipMsgToHtml(content);
            break;
        default:
            webim.Log.error(`未知消息元素类型: elemType=${type}`);
            break;
        }
    });
    return html;
};

export default convertMsgtoHtml;
