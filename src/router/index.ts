import { RouteComponent, Router, createRouter } from "vue-router";
import {
  ascending,
  getHistoryMode,
  formatTwoStageRoutes,
  formatFlatteningRoutes,
} from "./util";
import remainingRouter from "./modules/remaining";
import NProgress from "@/utils/nprogress";
import { buildHierarchyTree } from "@pureadmin/utils";
import { usePermissionStoreHook } from "@/store/modules/permission";

const modules: Record<string, any> = import.meta.glob(
  ["./modules/**/*.ts", "!./modules/**/remaining.ts"],
  {
    eager: true,
  }
);

const routes = [];

Object.keys(modules).forEach((key) => {
  routes.push(modules[key].default);
});

export const router: Router = createRouter({
  history: getHistoryMode(import.meta.env.VITE_ROUTER_HISTORY),
  routes: routes.concat(...remainingRouter),
  strict: true,
});

/** 用于渲染菜单，保持原始层级 */
export const constantMenus: Array<RouteComponent> = ascending(
  routes.flat(Infinity)
).concat(...remainingRouter);

/** 重置路由 */
export function resetRouter() {
  router.getRoutes().forEach((route) => {
    const { name, meta } = route;
    if (name && router.hasRoute(name) && meta?.backstage) {
      router.removeRoute(name);
      router.options.routes = formatTwoStageRoutes(
        formatFlatteningRoutes(
          buildHierarchyTree(ascending(routes.flat(Infinity)))
        )
      );
    }
  });
  usePermissionStoreHook().clearAllCachePage();
}

const whiteList = ["/login"];

router.afterEach(() => {
  NProgress.done();
});

export default router;
