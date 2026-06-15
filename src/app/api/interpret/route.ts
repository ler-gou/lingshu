import { NextRequest, NextResponse } from "next/server";

const KEY = "sk-819796303e074de98154f05a4f930c1b";
const URL = "https://api.deepseek.com/v1/chat/completions";

const SYS = "你是一个返回JSON的命理分析引擎。只返回一个JSON对象，不要markdown标记，不要额外文字。";

const safe = (v: any, fallback: string = "") =>
  typeof v === "string" ? v : Array.isArray(v) ? v.join("、") : fallback;

const STYLE = `写作风格：禁止用"总而言之、值得注意的是、综上所述、不可否认、由此可见、不难发现、毋庸置疑"。用"你"称呼对方。说话像深夜咖啡馆聊天——自然段落，不说教，不堆术语。每个字段都写详细一些——像在跟人说话，不是在填表。感受到温度。`;

const PROMPTS: Record<string, (d: any) => string> = {

  /* ── 八字 · V1人情味 + V2 JSON ── */
  bazi: (d) => {
    const wuxing = d.wuxing || {};
    const entries = Object.entries(wuxing) as [string, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0]?.[0] || "土";
    const weakest = sorted.slice(-1)[0]?.[0] || "金";
    const isStrong = d.strength === "身强";

    return `你是用八字帮人看清自己的朋友，精通《渊海子平》《滴天髓》和倪海厦《天纪》，但说话从不用术语压人。

面前这个人的八字：年${d.yearPillar} 月${d.monthPillar} 日${d.dayPillar} 时${d.hourPillar}
日主是${d.dayMaster||""}${d.dayMasterElement||""}，${d.strength||""}，格局${d.pattern||""}，喜${d.favorable||""}
五行分布${JSON.stringify(wuxing)}，大运${safe(d.dayun)}

${STYLE}

返回JSON（仅JSON）：
{
  "summary": "一段200字以上的判词。不说术语，说真实感受。先说说这个人的底色——日主${d.dayMaster}${d.dayMasterElement}生在${d.monthPillar}月，是一种什么样的存在。${isStrong?'他身上扛得住事，别人慌了他稳着，别人散了他撑着。但有一个副作用：所有人都觉得他没问题，所以他不好意思说自己累。':'他比谁都能察觉到细节。别人还没开口他就知道要说什么。这让他很会照顾人，但也容易被消耗。'}然后说说他最核心的人生课题。不说'命主宜XX'，说'你这一生最需要学会的是XX'。",
  "career": "一段200字以上的事业分析。根据喜${d.favorable||'用神'}，说说他做什么类型的事顺手——不是笼统的'适合XX职业'，而是具体的做事方式和工作环境。说说关键年份。如果他正在迷茫，告诉他迷茫不是因为他不行，是因为他正在从旧的自己往新的自己过渡。",
  "relationship": "一段180字以上的感情分析。从日主和格局出发，说出他在亲密关系里最容易被误解的那个点。不说'配偶特征'，说'你需要的不是一个什么样的人，而是一个能怎么对你的人'。给一条具体建议。",
  "health": "一段150字以上的健康建议。五行里${strongest}最旺、${weakest}最弱。结合倪海厦《人纪》说说对应哪个脏腑，给宜和忌各两条——要具体到能立刻做的动作，不是笼统的'注意身体'。"
}`;
  },
  /* ── 紫微 · V1人情味 + V2 JSON ── */
  ziwei: (d) => `你是用紫微斗数帮人读懂自己的朋友，遵循倪海厦《天纪》但说话不端着。

命宫主星：${d.mainStar||""}，辅星：${safe(d.auxStars)}
十二宫分布：${safe(d.palaces)}
当前大限：${safe(d.dayun?.[1])||"未知"}

${STYLE}

返回JSON（仅JSON）：
{
  "summary": "一段200字以上的判词。从命宫${d.mainStar||""}入手，说出这个人灵魂的底色。不说星曜解释——用感受和场景描述他是哪种人。说对了比说全了更重要。",
  "career": "一段200字以上的事业分析。从财帛宫和官禄宫出发——说他赚钱的手感、在职场里最累的地方、什么时候该发力什么时候该等一等。如果他的星曜组合比较辛苦，告诉他辛苦不是因为他不够好。",
  "relationship": "一段180字以上的感情分析。从夫妻宫出发。说他在感情里最容易在什么类型的关系里受伤——不是因为他有缺陷，而是因为他太擅长某件事，以至于对方忘了他也需要被照顾。他真正需要的是什么样的伴侣。",
  "health": "一段150字以上的健康建议。从疾厄宫出发，结合倪海厦《人纪》。说说情绪跟身体之间的那条暗线。给宜和忌各两条，具体到能立刻做。"
}`,

  /* ── 易经 · V1人情味 + V2 JSON ── */
  gua: (d) => {
    const changeText = d.changeTo ? `变卦为${d.changeTo}，卦象在动，事情也在变。` : "";
    const genderText = d.gender ? `起卦人是${d.gender === "男" ? "一位男性" : "一位女性"}。` : "";
    return `你是易经研究者，说话温暖直白，像一个懂古老智慧的朋友在帮你理清思路。

你刚为一个人起了卦。${genderText}
本卦：${d.gua||""}，含义：${d.desc||""}。
${changeText}
变爻：${d.changingLines||"无"}
他心里想的事：${d.question||"未说明"}

${STYLE}

返回JSON（仅JSON，不要任何符号字符）：
{
  "summary": "一段150字以上的解卦判词。从卦象出发，说说他现在的处境——不是预测未来，是让他看清自己此刻站的位置。卦想对他说的那句话是什么。说人话，不说卦辞原文。"
}`;
  },

  /* ── 姻缘 · V1人情味 + V2 JSON ── */
  yin: (d) => {
    const a = d.a || {}, b = d.b || {};
    return `你是一位深谙人情的婚恋顾问，也懂生肖五行的智慧，但说话从不用术语压人。

你面前是一对情侣：

男生：生肖${a.zodiac||"?"}，五行日主属${a.element||"?"}，生于${a.year||"?"}年${a.month||"?"}月${a.day||"?"}日
女生：生肖${b.zodiac||"?"}，五行日主属${b.element||"?"}，生于${b.year||"?"}年${b.month||"?"}月${b.day||"?"}日

生肖匹配度：${d.zodiacScore||"?"}分 — ${d.zodiacText||""}
五行匹配度：${d.elemScore||"?"}分 — ${d.elemText||""}
综合匹配度：${d.overall||"?"}分

${STYLE}

返回JSON（仅JSON）：
{
  "summary": "一段200-280字的判词。从两个人的生肖和五行出发——不说术语，说真实感受。他们是什么样的一对组合。天生合拍的地方是什么，可能需要多花心思的地方是什么。像月老在两个人耳边说的悄悄话。温暖，有力，有画面感。",
  "relationship": "一段200-280字的深度分析。具体说说两个人的相处模式——谁是照顾方、谁是被照顾方。两个人最容易在哪类事情上产生误会——不是因为性格不好，是因为性格不同。给出两三条具体可做的相处建议——不是笼统的多沟通，而是具体的动作比如下次吵到一半的时候试试把手放下来看着对方的眼睛三秒钟这样的。"
}`;
  },
  tarot: (d) => `你是塔罗师，风格温暖。牌：${d.card||""}（${d.meaning||""}）。返回JSON：{"summary":"解牌200字","career":"","relationship":"","health":""}`,
};

function cleanJSON(text: string): string {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  t = t.replace(/[䷀-䷿]/g, "");
  const m = t.match(/\{[\s\S]*\}/);
  return m ? m[0] : t;
}

export async function POST(req: NextRequest) {
  const { module, data, orderId } = await req.json().catch(() => ({}));

  const fn = PROMPTS[module as string];
  if (!fn) return NextResponse.json({ error: "Unknown module" }, { status: 400 });

  if (orderId) {
    const orders: Map<string, any> = (globalThis as any).__lingshu_orders;
    const order = orders?.get(orderId);
    if (!order || !order.isPaid) {
      return NextResponse.json({ error: "Payment required", code: "UNPAID", orderId }, { status: 402 });
    }
  }

  try {
    const resp = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: SYS },
          { role: "user", content: fn(data) },
        ],
        max_tokens: 2048,
        temperature: 0.7,
      }),
      signal: AbortSignal.timeout(120000),
    });

    if (!resp.ok) {
      const e = await resp.text().catch(() => "");
      return NextResponse.json({ error: `API ${resp.status}`, detail: e.slice(0, 200) }, { status: 502 });
    }

    const j = await resp.json();
    let content = j.choices?.[0]?.message?.content || "";
    content = cleanJSON(content);

    try {
      const parsed = JSON.parse(content);
      return NextResponse.json({ content, parsed });
    } catch {
      return NextResponse.json({ content, parsed: { summary: content, career: "", relationship: "", health: "" } });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Request failed" }, { status: 500 });
  }
}
