import { NextRequest, NextResponse } from "next/server";

const KEY = "sk-819796303e074de98154f05a4f930c1b";
const URL = "https://api.deepseek.com/v1/chat/completions";

const PROMPTS: Record<string, (d: any) => string> = {
  bazi: (d) => `你是一位资深的八字命理师，精通《渊海子平》《三命通会》《滴天髓》《穷通宝鉴》等典籍。请对以下八字命盘做详细解读。

八字四柱：年${d.yearPillar} 月${d.monthPillar} 日${d.dayPillar} 时${d.hourPillar}
日主：${d.dayMaster}${d.dayMasterElement}（${d.strength}）
格局：${d.pattern}
用神：${d.favorable}
五行分布：${JSON.stringify(d.wuxing)}
大运：${d.dayun?.join("、")}

请按以下板块逐项分析，做成一份完整的命书。

格式要求：可以有小标题分段，但不用 Markdown 的###和**加粗**。用自然的中文数字标记即可（如"一、日主五行"）。

禁止使用：总而言之、值得注意的是、综上所述、不可否认、由此可见、不难发现、毋庸置疑。用"你"来称呼对方。适当引用古籍但不堆砌：

1. 日主五行分析——日主${d.dayMaster}${d.dayMasterElement}在${d.monthPillar}月的强弱状态、调候需求、用神取法。结合月令深度分析五行旺衰，说说日主的天生气质。

2. 十神格局详解——${d.pattern}的完整含义、此格局对人的性格塑造和人生轨迹的影响。结合四柱全面分析格局成败。

3. 事业财运——适合的行业方向和做事方式。不是笼统的"适合XX职业"，而是根据用神说说做什么类型的事顺手、在什么环境里容易发挥。分析财富格局和关键时间节点。

4. 感情婚姻——从日主和格局出发，分析在亲密关系中的特质、最容易被误解的地方、以及适合的感情模式。

5. 健康养生——五行偏枯对应的身体倾向。${Object.entries(d.wuxing).sort((a:any,b:any)=>b[1]-a[1])[0][0]}最旺、${Object.entries(d.wuxing).sort((a:any,b:any)=>a[1]-b[1])[0][0]}最弱，说说对应哪些脏腑需要注意，结合倪海厦《人纪》的日常调理思路，给两三条具体的生活建议。

6. 大运走势——当前${d.dayun?.[1] || "大运"}的详细解读。不在哪个年份发财，而是这几年真正的人生课题是什么，该把力气花在哪。

最后给他一段话。像一个懂命理也懂他的朋友在告别时说的话。温暖，有力，不啰嗦。以一句祝福收尾。`,

  ziwei: (d) => `你是紫微斗数大师，精通倪海厦《天纪》体系。请对以下命盘做详细解读。

命宫主星：${d.mainStar}
辅星：${d.auxStars?.join("、")}
十二宫分布：${d.palaces?.join("；")}
当前大限：${d.dayun?.[1] || "34-43岁"}

禁止使用"总而言之、值得注意的是、综上所述、不可否认、由此可见、不难发现、毋庸置疑"。

请挑核心的宫位逐一分析（命宫、财帛宫、官禄宫、夫妻宫、疾厄宫），每宫不少于80字。用"你"称呼对方。整体不少于500字。

先说说命宫${d.mainStar}——这是命盘的灵魂。不说星曜术语表，说说这颗星给这个人的底色是什么。

然后说财帛宫和官禄宫——钱和工作。他赚钱的方式、在职场里顺和不顺的地方。

说夫妻宫——感情里最容易被误解的一件事。

说疾厄宫——身体跟情绪的关系。结合倪海厦《人纪》给两条具体的生活调整。

最后根据命宫主星单独给他一段话。以祝福收尾。`,

  gua: (d) => `你是易经研究者，说话温暖直白。

本卦：${d.gua} ${d.symbol || ""}
卦象含义：${d.desc}
${d.changeTo ? "变卦：" + d.changeTo : "无变卦"}
变爻：${d.changingLines || "无"}
心中所问：${d.question || "未说明"}

像跟朋友聊天一样解这个卦。自然的段落，不用标题。

先说说本卦${d.gua}——它是什么样的一种状态。不说"此卦主XX"，说"你现在的处境，用这个卦来看，大概是什么样的感觉"。

${d.changeTo ? "再说说变出来的那个卦——" + d.changeTo + "。变爻在" + d.changingLines + "，这是一个很关键的信号。说说它想提醒你什么。不是预测未来，是让你看清自己现在忽略的东西。" : "没有变爻。有时候不变就是最好的消息——你现在不需要改变什么，需要的是接受现在的状态，看清它。"}

最后给两句有温度的话。不是鸡汤，不是说教。像一个懂易经的朋友，看完卦之后，看着你，想对你说的话。`,

  yin: (d) => `你是情感咨询师，懂一些生肖五行的智慧但从不宿命论。

双方信息：
第一人：生肖${d.a?.zodiac}，五行${d.a?.element}，${d.a?.year}年${d.a?.month}月${d.a?.day}日生
第二人：生肖${d.b?.zodiac}，五行${d.b?.element}，${d.b?.year}年${d.b?.month}月${d.b?.day}日生
生肖匹配度：${d.zodiacScore}分 · ${d.zodiacText}
五行匹配度：${d.elemScore}分 · ${d.elemText}
综合：${d.overall}分

请像朋友一样聊聊这两个人。

先说说他们的匹配度。不是给一个冷冰冰的数字——而是说清楚：为什么是这个分？哪些地方天生合拍，哪些地方可能需要两个人多花点力气。

然后说说他们的相处模式。从生肖和五行的角度看，谁是照顾方、谁是被照顾方，两个人最容易在哪类事情上产生误会。${d.overall >= 80 ? "这是一个很好的搭配，但好搭配也需要经营。说说他们最需要注意的一个盲区。" : d.overall >= 50 ? "这个匹配不算优秀但绝对不差。很多时候不够完美的组合反而走得更远——因为两个人都知道需要努力。" : "分数不太高，但我从来不相信数字能决定两个人的命运。说说爱可以怎么做来弥补那些所谓的不合。"}

最后给两句话，像月老在两个人耳边的低语。温柔，不啰嗦。`,

  tarot: (d) => `你是塔罗读牌人。牌：${d.card}（${d.meaning}）。问题：${d.question || "近期运势"}。200-300字。温暖直接。`,

  qimen: (d) => `你是奇门研习者。值门${d.door}值星${d.star}值神${d.god}，向${d.direction}。事：${d.question || "未说明"}。100-200字。`,

  zeri: (d) => `你是择日师傅。${d.date}做${d.activity}，宜${d.yi?.join("、")}忌${d.ji?.join("、")}。两三句话。`,
};

export async function POST(req: NextRequest) {
  const { module, data } = await req.json();
  const fn = PROMPTS[module as string];
  if (!fn) return NextResponse.json({ error: "Unknown module" }, { status: 400 });

  try {
    const resp = await fetch(URL, {
      method: "POST",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${KEY}` },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [{ role: "user", content: fn(data) }],
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
    return NextResponse.json({ content: j.choices?.[0]?.message?.content || "解读生成中" });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Request failed" }, { status: 500 });
  }
}
