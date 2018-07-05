import Vue from 'vue';
import Router from 'vue-router';
import Index from '@/pages/Index';
import History from '@/pages/History';

Vue.use(Router);

export default new Router({
    routes: [
        {
            path: '/',
            name: 'Index',
            component: Index
        },
        {
            path: '/history',
            name: 'History',
            component: History
        }
    ]
});
