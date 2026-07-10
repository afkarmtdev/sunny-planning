import type { Msg } from "./types";

// Shared chrome: tab bar, error and offline states, update prompt, loading
// overlay, calendar, confirm-dialog default, and the mascot sprite alt.
export const ui = {
  // Bottom tab bar (Home reuses common.home).
  "ui.tab.plan": { en: "Plan", zh: "计划", pinyin: "ji4 hua4" },
  "ui.tab.today": { en: "Today", zh: "今天", pinyin: "jin1 tian1" },
  "ui.tab.costs": { en: "Costs", zh: "花费", pinyin: "hua1 fei4" },
  "ui.tab.album": { en: "Album", zh: "相册", pinyin: "xiang4 ce4" },
  "ui.tab.ratings": { en: "Ratings", zh: "评分", pinyin: "ping2 fen1" },

  // Full-screen error fallback.
  "ui.error.title": { en: "Something went sideways", zh: "出了点小状况", pinyin: "chu1 le5 dian3 xiao3 zhuang4 kuang4" },
  "ui.error.message": {
    en: "Sunny tripped over a wire. A quick reload usually sorts it out.",
    zh: "Sunny 绊到了一根线。刷新一下通常就好了。",
    pinyin: "Sunny ban4 dao4 le5 yi4 gen1 xian4。shua1 xin1 yi2 xia4 tong1 chang2 jiu4 hao3 le5。",
  },
  "ui.error.reload": { en: "Reload", zh: "刷新", pinyin: "shua1 xin1" },
  "ui.error.notFoundTitle": { en: "This page wandered off", zh: "这个页面走丢了", pinyin: "zhe4 ge5 ye4 mian4 zou3 diu1 le5" },
  "ui.error.notFoundMessage": {
    en: "Sunny could not find what you were looking for. Let's head back.",
    zh: "Sunny 找不到你要的东西。我们回去吧。",
    pinyin: "Sunny zhao3 bu2 dao4 ni3 yao4 de5 dong1 xi5。wo3 men5 hui2 qu4 ba5。",
  },
  "ui.error.backHome": { en: "Back to Home", zh: "返回首页", pinyin: "fan3 hui2 shou3 ye4" },

  // Offline pill.
  "ui.offline.text": { en: "You're offline.", zh: "你处于离线状态。", pinyin: "ni3 chu3 yu2 li2 xian4 zhuang4 tai4。" },
  "ui.offline.sub": {
    en: "Changes save on this device.",
    zh: "更改会保存在此设备上。",
    pinyin: "geng1 gai3 hui4 bao3 cun2 zai4 ci3 she4 bei4 shang4。",
  },

  // Service-worker update prompt.
  "ui.update.title": { en: "Sunny learned new tricks", zh: "Sunny 学会了新本领", pinyin: "Sunny xue2 hui4 le5 xin1 ben3 ling3" },
  "ui.update.message": {
    en: "A fresh version (v{version}) is ready. Update now?",
    zh: "新版本（v{version}）已就绪。现在更新吗？",
    pinyin: "xin1 ban3 ben3（v{version}）yi3 jiu4 xu4。xian4 zai4 geng1 xin1 ma5？",
  },
  "ui.update.confirm": { en: "Update", zh: "更新", pinyin: "geng1 xin1" },
  "ui.update.later": { en: "Later", zh: "稍后", pinyin: "shao1 hou4" },

  // Loading overlay caption (Try again reuses common.retry, Cancel common.cancel).
  "ui.loading.caption": { en: "just a sec...", zh: "稍等一下…", pinyin: "shao1 deng3 yi2 xia4…" },

  // Calendar navigation and notes.
  "ui.calendar.prevMonth": { en: "Previous month", zh: "上个月", pinyin: "shang4 ge5 yue4" },
  "ui.calendar.prevYear": { en: "Previous year", zh: "上一年", pinyin: "shang4 yi4 nian2" },
  "ui.calendar.prevYears": { en: "Previous years", zh: "上一页", pinyin: "shang4 yi2 ye4" },
  "ui.calendar.nextMonth": { en: "Next month", zh: "下个月", pinyin: "xia4 ge5 yue4" },
  "ui.calendar.nextYear": { en: "Next year", zh: "下一年", pinyin: "xia4 yi4 nian2" },
  "ui.calendar.nextYears": { en: "Next years", zh: "下一页", pinyin: "xia4 yi2 ye4" },
  "ui.calendar.pickMonth": { en: "Pick a month", zh: "选择月份", pinyin: "xuan3 ze2 yue4 fen4" },
  "ui.calendar.pickYear": { en: "Pick a year", zh: "选择年份", pinyin: "xuan3 ze2 nian2 fen4" },
  "ui.calendar.nudge": {
    en: "{date} already has a date-plan, so it cannot be picked.",
    zh: "{date} 已经安排了约会，无法选择。",
    pinyin: "{date} yi3 jing1 an1 pai2 le5 yue1 hui4，wu2 fa3 xuan3 ze2。",
  },
  "ui.calendar.today": { en: "Today", zh: "今天", pinyin: "jin1 tian1" },

  // ConfirmDialog default confirm label (cancel default reuses common.cancel).
  "ui.confirm": { en: "Confirm", zh: "确认", pinyin: "que4 ren4" },

  // Mascot sprite alt text: "Sunny {mood}".
  "ui.sprite.alt": { en: "Sunny {mood}", zh: "Sunny {mood}", pinyin: "Sunny {mood}" },
  "ui.sprite.mood.happy": { en: "happy", zh: "开心", pinyin: "kai1 xin1" },
  "ui.sprite.mood.sleepy": { en: "sleepy", zh: "困了", pinyin: "kun4 le5" },
  "ui.sprite.mood.asleep": { en: "asleep", zh: "睡着了", pinyin: "shui4 zhao2 le5" },
  "ui.sprite.mood.smitten": { en: "smitten", zh: "陶醉", pinyin: "tao2 zui4" },
} satisfies Record<string, Msg>;
