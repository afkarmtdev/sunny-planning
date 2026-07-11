import type { Msg } from "./types";

export const builder = {
  "builder.backAll": { en: "All dates", zh: "所有约会", pinyin: "suo3 you3 yue1 hui4" },

  "builder.status.completed": { en: "Completed", zh: "已完成", pinyin: "yi3 wan2 cheng2" },
  "builder.status.cancelled": { en: "Cancelled", zh: "已取消", pinyin: "yi3 qu3 xiao1" },

  "builder.aria.export": { en: "Export this itinerary", zh: "导出此行程", pinyin: "dao3 chu1 ci3 xing2 cheng2" },
  "builder.aria.rate": { en: "Rate {name}", zh: "为 {name} 评分", pinyin: "wei4 {name} ping2 fen1" },
  "builder.aria.directions": { en: "Open directions in Google Maps", zh: "在 Google Maps 中打开路线", pinyin: "zai4 Google Maps zhong1 da3 kai1 lu4 xian4" },

  "builder.thisVisit": { en: "this visit", zh: "本次到访", pinyin: "ben3 ci4 dao4 fang3" },
  "builder.rateThisVisit": { en: "rate this visit", zh: "为本次到访评分", pinyin: "wei4 ben3 ci4 dao4 fang3 ping2 fen1" },

  "builder.travelReadout": {
    en: "{minutes} min {mode} to next stop · directions",
    zh: "{minutes} 分钟{mode}到下一站 · 路线",
    pinyin: "{minutes} fen1 zhong1 {mode} dao4 xia4 yi2 zhan4 · lu4 xian4",
  },

  "builder.estTotal": { en: "EST. TOTAL", zh: "预估合计", pinyin: "yu4 gu1 he2 ji4" },
  "builder.actualTotal": { en: "ACTUAL TOTAL", zh: "实际合计", pinyin: "shi2 ji4 he2 ji4" },
  "builder.estAmount": { en: "est. ~{amount}", zh: "预估 ~{amount}", pinyin: "yu4 gu1 ~{amount}" },

  "builder.photosTitle": { en: "Photos from this date", zh: "这次约会的照片", pinyin: "zhe4 ci4 yue1 hui4 de5 zhao4 pian4" },
  "builder.notTiedToStop": { en: "Not tied to a stop", zh: "未关联地点", pinyin: "wei4 guan1 lian2 di4 dian3" },
  "builder.addPhoto": { en: "+ Add a photo", zh: "+ 添加照片", pinyin: "+ tian1 jia1 zhao4 pian4" },
  "builder.addPhotoMore": { en: "Add more memories from this date", zh: "添加这次约会的更多回忆", pinyin: "tian1 jia1 zhe4 ci4 yue1 hui4 de5 geng4 duo1 hui2 yi4" },
  "builder.noPhotosYet": { en: "No photos from this date yet", zh: "这次约会还没有照片", pinyin: "zhe4 ci4 yue1 hui4 hai2 mei2 you3 zhao4 pian4" },

  "builder.completedNote": { en: "Completed and logged to your costs.", zh: "已完成并记入你的花费。", pinyin: "yi3 wan2 cheng2 bing4 ji4 ru4 ni3 de5 hua1 fei4。" },
  "builder.cancelledNote": { en: "This date is cancelled.", zh: "这次约会已取消。", pinyin: "zhe4 ci4 yue1 hui4 yi3 qu3 xiao1。" },

  "builder.deleteDate": { en: "Delete this date", zh: "删除这次约会", pinyin: "shan1 chu2 zhe4 ci4 yue1 hui4" },
  "builder.saveDate": { en: "Save this date", zh: "保存这次约会", pinyin: "bao3 cun2 zhe4 ci4 yue1 hui4" },
  "builder.reopenEdit": { en: "Reopen to edit", zh: "重新打开以编辑", pinyin: "chong2 xin1 da3 kai1 yi3 bian1 ji2" },
  "builder.reopenPlan": { en: "Reopen to plan", zh: "重新打开以计划", pinyin: "chong2 xin1 da3 kai1 yi3 ji4 hua4" },
  "builder.saveChanges": { en: "Save changes", zh: "保存更改", pinyin: "bao3 cun2 geng1 gai3" },
  "builder.markComplete": { en: "Mark as complete", zh: "标记为已完成", pinyin: "biao1 ji4 wei2 yi3 wan2 cheng2" },

  "builder.tagPhotoTitle": { en: "Which stop is this from?", zh: "这是哪个地点拍的？", pinyin: "zhe4 shi4 na3 ge4 di4 dian3 pai1 de5？" },
  "builder.noStop": { en: "No stop", zh: "无地点", pinyin: "wu2 di4 dian3" },
  "builder.wholeDate": { en: "whole date", zh: "整次约会", pinyin: "zheng3 ci4 yue1 hui4" },

  "builder.addStopTitle": { en: "Add a stop", zh: "添加地点", pinyin: "tian1 jia1 di4 dian3" },
  "builder.editStopTitle": { en: "Edit stop", zh: "编辑地点", pinyin: "bian1 ji2 di4 dian3" },
  "builder.addStopBtn": { en: "Add stop", zh: "添加地点", pinyin: "tian1 jia1 di4 dian3" },
  "builder.saveStop": { en: "Save stop", zh: "保存地点", pinyin: "bao3 cun2 di4 dian3" },
  "builder.moveUp": { en: "Move up", zh: "上移", pinyin: "shang4 yi2" },
  "builder.moveDown": { en: "Move down", zh: "下移", pinyin: "xia4 yi2" },
  "builder.deleteStop": { en: "Delete this stop", zh: "删除此地点", pinyin: "shan1 chu2 ci3 di4 dian3" },
  "builder.defaultStopName": { en: "Somewhere fun", zh: "某个好玩的地方", pinyin: "mou3 ge4 hao3 wan2 de5 di4 fang5" },

  "builder.field.venue": { en: "Venue", zh: "场所", pinyin: "chang3 suo3" },
  "builder.field.time": { en: "Time", zh: "时间", pinyin: "shi2 jian1" },
  "builder.field.estCost": { en: "Est. cost (RM)", zh: "预估花费（RM）", pinyin: "yu4 gu1 hua1 fei4（RM）" },
  "builder.field.note": { en: "Note", zh: "备注", pinyin: "bei4 zhu4" },
  "builder.field.location": { en: "Location", zh: "位置", pinyin: "wei4 zhi4" },
  "builder.field.travelNext": { en: "Travel to next (min)", zh: "到下一站（分钟）", pinyin: "dao4 xia4 yi2 zhan4（fen1 zhong1）" },
  "builder.field.mode": { en: "Mode", zh: "方式", pinyin: "fang1 shi4" },
  "builder.field.title": { en: "Title", zh: "标题", pinyin: "biao1 ti2" },
  "builder.field.date": { en: "Date", zh: "日期", pinyin: "ri4 qi1" },

  "builder.ph.venue": { en: "Kopi & Cream Cafe", zh: "Kopi & Cream Cafe", pinyin: "Kopi & Cream Cafe" },
  "builder.ph.note": { en: "iced matcha & pastries", zh: "冰抹茶和糕点", pinyin: "bing1 mo3 cha2 he2 gao1 dian3" },
  "builder.ph.location": { en: "Paste a Google Maps link or lat, lng", zh: "粘贴 Google Maps 链接或 lat, lng", pinyin: "zhan1 tie1 Google Maps lian4 jie1 huo4 lat, lng" },

  "builder.pinned": { en: "Pinned", zh: "已定位", pinyin: "yi3 ding4 wei4" },
  "builder.locationNoPin": {
    en: "No pin found in this text yet",
    zh: "还没有从这段文字读到位置",
    pinyin: "hai2 mei2 you3 cong2 zhe4 duan4 wen2 zi4 du2 dao4 wei4 zhi4",
  },
  "builder.locationShortLink": {
    en: "This short link does not carry a pin. Open it in a browser, then paste the full URL from the address bar.",
    zh: "这个短链接不包含位置。请在浏览器中打开后，粘贴地址栏里的完整链接。",
    pinyin: "zhe4 ge4 duan3 lian4 jie1 bu4 bao1 han2 wei4 zhi4。qing3 zai4 liu2 lan3 qi4 zhong1 da3 kai1 hou4，zhan1 tie1 di4 zhi3 lan2 li3 de5 wan2 zheng3 lian4 jie1。",
  },

  "builder.mode.drive": { en: "drive", zh: "驾车", pinyin: "jia4 che1" },
  "builder.mode.walk": { en: "walk", zh: "步行", pinyin: "bu4 xing2" },

  "builder.dateDetails": { en: "Date details", zh: "约会详情", pinyin: "yue1 hui4 xiang2 qing2" },
  "builder.dateTaken": { en: "That date already has a date-plan.", zh: "那一天已经有约会安排了。", pinyin: "na4 yi4 tian1 yi3 jing1 you3 yue1 hui4 an1 pai2 le5。" },
  "builder.cancelDate": { en: "Cancel this date", zh: "取消这次约会", pinyin: "qu3 xiao1 zhe4 ci4 yue1 hui4" },

  "builder.deleteDate.title": { en: "Delete this date?", zh: "删除这次约会？", pinyin: "shan1 chu2 zhe4 ci4 yue1 hui4？" },
  "builder.deleteDate.message": { en: "This cannot be undone.", zh: "此操作无法撤销。", pinyin: "ci3 cao1 zuo4 wu2 fa3 che4 xiao1。" },

  "builder.cancelDate.title": { en: "Cancel this date?", zh: "取消这次约会？", pinyin: "qu3 xiao1 zhe4 ci4 yue1 hui4？" },
  "builder.cancelDate.message": { en: "You can reopen it later to keep planning.", zh: "你可以稍后重新打开继续计划。", pinyin: "ni3 ke3 yi3 shao1 hou4 chong2 xin1 da3 kai1 ji4 xu4 ji4 hua4。" },
  "builder.cancelDate.confirm": { en: "Cancel date", zh: "取消约会", pinyin: "qu3 xiao1 yue1 hui4" },

  "builder.leaveTitle": { en: "Leave without saving?", zh: "不保存就离开？", pinyin: "bu4 bao3 cun2 jiu4 li2 kai1？" },
  "builder.discardTitle": { en: "Discard changes?", zh: "放弃更改？", pinyin: "fang4 qi4 geng1 gai3？" },
  "builder.leaveMessage": { en: "This new date has not been saved yet and will be discarded.", zh: "这次新约会尚未保存，将被放弃。", pinyin: "zhe4 ci4 xin1 yue1 hui4 shang4 wei4 bao3 cun2，jiang1 bei4 fang4 qi4。" },
  "builder.discardMessage": { en: "Your unsaved changes to this date will be lost.", zh: "你对这次约会的未保存更改将会丢失。", pinyin: "ni3 dui4 zhe4 ci4 yue1 hui4 de5 wei4 bao3 cun2 geng1 gai3 jiang1 hui4 diu1 shi1。" },
  "builder.keepEditing": { en: "Keep editing", zh: "继续编辑", pinyin: "ji4 xu4 bian1 ji2" },

  "builder.time.hour": { en: "Hour", zh: "小时", pinyin: "xiao3 shi2" },
  "builder.time.min": { en: "Min", zh: "分", pinyin: "fen1" },
  "builder.time.minute": { en: "Minute", zh: "分钟", pinyin: "fen1 zhong1" },
  "builder.time.ampm": { en: "AM or PM", zh: "上午或下午", pinyin: "shang4 wu3 huo4 xia4 wu3" },
  "builder.time.am": { en: "AM", zh: "上午", pinyin: "shang4 wu3" },
  "builder.time.pm": { en: "PM", zh: "下午", pinyin: "xia4 wu3" },
} satisfies Record<string, Msg>;
