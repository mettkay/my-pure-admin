<script setup lang="ts">
import iconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";
import { useBoolean } from "@/layout/hooks/useBoolean";
import SearchModal from "./components/SearchModal.vue";

const { bool: show, toggle } = useBoolean();
function handleSearch() {
  toggle();
}
</script>

<template>
  <div>
    <div
      class="search-container w-[40px] h-[48px] flex-col cursor-pointer navbar-bg-hover"
      @click="handleSearch"
    >
      <iconifyIconOffline icon="ri:search-line" />
    </div>
    <SearchModal v-model:value="show" />
  </div>
</template>

<style scoped></style>
