import type { Msg } from "./types";

export const costs = {
  "costs.title": { en: "Cost Tracker", zh: "花费追踪", pinyin: "hua1 fei4 zhui1 zong1" },
  "costs.thisMonthUpper": { en: "THIS MONTH", zh: "本月", pinyin: "ben3 yue4" },

  "costs.aria.prevMonth": { en: "Previous month", zh: "上个月", pinyin: "shang4 ge4 yue4" },
  "costs.aria.nextMonth": { en: "Next month", zh: "下个月", pinyin: "xia4 ge4 yue4" },

  "costs.stat.avgPerDate": { en: "avg per date", zh: "每次约会平均", pinyin: "mei3 ci4 yue1 hui4 ping2 jun1" },
  "costs.stat.datesThisMonth": { en: "dates this month", zh: "本月约会", pinyin: "ben3 yue4 yue1 hui4" },

  "costs.datesThisMonth": { en: "Dates this month", zh: "本月约会", pinyin: "ben3 yue4 yue1 hui4" },
  "costs.datesIn": { en: "Dates in {month}", zh: "{month}的约会", pinyin: "{month} de5 yue1 hui4" },
  "costs.emptyMonth": { en: "No dates logged this month.", zh: "本月还没有记录约会。", pinyin: "ben3 yue4 hai2 mei2 you3 ji4 lu4 yue1 hui4。" },

  "costs.showMore": { en: "Show more", zh: "显示更多", pinyin: "xian3 shi4 geng4 duo1" },
  "costs.recentlyDeleted": { en: "Recently deleted", zh: "最近删除", pinyin: "zui4 jin4 shan1 chu2" },
  "costs.restore": { en: "Restore", zh: "恢复", pinyin: "hui1 fu4" },

  "costs.editExpense": { en: "Edit expense", zh: "编辑花费", pinyin: "bian1 ji2 hua1 fei4" },
  "costs.logSpend": { en: "Log a spend", zh: "记录花费", pinyin: "ji4 lu4 hua1 fei4" },

  "costs.field.label": { en: "Label", zh: "标签", pinyin: "biao1 qian1" },
  "costs.field.labelPlaceholder": { en: "Parking, snacks...", zh: "停车、零食……", pinyin: "ting2 che1、ling2 shi2……" },
  "costs.field.amount": { en: "Amount (RM)", zh: "金额（RM）", pinyin: "jin1 e2（RM）" },
  "costs.field.linkedStop": { en: "Linked stop", zh: "关联地点", pinyin: "guan1 lian2 di4 dian3" },

  "costs.receipt": { en: "Receipt", zh: "收据", pinyin: "shou1 ju4" },
  "costs.removeReceipt": { en: "Remove receipt", zh: "移除收据", pinyin: "yi2 chu2 shou1 ju4" },
  "costs.addReceipt": { en: "+ Add a receipt", zh: "+ 添加收据", pinyin: "+ tian1 jia1 shou1 ju4" },
  "costs.addReceiptSub": { en: "Snap or upload a photo", zh: "拍照或上传照片", pinyin: "pai1 zhao4 huo4 shang4 chuan2 zhao4 pian4" },

  "costs.saveExpense": { en: "Save expense", zh: "保存花费", pinyin: "bao3 cun2 hua1 fei4" },
  "costs.addExpense": { en: "Add expense", zh: "添加花费", pinyin: "tian1 jia1 hua1 fei4" },
  "costs.addExpensePlus": { en: "+ Add expense", zh: "+ 添加花费", pinyin: "+ tian1 jia1 hua1 fei4" },
  "costs.deleteExpense": { en: "Delete this expense", zh: "删除这笔花费", pinyin: "shan1 chu2 zhe4 bi3 hua1 fei4" },
  "costs.deleteExpenseTitle": { en: "Delete this expense?", zh: "删除这笔花费？", pinyin: "shan1 chu2 zhe4 bi3 hua1 fei4？" },
  "costs.deleteExpenseMessage": { en: "You can restore it from Recently deleted for 30 days.", zh: "30 天内可从最近删除中恢复。", pinyin: "30 tian1 nei4 ke3 cong2 zui4 jin4 shan1 chu2 zhong1 hui1 fu4。" },

  "costs.actualTotal": { en: "ACTUAL TOTAL", zh: "实际合计", pinyin: "shi2 ji4 he2 ji4" },
  "costs.estTotal": { en: "EST. TOTAL", zh: "预估合计", pinyin: "yu4 gu1 he2 ji4" },
  "costs.estPrefix": { en: "est. ~{amount}", zh: "预估 ~{amount}", pinyin: "yu4 gu1 ~{amount}" },
  "costs.emptyExpenses": { en: "No expenses logged for this date yet.", zh: "这次约会还没有记录花费。", pinyin: "zhe4 ci4 yue1 hui4 hai2 mei2 you3 ji4 lu4 hua1 fei4。" },
} satisfies Record<string, Msg>;
