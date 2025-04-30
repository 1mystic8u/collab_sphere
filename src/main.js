import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// PrimeVue imports
import ConfirmationService from 'primevue/confirmationservice';
import ToastService from 'primevue/toastservice';
import Aura from '@primeuix/themes/aura';
import PrimeVue from 'primevue/config';
import 'primeicons/primeicons.css';



const app = createApp(App);
const pinia = createPinia();


app.use(PrimeVue, {
    theme: {
        preset: Aura,
        options: {
            darkModeSelector: '.app-dark'
        }
    }
});
app.use(ToastService);
app.use(ConfirmationService);



app.use(router);
app.use(pinia);




app.mount('#app');