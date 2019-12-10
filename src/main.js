import Vue from "vue";
import App from "./components/App/comp.vue";
import BootstrapVue from "bootstrap-vue";
import uploader from "vue-simple-uploader";
import VueRouter from "vue-router";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
import { library } from "@fortawesome/fontawesome-svg-core";
import { fas } from "@fortawesome/free-solid-svg-icons";
import { far } from "@fortawesome/free-regular-svg-icons";
import VJsoneditor from "v-jsoneditor";
import VueSSE from "vue-sse";
import ServerEvents from "src/services/server-events";
import Notifications from "src/services/notifications";
import VueTimeago from "vue-timeago";
import Tree from "src/components/globals/Tree/comp.vue";
import VFrame from "src/components/globals/VFrame/comp.vue";
import HelpLink from "src/components/globals/HelpLink/comp.vue";

import "./custom.scss";

Number.prototype.pad = function(size) {
  var s = String(this);
  while (s.length < (size || 2)) {
    s = "0" + s;
  }
  return s;
};

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
Vue.component("tree", Tree);
Vue.component("v-frame", VFrame);
Vue.component("help-link", HelpLink);

library.add(fas);
library.add(far);

new Vue({
  render: h => h(App)
}).$mount("#app");

ServerEvents.listen();
Notifications.listen();
