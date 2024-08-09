<script setup lang="ts">
import { bg, avatar, illustration } from "./utils/static";
import { useNav } from "@/layout/hooks/useNav";
import { loginRules } from "./utils/rule";
import TypeIt from "@/components/ReTypeit";
import Motion from "./utils/motion";
import dayIcon from "@/assets/svg/day.svg?component";
import darkIcon from "@/assets/svg/dark.svg?component";
import Check from "@iconify-icons/ep/check";
import globalization from "@/assets/svg/globalization.svg?component";
import { useRenderIcon } from "@/components/ReIcon/src/hooks";
import { useDataThemeChange } from "@/layout/hooks/useDataThemeChange";
import { useTranslationLang } from "@/layout/hooks/useTranslationLang";
import { toRaw, reactive, computed, ref } from "vue";
import { ReImageVerify } from "@/components/ReImageVerify";
import { useUserStoreHook } from "@/store/modules/user";
import { FormInstance } from "element-plus";
import { transformI18n } from "@/plugins/i18n";
import { useI18n } from "vue-i18n";
import User from "@iconify-icons/ri/user-3-fill";
import Lock from "@iconify-icons/ri/lock-fill";
import Info from "@iconify-icons/ri/information-line";

const { dataTheme, overallStyle, dataThemeChange } = useDataThemeChange();
dataThemeChange(overallStyle.value);

const { t } = useI18n();

const { title, getDropdownItemStyle, getDropdownItemClass } = useNav();
const { locale, translationCh, translationEn } = useTranslationLang();

const checked = ref(false);
const loading = ref(false);
const disabled = ref(false);
const loginDay = ref(7);
const imgCode = ref("");

const ruleFormRef = ref<FormInstance>();
const currentPage = computed(() => {
  return useUserStoreHook().currentPage;
});

const ruleForm = reactive({
  username: "admin",
  password: "admin123",
  verifyCode: "",
});

const onLogin = async (formEl: FormInstance | undefined) => {
  console.log("formEl:", formEl);
};
</script>

<template>
  <div class="select-none">
    <img :src="bg" class="wave" />
    <div class="flex-c absolute right-5 top-3">
      <el-switch
        v-model="dataTheme"
        inline-prompt
        :active-icon="dayIcon"
        :inactive-icon="darkIcon"
        @change="dataThemeChange"
      />

      <el-dropdown trigger="click">
        <globalization
          class="hover:text-primary hover:!bg-[transparent] w-[20px] h-[20px] ml-1.5 cursor-pointer outline-none duration-300"
        />
        <template #dropdown>
          <el-dropdown-menu class="translation">
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'zh')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'zh')]"
              @click="translationCh"
            >
              <IconifyIconOffline
                v-show="locale === 'zh'"
                class="check-zh"
                :icon="Check"
              />
              简体中文
            </el-dropdown-item>
            <el-dropdown-item
              :style="getDropdownItemStyle(locale, 'en')"
              :class="['dark:!text-white', getDropdownItemClass(locale, 'en')]"
              @click="translationEn"
            >
              <span v-show="locale === 'en'" class="check-en">
                <IconifyIconOffline :icon="Check" />
              </span>
              English
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <div class="login-container">
      <div class="img">
        <component :is="illustration" />
      </div>

      <div class="login-box">
        <div class="login-form">
          <avatar class="avatar" />
          <Motion>
            <h2 class="outline-none">
              <TypeIt
                :options="{ strings: [title], cursor: false, speed: 100 }"
              />
            </h2>
          </Motion>

          <el-form
            v-if="currentPage === 0"
            ref="ruleFormRef"
            :model="ruleForm"
            :rules="loginRules"
            size="large"
          >
            <Motion :delay="100">
              <el-form-item
                :rules="[
                  {
                    required: true,
                    message: transformI18n($t('login.pureUsernameReg')),
                    trigger: 'blur',
                  },
                ]"
                prop="username"
              >
                <el-input
                  v-model="ruleForm.username"
                  clearable
                  :placeholder="t('login.pureUsername')"
                  :prefix-icon="useRenderIcon(User)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="150">
              <el-form-item prop="password">
                <el-input
                  v-model="ruleForm.password"
                  clearable
                  show-password
                  :placeholder="t('login.purePassword')"
                  :prefix-icon="useRenderIcon(Lock)"
                />
              </el-form-item>
            </Motion>

            <Motion :delay="200">
              <el-form-item prop="verifyCode">
                <el-input
                  v-model="ruleForm.verifyCode"
                  clearable
                  :placeholder="t('login.pureVerifyCode')"
                  :prefix-icon="useRenderIcon('ri:shield-keyhole-line')"
                >
                  <template v-slot:append>
                    <ReImageVerify v-model:code="imgCode" />
                  </template>
                </el-input>
              </el-form-item>
            </Motion>

            <Motion :delay="250">
              <el-form-item>
                <div class="w-full h-[20px] flex justify-between items-center">
                  <el-checkbox v-model="checked">
                    <span class="flex">
                      <select
                        v-model="loginDay"
                        :style="{
                          width: loginDay < 10 ? '10px' : '16px',
                          outline: 'none',
                          background: 'none',
                          appearance: 'none',
                        }"
                      >
                        <option value="1">1</option>
                        <option value="7">7</option>
                        <option value="30">30</option>
                      </select>
                      {{ t("login.pureRemember") }}
                      <IconifyIconOffline
                        v-tippy="{
                          content: t('login.pureRememberInfo'),
                          placement: 'top',
                        }"
                        :icon="Info"
                        class="ml-1"
                      />
                    </span>
                  </el-checkbox>
                  <el-button
                    link
                    type="primary"
                    @click="useUserStoreHook().SET_CURRENTPAGE(4)"
                  >
                    {{ t("login.pureForget") }}
                  </el-button>
                </div>
                <el-button
                  class="w-full mt-4"
                  size="default"
                  type="primary"
                  :loading="loading"
                  :disabled="disabled"
                  @click="onLogin(ruleFormRef)"
                >
                  {{ t("login.pureLogin") }}
                </el-button>
              </el-form-item>
            </Motion>
          </el-form>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
:deep(.el-input-group__append, .el-input-group__prepend) {
  padding: 0;
}

.translation {
  ::v-deep(.el-dropdown-menu__item) {
    padding: 5px 40px;
  }

  .check-zh {
    position: absolute;
    left: 20px;
  }

  .check-en {
    position: absolute;
    left: 20px;
  }
}

.wave {
  position: fixed;
  height: 100%;
  width: 80%;
  left: 0;
  bottom: 0;
  z-index: -1;
}

.login-container {
  width: 100vw;
  height: 100vh;
  max-width: 100%;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  grid-gap: 18rem;
  padding: 0 2rem;
}

.img {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}

.img img {
  width: 500px;
}

.login-box {
  display: flex;
  align-items: center;
  text-align: center;
  overflow: hidden;
}

.login-form {
  width: 360px;
}

.avatar {
  width: 350px;
  height: 80px;
}
</style>
