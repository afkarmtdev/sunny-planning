import type { Msg } from "./types";

export const settings = {
  "settings.title": { en: "Settings", zh: "设置", pinyin: "she4 zhi4" },
  "settings.addName": { en: "Add your name", zh: "添加你的名字", pinyin: "tian1 jia1 ni3 de5 ming2 zi5" },
  "settings.birthday": { en: "Birthday: {date}", zh: "生日：{date}", pinyin: "sheng1 ri4：{date}" },

  "settings.section.language": { en: "Language", zh: "语言", pinyin: "yu3 yan2" },
  "settings.section.preferences": { en: "Preferences", zh: "偏好设置", pinyin: "pian1 hao4 she4 zhi4" },
  "settings.section.notifications": { en: "Notifications", zh: "通知", pinyin: "tong1 zhi1" },
  "settings.section.about": { en: "About", zh: "关于", pinyin: "guan1 yu2" },

  "settings.sound.label": { en: "Sound effects", zh: "音效", pinyin: "yin1 xiao4" },
  "settings.sound.hint": { en: "Chiptune blips on taps and saves", zh: "点按和保存时的芯片音效", pinyin: "dian3 an4 he2 bao3 cun2 shi2 de5 xin1 pian4 yin1 xiao4" },
  "settings.haptics.label": { en: "Touch feedback", zh: "触感反馈", pinyin: "chu4 gan3 fan3 kui4" },
  "settings.haptics.hint": { en: "Little vibrations on supported phones", zh: "在支持的手机上轻微震动", pinyin: "zai4 zhi1 chi2 de5 shou3 ji1 shang4 qing1 wei1 zhen4 dong4" },

  "settings.notify.label": { en: "Date-day reminder", zh: "约会当天提醒", pinyin: "yue1 hui4 dang1 tian1 ti2 xing3" },
  "settings.notify.hint": { en: "A nudge on days you have a date planned", zh: "在你安排了约会的日子提醒你", pinyin: "zai4 ni3 an1 pai2 le5 yue1 hui4 de5 ri4 zi5 ti2 xing3 ni3" },
  "settings.notify.blocked": { en: "Blocked. Turn notifications on for this site in your browser.", zh: "已被阻止。请在浏览器中为本站开启通知。", pinyin: "yi3 bei4 zu3 zhi3。qing3 zai4 liu2 lan3 qi4 zhong1 wei4 ben3 zhan4 kai1 qi3 tong1 zhi1。" },

  "settings.version.label": { en: "Version", zh: "版本", pinyin: "ban3 ben3" },

  "settings.reset": { en: "Reset demo data", zh: "重置演示数据", pinyin: "chong2 zhi4 yan3 shi4 shu4 ju4" },
  "settings.logout": { en: "Log out", zh: "退出登录", pinyin: "tui4 chu1 deng1 lu4" },

  "settings.reset.title": { en: "Reset demo data?", zh: "重置演示数据？", pinyin: "chong2 zhi4 yan3 shi4 shu4 ju4？" },
  "settings.reset.message": { en: "This clears everything and reloads the seeded demo. There is no undo.", zh: "这会清除所有内容并重新载入演示数据。此操作无法撤销。", pinyin: "zhe4 hui4 qing1 chu2 suo3 you3 nei4 rong2 bing4 chong2 xin1 zai4 ru4 yan3 shi4 shu4 ju4。ci3 cao1 zuo4 wu2 fa3 che4 xiao1。" },
  "settings.reset.confirm": { en: "Reset", zh: "重置", pinyin: "chong2 zhi4" },
  "settings.reset.cancel": { en: "Keep my data", zh: "保留我的数据", pinyin: "bao3 liu2 wo3 de5 shu4 ju4" },

  "settings.logout.title": { en: "Log out?", zh: "退出登录？", pinyin: "tui4 chu1 deng1 lu4？" },
  "settings.logout.message.auth": { en: "Your photos and data are removed from this device and sync back on your next login. You will need your magic link to hop back in.", zh: "你的照片和数据会从这台设备移除，下次登录后会同步回来。你需要用魔法链接才能重新登录。", pinyin: "ni3 de5 zhao4 pian4 he2 shu4 ju4 hui4 cong2 zhe4 tai2 she4 bei4 yi2 chu2，xia4 ci4 deng1 lu4 hou4 hui4 tong2 bu4 hui2 lai2。ni3 xu1 yao4 yong4 mo2 fa3 lian4 jie1 cai2 neng2 chong2 xin1 deng1 lu4。" },
  "settings.logout.message.demo": { en: "This takes you back to the welcome screen.", zh: "这会带你回到欢迎界面。", pinyin: "zhe4 hui4 dai4 ni3 hui2 dao4 huan1 ying2 jie4 mian4。" },
  "settings.logout.cancel": { en: "Stay", zh: "留下", pinyin: "liu2 xia4" },
} satisfies Record<string, Msg>;
