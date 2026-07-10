import type { Msg } from "./types";

export const auth = {
  // Login
  "auth.tagline": { en: "Just for the two of you", zh: "只属于你们俩", pinyin: "zhi3 shu3 yu2 ni3 men5 lia3" },
  "auth.emailFirst": { en: "Type your email first", zh: "请先输入你的邮箱", pinyin: "qing3 xian1 shu1 ru4 ni3 de5 you2 xiang1" },
  "auth.sentTitle": { en: "Magic link sent", zh: "魔法链接已发送", pinyin: "mo2 fa3 lian4 jie1 yi3 fa1 song4" },
  "auth.sentSub": { en: "Check {email} and tap the link to hop back in here.", zh: "查看 {email}，点击链接即可回到这里。", pinyin: "cha2 kan4 {email}，dian3 ji1 lian4 jie1 ji2 ke3 hui2 dao4 zhe4 li3。" },
  "auth.emailLabel": { en: "Email", zh: "邮箱", pinyin: "you2 xiang1" },
  "auth.emailPlaceholder": { en: "you@email.com", zh: "you@email.com", pinyin: "you@email.com" },
  "auth.sending": { en: "Sending...", zh: "发送中...", pinyin: "fa1 song4 zhong1..." },
  "auth.sendLink": { en: "Send me a magic link", zh: "给我发送魔法链接", pinyin: "gei3 wo3 fa1 song4 mo2 fa3 lian4 jie1" },
  "auth.offline": { en: "You are offline. Reconnect to get your magic link.", zh: "你处于离线状态。重新联网以获取魔法链接。", pinyin: "ni3 chu3 yu2 li2 xian4 zhuang4 tai4。chong2 xin1 lian2 wang3 yi3 huo4 qu3 mo2 fa3 lian4 jie1。" },
  "auth.noPassword": { en: "No password. We will email you a one-tap link.", zh: "无需密码。我们会给你发送一键登录链接。", pinyin: "wu2 xu1 mi4 ma3。wo3 men5 hui4 gei3 ni3 fa1 song4 yi2 jian4 deng1 lu4 lian4 jie1。" },
  "auth.inviteHint": { en: "Have an invite link? Just tap it to join", zh: "有邀请链接吗？点一下就能加入", pinyin: "you3 yao1 qing3 lian4 jie1 ma5？dian3 yi2 xia4 jiu4 neng2 jia1 ru4" },
  "auth.demoHint": { en: "demo mode: Supabase is not connected yet, the button just lets you in", zh: "演示模式：Supabase 尚未连接，点按钮即可进入", pinyin: "yan3 shi4 mo2 shi4：Supabase shang4 wei4 lian2 jie1，dian3 an4 niu3 ji2 ke3 jin4 ru4" },

  // Invite
  "auth.backToHome": { en: "Back to Home", zh: "返回首页", pinyin: "fan3 hui2 shou3 ye4" },
  "auth.shareText": { en: "Join our little space", zh: "加入我们的小空间", pinyin: "jia1 ru4 wo3 men5 de5 xiao3 kong1 jian1" },
  "auth.inviteTitle": { en: "Invite your person", zh: "邀请你的另一半", pinyin: "yao1 qing3 ni3 de5 ling4 yi2 ban4" },
  "auth.inviteSub": { en: "Share this link so they can join your space", zh: "分享这个链接，让对方加入你的空间", pinyin: "fen1 xiang3 zhe4 ge5 lian4 jie1，rang4 dui4 fang1 jia1 ru4 ni3 de5 kong1 jian1" },
  "auth.waiting": { en: "Waiting for them to join…", zh: "等待对方加入…", pinyin: "deng3 dai4 dui4 fang1 jia1 ru4…" },
  "auth.copied": { en: "Copied!", zh: "已复制！", pinyin: "yi3 fu4 zhi4！" },
  "auth.copyLink": { en: "Copy link", zh: "复制链接", pinyin: "fu4 zhi4 lian4 jie1" },
  "auth.shareInvite": { en: "Share invite", zh: "分享邀请", pinyin: "fen1 xiang3 yao1 qing3" },
  "auth.privacyNote": { en: "Only the two of you will ever see this space", zh: "只有你们俩能看到这个空间", pinyin: "zhi3 you3 ni3 men5 lia3 neng2 kan4 dao4 zhe4 ge5 kong1 jian1" },

  // Accept invite
  "auth.foundInvite": { en: "You found an invite", zh: "你收到了一个邀请", pinyin: "ni3 shou1 dao4 le5 yi2 ge5 yao1 qing3" },
  "auth.foundInviteSub": { en: "Your person wants you in their Sunny Planning space", zh: "你的另一半想邀你加入他们的 Sunny Planning 空间", pinyin: "ni3 de5 ling4 yi2 ban4 xiang3 yao1 ni3 jia1 ru4 ta1 men5 de5 Sunny Planning kong1 jian1" },
  "auth.inviteCodeLabel": { en: "invite · {code}", zh: "邀请 · {code}", pinyin: "yao1 qing3 · {code}" },
  "auth.joining": { en: "Joining...", zh: "加入中...", pinyin: "jia1 ru4 zhong1..." },
  "auth.joinSpace": { en: "Join this space", zh: "加入这个空间", pinyin: "jia1 ru4 zhe4 ge5 kong1 jian1" },
  "auth.privacyNoteShort": { en: "Only the two of you will ever see it", zh: "只有你们俩能看到", pinyin: "zhi3 you3 ni3 men5 lia3 neng2 kan4 dao4" },

  // RequireAuth
  "auth.syncing": { en: "syncing your space...", zh: "正在同步你的空间...", pinyin: "zheng4 zai4 tong2 bu4 ni3 de5 kong1 jian1..." },
  "auth.syncError": { en: "Could not load your space. Check your connection and try again.", zh: "无法加载你的空间。请检查网络连接后重试。", pinyin: "wu2 fa3 jia1 zai4 ni3 de5 kong1 jian1。qing3 jian3 cha2 wang3 luo4 lian2 jie1 hou4 chong2 shi4。" },

  // Onboarding
  "auth.hiSunny": { en: "Hi, I'm Sunny", zh: "嗨，我是 Sunny", pinyin: "hai1，wo3 shi4 Sunny" },
  "auth.whatCall": { en: "What should I call you?", zh: "我该怎么称呼你？", pinyin: "wo3 gai1 zen3 me5 cheng1 hu5 ni3？" },
  "auth.yourName": { en: "Your name", zh: "你的名字", pinyin: "ni3 de5 ming2 zi5" },
  "auth.whenBirthday": { en: "When's your birthday?", zh: "你的生日是什么时候？", pinyin: "ni3 de5 sheng1 ri4 shi4 shen2 me5 shi2 hou5？" },
  "auth.birthdayReason": { en: "So I can plan a little something", zh: "这样我好帮你准备点小惊喜", pinyin: "zhe4 yang4 wo3 hao3 bang1 ni3 zhun3 bei4 dian3 xiao3 jing1 xi3" },
  "auth.pickColor": { en: "Pick your color", zh: "选择你的颜色", pinyin: "xuan3 ze2 ni3 de5 yan2 se4" },
  "auth.colorHint": { en: "It marks what's yours around the app", zh: "它会标记应用里属于你的内容", pinyin: "ta1 hui4 biao1 ji4 ying4 yong4 li3 shu3 yu2 ni3 de5 nei4 rong2" },
  "auth.allSet": { en: "All set, {name}!", zh: "都搞定啦，{name}！", pinyin: "dou1 gao3 ding4 la5，{name}！" },
  "auth.you": { en: "you", zh: "你", pinyin: "ni3" },
  "auth.betterForTwo": { en: "Sunny Planning is better for two. Bring your partner?", zh: "Sunny Planning 两个人用更好。要带上你的伴侣吗？", pinyin: "Sunny Planning liang3 ge5 ren2 yong4 geng4 hao3。yao4 dai4 shang4 ni3 de5 ban4 lv3 ma5？" },
  "auth.invitePartner": { en: "Invite your partner", zh: "邀请你的伴侣", pinyin: "yao1 qing3 ni3 de5 ban4 lv3" },
  "auth.justMe": { en: "Just me for now", zh: "暂时只有我", pinyin: "zan4 shi2 zhi3 you3 wo3" },
  "auth.next": { en: "Next", zh: "下一步", pinyin: "xia4 yi2 bu4" },
  "auth.skip": { en: "Skip for now", zh: "暂时跳过", pinyin: "zan4 shi2 tiao4 guo4" },

  // Splash
  "auth.splashTagline": { en: "plan it, live it, keep it", zh: "计划它，体验它，留住它", pinyin: "ji4 hua4 ta1，ti3 yan4 ta1，liu2 zhu4 ta1" },

  // Profile sheet
  "auth.profileTitle": { en: "Your profile", zh: "你的资料", pinyin: "ni3 de5 zi1 liao4" },
  "auth.changePhoto": { en: "Change your photo", zh: "更换你的照片", pinyin: "geng1 huan4 ni3 de5 zhao4 pian4" },
  "auth.addPhoto": { en: "Add a photo", zh: "添加照片", pinyin: "tian1 jia1 zhao4 pian4" },
  "auth.tapChangePhoto": { en: "Tap your photo to change it", zh: "点击照片即可更换", pinyin: "dian3 ji1 zhao4 pian4 ji2 ke3 geng1 huan4" },
  "auth.tapAddPhoto": { en: "Tap to add a photo", zh: "点击添加照片", pinyin: "dian3 ji1 tian1 jia1 zhao4 pian4" },
  "auth.removePhoto": { en: "Remove photo", zh: "移除照片", pinyin: "yi2 chu2 zhao4 pian4" },
  "auth.displayName": { en: "Display name", zh: "显示名称", pinyin: "xian3 shi4 ming2 cheng1" },
  "auth.yourColor": { en: "Your color", zh: "你的颜色", pinyin: "ni3 de5 yan2 se4" },
  "auth.birthday": { en: "Birthday", zh: "生日", pinyin: "sheng1 ri4" },
  "auth.pickBirthday": { en: "Pick your birthday", zh: "选择你的生日", pinyin: "xuan3 ze2 ni3 de5 sheng1 ri4" },
  "auth.saveProfile": { en: "Save profile", zh: "保存资料", pinyin: "bao3 cun2 zi1 liao4" },
} satisfies Record<string, Msg>;
