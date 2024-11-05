<script setup lang="ts">
import { computed } from "vue";
import en from "element-plus/es/locale/lang/en";
import zhCn from "element-plus/es/locale/lang/zh-cn";
import plusEn from "plus-pro-components/es/locale/lang/en";
import plusZhCn from "plus-pro-components/es/locale/lang/zh-cn";
import { ElConfigProvider } from "element-plus";

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

<style scoped></style>
