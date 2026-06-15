"use client";

import Link from "next/link";

const MODULES = [
  { id:"bazi", title:"八字命理", subtitle:"四柱推命 · 十神格局", icon:"🔮",
    desc:"透过出生时间，看清你的底色。不是算命的把戏，是一张两千年前的自我认知地图——你的性格、你的天赋、你这辈子最容易卡住的地方，都在里面。",
    features:["日主五行分析","十神格局解读","事业财运方向","大运流年走势"],
    color:"rgba(197,160,89,0.12)" },
  { id:"ziwei", title:"紫微斗数", subtitle:"命盘星图 · 十二宫位", icon:"⭐",
    desc:"如果说八字是素描，紫微就是工笔画。十四主星落入十二宫，每一颗都在讲一个关于你的故事。",
    features:["十二宫星盘排布","十四主星解读","格局判定","中医体质分析"],
    color:"rgba(74,63,122,0.10)" },
  { id:"gua", title:"易经卜卦", subtitle:"三枚铜钱 · 六十四卦", icon:"📜",
    desc:"一事一占，心诚则灵。当你面对一个选择拿不定主意的时候，古老的六十四卦里藏着三千年的智慧——可能比你想象的更懂你。",
    features:["三枚铜钱起卦","本卦变卦解读","动爻信号分析","人生选择指南"],
    color:"rgba(122,106,85,0.10)" },
  { id:"yin", title:"姻缘合婚", subtitle:"生肖相合 · 五行生克", icon:"💞",
    desc:"两个人走到一起，有些地方天然合拍，有些地方需要磨合。不是说能不能在一起——是说在一起之后，哪些地方不用费力，哪些地方要多花点心思。",
    features:["生肖匹配度","五行生克分析","相处模式解读","合盘建议"],
    color:"rgba(166,106,106,0.10)" },
];

export default function Home() {
  return (
    <main className="min-h-screen pb-20 selection:bg-[var(--gold)] selection:text-white">
      <div className="w-full max-w-3xl mx-auto px-6 pt-20 pb-8 flex justify-between items-center">
        <div className="text-2xl font-bold tracking-widest serif">
          灵<span className="text-[var(--gold)]">/</span>枢
        </div>
        <div className="text-sm text-gray-400 tracking-widest">东方智慧生活</div>
      </div>

      <section className="w-full max-w-xl mx-auto px-6 mt-8">
        <div className="text-center mb-16">
          <h1 className="text-3xl md:text-4xl font-bold leading-snug mb-5 serif">
            有些答案，<br/>老祖宗替我们存了两千年。
          </h1>
          <p className="text-gray-400 text-sm leading-relaxed max-w-sm mx-auto">
            不是算命。是借一张命盘，<br/>
            跟那个被生活推着走的自己，好好聊一次天。
          </p>
        </div>

        <div className="space-y-4">
          {MODULES.map((mod)=>(
            <div key={mod.id}>
              <Link href={`/${mod.id}`}>
                <div className="bg-white rounded-[2rem] p-7 shadow-sm border border-gray-100
                  active:scale-[0.98] transition-transform duration-150 cursor-pointer">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-11 h-11 rounded-2xl flex items-center justify-center text-xl"
                      style={{background:`linear-gradient(135deg,${mod.color},transparent)`}}>
                      {mod.icon}
                    </div>
                    <div>
                      <h2 className="text-lg font-bold serif">{mod.title}</h2>
                      <p className="text-xs text-gray-400 mt-0.5">{mod.subtitle}</p>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed mb-4">{mod.desc}</p>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {mod.features.map(f=>(
                      <span key={f} className="text-[11px] rounded-full px-3 py-1.5 border"
                        style={{background:"var(--silk)",borderColor:"var(--border)",color:"var(--ink)"}}>{f}</span>
                    ))}
                  </div>
                  <div className="flex items-center gap-2 text-sm font-medium text-[var(--gold)]">
                    <span>开始解读</span>
                    <span>→</span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>

        <footer className="mt-20 text-center pb-10">
          <p className="text-xs text-gray-300">灵枢 Lingshu · 始于天纪 · 忠于养真</p>
        </footer>
      </section>
    </main>
  );
}
