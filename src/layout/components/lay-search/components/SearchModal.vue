<script setup lang="ts">
import "animate.css";
import iconifyIconOffline from "@/components/ReIcon/src/iconifyIconOffline";
import { useNav } from "@/layout/hooks/useNav";
import { match } from "pinyin-pro";
import { transformI18n } from "@/plugins/i18n";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { cloneDeep, isAllEmpty, storageLocal } from "@pureadmin/utils";
import { onKeyStroke, useDebounceFn } from "@vueuse/core";
import { computed, ref, shallowRef, watch } from "vue";
import { useI18n } from "vue-i18n";
import { useRouter } from "vue-router";
import SearchResult from "./SearchResult.vue";
import SearchHistory from "./SearchHistory.vue";
import SearchFooter from "./SearchFooter.vue";
import SearchIcon from "@iconify-icons/ri/search-line";
import { dragItem, optionsItem } from "../types";
import { getConfig } from "@/config";

const HISTORY_TYPE = "history";
const COLLECT_TYPE = "collect";
const LOCALEHISTORYKEY = "menu-search-history";
const LOCALECOLLECTKEY = "menu-search-collect";

interface Props {
  value: boolean;
}

interface Emits {
  (e: "update:value", val: boolean): void;
}

const { device } = useNav();
const emit = defineEmits<Emits>();
const props = withDefaults(defineProps<Props>(), {});

const router = useRouter();
const { t, locale } = useI18n();

const keyword = ref("");
const historyPath = ref("");
const activePath = ref("");
const resultOptions = shallowRef([]);
const historyOptions = shallowRef([]);
const inputRef = ref(null);
const resultRef = ref();
const historyRef = ref();
const scrollbarRef = ref();
const historyNum = getConfig().MenuSearchHistory;

const handleSearch = useDebounceFn(search, 300);

const menusData = computed(() => {
  return cloneDeep(usePermissionStoreHook().wholeMenus);
});

watch(
  () => props.value,
  newValue => {
    if (newValue) getHistory();
  }
);

const show = computed({
  get() {
    return props.value;
  },
  set(val: boolean) {
    emit("update:value", val);
  }
});

const showSearchResult = computed(() => {
  return keyword.value && resultOptions.value.length > 0;
});

const showSearchHistory = computed(() => {
  return !keyword.value && historyOptions.value.length > 0;
});

const showEmpty = computed(() => {
  return (
    (!keyword.value && historyOptions.value.length === 0) ||
    (keyword.value && resultOptions.value.length === 0)
  );
});

function handleClose() {
  show.value = false;

  setTimeout(() => {
    resultOptions.value = [];
    historyPath.value = "";
    keyword.value = "";
  }, 200);
}

function flatTree(arr) {
  const res = [];
  function deep(arr) {
    arr.forEach(item => {
      res.push(item);
      item.children && deep(item.children);
    });
  }
  deep(arr);
  return res;
}

function search() {
  const flatMenusData = flatTree(menusData.value);
  resultOptions.value = flatMenusData.filter(menu =>
    keyword.value
      ? transformI18n(menu.meta?.title)
          .toLocaleLowerCase()
          .includes(keyword.value.toLocaleLowerCase().trim()) ||
        (locale.value === "zh" &&
          !isAllEmpty(
            match(
              transformI18n(menu.meta?.title).toLocaleLowerCase(),
              keyword.value.toLocaleLowerCase().trim()
            )
          ))
      : false
  );
}

function getStorageItem(key) {
  return storageLocal().getItem<optionsItem[]>(key) || [];
}

function setStorageItem(key, value) {
  storageLocal().setItem(key, value);
}

function saveHistory() {
  const { path, meta } = resultOptions.value.find(
    item => item.path === activePath.value
  );
  const searchHistoryList = getStorageItem(LOCALEHISTORYKEY);
  const searchCollectList = getStorageItem(LOCALECOLLECTKEY);
  const isCollected = searchCollectList.some(item => item.path === path);
  const existingIndex = searchHistoryList.findIndex(item => item.path === path);
  if (!isCollected) {
    if (existingIndex !== -1) searchHistoryList.splice(existingIndex, 1);
    if (searchHistoryList.length >= historyNum) searchHistoryList.pop();
    searchHistoryList.unshift({ path, meta, type: HISTORY_TYPE });
    setStorageItem(LOCALEHISTORYKEY, searchHistoryList);
  }
}

function updateHistory() {
  let searchHistoryList = getStorageItem(LOCALEHISTORYKEY);
  const historyIndex = searchHistoryList.findIndex(
    item => item.path === historyPath.value
  );
  if (historyIndex !== -1) {
    const [historyItem] = searchHistoryList.splice(historyIndex, 1);
    searchHistoryList.unshift(historyItem);
    setStorageItem(LOCALEHISTORYKEY, searchHistoryList);
  }
}

function getCurrentOptionsAndPath() {
  const isResultOptions = resultOptions.value.length > 0;
  const options = isResultOptions ? resultOptions.value : historyOptions.value;
  const currentPath = isResultOptions ? activePath.value : historyPath.value;
  return { options, currentPath, isResultOptions };
}

function scrollTo(index) {
  const ref = resultOptions.value.length ? resultRef.value : historyRef.value;
  const scrollTop = ref.handleScroll(index);
  scrollbarRef.value.setScrollTop(scrollTop);
}

function updatePathAndScroll(newIndex, isResultOptions) {
  if (isResultOptions) {
    activePath.value = resultOptions.value[newIndex].path;
  } else {
    historyPath.value = historyOptions.value[newIndex].path;
  }
  console.log(
    "%c [ newIndex ]-175",
    "font-size:13px; background:pink; color:#bf2c9f;",
    newIndex
  );
  scrollTo(newIndex);
}

function handleUp() {
  const { options, currentPath, isResultOptions } = getCurrentOptionsAndPath();
  if (options.length === 0) return;
  const index = options.findIndex(item => item.path === currentPath);
  const prevIndex = (index - 1 + options.length) % options.length;
  updatePathAndScroll(prevIndex, isResultOptions);
}

function handleDown() {
  const { options, currentPath, isResultOptions } = getCurrentOptionsAndPath();
  if (options.length === 0) return;
  const index = options.findIndex(item => item.path === currentPath);
  const nextIndex = (index + 1) % options.length;
  updatePathAndScroll(nextIndex, isResultOptions);
}

function handleEnter() {
  const { options, currentPath, isResultOptions } = getCurrentOptionsAndPath();
  if (options.length === 0 || currentPath === "") return;
  const index = options.findIndex(item => item.path === currentPath);
  if (index === -1) return;
  if (isResultOptions) {
    saveHistory();
  } else {
    updateHistory();
  }
  router.push(options[index].path);
  handleClose();
}

function handleDelete(item) {
  const key = item.type === HISTORY_TYPE ? LOCALEHISTORYKEY : LOCALECOLLECTKEY;
  let list = getStorageItem(key);
  list = list.filter(listItem => listItem.path !== item.path);
  setStorageItem(key, list);
  getHistory();
}

function handleCollect(item) {
  let searchHistoryList = getStorageItem(LOCALEHISTORYKEY);
  let searchCollectList = getStorageItem(LOCALECOLLECTKEY);
  console.log(
    "%c [ searchCollectList ]-192",
    "font-size:13px; background:pink; color:#bf2c9f;",
    searchCollectList
  );
  searchHistoryList = searchHistoryList.filter(
    historyItem => historyItem.path !== item.path
  );
  setStorageItem(LOCALEHISTORYKEY, searchHistoryList);
  if (!searchCollectList.some(collectItem => collectItem.path === item.path)) {
    searchCollectList.unshift({ ...item, type: COLLECT_TYPE });
    setStorageItem(LOCALECOLLECTKEY, searchCollectList);
  }
  getHistory();
}

function handleDrag(item: dragItem) {
  const searchCollectList = getStorageItem(LOCALECOLLECTKEY);
  const [reorderedItem] = searchCollectList.splice(item.oldIndex, 1);
  searchCollectList.splice(item.newIndex, 0, reorderedItem);
  setStorageItem(LOCALECOLLECTKEY, searchCollectList);
  historyOptions.value = [
    ...getStorageItem(LOCALEHISTORYKEY),
    ...getStorageItem(LOCALECOLLECTKEY)
  ];
  historyPath.value = reorderedItem.path;
}

function getHistory() {
  const searchHistoryList = getStorageItem(LOCALEHISTORYKEY);
  const searchCollectList = getStorageItem(LOCALECOLLECTKEY);
  historyOptions.value = [...searchHistoryList, ...searchCollectList];
  historyPath.value = historyOptions.value[0]?.path;
}

onKeyStroke("Enter", handleEnter);
onKeyStroke("ArrowUp", handleUp);
onKeyStroke("ArrowDown", handleDown);
</script>

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
  >
    <el-input
      ref="inputRef"
      v-model="keyword"
      size="large"
      clearable
      :placeholder="t('search.purePlaceholder')"
      @input="handleSearch"
    >
      <template #prefix>
        <iconifyIconOffline
          :icon="SearchIcon"
          class="text-primary w-[24px] h-[24px]"
        />
      </template>
    </el-input>

    <div class="search-content mt-[12px]">
      <el-scrollbar ref="scrollbarRef" max-height="calc(90vh-140px)">
        <el-empty v-if="showEmpty" :description="t('search.pureEmpty')" />
        <SearchHistory
          v-if="showSearchHistory"
          ref="historyRef"
          v-model:value="historyPath"
          :options="historyOptions"
          @click="handleEnter"
          @delete="handleDelete"
          @collect="handleCollect"
          @drag="handleDrag"
        />
        <SearchResult
          v-if="showSearchResult"
          ref="resultRef"
          v-model:value="activePath"
          :options="resultOptions"
          @click="handleEnter"
        />
      </el-scrollbar>
    </div>

    <template #footer>
      <SearchFooter :total="resultOptions.length" />
    </template>
  </el-dialog>
</template>

<style scoped></style>
