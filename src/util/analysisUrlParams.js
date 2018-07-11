/**
 * 获取url上的参数
 * @param { String } url
 * @param { String } key
 * @returns { Object || String } {*}
 */
const analysisUrlParams = function (url, key) {
    if (!url) {
        return null;
    }
    const paramsString = url.split('?').length > 1 ? url.split('?')[1] : '';
    const keyValuesString = paramsString ? paramsString.split('&') : '';
    const result = {};
    if (keyValuesString) {
        keyValuesString.forEach((item) => {
            result[item.split('=')[0]] = item.split('=')[1];
        });
    }
    if (key && key in result) {
        return result[key];
    }
    return result;
};
export default analysisUrlParams;
