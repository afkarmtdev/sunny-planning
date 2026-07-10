import type { Msg } from "./types";

// `export` is a reserved word, so the const is named `exportMsgs`.
export const exportMsgs = {
  "export.back.itinerary": { en: "Back to Itinerary", zh: "返回行程", pinyin: "fan3 hui2 xing2 cheng2" },
  "export.back.export": { en: "Back to export", zh: "返回导出", pinyin: "fan3 hui2 dao3 chu1" },

  "export.title": { en: "Export itinerary", zh: "导出行程", pinyin: "dao3 chu1 xing2 cheng2" },
  "export.subtitle": { en: "Pick a shell skin for your PDF", zh: "为你的 PDF 选择一个样式", pinyin: "wei4 ni3 de5 PDF xuan3 ze2 yi2 ge4 yang4 shi4" },
  "export.preview": { en: "PREVIEW", zh: "预览", pinyin: "yu4 lan3" },
  "export.asPdf": { en: "Export as PDF", zh: "导出为 PDF", pinyin: "dao3 chu1 wei2 PDF" },

  // Skin display names read as brand/proper names: kept verbatim across locales.
  // Their subtitles are translated.
  "export.skin.strawberry.name": { en: "Strawberry Milk", zh: "Strawberry Milk", pinyin: "Strawberry Milk" },
  "export.skin.strawberry.sub": { en: "pink gingham", zh: "粉色格纹", pinyin: "fen3 se4 ge2 wen2" },
  "export.skin.retro.name": { en: "Retro LCD", zh: "Retro LCD", pinyin: "Retro LCD" },
  "export.skin.retro.sub": { en: "pixel mint", zh: "像素薄荷", pinyin: "xiang4 su4 bo4 he2" },
  "export.skin.scrapbook.name": { en: "Scrapbook", zh: "Scrapbook", pinyin: "Scrapbook" },
  "export.skin.scrapbook.sub": { en: "kraft + stickers", zh: "牛皮纸 + 贴纸", pinyin: "niu2 pi2 zhi3 + tie1 zhi3" },
  "export.skin.loveletter.name": { en: "Love Letter", zh: "Love Letter", pinyin: "Love Letter" },
  "export.skin.loveletter.sub": { en: "lace + stamps", zh: "蕾丝 + 邮票", pinyin: "lei3 si1 + you2 piao4" },

  "export.packing": { en: "packing up your PDF...", zh: "正在打包你的 PDF...", pinyin: "zheng4 zai4 da3 bao1 ni3 de5 PDF..." },
  "export.stamp": { en: "with love", zh: "满怀爱意", pinyin: "man3 huai2 ai4 yi4" },
  "export.kicker": { en: "{skin} itinerary", zh: "{skin} 行程", pinyin: "{skin} xing2 cheng2" },
  "export.empty": { en: "No stops yet. Add some in the builder first.", zh: "还没有地点。请先在编辑器里添加。", pinyin: "hai2 mei2 you3 di4 dian3。qing3 xian1 zai4 bian1 ji2 qi4 li3 tian1 jia1。" },
  "export.stopFallback": { en: "Stop {n}", zh: "地点 {n}", pinyin: "di4 dian3 {n}" },

  "export.travel.drive": { en: "drive", zh: "开车", pinyin: "kai1 che1" },
  "export.travel.walk": { en: "walk", zh: "步行", pinyin: "bu4 xing2" },
  "export.travel.readout": { en: "↓ {minutes} min {mode} to the next stop", zh: "↓ {mode} {minutes} 分钟到下一站", pinyin: "↓ {mode} {minutes} fen1 zhong1 dao4 xia4 yi2 zhan4" },

  "export.estTotal": { en: "Est. total", zh: "预估合计", pinyin: "yu4 gu1 he2 ji4" },
  "export.madeWith": { en: "made with Sunny Planning, just for the two of us", zh: "用 Sunny Planning 制作，只为我们俩。", pinyin: "yong4 Sunny Planning zhi4 zuo4，zhi3 wei4 wo3 men5 lia3。" },
  "export.printOrSave": { en: "Print or save as PDF", zh: "打印或保存为 PDF", pinyin: "da3 yin4 huo4 bao3 cun2 wei2 PDF" },
} satisfies Record<string, Msg>;
