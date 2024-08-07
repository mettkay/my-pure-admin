import { useEpThemeStoreHook } from "@/store/modules/epTheme";
import { useGlobal } from "@pureadmin/utils";
import { computed } from "vue";
import { getConfig } from "@/config";
import { transformI18n } from "@/plugins/i18n";
import { RouteMeta } from "vue-router";


export function useNav() {
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

  const getDropdownItemClass = computed(() => {
    return (locale, t) => {
      return locale === t ? "" : "dark:hover:!text-primary";
    };
  });

  const { $storage, $config } = useGlobal<GlobalPropertiesApi>();

  const title = computed(() => {
    return $config.Title;
  });

  return {
    title,
    changeTitle,
    handleResize,
    getDropdownItemStyle,
    getDropdownItemClass,
  };
}
