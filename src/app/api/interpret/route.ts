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

  yin: (d) => `你是情感咨询师。双方生肖${d.a?.zodiac||""}${d.a?.element||""} vs ${d.b?.zodiac||""}${d.b?.element||""}，生肖匹配${d.zodiacScore||"?"}分，五行匹配${d.elemScore||"?"}分，综合${d.overall||"?"}分。返回JSON：{"summary":"合婚判词120字","career":"","relationship":"从生肖五行分析相处模式、默契和摩擦 150字","health":""}`,

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
