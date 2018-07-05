/**
 * vuex store
 */

import Vue from 'vue';
import Vuex from 'vuex';
import chat from './chat';
import login from './login';

Vue.use(Vuex);

export default new Vuex.Store({
    modules: {
        chat,
        login
    }
});
