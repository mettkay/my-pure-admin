import { responsiveStorageNameSpace } from "@/config";
import { storageLocal } from "@pureadmin/utils";
import { defineStore } from "pinia";

export const useMultiTagsStore = defineStore({
  id: "pure-multiTags",
  state: () => ({
    multiTags: storageLocal().getItem<StorageConfigs>(
      `${responsiveStorageNameSpace()}configure`
    )?.multiTagsCache
  })
});
