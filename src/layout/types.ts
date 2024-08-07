const { VITE_HIDE_HOME } = import.meta.env;
import { RouteMeta } from "vue-router";

export const routerArrays: Array<RouteConfigs> =
  VITE_HIDE_HOME === "false"
    ? [
        {
          path: "/welcome",
          meta: {
            title: "menus.pureHome",
            icon: "ep:home-filled",
          },
        },
      ]
    : [];

export type RouteConfigs = {
  path?: string;
  query?: object;
  params?: object;
  meta?: RouteMeta;
  children?: RouteConfigs[];
  name?: string;
};

// export type routeMetaType = {
//   title?: string;
//   icon?: string | IconifyIcon;
//   showLink?: boolean;
//   savedPosition?: boolean;
//   auths?: Array<string>;
// };

export type themeColorsType = {
  color: string;
  themeColor: string;
};