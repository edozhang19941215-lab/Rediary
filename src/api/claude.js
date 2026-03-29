const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY;
const MODEL = 'MiniMax-M2.7-highspeed';

// In dev: call MiniMax directly with local key.
// In prod (Vercel demo): call serverless proxy — key stays server-side.
const API_URL = API_KEY
  ? 'https://api.minimax.chat/v1/chat/completions'
  : '/api/chat';
const IMAGE_API_URL = API_KEY
  ? 'https://api.minimax.chat/v1/image_generation'
  : '/api/image';

// Strip <think>...</think> reasoning blocks from response
function stripThink(text) {
  return text.replace(/<think>[\s\S]*?<\/think>/g, '').trim();
}

async function callAI(system, userMessage, maxTokens = 500) {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: userMessage },
      ],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return stripThink(data.choices[0].message.content);
}

async function callAIWithHistory(system, messages, maxTokens = 400) {
  const headers = { 'Content-Type': 'application/json' };
  if (API_KEY) headers['Authorization'] = `Bearer ${API_KEY}`;
  const res = await fetch(API_URL, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      model: MODEL,
      max_tokens: maxTokens,
      messages: [{ role: 'system', content: system }, ...messages],
    }),
  });
  if (!res.ok) throw new Error(`API ${res.status}`);
  const data = await res.json();
  return stripThink(data.choices[0].message.content);
}

// Trim leading assistant messages so history always starts with 'user'
function trimHistory(history) {
  let h = [...history];
  while (h.length > 0 && h[0].role !== 'user') h = h.slice(1);
  return h;
}

// Base pet chat — opening greeting or reply within conversation
export async function getPetResponse({ pet, diaryText, conversationHistory, isOpening = false }) {
  try {
    if (isOpening) {
      return await callAI(
        pet.systemPrompt,
        '用户刚打开日记本，准备开始写。请用你的角色给一个温暖的开场问候（1-2句）。'
      );
    }
    const history = trimHistory(conversationHistory.slice(-8));
    history.push({ role: 'user', content: `用户正在写日记，目前写了：\n"${diaryText.slice(-300)}"\n\n请以你的角色回应，给予温暖反馈或启发性问题（1-2句）。` });
    return await callAIWithHistory(pet.systemPrompt, history);
  } catch {
    return getFallbackResponse(pet, isOpening);
  }
}

// Pet responds to mood selection — warm, personality-driven inquiry
export async function getMoodResponse({ pet, mood, moodLabel }) {
  const prompt = `用户刚刚选择了今天的心情：${mood} ${moodLabel}。
请以你的角色，给出一句温暖的回应或追问（1-2句），引导用户说说今天发生了什么，让他们有想写日记的冲动。
语气要符合你的性格，但核心是温暖、好奇、让用户感到被关注。`;
  try {
    return await callAI(pet.systemPrompt, prompt, 200);
  } catch {
    return getFallbackMood(pet, mood);
  }
}

// Pet replies to user's chat message in diary
export async function getChatReply({ pet, userMessage, conversationHistory, diaryText }) {
  const diaryContext = diaryText?.trim()
    ? `\n\n【用户今天日记里写了】\n${diaryText.slice(0, 600)}`
    : '';
  // Inject last pet message so model won't repeat itself
  const lastPetMsg = [...conversationHistory].reverse().find(m => m.role === 'assistant')?.content || '';
  const noRepeat = lastPetMsg
    ? `\n\n【严格禁止】不能重复、改写或与这句话雷同："${lastPetMsg.slice(0, 60)}"，必须说全新的内容。`
    : '';
  const system = pet.systemPrompt + diaryContext + noRepeat;

  const history = trimHistory(conversationHistory.slice(-8));
  history.push({ role: 'user', content: userMessage });
  try {
    return await callAIWithHistory(system, history, 200);
  } catch {
    return getFallbackResponse(pet, false);
  }
}

// After chat exchange — decide if anything should be appended to the diary
// Returns a string to append, or '' if nothing new
export async function updateDiaryFromChat({ conversationHistory, currentDiary }) {
  const lastTwo = conversationHistory.slice(-4); // last 2 user+pet pairs
  if (lastTwo.length < 2) return '';

  const exchangeText = lastTwo
    .map(m => `${m.role === 'user' ? '用户' : '小动物'}：${m.content}`)
    .join('\n');

  const system = `你是一个日记记录助手，帮助把对话内容整合进日记里。

【核心原则】
只记录【用户】自己说的关于自己生活的内容。
绝对不能记录：宠物/小动物说的话、宠物分享的故事、宠物的经历感受。

【记录标准——满足任一条即记录】
1. 用户提到了自己经历的具体的事、物、人、地点
2. 用户表达了自己的情绪或感受
3. 用户说了任何对自己今天有实质描述的话

【不记录的情况】
- 纯粹的单字应答（"嗯"、"哦"等）且没有新信息
- 内容和现有日记完全重复
- 这句话是宠物说的

【续写要求——非常重要】
- 认真阅读"现有日记"，理解已有的内容、时态和语气风格
- 输出是日记的自然续写，用第一人称，像同一个人继续写
- 不要重复现有日记已经描述过的事件或感受
- 如果现有日记里已出现"今天"，不要以"今天"开头，改用自然连接词或直接叙事
- 语言风格与现有日记保持一致，顺畅接续
- 1-2句，简洁自然

如果不值得记录，返回空字符串。
只输出新增的日记语句本身或空字符串，不要任何解释。`;

  try {
    const result = await callAI(
      system,
      `现有日记：\n${currentDiary || '（空白）'}\n\n最新对话：\n${exchangeText}`,
      300
    );
    return result.trim();
  } catch {
    return '';
  }
}

// Proactive message — pet reads diary and initiates conversation after idle
export async function getProactiveMessage({ pet, diaryText, conversationHistory }) {
  const context = diaryText
    ? `用户目前写了：\n"${diaryText.slice(-400)}"`
    : '用户还没有开始写日记。';

  const lastPetMsg = [...conversationHistory].reverse().find(m => m.role === 'assistant')?.content || '';
  const noRepeat = lastPetMsg
    ? `\n【严格禁止】不能重复或改写这句："${lastPetMsg.slice(0, 60)}"，必须换一个全新的角度或话题。`
    : '';

  const prompt = `${context}

用户已经一段时间没有互动了。请以你的角色主动发起一句话：
- 可以是对日记内容的真诚回应（比如鼓励、好奇追问某个细节）
- 可以是对用户积极情绪的放大
- 也可以用你的个性特点随口说一句话来吸引用户回应
保持温暖、自然，1-2句。${noRepeat}`;

  try {
    const history = trimHistory(conversationHistory.slice(-4));
    history.push({ role: 'user', content: prompt });
    return await callAIWithHistory(pet.systemPrompt, history, 200);
  } catch {
    return getFallbackProactive(pet);
  }
}

// Generate golden quote (金句) for card sharing
export async function generateGoldenQuote({ diaryText, conversationHistory }) {
  const system = `你是一个擅长提炼日记金句的助手，风格温暖真实，像朋友说的一句话。
根据用户的日记内容，提炼出一句金句，让用户发朋友圈或小红书用。
要求：不超过25个字，紧扣日记里的具体细节，真实自然有温度，不要说教，不要空洞的鸡汤。
只输出金句本身，不加引号不加解释。`;

  const chatLines = trimHistory(conversationHistory.slice(-6))
    .map(m => `${m.role === 'user' ? '用户' : '宠物'}：${m.content}`)
    .join('\n');
  const userMsg = `日记内容：\n${diaryText || '（今日无内容）'}\n\n今日对话：\n${chatLines || '（无对话）'}`;

  // Let errors propagate — caller handles fallback
  const result = await callAI(system, userMsg, 800);
  if (!result?.trim()) throw new Error('empty response');
  return result.trim();
}

// Generate an AI illustration for the diary page via MiniMax image generation
export async function generateDiaryIllustration(diaryText, pet) {
  // Extract a short scene hint directly from diary text (no extra LLM call)
  const excerpt = diaryText?.trim().slice(0, 80).replace(/\n/g, '，') || '';
  const contextHint = excerpt ? `，画面灵感来自：${excerpt}` : '';

  const prompt = `治愈卡通风格插图，温馨可爱，日式治愈系，柔和暖色调，圆润线条，画面包含日常生活小物件（咖啡杯、书本、植物、小食物等），无人物面部，无文字${contextHint}`;

  const imgHeaders = { 'Content-Type': 'application/json' };
  if (API_KEY) imgHeaders['Authorization'] = `Bearer ${API_KEY}`;
  const res = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: imgHeaders,
    body: JSON.stringify({ model: 'image-01', prompt, n: 1 }),
  });

  if (!res.ok) throw new Error(`Image API ${res.status}`);
  const data = await res.json();
  const url = data?.data?.image_urls?.[0];
  if (!url) throw new Error('No image URL returned');
  return url;
}

// Generate beautiful summary + Xiaohongshu share suggestion
export async function generateDiarySummary(diaryText, petName) {
  const system = `你是一个擅长将日常感悟提炼成优美文字的助手。
你会将日记内容转化为适合分享的小红书图文笔记格式。
要求：
1. 生成一段优美的俳句或散文（不超过80字），提炼日记的情感内核，不暴露任何个人隐私信息
2. 生成一句话说明为什么这段内容值得分享给小红书上的读者（找到共鸣的理由）
3. 生成3个适合的小红书话题标签
4. 生成一段SVG图像代码描述（用于生成配图风格），描述画面意境

严格只输出JSON格式，不要其他内容：
{
  "poem": "优美的俳句或散文",
  "shareReason": "为什么值得分享（提到可能找到同类读者）",
  "tags": ["#标签1", "#标签2", "#标签3"],
  "imagePrompt": "简短的配图意境描述（如：暖光透过窗帘，一杯茶，安静的下午）"
}`;

  try {
    const text = await callAI(system, `日记内容：\n${diaryText.slice(0, 800)}`, 600);
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      poem: '今天的故事，留在心里最柔软的角落。',
      shareReason: '也许有人和你一样，正在经历相似的时刻，等待着被理解。',
      tags: ['#日记', '#生活记录', '#成长'],
      imagePrompt: '温暖的光，一本日记，安静的角落'
    };
  }
}

// Generate a growth illustration based on summary data
export async function generateGrowthIllustration(summaryData) {
  const keywords = summaryData.keywords?.join('、') || '';
  const emotion = summaryData.emotion || '温暖';
  const highlight = summaryData.highlight?.slice(0, 30) || '';

  const prompt = `治愈卡通风格插图，温馨可爱，日式治愈系，柔和暖色调，圆润线条，画面主题来自："${highlight || emotion}"，具体意象包含：${keywords}，整体氛围${emotion}，无人物面部，无文字`;

  const imgHeaders = { 'Content-Type': 'application/json' };
  if (API_KEY) imgHeaders['Authorization'] = `Bearer ${API_KEY}`;
  const res = await fetch(IMAGE_API_URL, {
    method: 'POST',
    headers: imgHeaders,
    body: JSON.stringify({ model: 'image-01', prompt, n: 1 }),
  });

  if (!res.ok) throw new Error(`Image API ${res.status}`);
  const data = await res.json();
  const url = data?.data?.image_urls?.[0];
  if (!url) throw new Error('No image URL');
  return url;
}

// Generate growth summary for week/month
export async function generateGrowthSummary(entries, period = 'week') {
  const combinedText = entries.map(e => e.text).filter(Boolean).join('\n---\n').slice(0, 2000);
  if (!combinedText) return null;

  const system = `你是一个帮助用户发现自我成长的助手。根据用户这段时间的日记，提炼关键词和成长洞察。
严格只输出JSON，不要其他内容：
{
  "keywords": ["关键词1", "关键词2", "关键词3", "关键词4", "关键词5"],
  "summary": "一段温暖的成长总结（60字以内）",
  "emotion": "整体情绪基调（如：温柔平静、充满活力等）",
  "highlight": "这段时间最值得记住的一句话（诗意的）"
}`;

  try {
    const text = await callAI(system, `${period === 'week' ? '本周' : '本月'}日记：\n${combinedText}`, 500);
    const clean = text.replace(/```json|```/g, '').trim();
    return JSON.parse(clean);
  } catch {
    return {
      keywords: ['成长', '记录', '生活', '思考', '感恩'],
      summary: '每一天都是独特的故事，你在用文字温柔地见证自己。',
      emotion: '平静温暖',
      highlight: '记录本身，就是一种爱。'
    };
  }
}

// Generate an SVG art piece based on diary mood
export function generateMoodSVG(imagePrompt, petColor) {
  const colors = {
    warm: ['#FFD4A3', '#FFA07A', '#FF8C69', '#FFDAB9'],
    cool: ['#B0E0E6', '#ADD8E6', '#87CEEB', '#E0F0FF'],
    nature: ['#90EE90', '#98FB98', '#ADFF2F', '#F0FFF0'],
    night: ['#4A4A8A', '#6A5ACD', '#9370DB', '#DDA0DD'],
  };

  const prompt = imagePrompt?.toLowerCase() || '';
  let palette = colors.warm;
  if (prompt.includes('夜') || prompt.includes('月') || prompt.includes('星')) palette = colors.night;
  else if (prompt.includes('海') || prompt.includes('蓝') || prompt.includes('云')) palette = colors.cool;
  else if (prompt.includes('草') || prompt.includes('树') || prompt.includes('绿')) palette = colors.nature;

  const c = palette;
  return `<svg viewBox="0 0 300 200" xmlns="http://www.w3.org/2000/svg">
    <defs>
      <radialGradient id="bg" cx="50%" cy="50%" r="70%">
        <stop offset="0%" stop-color="${c[3]}" stop-opacity="1"/>
        <stop offset="100%" stop-color="${c[0]}" stop-opacity="0.6"/>
      </radialGradient>
      <filter id="blur"><feGaussianBlur stdDeviation="8"/></filter>
    </defs>
    <rect width="300" height="200" fill="url(#bg)" rx="12"/>
    <circle cx="80" cy="60" r="50" fill="${c[1]}" opacity="0.4" filter="url(#blur)"/>
    <circle cx="220" cy="140" r="60" fill="${c[2]}" opacity="0.35" filter="url(#blur)"/>
    <circle cx="150" cy="100" r="40" fill="${petColor}" opacity="0.2" filter="url(#blur)"/>
    <ellipse cx="150" cy="180" rx="120" ry="30" fill="${c[0]}" opacity="0.3" filter="url(#blur)"/>
    <circle cx="60" cy="150" r="25" fill="${c[1]}" opacity="0.25" filter="url(#blur)"/>
    <circle cx="250" cy="50" r="35" fill="${c[2]}" opacity="0.3" filter="url(#blur)"/>
    ${[...Array(12)].map((_, i) => {
      const x = 20 + (i * 24) % 280;
      const y = 20 + (i * 31) % 160;
      const r = 2 + (i % 4);
      return `<circle cx="${x}" cy="${y}" r="${r}" fill="${c[i % 4]}" opacity="${0.4 + (i % 3) * 0.2}"/>`;
    }).join('')}
  </svg>`;
}

function getFallbackResponse(pet, isOpening) {
  const map = {
    sheep: {
      open: ['悄悄地来了…今天有什么想说的吗', '小云也在呢，慢慢来'],
      follow: ['然后呢…', '听起来很特别', '你现在感觉怎么样？']
    },
    monkey: {
      open: ['…开始记录吧', '（路过）数据显示今天适合写日记'],
      follow: ['有意思', '继续', '逻辑上来说，这值得记录']
    },
    bird: {
      open: ['✨闪✨ 今天有什么值得记录？', '作为有品味的鸟，我觉得你今天一定有故事'],
      follow: ['有点意思', '✨', '继续说，我在听']
    },
  };
  const arr = (map[pet.id] || map.sheep)[isOpening ? 'open' : 'follow'];
  return arr[Math.floor(Math.random() * arr.length)];
}

function getFallbackMood(pet, mood) {
  const positive = ['😊', '🥰', '🌟'];
  const isPositive = positive.includes(mood);
  const map = {
    sheep: isPositive ? '嗯嗯～看到你开心，小云也在笑呢。今天发生什么好事了？' : '没关系的…慢慢说，克劳德在这里陪着你。',
    monkey: isPositive ? '…数据显示今天心情指数偏高。说说原因。' : '（沉默）…说出来会好一点的。',
    bird: isPositive ? '✨闪✨ 好心情是要记录下来的！快说说！' : '朋友，今天怎么了？文森特在听。',
  };
  return map[pet.id] || map.sheep;
}

function getFallbackProactive(pet) {
  const map = {
    sheep: ['你在想什么呢…慢慢说也没关系', '小云在偷看你的日记，它说还不够哦～'],
    monkey: ['（盯着你）…还有吗。', '逻辑推断：你今天一定还有没说完的事。'],
    bird: ['✨ 朋友，别停下，这部分最有意思了', '我觉得你刚才那段值得展开说说。'],
  };
  const arr = map[pet.id] || map.sheep;
  return arr[Math.floor(Math.random() * arr.length)];
}
