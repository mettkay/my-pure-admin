<script setup lang="ts">
import Sortable from "sortablejs";
import { useEpThemeStoreHook } from "@/store/modules/epTheme";
import { computed, getCurrentInstance, nextTick, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import { dragItem, optionsItem, Props } from "../types";
import SearchHistoryItem from "./SearchHistoryItem.vue";
import { useResizeObserver } from "@vueuse/core";
import { ElRef, isArray } from "@pureadmin/utils";

interface Emits {
  (e: "update:value", val: string): void;
  (e: "enter"): void;
  (e: "collect", val: optionsItem): void;
  (e: "delete", val: optionsItem): void;
  (e: "drag", val: dragItem): void;
}

const { t } = useI18n();
const emit = defineEmits<Emits>();
const instance = getCurrentInstance();
const props = withDefaults(defineProps<Props>(), {});

const historyRef = ref();
const innerHeight = ref();
const stopMouseEvent = ref(false);

const titleStyle = computed(() => {
  return {
    color: useEpThemeStoreHook().epThemeColor,
    fontWeight: 500
  };
});

const active = computed({
  get() {
    return props.value;
  },
  set(val: string) {
    emit("update:value", val);
  }
});

const itemStyle = computed(() => {
  return item => {
    return {
      background:
        item?.path === active.value ? useEpThemeStoreHook().epThemeColor : "",
      color: item.path === active.value ? "#fff" : "",
      fontSize: item.path === active.value ? "16px" : "14px"
    };
  };
});

const historyList = computed(() => {
  return props.options.filter(item => item.type === "history");
});

const collectList = computed(() => {
  return props.options.filter(item => item.type === "collect");
});

async function handleMouse(item) {
  if (!stopMouseEvent.value) active.value = item.path;
}

function handleTo() {
  emit("enter");
}

function handleCollect(item) {
  emit("collect", item);
}

function handleDelete(item) {
  stopMouseEvent.value = true;
  emit("delete", item);
}

const handleChangeIndex = (evt): void => {
  emit("drag", { oldIndex: evt.oldIndex, newIndex: evt.newIndex });
};

function resizeResult() {
  // el-scrollbar max-height="calc(90vh - 140px)"
  innerHeight.value = window.innerHeight - window.innerHeight / 10 - 140;
}

useResizeObserver(historyRef, resizeResult);

let sortableInstance = null;

watch(
  collectList,
  val => {
    if (val.length > 1) {
      nextTick(() => {
        const wrapper: HTMLElement =
          document.querySelector(".collect-container");
        if (!wrapper || sortableInstance) return;
        sortableInstance = Sortable.create(wrapper, {
          animation: 160,
          onStart: event => {
            event.item.style.cursor = "move";
          },
          onEnd: event => {
            event.item.style.cursor = "pointer";
          },
          onUpdate: handleChangeIndex
        });
        resizeResult();
      });
    }
  },
  { deep: true, immediate: true }
);

function handleScroll(index: number) {
  const curInstance = instance?.proxy?.$refs[`historyItemRef${index}`];
  if (!curInstance) return 0;
  const curRef = isArray(curInstance)
    ? (curInstance[0] as ElRef)
    : (curInstance as ElRef);
  const scrollTop = curRef.offsetTop + 128; // 128 两个history-item（56px+56px=112px）高度加上下margin（8px+8px=16px）
  return scrollTop > innerHeight.value ? scrollTop - innerHeight.value : 0;
}

defineExpose({ handleScroll });
</script>

<template>
  <div ref="historyRef" class="history">
    <template v-if="historyList.length">
      <div :style="titleStyle">{{ t("search.pureHistory") }}</div>
      <div
        v-for="(item, index) in historyList"
        :key="item.path"
        :ref="'historyItemRef' + index"
        class="history-item dark:bg-[#1d1d1d]"
        :style="itemStyle(item)"
        @click="handleTo"
        @mouseenter="handleMouse(item)"
      >
        <SearchHistoryItem
          :item="item"
          @delete-item="handleDelete"
          @collect-item="handleCollect"
        />
      </div>
    </template>

    <template v-if="collectList.length">
      <div :style="titleStyle">
        {{
          `${t("search.pureCollect")}${collectList.length > 1 ? t("search.pureDragSort") : ""}`
        }}
      </div>
      <div class="collect-container">
        <div
          v-for="(item, index) in collectList"
          :key="item.path"
          :ref="'historyItemRef' + (index + historyList.length)"
          class="history-item dark:bg-[#1d1d1d]"
          :style="itemStyle(item)"
          @click="handleTo"
          @mouseenter="handleMouse(item)"
        >
          <SearchHistoryItem :item="item" @delete-item="handleDelete" />
        </div>
      </div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.history {
  padding-bottom: 12px;

  &-item {
    display: flex;
    align-items: center;
    height: 56px;
    padding: 14px;
    margin: 8px auto 10px;
    cursor: pointer;
    border: 0.1px solid #ccc;
    border-radius: 4px;
    transition: font-size 0.16s;
  }
}
</style>
