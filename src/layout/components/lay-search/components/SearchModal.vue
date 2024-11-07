<script setup lang="ts"></script>

<template>
  <el-dialog
    v-model="show"
    top="5vh"
    class="pure-search-dialog"
    :show-close="false"
    :width="device === 'mobile' ? '80vw' : '40vw'"
    :before-close="handleClose"
    :style="{
      borderRadius: '6px'
    }"
    append-to-body
    @opened="inputRef.focus()"
    @close="inputRef.blur()"
  />
</template>

<style scoped></style>
