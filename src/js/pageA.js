import Vue from 'vue';
import Index from '../view/pageA.vue';
import '../less/pageA.less';

/* 配置index实例化vue */
new Vue({
    el: '#index',
    render: function(h) {
        return h(Index)
    }
})