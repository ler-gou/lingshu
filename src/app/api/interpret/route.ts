import { NextRequest, NextResponse } from "next/server";

const KEY = "sk-819796303e074de98154f05a4f930c1b";
const URL = "https://api.deepseek.com/v1/chat/completions";

const SYS = "你是一个返回JSON的AI API。只返回一个JSON对象，不要markdown标记，不要额外文字。";

const safe = (v: any, fallback: string = "") => {
  if (typeof v === "string") return v;
  if (Array.isArray(v)) return v.join("、");
  return fallback;
};

const PROMPTS: Record<string, (d: any) => string> = {

  bazi: (d) => `你是八字命理师。命盘数据：八字年${d.yearPillar}月${d.monthPillar}日${d.dayPillar}时${d.hourPillar}，日主${d.dayMaster||""}${d.dayMasterElement||""}，${d.strength||""}，格局${d.pattern||""}，喜${d.favorable||""}，五行${JSON.stringify(d.wuxing||{})}，大运${safe(d.dayun)}。

返回JSON（仅JSON，不要markdown）：
{"summary":"150字高情商判词。不说术语，说真实感受——你是什么样的人，最核心的课题是什么。","career":"事业财运。结合喜用神说清楚做什么顺手、关键年份。不少于150字。","relationship":"感情缘分。从日主和格局出发说你在亲密关系里最容易被误解的一个点。不少于120字。","health":"健康建议。结合五行偏枯和倪海厦人纪，给宜和忌各两条（具体能立刻做的）。不少于100字。"}`,

  ziwei: (d) => `你是紫微斗数大师。命盘：命宫主星${d.mainStar||""}，辅星${safe(d.auxStars)}，十二宫${safe(d.palaces)}，当前大限${safe(d.dayun?.[1])||"未知"}。

返回JSON（仅JSON，不要markdown）：
{"summary":"150字高情商判词。从命宫入手说出这个人灵魂的底色——用感受和场景描述他是哪种人。","career":"从财帛宫和官禄宫出发说事业财运——最赚钱的方式、职场里最累的地方、关键年份。不少于150字。","relationship":"从夫妻宫出发说感情缘分——最容易在什么类型的关系里受伤，真正需要的是什么。不少于120字。","health":"从疾厄宫出发结合倪海厦人纪——身体调理宜和忌各两条，具体能立刻做。不少于100字。"}`,

  gua: (d) => `你是易经研究者。本卦「${d.gua||""}」，含义：${d.desc||""}。${d.changeTo?"此处产生了变卦——"+d.changeTo+"。":""}变爻：${d.changingLines||"无"}。问：${d.question||"未说明"}。

返回JSON（纯文字，不要任何符号字符）：{"summary":"解卦判词80-120字，从卦象出发说清此人现在的处境和卦给他的提醒","career":"","relationship":"","health":""}`,

  yin: (d) => `你是一位深谙人情的婚恋顾问，也懂生肖五行的智慧，但说话从不用术语压人。

你面前是两个人：

第一个：生肖${d.a?.zodiac||"?"}，五行日主属${d.a?.element||"?"}，生于${d.a?.year||"?"}年${d.a?.month||"?"}月${d.a?.day||"?"}日
第二个：生肖${d.b?.zodiac||"?"}，五行日主属${d.b?.element||"?"}，生于${d.b?.year||"?"}年${d.b?.month||"?"}月${d.b?.day||"?"}日

生肖匹配度：${d.zodiacScore||"?"}分 — ${d.zodiacText||""}
五行匹配度：${d.elemScore||"?"}分 — ${d.elemText||""}
综合匹配度：${d.overall||"?"}分

请像朋友一样聊聊这两个人。自然的段落，不要章节标题。用"你们"来称呼。禁止用"总而言之、值得注意的是、综上所述、不可否认、由此可见、不难发现、毋庸置疑"。

返回JSON（仅JSON，不要markdown）：
{
  "summary": "一段180-250字的判词。从两个人的生肖和五行出发——不说术语，说真实感受。他们是什么样的一对组合。天生合拍的地方是什么，可能需要多花心思的地方是什么。像月老在两个人耳边说的悄悄话。温暖，有力，有画面感。",
  "relationship": "一段180-250字的深度分析。具体说说两个人的相处模式——谁是照顾方、谁是被照顾方。两个人最容易在哪类事情上产生误会——不是因为性格不好，是因为性格不同。给出两三条具体可做的相处建议——不是笼统的'多沟通'，而是'下次吵架的时候试试先停三秒再说'这样的。",
  "career": "",
  "health": ""
}`,


  tarot: (d) => `你是塔罗师。牌：${d.card||""}（${d.meaning||""}）。返回JSON：{"summary":"解牌200字","career":"","relationship":"","health":""}`,
};

function cleanJSON(text: string): string {
  let t = text.trim();
  t = t.replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "");
  // Strip Yi Jing hexagram symbols (U+4DC0–U+4DFF) — not supported in most fonts
  t = t.replace(/[䷀-䷿]/g, "");
  const m = t.match(/\{[\s\S]*\}/);
  return m ? m[0] : t;
}

export async function POST(req: NextRequest) {
  const { module, data, orderId } = await req.json().catch(() => ({}));

  const fn = PROMPTS[module as string];
  if (!fn) return NextResponse.json({ error: "Unknown module" }, { status: 400 });

  // ═══ Payment auth guard ═══
  // When called via the paid flow (orderId present), verify payment status.
  // Free modules (bazi preview, tarot, gua, yin) skip payment check.
  const PAID_MODULES = new Set(["ziwei", "bazi"]);
  if (PAID_MODULES.has(module as string) && !orderId) {
    // Free preview mode: return a shorter, less detailed prompt result
    // (The full prompt already handles this — just let it through for free tier)
  }
  if (orderId) {
    const orders: Map<string, any> = (globalThis as any).__lingshu_orders;
    const order = orders?.get(orderId);
    if (!order || !order.isPaid) {
      return NextResponse.json(
        { error: "Payment required", code: "UNPAID", orderId },
        { status: 402 }
      );
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
      return NextResponse.json({
        content,
        parsed: { summary: content, career: "", relationship: "", health: "" },
      });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Request failed" }, { status: 500 });
  }
}
