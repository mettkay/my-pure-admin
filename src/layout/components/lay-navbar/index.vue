<script setup>
import { useNav } from "@/layout/hooks/useNav";
import LaySearch from "../lay-search/index.vue";

const { layout } = useNav();
</script>

<template>
  <div class="navbar bg-white shadow-sm shadow-[rgba(0,21,41,0.08)]">
    <div v-if="layout === 'vertical'" class="vertical-header-right">
      <LaySearch id="header-search" />
    </div>
  </div>
</template>
