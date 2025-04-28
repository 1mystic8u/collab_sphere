import { createApp } from 'vue';
import App from './App.vue';
import router from './router';
import { createPinia } from 'pinia';

// PrimeVue imports
import PrimeVue from 'primevue/config';
import 'primevue/resources/themes/lara-light-teal/theme.css';
import 'primevue/resources/primevue.min.css';
import 'primeicons/primeicons.css';

// PrimeVue components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Card from 'primevue/card';
import Dialog from 'primevue/dialog';
import Textarea from 'primevue/textarea';
import Chip from 'primevue/chip';
import Badge from 'primevue/badge';
import Avatar from 'primevue/avatar';
import Menu from 'primevue/menu';

const app = createApp(App);
const pinia = createPinia();

// Register PrimeVue
app.use(PrimeVue);
app.use(router);
app.use(pinia);

// Register PrimeVue components
app.component('Button', Button);
app.component('InputText', InputText);
app.component('Card', Card);
app.component('Dialog', Dialog);
app.component('Textarea', Textarea);
app.component('Chip', Chip);
app.component('Badge', Badge);
app.component('Avatar', Avatar);
app.component('Menu', Menu);

app.mount('#app');