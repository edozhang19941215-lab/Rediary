// Mock diary entries for development/testing
// Run seedMockEntries() in browser console or call it from a dev button

const ENTRIES_KEY = 'peiPei_entries';

const MOCK_ENTRIES = [
  {
    id: '1710000001',
    petId: 'sheep',
    stationeryId: 'lined',
    date: daysAgo(98),
    mood: '😊',
    stickers: { s1: '☕', s3: '🌿' },
    photos: [],
    text: `今天是新年后第一个真正平静的日子。\n\n早上被阳光拍醒的，没有闹钟，感觉特别好。骑车去了附近的菜市场，买了一把香菜和几个西红柿。摊主是个老奶奶，给我多捞了一把香菜，说"年轻人多吃点"。这种小事让我觉得城市也有温度。\n\n下午窝在家里看了一部老片子，《天空之城》，已经是第三遍了，但结尾的"巴鲁斯"还是让我鸡皮疙瘩。有些东西不会因为熟悉而变淡。\n\n晚上和妈妈打了视频，她在学做抖音，拍她种的多肉，又好笑又可爱。今年想多回几次家。`,
    createdAt: new Date(daysAgo(98)).getTime(),
  },
  {
    id: '1710000002',
    petId: 'monkey',
    stationeryId: 'grid',
    date: daysAgo(84),
    mood: '🤔',
    stickers: { s2: '📖' },
    photos: [],
    text: `今天开了一个很长的会，三个小时，结论是"再讨论讨论"。\n\n我一直在想，为什么有些会议的目的是为了开更多会议。记了满满一页笔记，但没有一条是可以执行的。可能这就是大公司的运转方式，我还不太适应。\n\n不过下班路上听了一期播客，讲"慢决策"的——说人类天生倾向于把行动等同于进展，但很多时候停下来思考才是真正的前进。也许那个会议不是没有意义，只是意义在另一个时间轴上。\n\n今天学到：把焦虑写下来，它就变小了。`,
    createdAt: new Date(daysAgo(84)).getTime(),
  },
  {
    id: '1710000003',
    petId: 'bird',
    stationeryId: 'sakura',
    date: daysAgo(72),
    mood: '🥰',
    stickers: { s1: '🌸', s5: '✨' },
    photos: [],
    text: `今天的咖啡拉花是一朵花，我盯着看了好久才舍得喝。\n\n和小林约好去看展，是一个摄影师的个人展，全是胶片拍的日常——早餐、路灯、猫、晾衣服的阳台。没有一张是"好看"的那种构图，但每一张都让我觉得"对，生活就是这样"。\n\n小林买了展览的图册，我买了一张明信片，画的是猫坐在窗台看雨。写给谁呢，想了想，决定写给五年后的自己。\n\n今天感觉很满，那种物质和情感都刚刚好的满。`,
    createdAt: new Date(daysAgo(72)).getTime(),
  },
  {
    id: '1710000004',
    petId: 'monkey',
    stationeryId: 'kraft',
    date: daysAgo(61),
    mood: '😢',
    stickers: {},
    photos: [],
    text: `今天丢失了一个方案，保存失败，三个小时白干。\n\n我知道这种事情很正常，但当下那种空白和愤怒真的很难受。坐在椅子上发了大概五分钟呆，然后重新开始。\n\n重做的版本反而比原来的好一些，逻辑更清楚。但我不想承认这一点，因为那样就没有人来可怜我了。\n\n晚上吃了一碗泡面，加了两个鸡蛋和很多辣，感觉好多了。也许人的疗愈系统比想象中简单。`,
    createdAt: new Date(daysAgo(61)).getTime(),
  },
  {
    id: '1710000005',
    petId: 'sheep',
    stationeryId: 'cloud',
    date: daysAgo(49),
    mood: '😌',
    stickers: { s3: '🌙', s4: '🐰' },
    photos: [],
    text: `今天做了一件一直在拖的事：整理了手机相册。\n\n翻到两年前的照片，那时候头发更长，表情也不一样，更紧绷一点。不知道是变好了还是变麻木了，但感觉确实不同。\n\n删掉了很多重复的截图和不知道为什么拍的照片，留下来的那些突然变得更清晰了。有一张是朋友聚会，五个人挤在一张沙发上，每个人都在笑，那时候我们还不知道有人即将换城市。\n\n整理完觉得有点轻，也有点空。大概清理就是这样，得到空间，但也要接受失去的东西。`,
    createdAt: new Date(daysAgo(49)).getTime(),
  },
  {
    id: '1710000006',
    petId: 'bird',
    stationeryId: 'lined',
    date: daysAgo(38),
    mood: '🌟',
    stickers: { s1: '✨', s2: '🎵' },
    photos: [],
    text: `今天跑步跑了五公里，是这个月的最长距离。\n\n以前一想到跑步就觉得很痛苦，但今天不知道为什么，大概到第三公里的时候就进入了一种奇怪的状态——不累了，只是在跑，脑子里什么都没有，音乐也好像变远了。\n\n后来查了一下，好像叫"runner's high"，是大脑分泌内啡肽。但我觉得不完全是这个，更像是某种"够了"的感觉，一种允许自己只是在移动、不需要思考任何事情的许可。\n\n想把这个感觉存起来，留着某个丧的早晨用。`,
    createdAt: new Date(daysAgo(38)).getTime(),
  },
  {
    id: '1710000007',
    petId: 'sheep',
    stationeryId: 'sakura',
    date: daysAgo(27),
    mood: '😤',
    stickers: { s5: '✂️' },
    photos: [],
    text: `今天和室友因为洗碗的事闹了点不愉快。\n\n其实不是洗碗，是很多个小事积累在一起，洗碗只是最后那一根稻草。我们说了一些比较重的话，然后各自回了房间。\n\n我坐在床上生了一个小时的闷气，然后觉得有点没意思。去敲了她的门，说"我们出去走走吧"。走了半圈小区，买了两根冰淇淋，什么都没有再说，但好像就这样过去了。\n\n我一直以为道歉是最难的，但有时候"出去走走吧"也可以是道歉。`,
    createdAt: new Date(daysAgo(27)).getTime(),
  },
  {
    id: '1710000008',
    petId: 'monkey',
    stationeryId: 'grid',
    date: daysAgo(14),
    mood: '🌟',
    stickers: { s1: '⭐', s3: '📚' },
    photos: [],
    text: `今天的项目第一阶段正式通过了。\n\n收到邮件的时候我在地铁上，信号断断续续，看了三遍才确认内容是对的。然后在座位上坐了很久，没有跟任何人说，就是自己安静地高兴了一会儿。\n\n这个项目从提案到今天四个月，中间改了不知道多少版，有两次差点被砍掉。每次以为做不下去了，然后又继续了。\n\n我想记住今天地铁里那个沉默的高兴，它比任何庆祝都真实。有时候最好的时刻是一个人的。`,
    createdAt: new Date(daysAgo(14)).getTime(),
  },
  {
    id: '1710000009',
    petId: 'bird',
    stationeryId: 'night',
    date: daysAgo(6),
    mood: '😴',
    stickers: { s4: '🌙' },
    photos: [],
    text: `今天又熬到了两点，什么也没干，就是刷手机。\n\n我知道这不对，但有时候就是没有办法让自己停下来。那种不停地刷的状态有点像在等什么，但不知道在等什么。\n\n最后看了一个视频，是有人在深夜的厨房里做拉面，镜头很近，锅里滚沸的声音很响，然后他把面盛出来，撒了葱花，坐下来吃。就这样，没有说话，没有字幕。看完我居然平静了。\n\n也许我需要的不是内容，只是有人陪着我待一会儿。`,
    createdAt: new Date(daysAgo(6)).getTime(),
  },
  {
    id: '1710000010',
    petId: 'sheep',
    stationeryId: 'lined',
    date: daysAgo(1),
    mood: '😊',
    stickers: { s1: '☕', s2: '💐' },
    photos: [],
    text: `今天收到了一份快递，是半个月前给自己下单的书，早就忘了。\n\n拆开来的时候有一种莫名其妙的惊喜感，像是另一个时间的自己寄来的礼物。书里还有当时随手夹进去的一张超市收据，买了酸奶和一包薯片。一个人过日子给自己买零食，这很好。\n\n傍晚去楼下的花店转了一圈，没买什么，就是看了看。老板娘在给一束花修整，剪掉多余的叶子，让每一朵都能更好地被看见。\n\n今天没有发生什么大事，但每件小事都刚好。`,
    createdAt: new Date(daysAgo(1)).getTime(),
  },
];

function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(21, Math.floor(Math.random() * 40) + 10, 0, 0);
  return d.toISOString();
}

export function seedMockEntries(overwrite = false) {
  const existing = JSON.parse(localStorage.getItem(ENTRIES_KEY) || '[]');
  if (existing.length > 0 && !overwrite) {
    console.log(`已有 ${existing.length} 条日记，跳过。传入 true 强制覆盖。`);
    return;
  }
  localStorage.setItem(ENTRIES_KEY, JSON.stringify(MOCK_ENTRIES));
  console.log(`✅ 已写入 ${MOCK_ENTRIES.length} 条 mock 日记`);
}

export function clearMockEntries() {
  localStorage.removeItem(ENTRIES_KEY);
  console.log('🗑️ 已清除所有日记');
}
