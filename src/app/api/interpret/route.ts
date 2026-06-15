import { NextRequest, NextResponse } from "next/server";

const KEY = "sk-819796303e074de98154f05a4f930c1b";
const URL = "https://api.deepseek.com/v1/chat/completions";

const SYS = "你是一个返回JSON的命理分析引擎。只返回一个JSON对象，不要markdown标记，不要额外文字。";

const safe = (v: any, fallback: string = "") => typeof v === "string" ? v : Array.isArray(v) ? v.join("、") : fallback;

const STYLE = `写作风格：禁止用"总而言之、值得注意的是、综上所述、不可否认、由此可见、不难发现、毋庸置疑"。用"你"称呼对方。说话像深夜咖啡馆聊天——自然段落，不说教，不堆术语。每个字段都写详细一些——像在跟人说话，不是在填表。感受到温度。`;

const PROMPTS: Record<string, (d: any) => string> = {
  bazi: (d) => {
    const wuxing = d.wuxing || {}, entries = Object.entries(wuxing) as [string, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    const strongest = sorted[0]?.[0] || "土", weakest = sorted.slice(-1)[0]?.[0] || "金";
    return `你是用八字帮人看清自己的朋友，精通《渊海子平》《滴天髓》和倪海厦《天纪》，但说话从不用术语压人。

面前这个人的八字：年${d.yearPillar} 月${d.monthPillar} 日${d.dayPillar} 时${d.hourPillar}
日主是${d.dayMaster||""}${d.dayMasterElement||""}，${d.strength||""}，格局${d.pattern||""}，喜${d.favorable||""}
五行分布${JSON.stringify(wuxing)}，大运${safe(d.dayun)}

${STYLE}
返回JSON（仅JSON）：{"summary":"200字以上的判词。先说说这个人——日主${d.dayMaster}${d.dayMasterElement}生在${d.monthPillar}月是一种什么样的存在。${d.strength==='身强'?'他扛得住事，但所有人都觉得他没问题，所以他不好意思说累。':'他比谁都能察觉细节，很会照顾人但也容易被消耗。'}然后说说最核心的人生课题。","career":"200字以上事业分析。根据喜${d.favorable||'用神'}，说说做什么顺手，关键年份。迷茫是正常的——他在从旧的自己往新的自己过渡。","relationship":"180字以上感情分析。不说配偶特征，说他在亲密关系里最容易被误解的那个点，他真正需要的是一种什么样的对待。","health":"150字以上健康建议。五行${strongest}最旺${weakest}最弱，结合倪海厦《人纪》给宜忌各两条——具体能立刻做的动作。"}`;
  },
  ziwei: (d) => `你是用紫微斗数帮人读懂自己的朋友，遵循倪海厦《天纪》但说话不端着。
命宫主星：${d.mainStar||""}，辅星：${safe(d.auxStars)}，十二宫分布：${safe(d.palaces)}，当前大限：${safe(d.dayun?.[1])||"未知"}
${STYLE}
返回JSON（仅JSON）：{"summary":"200字以上的判词。从命宫${d.mainStar||""}入手说出这个人灵魂的底色——用感受和场景描述他是哪种人。说对了比说全了更重要。","career":"200字以上事业分析。从财帛宫官禄宫出发说赚钱的手感、最累的地方、什时候该等一等。","relationship":"180字以上感情分析。从夫妻宫出发说他最容易在什么关系里受伤——不是因为有缺陷，是因为他太擅长某件事以至于对方忘了他也需要被照顾。","health":"150字以上健康建议。从疾厄宫出发结合倪海厦《人纪》，说说情绪和身体的暗线，给宜忌各两条。"}`,
  gua: (d) => {
    const change = d.changeTo ? `变卦为${d.changeTo}，卦象在动，事情也在变。` : "";
    const gender = d.gender ? `起卦人是${d.gender==="男"?"一位男性":"一位女性"}。` : "";
    return `你是易经研究者。${gender}本卦：${d.gua||""}，含义：${d.desc||""}。${change}变爻：${d.changingLines||"无"}。他想的事：${d.question||"未说明"}。${STYLE}返回JSON：{"summary":"150字以上解卦判词，从卦象说出他的处境和卦的提醒，说人话不说卦辞。"}`;
  },
  yin: (d) => {
    const a = d.a || {}, b = d.b || {};
    return `你是婚恋顾问，懂生肖五行但不宿命。男生：${a.zodiac||"?"}${a.element||"?"} 女生：${b.zodiac||"?"}${b.element||"?"}。匹配度${d.zodiacScore||"?"}/${d.elemScore||"?"}/${d.overall||"?"}分。${STYLE}返回JSON：{"summary":"200-280字判词，从生肖五行出发说真实感受——他们是什么样的组合，天生合拍和需要多花心思的地方。","relationship":"200-280字深度分析——谁照顾谁、最容易在哪类事上误会、两三条具体相处建议。"}`;
  },
  tarot: (d) => `塔罗师。牌${d.card||""}（${d.meaning||""}）。返回JSON：{"summary":"解牌200字"}`,
};

function cleanJSON(t: string): string {
  t = t.trim().replace(/^```(?:json)?\s*/i, "").replace(/\s*```\s*$/i, "").replace(/[䷀-䷿]/g, "");
  const m = t.match(/\{[\s\S]*\}/);
  return m ? m[0] : t;
}

async function callDeepSeek(prompt: string) {
  const resp = await fetch(URL, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
    body: JSON.stringify({ model: "deepseek-chat", messages: [{ role: "system", content: SYS }, { role: "user", content: prompt }], max_tokens: 2048, temperature: 0.7 }),
    signal: AbortSignal.timeout(120000),
  });
  if (!resp.ok) { const e = await resp.text().catch(() => ""); throw new Error(`API ${resp.status}: ${e.slice(0, 200)}`); }
  return resp.json();
}

export async function POST(req: NextRequest) {
  const { module, data, orderId, stream } = await req.json().catch(() => ({}));
  const fn = PROMPTS[module as string];
  if (!fn) return NextResponse.json({ error: "Unknown module" }, { status: 400 });

  if (orderId) {
    const orders: Map<string, any> = (globalThis as any).__lingshu_orders;
    const order = orders?.get(orderId);
    if (!order || !order.isPaid) return NextResponse.json({ error: "Payment required", code: "UNPAID", orderId }, { status: 402 });
  }

  // Streaming — bypasses Vercerel 10s timeout via SSE
  if (stream) {
    const prompt = fn(data);
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const enc = new TextEncoder();
    (async () => {
      try {
        const j = await callDeepSeek(prompt);
        let c = j.choices?.[0]?.message?.content || "";
        c = cleanJSON(c);
        try { JSON.parse(c); writer.write(enc.encode(`data: ${c}\n\n`)); }
        catch { writer.write(enc.encode(`data: ${JSON.stringify({summary:c,career:"",relationship:"",health:""})}\n\n`)); }
      } catch (e: any) { writer.write(enc.encode(`data: ${JSON.stringify({error:e.message||"failed"})}\n\n`)); }
      finally { writer.write(enc.encode("data: [DONE]\n\n")); writer.close(); }
    })();
    return new Response(readable, { headers: { "Content-Type": "text/event-stream", "Cache-Control": "no-cache", Connection: "keep-alive" } });
  }

  // Non-streaming (legacy, will hit Vercel 10s timeout on long responses)
  try {
    const j = await callDeepSeek(fn(data));
    let content = j.choices?.[0]?.message?.content || "";
    content = cleanJSON(content);
    try { return NextResponse.json({ content, parsed: JSON.parse(content) }); }
    catch { return NextResponse.json({ content, parsed: { summary: content, career: "", relationship: "", health: "" } }); }
  } catch (e: any) { return NextResponse.json({ error: e.message }, { status: 500 }); }
}
