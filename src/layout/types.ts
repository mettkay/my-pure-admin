const { VITE_HIDE_HOME } = import.meta.env;
import type { IconifyIcon } from "@iconify/vue/dist/offline.js";
import type { RouteMeta } from "vue-router";

export const routerArrays: Array<RouteConfigs> =
  VITE_HIDE_HOME === "false"
    ? [
        {
          path: "/welcome",
          meta: {
            title: "menus.pureHome",
            icon: "ep:home-filled"
          }
        }
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

export type menuType = {
  id?: number;
  name?: string;
  path?: string;
  noShowingChildren?: boolean;
  children?: menuType[];
  value: unknown;
  meta?: {
    icon?: string;
    title?: string;
    rank?: number;
    showParent?: boolean;
    extraIcon?: string;
  };
  showTooltip?: boolean;
  parentId?: number;
  pathList?: number[];
  redirect?: string;
};

export interface setType {
  sidebar: {
    opened: boolean;
    withoutAnimation: boolean;
    isClickCollapse: boolean;
  };
  device: string;
  fixedHeader: boolean;
  classes: {
    hideSidebar: boolean;
    openSidebar: boolean;
    withoutAnimation: boolean;
    mobile: boolean;
  };
  hideTabs: boolean;
}

// export type routeMetaType = {
//   title?: string;
//   icon?: string | IconifyIcon;
//   showLink?: boolean;
//   savedPosition?: boolean;
//   auths?: Array<string>;
// };

export type tagsViewsType = {
  icon: string | IconifyIcon;
  text: string;
  divided: boolean;
  disabled: boolean;
  show: boolean;
};

export type themeColorsType = {
  color: string;
  themeColor: string;
};
