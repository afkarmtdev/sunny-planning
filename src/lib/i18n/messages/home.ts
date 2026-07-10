import type { Msg } from "./types";

export const home = {
  "home.greeting.morning": { en: "Good morning", zh: "早上好", pinyin: "zao3 shang4 hao3" },
  "home.greeting.afternoon": { en: "Good afternoon", zh: "下午好", pinyin: "xia4 wu3 hao3" },
  "home.greeting.evening": { en: "Good evening", zh: "晚上好", pinyin: "wan3 shang4 hao3" },

  "home.aria.invite": { en: "Invite your partner", zh: "邀请你的伴侣", pinyin: "yao1 qing3 ni3 de5 ban4 lv3" },

  "home.birthday.title": { en: "Happy birthday!", zh: "生日快乐！", pinyin: "sheng1 ri4 kuai4 le4！" },
  "home.birthday.titleNamed": { en: "Happy birthday, {name}!", zh: "{name}，生日快乐！", pinyin: "{name}，sheng1 ri4 kuai4 le4！" },
  "home.birthday.sub": { en: "Today is all yours. Sunny is so happy.", zh: "今天全是你的。Sunny 好开心。", pinyin: "jin1 tian1 quan2 shi4 ni3 de5。Sunny hao3 kai1 xin1。" },

  "home.reminder.label": { en: "YOUR DATE IS TODAY", zh: "今天有约会", pinyin: "jin1 tian1 you3 yue1 hui4" },
  "home.reminder.start": { en: "Start", zh: "开始", pinyin: "kai1 shi3" },

  "home.happiness.label": { en: "HAPPINESS", zh: "快乐值", pinyin: "kuai4 le4 zhi2" },
  "home.happiness.sub": { en: "{count} dates keep them glowing", zh: "{count} 次约会让 Sunny 闪闪发光", pinyin: "{count} ci4 yue1 hui4 rang4 Sunny shan3 shan3 fa1 guang1" },

  "home.next.label": { en: "NEXT DATE", zh: "下次约会", pinyin: "xia4 ci4 yue1 hui4" },
  "home.next.view": { en: "View itinerary", zh: "查看行程", pinyin: "cha2 kan4 xing2 cheng2" },
  "home.empty": { en: "No date on the calendar yet. Sunny is waiting.", zh: "日程上还没有约会。Sunny 在等着呢。", pinyin: "ri4 cheng2 shang4 hai2 mei2 you3 yue1 hui4。Sunny zai4 deng3 zhe5 ne5。" },

  "home.stat.logged": { en: "dates logged", zh: "已记录约会", pinyin: "yi3 ji4 lu4 yue1 hui4" },
  "home.stat.month": { en: "this month", zh: "本月", pinyin: "ben3 yue4" },
  "home.stat.streak": { en: "streak", zh: "连续", pinyin: "lian2 xu4" },
  "home.stat.weeks": { en: "{n}wks", zh: "{n}周", pinyin: "{n} zhou1" },

  "home.plan": { en: "Plan a new date", zh: "计划新约会", pinyin: "ji4 hua4 xin1 yue1 hui4" },

  // OS reminder fired from the store when a date is planned for today.
  "home.notify.title": { en: "You have a date today", zh: "今天有约会", pinyin: "jin1 tian1 you3 yue1 hui4" },
  "home.notify.body": { en: "{title} is on. Open Sunny to start Day-of.", zh: "{title} 就在今天。打开 Sunny 开始当天模式。", pinyin: "{title} jiu4 zai4 jin1 tian1。da3 kai1 Sunny kai1 shi3 dang1 tian1 mo2 shi4。" },
} satisfies Record<string, Msg>;
