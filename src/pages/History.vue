<template>
    <div class="">
        <mt-loadmore
                :top-method="getHistoryMessages"
                :top-all-loaded="allLoaded"
                :topDistance="50"
                :maxDistance="70"
                class="history-wrapper"
                @top-status-change="handleTopChange"
                ref="loadmore">
            <div slot="top" class="mint-loadmore-top">
                <div v-if="!allLoaded">
                    <span v-show="topStatus === 'pull'">↓查看更多消息</span>
                    <span v-show="topStatus === 'drop'">↑释放查看更多</span>
                    <span v-show="topStatus === 'loading'">加载中...</span>
                </div>
                <div v-else>
                    <span>没啦，别拉了</span>
                </div>
            </div>
            <Message :messagesLists="historyMessagesLists"></Message>
        </mt-loadmore>
    </div>
</template>

<script>
    import { mapState } from 'vuex';
    import Message from '@/components/message';

    export default {
        name: 'History',
        data() {
            return {
                allLoaded: false,
                topStatus: ''
            };
        },
        components: {
            Message
        },
        computed: {
            ...mapState('chat', ['historyMessagesLists'])
        },
        methods: {
            // 获取爱豆子服务器存储的聊天记录，一般是超过7天的
            getHistoryMessages() {
                const _this = this;
                // 加载更多数据 是否还有更多
                this.$refs.loadmore.onTopLoaded();
                if (!_this.allLoaded) {
                    this.getLastC2CHistoryMsgs().then((res) => {
                        // 是否还有历史消息可以拉取，1-表示没有，0-表示有
                        const complete = res.Complete;
                        // 返回的消息条数，小于或等于请求的消息条数，小于的时候，说明没有历史消息可拉取了
                        // const retMsgCount = res.MsgCount;
                        if (complete === 1) {
                            _this.allLoaded = true;
                        }
                        _this.$refs.loadmore.onTopLoaded();
                        let preEle;
                        let scrollTop;
                        if (res.scrollTop && res.preId) { // 拉去历史记录后，保持滚动条的位置
                            preEle = document.getElementById(res.preId);
                            scrollTop = preEle.offsetTop - ((Number(document.documentElement.style.fontSize.replace('px', '')) / 75) * 32);
                            document.documentElement.scrollTop = scrollTop;
                            document.body.scrollTop = scrollTop;
                        } else if (res.scrollDown && res.preId) { // 首次历史消息，滚到底部
                            _this.scrollTopBottom();
                        }
                    }).catch((err) => {
                        console.log(`拉取历史消息出错:${err.ErrorInfo}`);
                    });
                } else {
                    this.$refs.loadmore.onTopLoaded();
                }
            },
            handleTopChange(status) {
                this.topStatus = status;
            }
        }
    };
</script>

<style scoped lang="less">
.history-wrapper{
    min-height: 500px;
    padding-bottom: 100px;
}
</style>
