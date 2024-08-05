import { Router, createRouter } from "vue-router";
import { getHistoryMode } from "./util";
import remainingRouter from "./modules/remaining";
import NProgress from "@/utils/nprogress";

const routes = [];

export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: routes.concat(...remainingRouter),
  strict: true,
});

const whiteList = ["/login"];

router.afterEach(() => {
  console.log(router);
  NProgress.done();
});

export default router;
