<script setup lang="ts">
import { useTags } from "@/layout/hooks/useTag";
import { routerArrays } from "@/layout/types";
import { transformI18n } from "@/plugins/i18n";
import { getTopMenu, handleAliveRoute } from "@/router/utils";
import { useMultiTagsStoreHook } from "@/store/modules/multiTags";
import { usePermissionStoreHook } from "@/store/modules/permission";
import { useSettingStoreHook } from "@/store/modules/settings";
import { emitter } from "@/utils/mitt";
import ArrowLeftSLine from "@iconify-icons/ri/arrow-left-s-line";
import ArrowRightSLine from "@iconify-icons/ri/arrow-right-s-line";
import { isAllEmpty, isEqual } from "@pureadmin/utils";
import { nextTick, onMounted, toRaw } from "vue";
import { ref, unref } from "vue";

const {
  Close,
  route,
  router,
  showTags,
  translateX,
  isScrolling,
  showModel,
  linkIsActive,
  isFixedTag,
  getTabStyle,
  multiTags,
  closeMenu,
  tagsViews,
  currentSelect,
  buttonLeft,
  buttonTop,
  visible,
  onMouseenter,
  onMouseleave,
  iconIsActive,
  activeIndex,
  scheduleIsActive,
  instance
} = useTags();

const tabDom = ref();
const containerDom = ref();
const scrollbarDom = ref();
const isShowArrow = ref(false);
const topPath = getTopMenu()?.path;
const { VITE_HIDE_HOME } = import.meta.env;
const fixedTags = [
  ...routerArrays,
  ...usePermissionStoreHook().flatteningRoutes.filter(v => v?.meta?.fixedTag)
];

const handleScroll = (offset: number): void => {
  const scrollbarDomWidth = scrollbarDom.value
    ? scrollbarDom.value?.offsetWidth
    : 0;
  const tabDomWidth = tabDom.value ? tabDom.value.offsetWidth : 0;
  if (offset > 0) {
    translateX.value = Math.min(0, translateX.value + offset);
  } else {
    if (scrollbarDomWidth < tabDomWidth) {
      if (translateX.value >= -(tabDomWidth - scrollbarDomWidth)) {
        translateX.value = Math.max(
          translateX.value + offset,
          scrollbarDomWidth - tabDomWidth
        );
      }
    } else {
      translateX.value = 0;
    }
  }
  isScrolling.value = false;
};

const handleWheel = (event: WheelEvent): void => {
  isScrolling.value = true;
  const scrollIntensity = Math.abs(event.deltaX) + Math.abs(event.deltaY);
  let offset = 0;
  if (event.deltaX < 0) {
    offset = scrollIntensity > 0 ? scrollIntensity : 100;
  } else {
    offset = scrollIntensity > 0 ? -scrollIntensity : -100;
  }

  smoothScroll(offset);
};

const smoothScroll = (offset: number): void => {
  // 每帧滚动的距离
  const scrollAmount = 20;
  let remaining = Math.abs(offset);

  const scrollStep = () => {
    const scrollOffset = Math.sign(offset) * Math.min(scrollAmount, remaining);
    handleScroll(scrollOffset);
    remaining -= Math.abs(scrollOffset);

    if (remaining > 0) {
      requestAnimationFrame(scrollStep);
    }
  };

  requestAnimationFrame(scrollStep);
};

function showMenus(value: boolean) {
  Array.of(1, 2, 3, 4, 5).forEach(v => {
    tagsViews[v].show = value;
  });
}

function openMenu(tag, e) {
  closeMenu();
  if (tag.path === topPath || tag?.meta?.fixedTag) {
    // 右键菜单为顶级菜单或拥有 fixedTag 属性，只显示刷新
    showMenus(false);
    tagsViews[0].show = true;
  } else if (route.path !== tag.path && route.name !== tag.name) {
    // 右键菜单不匹配当前路由，隐藏刷新
    tagsViews[0].show = false;
    showMenuModel(tag.path, tag.query);
  } else if (multiTags.value.length === 2 && route.path !== tag.path) {
    showMenus(true);
    // 只有两个标签时不显示关闭其他标签页
    tagsViews[4].show = false;
  } else if (route.path === tag.path) {
    // 右键当前激活的菜单
    showMenuModel(tag.path, tag.query, true);
  }

  currentSelect.value = tag;
  const menuMinWidth = 140;
  const offsetLeft = unref(containerDom).getBoundingClientRect().left;
  const offsetWidth = unref(containerDom).offsetWidth;
  const maxLeft = offsetWidth - menuMinWidth;
  const left = e.clientX - offsetLeft + 5;
  if (left > maxLeft) {
    buttonLeft.value = maxLeft;
  } else {
    buttonLeft.value = left;
  }
  useSettingStoreHook().hiddenSideBar
    ? (buttonTop.value = e.clientY)
    : (buttonTop.value = e.clientY - 40);
  nextTick(() => {
    visible.value = true;
  });
}

function showMenuModel(
  currentPath: string,
  query: object = {},
  refresh = false
) {
  const allRoute = multiTags.value;
  const routeLength = multiTags.value.length;
  let currentIndex = -1;
  if (isAllEmpty(query)) {
    currentIndex = allRoute.findIndex(v => v.path === currentPath);
  } else {
    currentIndex = allRoute.findIndex(v => isEqual(v.query, query));
  }
  function fixedTagDisabled() {
    if (allRoute[currentIndex]?.meta?.fixedTag) {
      Array.of(1, 2, 3, 4, 5).forEach(v => {
        tagsViews[v].disabled = true;
      });
    }
  }

  showMenus(true);

  if (refresh) {
    tagsViews[0].show = true;
  }

  /**
   * currentIndex为1时，左侧的菜单顶级菜单，则不显示关闭左侧标签页
   * 如果currentIndex等于routeLength-1，右侧没有菜单，则不显示关闭右侧标签页
   */
  if (currentIndex === 1 && routeLength !== 2) {
    // 左侧的菜单是顶级菜单，右侧存在别的菜单
    tagsViews[2].show = false;
    Array.of(1, 3, 4, 5).forEach(v => {
      tagsViews[v].disabled = false;
    });
    tagsViews[2].disabled = true;
    fixedTagDisabled();
  } else if (currentIndex === 1 && routeLength === 2) {
    disabledMenus(false);
    // 左侧的菜单是顶级菜单，右侧不存在别的菜单
    Array.of(2, 3, 4).forEach(v => {
      tagsViews[v].show = false;
      tagsViews[v].disabled = true;
    });
    fixedTagDisabled();
  } else if (routeLength - 1 === currentIndex && currentIndex !== 0) {
    // 当前路由是所有路由中的最后一个
    tagsViews[3].show = false;
    Array.of(1, 2, 4, 5).forEach(v => {
      tagsViews[v].disabled = false;
    });
    tagsViews[3].disabled = true;
    if (allRoute[currentIndex - 1]?.meta?.fixedTag) {
      tagsViews[2].show = false;
      tagsViews[2].disabled = true;
    }
    fixedTagDisabled();
  } else if (currentIndex === 0 || currentPath === `/redirect${topPath}`) {
    // 当前路由为顶级菜单
    disabledMenus(true);
  } else {
    disabledMenus(false, allRoute[currentIndex - 1]?.meta?.fixedTag);
    fixedTagDisabled();
  }
}

function disabledMenus(value: boolean, fixedTag = false) {
  Array.of(1, 2, 3, 4, 5).forEach(v => {
    tagsViews[v].disabled = value;
  });
  if (fixedTag) {
    tagsViews[2].show = false;
    tagsViews[2].disabled = true;
  }
}

/** 触发tags标签切换 */
function tagOnClick(item) {
  const { name, path } = item;
  if (name) {
    if (item.query) {
      router.push({
        name,
        query: item.query
      });
    } else if (item.params) {
      router.push({
        name,
        params: item.params
      });
    } else {
      router.push({ name });
    }
  } else {
    router.push({ path });
  }
}

const dynamicTagView = async () => {
  await nextTick();
  const index = multiTags.value.findIndex(item => {
    if (!isAllEmpty(route.query)) {
      return isEqual(route.query, item.query);
    } else if (!isAllEmpty(route.params)) {
      return isEqual(route.params, item.params);
    } else {
      return route.path === item.path;
    }
  });
  moveToView(index);
};

const moveToView = async (index: number): Promise<void> => {
  await nextTick();
  const tabNavPadding = 10;
  if (!instance.refs["dynamic" + index]) return;
  const tabItemEl = instance.refs["dynamic" + index][0];
  const tabItemElOffsetLeft = (tabItemEl as HTMLElement)?.offsetLeft;
  const tabItemOffsetWidth = (tabItemEl as HTMLElement)?.offsetWidth;
  // 标签页导航栏可视长度（不包含溢出部分）
  const scrollbarDomWidth = scrollbarDom.value
    ? scrollbarDom.value?.offsetWidth
    : 0;

  // 已有标签页总长度（包含溢出部分）
  const tabDomWidth = tabDom.value ? tabDom.value?.offsetWidth : 0;

  scrollbarDomWidth <= tabDomWidth
    ? (isShowArrow.value = true)
    : (isShowArrow.value = false);
  if (tabDomWidth < scrollbarDomWidth || tabItemElOffsetLeft === 0) {
    translateX.value = 0;
  } else if (tabItemElOffsetLeft < -translateX.value) {
    // 标签在可视区域左侧
    translateX.value = -tabItemElOffsetLeft + tabNavPadding;
  } else if (
    tabItemElOffsetLeft > -translateX.value &&
    tabItemElOffsetLeft + tabItemOffsetWidth <
      -translateX.value + scrollbarDomWidth
  ) {
    // 标签在可视区域
    translateX.value = Math.min(
      0,
      scrollbarDomWidth -
        tabItemOffsetWidth -
        tabItemElOffsetLeft -
        tabNavPadding
    );
  } else {
    // 标签在可视区域右侧
    translateX.value = -(
      tabItemElOffsetLeft -
      (scrollbarDomWidth - tabNavPadding - tabItemOffsetWidth)
    );
  }
};

function deleteDynamicTag(obj: any, current: any, tag?: string) {
  const valueIndex: number = multiTags.value.findIndex((item: any) => {
    if (item.query) {
      if (item.path === obj.path) {
        return item.query === obj.query;
      }
    } else if (item.params) {
      if (item.path === obj.path) {
        return item.params === obj.params;
      }
    } else {
      return item.path === obj.path;
    }
  });

  const spliceRoute = (
    startIndex?: number,
    length?: number,
    other?: boolean
  ): void => {
    if (other) {
      useMultiTagsStoreHook().handleTags(
        "equal",
        [
          VITE_HIDE_HOME === "false" ? fixedTags : toRaw(getTopMenu()),
          obj
        ].flat()
      );
    } else {
      useMultiTagsStoreHook().handleTags("splice", "", {
        startIndex,
        length
      }) as any;
    }
    dynamicTagView();
  };

  if (tag === "other") {
    spliceRoute(1, 1, true);
  } else if (tag === "left") {
    spliceRoute(fixedTags.length, valueIndex - 1, true);
  } else if (tag === "right") {
    spliceRoute(valueIndex + 1, multiTags.value.length);
  } else {
    // 从当前匹配到的路径中删除
    spliceRoute(valueIndex, 1);
  }
  const newRoute = useMultiTagsStoreHook().handleTags("slice");
  if (current === route.path) {
    // 如果删除当前激活tag就自动切换到最后一个tag
    if (tag === "left") return;
    if (newRoute[0]?.query) {
      router.push({ name: newRoute[0].name, query: newRoute[0].query });
    } else if (newRoute[0]?.params) {
      router.push({ name: newRoute[0].name, params: newRoute[0].params });
    } else {
      router.push({ path: newRoute[0].path });
    }
  } else {
    if (!multiTags.value.length) return;
    if (multiTags.value.some(item => item.path === route.path)) return;
    if (newRoute[0]?.query) {
      router.push({ name: newRoute[0].name, query: newRoute[0].query });
    } else if (newRoute[0]?.params) {
      router.push({ name: newRoute[0].name, params: newRoute[0].params });
    } else {
      router.push({ path: newRoute[0].path });
    }
  }
}

function deleteMenu(item, tag?: string) {
  deleteDynamicTag(item, item.path, tag);
  handleAliveRoute(route as ToRouteType);
}

function dynamicRouteTag(value: string): void {
  const hasValue = multiTags.value.some(item => {
    return item.path === value;
  });

  function concatPath(arr: object[], value: string) {
    if (!hasValue) {
      arr.forEach((arrItem: any) => {
        if (arrItem.path === value) {
          useMultiTagsStoreHook().handleTags("push", {
            path: value,
            meta: arrItem.meta,
            name: arrItem.name
          });
        } else {
          if (arrItem.children && arrItem.children.length > 0) {
            concatPath(arrItem.children, value);
          }
        }
      });
    }
  }
  concatPath(router.options.routes as any, value);
}

onMounted(() => {
  showMenuModel(route.fullPath);

  //  接收侧边栏切换传递过来的参数
  emitter.on("changLayoutRoute", indexPath => {
    dynamicRouteTag(indexPath);
    setTimeout(() => {
      showMenuModel(indexPath);
    });
  });
});
</script>

<template>
  <div v-if="!showTags" ref="containerDom" class="tags-view">
    <span v-show="isShowArrow" class="arrow-left cursor-pointer">
      <IconifyIconOffline :icon="ArrowLeftSLine" @click="handleScroll(200)" />
    </span>

    <div
      ref="scrollbarDom"
      class="scroll-container"
      :class="showModel == 'chrome' && 'chrome-scroll-container'"
      @wheel.prevent="handleWheel"
    >
      <div ref="tabDom" class="tab select-none" :style="getTabStyle">
        <div
          v-for="(item, index) in multiTags"
          :ref="'dynamic' + index"
          :key="index"
          :class="[
            'scroll-item is-closable',
            linkIsActive(item),
            showModel === 'chrome' && 'chrome-item',
            isFixedTag(item) && 'fixed-tag'
          ]"
          @contextmenu.prevent="openMenu(item, $event)"
          @mouseenter.prevent="onMouseenter(index)"
          @mouseleave.prevent="onMouseleave(index)"
          @click="tagOnClick(item)"
        >
          <template v-if="showModel !== 'chrome'">
            <span
              class="tag-title dark:!text-text_color_primary dark:hover:!text-primary"
            >
              {{ transformI18n(item.meta.title) }}
            </span>
            <span
              v-if="
                isFixedTag(item)
                  ? false
                  : iconIsActive(item, index) ||
                    (index === activeIndex && index !== 0)
              "
              class="el-icon-close"
              @click.stop="deleteMenu(item)"
            >
              <IconifyIconOffline :icon="Close" />
            </span>
            <span
              v-if="showModel !== 'card'"
              :ref="'schedule' + index"
              :class="[scheduleIsActive(item)]"
            />
          </template>
          <div v-else class="chrome-tab">
            <div class="chrome-tab__bg">
              <TagChrome />
            </div>
            <span class="tag-title">
              {{ transformI18n(item.meta.title) }}
            </span>
            <span
              v-if="isFixedTag(item) ? false : index !== 0"
              class="chrome-close-btn"
              @click.stop="deleteMenu(item)"
            >
              <IconifyIconOffline :icon="Close" />
            </span>
            <span class="chrome-tab-divider" />
          </div>
        </div>
      </div>
    </div>

    <span v-show="isShowArrow" class="arrow-right">
      <IconifyIconOffline :icon="ArrowRightSLine" @click="handleScroll(-200)" />
    </span>
  </div>
</template>

<style lang="scss" scoped>
@import url("./index.scss");
</style>
