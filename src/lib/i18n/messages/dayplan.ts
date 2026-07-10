import type { Msg } from "./types";

export const dayplan = {
  // Day-of mode (DayOf screen)
  "dayplan.today": { en: "Today", zh: "今天", pinyin: "jin1 tian1" },

  "dayplan.complete.title": { en: "Date complete!", zh: "约会完成！", pinyin: "yue1 hui4 wan2 cheng2！" },
  "dayplan.complete.spent": { en: "Spent {amount}", zh: "花费 {amount}", pinyin: "hua1 fei4 {amount}" },
  "dayplan.complete.estimate": { en: "est. ~{amount}", zh: "预估 ~{amount}", pinyin: "yu4 gu1 ~{amount}" },
  "dayplan.complete.andMore": { en: "and {count} more", zh: "还有 {count} 项", pinyin: "hai2 you3 {count} xiang4" },

  "dayplan.logSpendAdd": { en: "+ Log a spend", zh: "+ 记一笔花费", pinyin: "+ ji4 yi4 bi3 hua1 fei4" },
  "dayplan.logSpend": { en: "Log a spend", zh: "记一笔花费", pinyin: "ji4 yi4 bi3 hua1 fei4" },

  "dayplan.addPhotos": { en: "+ Add photos from today", zh: "+ 添加今天的照片", pinyin: "+ tian1 jia1 jin1 tian1 de5 zhao4 pian4" },
  "dayplan.addedToAlbum": { en: "added to your album", zh: "已添加到相册", pinyin: "yi3 tian1 jia1 dao4 xiang4 ce4" },
  "dayplan.willLandInAlbum": { en: "They will land in your album", zh: "它们会出现在你的相册里", pinyin: "ta1 men5 hui4 chu1 xian4 zai4 ni3 de5 xiang4 ce4 li3" },

  "dayplan.ratePlaces": { en: "Rate the places you went", zh: "给去过的场所评分", pinyin: "gei3 qu4 guo4 de5 chang3 suo3 ping2 fen1" },
  "dayplan.startAgain": { en: "Start again", zh: "重新开始", pinyin: "chong2 xin1 kai1 shi3" },

  "dayplan.rightNow": { en: "RIGHT NOW", zh: "此刻", pinyin: "ci3 ke4" },
  "dayplan.travelTime": { en: "TRAVEL TIME TO NEXT STOP", zh: "到下一站的路程时间", pinyin: "dao4 xia4 yi2 zhan4 de5 lu4 cheng2 shi2 jian1" },
  "dayplan.markComplete": { en: "Mark date complete", zh: "标记约会完成", pinyin: "biao1 ji4 yue1 hui4 wan2 cheng2" },
  "dayplan.goNext": { en: "GO to next stop", zh: "前往下一站", pinyin: "qian2 wang3 xia4 yi2 zhan4" },
  "dayplan.navigateWaze": { en: "Navigate in Waze", zh: "用 Waze 导航", pinyin: "yong4 Waze dao3 hang2" },
  "dayplan.openMaps": { en: "Open in Google Maps", zh: "用 Google Maps 打开", pinyin: "yong4 Google Maps da3 kai1" },

  "dayplan.upNext": { en: "UP NEXT", zh: "接下来", pinyin: "jie1 xia4 lai2" },
  "dayplan.wherever": { en: "Wherever the night takes you", zh: "今晚随心而行", pinyin: "jin1 wan3 sui2 xin1 er2 xing2" },

  "dayplan.noStopsYet": { en: "Today's date has no stops yet.", zh: "今天的约会还没有地点。", pinyin: "jin1 tian1 de5 yue1 hui4 hai2 mei2 you3 di4 dian3。" },
  "dayplan.addStops": { en: "Add some stops", zh: "添加地点", pinyin: "tian1 jia1 di4 dian3" },

  "dayplan.nothingPreview": { en: "Nothing on today. Here is what is coming up.", zh: "今天没有安排。看看接下来的约会。", pinyin: "jin1 tian1 mei2 you3 an1 pai2。kan4 kan4 jie1 xia4 lai2 de5 yue1 hui4。" },
  "dayplan.nextDate": { en: "NEXT DATE", zh: "下次约会", pinyin: "xia4 ci4 yue1 hui4" },
  "dayplan.viewItinerary": { en: "View itinerary", zh: "查看行程", pinyin: "cha2 kan4 xing2 cheng2" },
  "dayplan.nothingToday": { en: "Nothing on today.", zh: "今天没有安排。", pinyin: "jin1 tian1 mei2 you3 an1 pai2。" },
  "dayplan.planSweet": { en: "Plan something sweet", zh: "计划一场甜蜜约会", pinyin: "ji4 hua4 yi4 chang3 tian2 mi4 yue1 hui4" },

  // Plan list (PlanList screen)
  "dayplan.title": { en: "Our Dates", zh: "我们的约会", pinyin: "wo3 men5 de5 yue1 hui4" },

  "dayplan.filter.all": { en: "All", zh: "全部", pinyin: "quan2 bu4" },
  "dayplan.filter.planned": { en: "Planned", zh: "已计划", pinyin: "yi3 ji4 hua4" },
  "dayplan.filter.completed": { en: "Completed", zh: "已完成", pinyin: "yi3 wan2 cheng2" },
  "dayplan.filter.cancelled": { en: "Cancelled", zh: "已取消", pinyin: "yi3 qu3 xiao1" },

  "dayplan.empty.all": { en: "No dates yet. Plan your first one.", zh: "还没有约会。计划第一场吧。", pinyin: "hai2 mei2 you3 yue1 hui4。ji4 hua4 di4 yi1 chang3 ba5。" },
  "dayplan.empty.planned": { en: "No dates planned yet.", zh: "还没有计划的约会。", pinyin: "hai2 mei2 you3 ji4 hua4 de5 yue1 hui4。" },
  "dayplan.empty.completed": { en: "No completed dates yet.", zh: "还没有完成的约会。", pinyin: "hai2 mei2 you3 wan2 cheng2 de5 yue1 hui4。" },
  "dayplan.empty.cancelled": { en: "No cancelled dates.", zh: "没有取消的约会。", pinyin: "mei2 you3 qu3 xiao1 de5 yue1 hui4。" },

  "dayplan.stopCount.one": { en: "1 stop", zh: "1 个地点", pinyin: "1 ge4 di4 dian3" },
  "dayplan.stopCount.other": { en: "{n} stops", zh: "{n} 个地点", pinyin: "{n} ge4 di4 dian3" },

  "dayplan.action.complete": { en: "Complete", zh: "完成", pinyin: "wan2 cheng2" },
  "dayplan.action.reopen": { en: "Reopen", zh: "重新打开", pinyin: "chong2 xin1 da3 kai1" },

  "dayplan.doneChip": { en: "done", zh: "已完成", pinyin: "yi3 wan2 cheng2" },
  "dayplan.cancelledChip": { en: "cancelled", zh: "已取消", pinyin: "yi3 qu3 xiao1" },

  "dayplan.showMore": { en: "Show more", zh: "显示更多", pinyin: "xian3 shi4 geng4 duo1" },
  "dayplan.planNewDate": { en: "Plan a new date", zh: "计划新约会", pinyin: "ji4 hua4 xin1 yue1 hui4" },

  "dayplan.delete.title": { en: "Delete this date?", zh: "删除这场约会？", pinyin: "shan1 chu2 zhe4 chang3 yue1 hui4？" },
  "dayplan.delete.message": { en: "This cannot be undone.", zh: "此操作无法撤销。", pinyin: "ci3 cao1 zuo4 wu2 fa3 che4 xiao1。" },
} satisfies Record<string, Msg>;
