import type { Msg } from "./types";

export const album = {
  "album.title": { en: "Our Album", zh: "我们的相册", pinyin: "wo3 men5 de5 xiang4 ce4" },

  "album.filterAll": { en: "All", zh: "全部", pinyin: "quan2 bu4" },
  "album.unsorted": { en: "Unsorted", zh: "未分类", pinyin: "wei4 fen1 lei4" },
  "album.emptyFiltered": { en: "No photos from this date yet.", zh: "这次约会还没有照片。", pinyin: "zhe4 ci4 yue1 hui4 hai2 mei2 you3 zhao4 pian4。" },
  "album.showMore": { en: "Show more", zh: "显示更多", pinyin: "xian3 shi4 geng4 duo1" },

  "album.addPhoto": { en: "+ Add a photo", zh: "+ 添加照片", pinyin: "+ tian1 jia1 zhao4 pian4" },
  "album.addPhotoSub": { en: "Sunny is waiting for more memories", zh: "Sunny 在等更多回忆", pinyin: "Sunny zai4 deng3 geng4 duo1 hui2 yi4" },

  "album.pickTitle": { en: "Which date is this from?", zh: "这是哪次约会的？", pinyin: "zhe4 shi4 na3 ci4 yue1 hui4 de5？" },
  "album.pickHintOne": { en: "Tag your photo to a date so they show up together.", zh: "把照片标记到某次约会，让它们一起显示。", pinyin: "ba3 zhao4 pian4 biao1 ji4 dao4 mou3 ci4 yue1 hui4，rang4 ta1 men5 yi4 qi3 xian3 shi4。" },
  "album.pickHintMany": { en: "Tag your {count} photos to a date so they show up together.", zh: "把这 {count} 张照片标记到某次约会，让它们一起显示。", pinyin: "ba3 zhe4 {count} zhang1 zhao4 pian4 biao1 ji4 dao4 mou3 ci4 yue1 hui4，rang4 ta1 men5 yi4 qi3 xian3 shi4。" },
  "album.todayBadge": { en: "Today", zh: "今天", pinyin: "jin1 tian1" },
  "album.skip": { en: "Skip for now", zh: "暂时跳过", pinyin: "zan4 shi2 tiao4 guo4" },
  "album.noDate": { en: "no date", zh: "无日期", pinyin: "wu2 ri4 qi1" },

  "album.enlarge": { en: "Enlarge {caption}", zh: "放大 {caption}", pinyin: "fang4 da4 {caption}" },
  "album.photoWord": { en: "photo", zh: "照片", pinyin: "zhao4 pian4" },
  "album.datePhotoAlt": { en: "date photo", zh: "约会照片", pinyin: "yue1 hui4 zhao4 pian4" },
  "album.addCaption": { en: "add a caption", zh: "添加说明", pinyin: "tian1 jia1 shuo1 ming2" },

  "album.addedBy": { en: "added by {name}", zh: "由 {name} 添加", pinyin: "you2 {name} tian1 jia1" },
  "album.changeStop": { en: "Change stop", zh: "更换地点", pinyin: "geng1 huan4 di4 dian3" },
  "album.tagStop": { en: "Tag to a stop", zh: "标记到地点", pinyin: "biao1 ji4 dao4 di4 dian3" },
  "album.viewDate": { en: "View this date", zh: "查看这次约会", pinyin: "cha2 kan4 zhe4 ci4 yue1 hui4" },
  "album.deletePhoto": { en: "Delete photo", zh: "删除照片", pinyin: "shan1 chu2 zhao4 pian4" },
  "album.deleteConfirmTitle": { en: "Delete this photo?", zh: "删除这张照片？", pinyin: "shan1 chu2 zhe4 zhang1 zhao4 pian4？" },
  "album.deleteConfirmMsg": { en: "This removes it from your album for good.", zh: "这将从相册中永久删除它。", pinyin: "zhe4 jiang1 cong2 xiang4 ce4 zhong1 yong3 jiu3 shan1 chu2 ta1。" },
} satisfies Record<string, Msg>;
