import vue from "@vitejs/plugin-vue";
import type { PluginOption } from "vite";
import svgLoader from "vite-svg-loader";
import { pathResolve } from "./utils";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";

export function getPluginsList(
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression
): PluginOption[] {
  return [
    vue(),
    VueI18nPlugin({
      jitCompilation: false,
      include: [pathResolve("../locales/**")],
    }),
    svgLoader(),
  ];
}