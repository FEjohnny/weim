// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue';
import 'lib-flexible/flexible';
import es6Promise from 'es6-promise';
import '@/style/swiper.css';
import { Loadmore } from 'mint-ui';
import '@/style/mint-ui-used.css';
import '@/style/emotions.less';

import App from './App';
import httpPlugin from './plugins/axios';
import store from './store';
import router from './router';

es6Promise.polyfill();

Vue.use(httpPlugin);
// Vue.use(Loadmore);
Vue.component(Loadmore.name, Loadmore);

Vue.config.productionTip = false;

/* eslint-disable no-new */
new Vue({
    el: '#app',
    store,
    router,
    components: { App },
    template: '<App/>'
});
