import { useEpThemeStoreHook } from "@/store/modules/epTheme";
import { useGlobal } from "@pureadmin/utils";
import { computed, CSSProperties } from "vue";
import { emitter } from "@/utils/mitt";
import { getConfig } from "@/config";
import { router, remainingPaths } from "@/router";
import { transformI18n } from "@/plugins/i18n";
import { RouteMeta } from "vue-router";
import { useAppStoreHook } from "@/store/modules/app";
import { storeToRefs } from "pinia";
import { usePermissionStoreHook } from "@/store/modules/permission";


export function useNav() {
  const pureApp = useAppStoreHook();
  const tooltipEffect = getConfig()?.TooltipEffect ?? "light";
  const { wholeMenus } = storeToRefs(usePermissionStoreHook());

  const getDivStyle = computed((): CSSProperties => {
    return {
      width: "100%",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      overflow: "hidden",
    };
  });

  /** 设置国际化选中后的样式 */
  const getDropdownItemStyle = computed(() => {
    return (locale, t) => {
      return {
        background: locale === t ? useEpThemeStoreHook().epThemeColor : "",
        color: locale === t ? "#f4f4f5" : "#000",
      };
    };
  });

  /** 动态title */
  function changeTitle(meta: RouteMeta) {
    const Title = getConfig().Title;
    if (Title) document.title = `${transformI18n(meta.title)} | ${Title}`;
    else document.title = transformI18n(meta.title);
  }

  function handleResize(menuRef) {
    menuRef?.handleResize();
  }

  const isCollapse = computed(() => {
    return !pureApp.getSidebarStatus;
  });

  const device = computed(() => {
    return pureApp.getDevice;
  });

  const layout = computed(() => {
    return $storage?.layout?.layout;
  });

  const getDropdownItemClass = computed(() => {
    return (locale, t) => {
      return locale === t ? "" : "dark:hover:!text-primary";
    };
  });

  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();

  const title = computed(() => {
    return $config.Title;
  });

  function toggleSideBar() {
    pureApp.toggleSideBar();
  }

  function menuSelect(indexPath: string) {
    if (wholeMenus.value.length === 0 || isRemaining(indexPath)) return;
    emitter.emit("changLayoutRoute", indexPath);
  }

  function isRemaining(path: string) {
    return remainingPaths.includes(path);
  }

  function getLogo() {
    return new URL("/logo.svg", import.meta.url).href;
  }

  return {
    title,
    layout,
    pureApp,
    isCollapse,
    getDivStyle,
    device,
    menuSelect,
    tooltipEffect,
    changeTitle,
    toggleSideBar,
    handleResize,
    getLogo,
    getDropdownItemStyle,
    getDropdownItemClass,
  };
}
