import vue from "@vitejs/plugin-vue";
import type { PluginOption } from "vite";
import svgLoader from "vite-svg-loader";
import vueJsx from "@vitejs/plugin-vue-jsx";
import { pathResolve } from "./utils";
import VueI18nPlugin from "@intlify/unplugin-vue-i18n/vite";
import { vitePluginFakeServer } from "vite-plugin-fake-server";
import { genScssMultipleScopeVars } from "../src/layout/theme";
import { themePreprocessorPlugin } from "@pureadmin/theme";

export function getPluginsList(
  VITE_CDN: boolean,
  VITE_COMPRESSION: ViteCompression
): PluginOption[] {
  return [
    vue(),
    vueJsx(),
    VueI18nPlugin({
      jitCompilation: false,
      include: [pathResolve("../locales/**")],
    }),
    vitePluginFakeServer({
      logger: false,
      include: "mock",
      infixName: false,
      enableProd: true,
    }),
    svgLoader(),
    themePreprocessorPlugin({
      scss: {
        multipleScopeVars: genScssMultipleScopeVars(),
        extract: true,
      },
    }),
  ];
}
