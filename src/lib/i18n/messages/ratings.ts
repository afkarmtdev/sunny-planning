import type { Msg } from "./types";

export const ratings = {
  "ratings.title": { en: "Venue Ratings", zh: "场所评分", pinyin: "chang3 suo3 ping2 fen1" },

  "ratings.filterAll": { en: "All", zh: "全部", pinyin: "quan2 bu4" },
  "ratings.filterFaves": { en: "Faves", zh: "收藏", pinyin: "shou1 cang2" },

  "ratings.bannerTitle": { en: "Rating {title}", zh: "为 {title} 评分", pinyin: "wei4 {title} ping2 fen1" },
  "ratings.dismiss": { en: "Dismiss", zh: "忽略", pinyin: "hu1 lve4" },
  "ratings.nothingToRate": { en: "Nothing to rate for this date.", zh: "这次约会没有可评分的场所。", pinyin: "zhe4 ci4 yue1 hui4 mei2 you3 ke3 ping2 fen1 de5 chang3 suo3。" },

  "ratings.editVenue": { en: "Edit {name}", zh: "编辑 {name}", pinyin: "bian1 ji2 {name}" },
  "ratings.empty": { en: "Nothing here yet.", zh: "这里还什么都没有。", pinyin: "zhe4 li3 hai2 shen2 me5 dou1 mei2 you3。" },
  "ratings.lastVisited": { en: "last visited {date} · {title}", zh: "上次到访 {date} · {title}", pinyin: "shang4 ci4 dao4 fang3 {date} · {title}" },
  "ratings.addNote": { en: "+ add a note", zh: "+ 添加备注", pinyin: "+ tian1 jia1 bei4 zhu4" },
  "ratings.showMore": { en: "Show more", zh: "显示更多", pinyin: "xian3 shi4 geng4 duo1" },

  "ratings.noteSheetTitle": { en: "Add a note", zh: "添加备注", pinyin: "tian1 jia1 bei4 zhu4" },
  "ratings.noteLabel": { en: "Note", zh: "备注", pinyin: "bei4 zhu4" },
  "ratings.notePlaceholder": { en: "always our first stop", zh: "总是我们的第一站", pinyin: "zong3 shi4 wo3 men5 de5 di4 yi1 zhan4" },
  "ratings.saveNote": { en: "Save note", zh: "保存备注", pinyin: "bao3 cun2 bei4 zhu4" },

  "ratings.tagLabel": { en: "Tag", zh: "标签", pinyin: "biao1 qian1" },
  "ratings.tagPlaceholder": { en: "Or make a new tag", zh: "或新建标签", pinyin: "huo4 xin1 jian4 biao1 qian1" },
  "ratings.saveChanges": { en: "Save changes", zh: "保存更改", pinyin: "bao3 cun2 geng4 gai3" },
  "ratings.discardTitle": { en: "Discard changes?", zh: "放弃更改？", pinyin: "fang4 qi4 geng4 gai3？" },
  "ratings.discardMessage": { en: "Your unsaved edits to {name} will be lost.", zh: "你对 {name} 未保存的修改将丢失。", pinyin: "ni3 dui4 {name} wei4 bao3 cun2 de5 xiu1 gai3 jiang1 diu1 shi1。" },
  "ratings.keepEditing": { en: "Keep editing", zh: "继续编辑", pinyin: "ji4 xu4 bian1 ji2" },

  "ratings.yourRating": { en: "YOUR RATING", zh: "你的评分", pinyin: "ni3 de5 ping2 fen1" },
  "ratings.visitCount.one": { en: "You have been here {count} time", zh: "你来过这里 {count} 次", pinyin: "ni3 lai2 guo4 zhe4 li3 {count} ci4" },
  "ratings.visitCount.other": { en: "You have been here {count} times", zh: "你来过这里 {count} 次", pinyin: "ni3 lai2 guo4 zhe4 li3 {count} ci4" },
  "ratings.manualRating": { en: "Manual rating", zh: "手动评分", pinyin: "shou3 dong4 ping2 fen1" },
  "ratings.ratedEarlier": { en: "rated earlier", zh: "早前评分", pinyin: "zao3 qian2 ping2 fen1" },
  "ratings.notRated": { en: "not rated", zh: "未评分", pinyin: "wei4 ping2 fen1" },
  "ratings.snapsHere": { en: "Snaps from here", zh: "这里的照片", pinyin: "zhe4 li3 de5 zhao4 pian4" },

  "ratings.pawsAria": { en: "{value} out of 5 paws", zh: "5 个爪印中的 {value} 个", pinyin: "5 ge4 zhua3 yin4 zhong1 de5 {value} ge4" },
  "ratings.ratePaws": { en: "Rate {count} paws", zh: "评 {count} 爪印", pinyin: "ping2 {count} zhua3 yin4" },

  "ratings.removeFave": { en: "Remove from favorites", zh: "取消收藏", pinyin: "qu3 xiao1 shou1 cang2" },
  "ratings.addFave": { en: "Mark as favorite", zh: "加入收藏", pinyin: "jia1 ru4 shou1 cang2" },
  "ratings.faveBadge": { en: "FAVE", zh: "收藏", pinyin: "shou1 cang2" },
} satisfies Record<string, Msg>;
