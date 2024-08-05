import { createApp } from "vue";
import router from "./router";
import { useI18n } from "@/plugins/i18n";
import { getPlatformConfig } from "./config";
import App from "./App.vue";

import "./style/reset.scss";

import "./style/tailwind.css";
import "element-plus/dist/index.css";

const app = createApp(App);

getPlatformConfig(app).then(async (config) => {
  app.use(router);
  app.use(useI18n);
  app.mount("#app");
});
