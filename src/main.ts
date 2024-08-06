import { createApp } from "vue";
import router from "./router";
import { useI18n } from "@/plugins/i18n";
import { getPlatformConfig } from "./config";
import App from "./App.vue";
import { setupStore } from "./store";
import { injectResponsiveStorage } from "@/utils/responsive";
import { useElementPlus } from "@/plugins/elementPlus";

import "./style/reset.scss";

import "./style/tailwind.css";
import "element-plus/dist/index.css";

const app = createApp(App);

getPlatformConfig(app).then(async (config) => {
  setupStore(app);
  app.use(router);

  injectResponsiveStorage(app, config);
  app.use(useI18n);
  app.use(useElementPlus);
  app.mount("#app");
});
