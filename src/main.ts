import { createApp, type Directive } from "vue";
import App from "./App.vue";
import router from "./router";
import { useI18n } from "@/plugins/i18n";
import { getPlatformConfig } from "./config";
import { MotionPlugin } from "@vueuse/motion";
import { setupStore } from "./store";
import { injectResponsiveStorage } from "@/utils/responsive";
import { useElementPlus } from "@/plugins/elementPlus";

import "./style/reset.scss";
import "./style/index.scss";

import "./style/tailwind.css";
import "element-plus/dist/index.css";

const app = createApp(App);

import * as directives from "@/directives";
Object.keys(directives).forEach(key => {
  app.directive(key, (directives as { [key: string]: Directive })[key]);
});

import { IconifyIconOffline } from "./components/ReIcon";
app.component("IconifyIconOffline", IconifyIconOffline);

// 全局注册vue-tippy
import "tippy.js/dist/tippy.css";
import "tippy.js/themes/light.css";
import VueTippy from "vue-tippy";
app.use(VueTippy);

getPlatformConfig(app).then(async config => {
  setupStore(app);
  app.use(router);
  injectResponsiveStorage(app, config);
  app.use(MotionPlugin);
  app.use(useI18n);
  app.use(useElementPlus);
  app.mount("#app");
});
