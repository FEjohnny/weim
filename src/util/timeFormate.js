/**
 * 格式化时间戳
 * yyyy-MM-dd hh:mm 年月日时分秒(默认格式)
 * @param time
 */
function timeFormate(time) {
    if (!time) {
        return 0;
    }
    let formatTime;
    const format = 'yyyy/MM/dd hh:mm';
    const date = new Date(time * 1000);
    const o = {
        'M+': date.getMonth() + 1, // 月份
        'd+': date.getDate(), // 日
        'h+': date.getHours(), // 小时
        'm+': date.getMinutes(), // 分
        's+': date.getSeconds() // 秒
    };
    if (/(y+)/.test(format)) {
        formatTime = format.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
    } else {
        formatTime = format;
    }
    for (var k in o) {
        if (new RegExp("(" + k + ")").test(formatTime))
            formatTime = formatTime.replace(RegExp.$1, (RegExp.$1.length == 1) ? (o[k]) : (("00" + o[k]).substr(("" + o[k]).length)));
    }
    return formatTime;
}

/**
 * 是否是今天
 * @param {String} time：yyyy-MM-dd hh:mm:ss
 * @returns {boolean}
 */
function isToday(time) {
    const today = timeFormate(new Date() / 1000);
    const todayStartTime = new Date(`${today.slice(0, 10)} 00:00:00`);
    if (todayStartTime < (time * 1000)) {
        return true;
    }
    return false;
}

/**
 * 是否是昨天
 * @param {Number} time: 时间戳
 */
function isYestoday(time) {
    const today = timeFormate(new Date() / 1000);
    const todayStartTime = new Date(`${today.slice(0, 10)} 00:00:00`);
    if (todayStartTime - (time * 1000) < 24 * 60 * 60 * 1000) {
        return '昨天';
    }
    return false;
}

/**
 * 是否是本周
 * @param {Number} time：时间戳
 */
function isInOneWeek(time) {
    const nowTime = new Date();
    const week = nowTime.getDay(); // 今天是周几，返回0（周日)-6(周六）
    const today = timeFormate(nowTime.getTime() / 1000);
    const todayStartTime = new Date(`${today.slice(0, 10)} 00:00:00`).getTime();
    // 本周日的开始时间
    const sundayStartTime = todayStartTime - (week * 24 * 60 * 60 * 1000);
    if (time * 1000 >= sundayStartTime) { // 属于本周内的时间
        const resWeek = new Date(time * 1000).getDay(); // 所计算的时间是周几
        switch (resWeek) {
        case 0:
            return '周日';
        case 1:
            return '周一';
        case 2:
            return '周二';
        case 3:
            return '周三';
        case 4:
            return '周四';
        case 5:
            return '周五';
        case 6:
            return '周六';
        default:
            return false;
        }
    }
    return false;
}

/**
 * 是否是今年
 * @param {Number} time：时间戳
 */
function isInOneYear(time) {
    const nowYear = new Date().getFullYear();
    const nowYearStartTime = new Date(`${nowYear}/01/01 00:00:00`).getTime() / 1000;
    if (time > nowYearStartTime) {
        return true;
    }
    return false;
}

/**
 * 按照一定规则解析时间,基本逻辑：
 * 今天的消息，只显示【时分】
 * 昨天的消息，显示【昨天 时分】
 * 如果是本周的消息，显示【周几 时分】
 * 如果是今年的消息，显示【月日 时分】
 * 其余的消息，显示【年+月+日 时分】
 * @param time 当前消息的时间
 */
function complexTimeFormate(time) {
    const _time = timeFormate(time);
    if (isToday(time)) { // 今天
        return _time.slice(10, 16);
    } else if (isYestoday(time)) { // 昨天
        return `昨天 ${_time.slice(10, 16)}`;
    } else if (isInOneWeek(time)) { // 本周
        return `${isInOneWeek(time)} ${_time.slice(10, 16)}`;
    } else if (isInOneYear(time)) { // 今年
        return _time.slice(5, 16);
    }
    return _time;
}

export const historyMsgTimeFormate = function (historyLists) {
    let oldestShowTime = 0;
    const msgLists = historyLists;
    msgLists.forEach((item, index) => {
        // 最后的一条消息，肯定会显示时间
        if (index === 0) {
            oldestShowTime = item.time;
            msgLists[index].showTime = complexTimeFormate(item.time);
        } else if (item.time - oldestShowTime > 5 * 60) {
            oldestShowTime = item.time;
            msgLists[index].showTime = complexTimeFormate(item.time);
        }
    });
    return msgLists;
};
/**
 * 处理发消息和接收到新消息的时间
 * 超过5分钟，重新显示新的时间
 * @param time
 * @param lastedShowTime
 * @returns {*}
 */
export const newMsgTimeFormate = function (time, lastedShowTime) {
    const _time = timeFormate(time);
    if (time - lastedShowTime > 5 * 60) {
        return {
            showTime: _time.slice(10, 16), // 新消息，只展示时分
            lastedShowTime: time
        };
    }
    return {
        showTime: '',
        lastedShowTime: lastedShowTime
    };
};
