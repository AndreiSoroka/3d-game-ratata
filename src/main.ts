import ElementPlus from 'element-plus';
import { createApp } from 'vue';
import { createPinia } from 'pinia';

import App from './App.vue';
import router from './app/router';

import '@/shared/assets/main.css';
import 'element-plus/dist/index.css';
import 'element-plus/theme-chalk/dark/css-vars.css';

const app = createApp(App);

app.use(createPinia());
app.use(ElementPlus);
app.use(router);

app.mount('#app');
