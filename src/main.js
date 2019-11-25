import Vue from "vue";
import App from "./components/App/comp.vue";
import BootstrapVue from "bootstrap-vue";
import uploader from "vue-simple-uploader";
import VueRouter from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import VJsoneditor from "v-jsoneditor";
import VueSSE from "vue-sse";
import ServerEvents from "src/services/server-events";
import Notifications from "src/services/notifications";
import VueTimeago from "vue-timeago";

import "./custom.scss";

Vue.config.productionTip = false;
Vue.use(uploader);
Vue.use(BootstrapVue);
Vue.use(VueRouter);
Vue.use(VJsoneditor);
Vue.use(VueSSE);
Vue.use(VueTimeago, {
  locale: "en"
});
Vue.component("font-awesome-icon", FontAwesomeIcon);

library.add(fas);

new Vue({
  render: h => h(App)
}).$mount("#app");

ServerEvents.listen();
Notifications.listen();
