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
    import { mapActions, mapState } from 'vuex';
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
        created() {},
        computed: {
            ...mapState('chat', ['wxInfo', 'historyMessagesLists'])
        },
        methods: {
            ...mapActions('chat', ['getHistoryMessagesFromIdouzi']),
            // 获取爱豆子服务器存储的聊天记录，一般是超过7天的
            getHistoryMessages() {
                const _this = this;
                // 加载更多数据 是否还有更多
                if (!_this.allLoaded) {
                    this.getHistoryMessagesFromIdouzi().then((res) => {
                        _this.$refs.loadmore.onTopLoaded();
                        let preEle;
                        let scrollTop;
                        if (res.msgLists.length === 0) {
                            _this.allLoaded = true;
                        }
                        if (res.scrollTop && res.preId) { // 拉去历史记录后，保持滚动条的位置
                            preEle = document.getElementById(res.preId);
                            scrollTop = preEle.offsetTop - ((Number(document.documentElement.style.fontSize.replace('px', '')) / 75) * 32);
                            document.documentElement.scrollTop = scrollTop;
                            document.body.scrollTop = scrollTop;
                        }
                    }).catch((err) => {
                        this.$refs.loadmore.onTopLoaded();
                        alert(`拉取历史消息出错:${err}`);
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
