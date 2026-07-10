import type { Msg } from "./types";

// Shared vocabulary reused across many screens: buttons, confirm labels, and the
// handful of words that would otherwise be retyped everywhere.
export const common = {
  "common.save": { en: "Save", zh: "保存", pinyin: "bao3 cun2" },
  "common.cancel": { en: "Cancel", zh: "取消", pinyin: "qu3 xiao1" },
  "common.discard": { en: "Discard", zh: "放弃", pinyin: "fang4 qi4" },
  "common.delete": { en: "Delete", zh: "删除", pinyin: "shan1 chu2" },
  "common.remove": { en: "Remove", zh: "移除", pinyin: "yi2 chu2" },
  "common.keep": { en: "Keep", zh: "保留", pinyin: "bao3 liu2" },
  "common.back": { en: "Back", zh: "返回", pinyin: "fan3 hui2" },
  "common.home": { en: "Home", zh: "首页", pinyin: "shou3 ye4" },
  "common.done": { en: "Done", zh: "完成", pinyin: "wan2 cheng2" },
  "common.close": { en: "Close", zh: "关闭", pinyin: "guan1 bi4" },
  "common.edit": { en: "Edit", zh: "编辑", pinyin: "bian1 ji2" },
  "common.add": { en: "Add", zh: "添加", pinyin: "tian1 jia1" },
  "common.retry": { en: "Try again", zh: "重试", pinyin: "chong2 shi4" },
  "common.notSet": { en: "Not set", zh: "未设置", pinyin: "wei4 she4 zhi4" },
} satisfies Record<string, Msg>;
