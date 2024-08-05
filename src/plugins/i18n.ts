import { type I18n, createI18n } from "vue-i18n";
import { storageLocal, isObject } from "@pureadmin/utils";

import enLocale from "element-plus/es/locale/lang/en";
import zhLocale from "element-plus/es/locale/lang/zh-cn";
import { App } from "vue";
import { responsiveStorageNameSpace } from "@/config";

const siphonI18n = (function () {
  // 仅初始化一次国际化配置
  let cache = Object.fromEntries(
    Object.entries(
      import.meta.glob("../../locales/*.y(a)?ml", { eager: true })
    ).map(([key, value]: any) => {
      const matched = key.match(/([A-Za-z0-9-_]+)\./i)[1];
      return [matched, value.default];
    })
  );
  return (prefix = "zh-CN") => {
    return cache[prefix];
  };
})();

export const localesConfigs = {
  zh: {
    ...siphonI18n("zh-CN"),
    ...zhLocale,
  },
  en: {
    ...siphonI18n("en"),
    ...enLocale,
  },
};

export const $t = (key: string) => key;

export const i18n: I18n = createI18n({
  legacy: false,
  locale:
    storageLocal().getItem<StorageConfigs>(
      `${responsiveStorageNameSpace()}locale`
    )?.locale ?? "zh",
  fallbackLocale: "en",
  messages: localesConfigs,
});

export function useI18n(app: App) {
  app.use(i18n);
}
