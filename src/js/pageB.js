import Vue from 'vue';
import Index from '../view/pageB.vue';
import '../less/pageB.less';

/* 配置index实例化vue */
new Vue({
    el: '#index',
    render: function(h) {
        return h(Index)
    }
})