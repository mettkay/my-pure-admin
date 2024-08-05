<script setup lang="ts">
import { computed } from "vue";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import plusEn from "plus-pro-components/es/locale/lang/en";
import plusZhCn from "plus-pro-components/es/locale/lang/zh-cn";
import { ElConfigProvider } from 'element-plus'

import { storageLocal } from "@pureadmin/utils";

// const { $storage } = useGlobal<GlobalUtilsPropertiesApi>();

const currentLocale = computed(() => {
  return storageLocal().getItem<StorageConfigs>("responsive-locale")?.locale ===
    "zh"
    ? { ...zhCn, ...plusZhCn }
    : { ...en, ...plusEn };
});
</script>

<template>
  <el-config-provider :locale="currentLocale">
    <router-view />
  </el-config-provider>
</template>

<style scoped>
.logo {
  height: 6em;
  padding: 1.5em;
  will-change: filter;
  transition: filter 300ms;
}
.logo:hover {
  filter: drop-shadow(0 0 2em #646cffaa);
}
.logo.vue:hover {
  filter: drop-shadow(0 0 2em #42b883aa);
}
</style>
