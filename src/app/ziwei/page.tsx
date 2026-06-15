"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── 常量 ───
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const PALACES = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
const MAIN_STARS = ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"];
const AUX_STARS_ALL = ["左辅","右弼","文昌","文曲","天魁","天钺","擎羊","陀罗","火星","铃星","地空","地劫"];
const WUXING_MAP:Record<string,string> = {
  "甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水",
  "子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水",
};

// TCM per-element mapping
const TCM_ORGANS:Record<string,{zang:string;fu:string;desc:string;herbs:string[];dos:string[];donts:string[];element:string}> = {
  "心":{zang:"心",fu:"小肠",element:"火",desc:"心火旺则失眠多梦，舌尖红赤",herbs:["酸枣仁","莲子心","丹参"],dos:["午时静坐15分钟","多吃苦味清心火","按揉内关穴"],donts:["熬夜过度耗心血","情绪大悲大喜","过量咖啡刺激"]},
  "肝":{zang:"肝",fu:"胆",element:"木",desc:"肝气郁则偏头痛、眼睛干涩、易怒",herbs:["柴胡","白芍","枸杞"],dos:["晨起敲胆经","喝玫瑰花茶","远眺绿色放松"],donts:["压抑怒火伤肝","深夜看屏幕","过量饮酒"]},
  "脾":{zang:"脾",fu:"胃",element:"土",desc:"脾虚则消化不良、四肢乏力、思虑伤脾",herbs:["白术","茯苓","陈皮"],dos:["饭后散步半小时","七分饱养脾胃","艾灸足三里"],donts:["思虑过度伤脾","生冷冰饮","边吃饭边看手机"]},
  "肺":{zang:"肺",fu:"大肠",element:"金",desc:"肺气虚则易感冒、皮肤干燥、气短",herbs:["百合","麦冬","杏仁"],dos:["晨起深呼吸100次","多吃白色食物","按摩列缺穴"],donts:["吸烟伤害肺气","久坐不扩张肺","干燥环境久待"]},
  "肾":{zang:"肾",fu:"膀胱",element:"水",desc:"肾气不足则腰膝酸软、记忆力衰退、耳鸣",herbs:["熟地","山药","枸杞"],dos:["睡前泡脚补肾阳","黑色食物养肾","按摩太溪穴"],donts:["憋尿伤肾","长期熬夜耗精","频繁染烫伤发"]},
};

const GEJU_PATTERNS:Record<string,{name:string;level:"exc"|"good"|"neu"|"cau";desc:string}> = {
  "紫府同宫":{name:"紫府同宫",level:"exc",desc:"帝星与库星同宫，格局宏大，一生贵气。做事有章法，天生具备管理才能，但高处不胜寒——你身边能说真话的人不多。"},
  "日月并明":{name:"日月并明",level:"exc",desc:"太阳太阴同守，阴阳调和。为人处世圆融周到，能在复杂局面中找到平衡。但内心常有两种声音在拉扯——一个想冲锋、一个想退守。"},
  "杀破狼":{name:"杀破狼",level:"good",desc:"七杀、破军、贪狼三颗动荡之星，最不适合安逸的人。你的人生注定经历几次推倒重来——每一次看似的失败其实是在帮你看清真正重要的东西。"},
  "机月同梁":{name:"机月同梁",level:"good",desc:"天机太阴天同天梁汇聚，心思缜密。你适合从事需要耐心和规划的工作，最怕的其实是自己有时候想太多，把简单的事搞复杂了。"},
  "紫府朝垣":{name:"紫府朝垣",level:"exc",desc:"紫微与天府遥相呼应，格局清贵。这样的命盘最大的特点就是——不争。你有自己的节奏，不需要跟别人比。慢一点反而更稳。"},
  "火贪格":{name:"火贪格",level:"good",desc:"火星贪狼同宫，爆发力极强。这不是稳定的格局，但爆发的时候能让别人追不上。关键是你得找到那件让你真正燃起来的事。"},
  "铃贪格":{name:"铃贪格",level:"cau",desc:"铃星贪狼同宫，虽然爆发力也强，但容易贪多嚼不烂。提醒你一件事：真的不必什么都抓在手里。有时候放手比抓住更难，但也更需要。"},
  "马头带剑":{name:"马头带剑",level:"good",desc:"天马擎羊同宫，一生如策马冲锋。你这辈子注定不会按部就班。别人看你颠簸，只有你自己知道——停下来才会真的不安。"},
  "月朗天门":{name:"月朗天门",level:"exc",desc:"太阴在亥入庙，格局清雅。最大的特质是直觉极其准确。你不需要太多分析，相信第一感觉往往比反复琢磨更对。"},
  "石中隐玉":{name:"石中隐玉",level:"good",desc:"外表不起眼，内有乾坤。你可能常被人小看，但最后让人大跌眼镜的总是你。你的价值不需要别人来定义。"},
};

// ─── 排盘逻辑 ───
function calc(year:number,month:number,day:number,hour:number,gender:string){
  const by=year-4,ySi=by%10,yBi=by%12;
  const yGan=STEMS[ySi],yZhi=BRANCHES[yBi];
  const mSi=(by%10*2+(month%12))%10,mBi=(month+1)%12;
  const mGan=STEMS[mSi],mZhi=BRANCHES[mBi];
  const doff=Math.floor((Date.UTC(year,month-1,day)-Date.UTC(1900,0,1))/864e5)+10;
  const dSi=doff%10,dBi=doff%12;
  const dGan=STEMS[dSi],dZhi=BRANCHES[dBi];
  const hBi=Math.floor((hour+1)/2)%12, hSi=(doff%10*2+hBi)%10;
  const hGan=STEMS[hSi],hZhi=BRANCHES[hBi];

  const seed=(+year+(+month)*31+(+day)*17+(+hour)*13+(gender==="女命"?1:0))%10000;

  // Four Pillars
  const pillars = [
    {label:"年柱",gan:yGan,zhi:yZhi,nayin:["海中金","炉中火","大林木","路旁土","剑锋金","山头火"][yBi%6]},
    {label:"月柱",gan:mGan,zhi:mZhi,nayin:["涧下水","城头土","白蜡金","杨柳木","泉中水","屋上土"][mBi%6]},
    {label:"日柱",gan:dGan,zhi:dZhi,nayin:["霹雳火","松柏木","流年水","砂石金","山下火","平地木"][dBi%6]},
    {label:"时柱",gan:hGan,zhi:hZhi,nayin:["大海水","炉中火","大林木","路旁土","剑锋金","山头火"][hBi%6]},
  ];

  // Day Master
  const dayMaster = WUXING_MAP[dGan];
  const counts:Record<string,number>={木:0,火:0,土:0,金:0,水:0};
  [yGan,yZhi,mGan,mZhi,dGan,dZhi,hGan,hZhi].forEach(c=>{const e=(WUXING_MAP as any)[c];if(e)counts[e]++});
  const strength = counts[dayMaster]>3?"身强":"身弱";
  const el=dayMaster;
  const favorable = el==="木"?"金水":el==="火"?"水土":el==="土"?"金水":el==="金"?"木火":"木火";
  const patternName = ["正官格","七杀格","正印格","偏印格","正财格","偏财格","食神格","伤官格","建禄格","阳刃格"][doff%10];

  // Wuxing bars
  const wuxingBars = [
    {el:"火",count:counts["火"]||0,color:"#ff897a"},
    {el:"土",count:counts["土"]||0,color:"#e8c079"},
    {el:"金",count:counts["金"]||0,color:"#d3d6ea"},
    {el:"水",count:counts["水"]||0,color:"#6fb8ff"},
    {el:"木",count:counts["木"]||0,color:"#6fe3a8"},
  ];
  const maxWx = Math.max(...wuxingBars.map(b=>b.count),1);

  // Dayun
  const dayun = [];
  for(let i=2;i<=6;i++){
    const si=(doff%10+i)%10,bi=(doff%12+i)%12;
    dayun.push({age:i*10+4,gan:STEMS[si],zhi:BRANCHES[bi],isCurrent:i===3});
  }

  // Ziwei palace stars
  const palaceStars = PALACES.map((name,i)=>{
    const si=(seed+i*7)%MAIN_STARS.length;
    const ai1=(seed+i*3+5)%AUX_STARS_ALL.length, ai2=(seed+i*5+3)%AUX_STARS_ALL.length;
    const branchIdx = (hBi+i)%12;
    return {
      name,
      branch: BRANCHES[branchIdx],
      branchIdx,
      main: MAIN_STARS[si],
      aux: [AUX_STARS_ALL[ai1],AUX_STARS_ALL[ai2]],
      isMing: i===0,
      isShen: i===6,
      limit: `${(i+2)*10+4}-${(i+3)*10+3}`,
    };
  });

  const mainStar = palaceStars[0].main;

  // Sihua
  const sihuaIdx = (seed*7)%4;
  const sihuaTypes = ["禄","权","科","忌"];
  const sihuaStar = MAIN_STARS[(seed*3)%MAIN_STARS.length];

  // TCM organ matching
  const dominateElement = wuxingBars.sort((a,b)=>b.count-a.count)[0].el;
  const tcm = TCM_ORGANS[
    {火:"心",土:"脾",金:"肺",水:"肾",木:"肝"}[dominateElement] || "脾"
  ];

  // Geju
  const gejuKeys = Object.keys(GEJU_PATTERNS);
  const gejuList = [
    GEJU_PATTERNS[gejuKeys[seed%10]],
    GEJU_PATTERNS[gejuKeys[(seed+3)%10]],
    GEJU_PATTERNS[gejuKeys[(seed+7)%10]],
  ];

  return {
    pillars,dayMaster,strength,favorable,patternName,wuxingBars,maxWx,
    dayun,palaceStars,mainStar,sihuaStar,sihuaTypes,sihua:sihuaTypes,
    tcm,gejuList,gender,
  };
}

// ─── 组件 ───
export default function ZiWeiPage(){
  const [year,setYear]=useState("1990");const [month,setMonth]=useState("6");
  const [day,setDay]=useState("15");const [hour,setHour]=useState("12");
  const [gender,setGender]=useState("男命");
  const [name,setName]=useState("");
  const [city,setCity]=useState("北京");
  const [state,setState]=useState<"input"|"loading"|"preview"|"paid">("input");
  const [result,setResult]=useState<ReturnType<typeof calc>|null>(null);
  const [aiText,setAiText]=useState("");const [aiLoading,setAiLoading]=useState(false);
  const [selPalace,setSelPalace]=useState(0);

  const handleCalc = ()=>{
    setState("loading");
    setTimeout(()=>{setResult(calc(+year,+month,+day,+hour,gender));setState("preview")},1200);
  };

  const fetchAI = async ()=>{
    if(!result)return;setAiLoading(true);setAiText("");
    try{
      const resp=await fetch("/api/interpret",{method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({module:"ziwei",data:{
          mainStar:result.mainStar,palaces:result.palaceStars.map(p=>`${p.name}:${p.main}`),
          auxStars:result.palaceStars[0].aux,dayun:result.dayun,
          geju:result.gejuList.map(g=>g.name).join("、"),
          tcmOrgan:result.tcm.zang,
        }})});
      const j=await resp.json();
      setAiText(j.content||j.error||"解读失败");
      setState("paid");
    }catch{setAiText("网络错误");}
    setAiLoading(false);
  };

  const displayName = name.trim()||"行路人";
  const wuxingEmoji:Record<string,string>={金:"⚪",木:"🟢",水:"🔵",火:"🔴",土:"🟤"};
  const gejuLevelClass:Record<string,string>={exc:"bg-[var(--gold)] text-white",good:"bg-[var(--pine-bg)] text-[var(--pine)]",neu:"bg-gray-100 text-gray-500",cau:"bg-[var(--rose-bg)] text-[var(--rose)]"};

  return(
    <main className="min-h-screen pb-20 selection:bg-[var(--gold)] selection:text-white">
      <div className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 灵枢</Link>
      </div>

      <AnimatePresence mode="wait">
        {/* ═══ INPUT ═══ */}
        {state==="input"&&(
          <motion.section key="input" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="w-full max-w-xl mx-auto px-6 mt-4 text-center">
            <div className="w-24 h-24 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border border-[var(--gold)]/30 animate-spin-slow"/>
              <div className="absolute inset-3 rounded-full border border-[var(--gold)]/20 animate-spin-slow" style={{animationDuration:"34s",animationDirection:"reverse"}}/>
              <div className="absolute inset-6 rounded-full border border-[var(--gold)]/15 animate-spin-slow" style={{animationDuration:"60s"}}/>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--gold)] shadow-[0_0_18px_var(--gold)]"/>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold leading-snug mb-4 serif">
              紫微<span className="text-[var(--gold)]">·</span>命理
            </h1>
            <p className="text-gray-400 mb-10 text-sm">
              排八字 · 演星盘 · 观格局
            </p>
            <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-left">
              <div className="space-y-5">
                <input type="text" value={name} onChange={e=>setName(e.target.value)}
                  placeholder="你的称呼（选填）" className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"/>
                <div className="flex gap-2 p-1 bg-[var(--silk)] rounded-xl">
                  {["男命","女命"].map(g=>(
                    <button key={g} onClick={()=>setGender(g)}
                      className={`flex-1 py-2.5 text-sm rounded-lg font-medium transition-all ${
                        gender===g?"bg-white shadow-sm text-[var(--ink)]":"text-gray-400"}`}>{g}</button>
                  ))}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><label className="block text-xs text-gray-400 mb-1 pl-1">出生地</label>
                    <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="如：北京"
                      className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"/></div>
                  <div><label className="block text-xs text-gray-400 mb-1 pl-1">性别</label>
                    <select value={gender} onChange={e=>setGender(e.target.value)}
                      className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none cursor-pointer">
                      <option>男命</option><option>女命</option>
                    </select></div>
                </div>
                <div className="grid grid-cols-2 gap-3">{/* date fields unchanged */}
                  {[{l:"年",v:year,s:setYear},{l:"月",v:month,s:setMonth},{l:"日",v:day,s:setDay},{l:"时(0-23)",v:hour,s:setHour}].map(f=>(
                    <div key={f.l}><label className="block text-xs text-gray-400 mb-1">{f.l}</label>
                    <input type="number" value={f.v} onChange={e=>f.s(e.target.value)}
                      className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"/></div>
                  ))}
                </div>
                <button onClick={handleCalc}
                  className="w-full bg-[var(--ink)] hover:bg-black text-white rounded-full py-4 mt-2 font-semibold tracking-wider shadow-lg">
                  排布先天格局
                </button>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ LOADING ═══ */}
        {state==="loading"&&(
          <motion.section key="loading" initial={{opacity:0}} animate={{opacity:1}}
            className="w-full max-w-xl mx-auto px-6 mt-20 text-center">
            <div className="w-20 h-20 mx-auto mb-6 relative">
              <div className="absolute inset-0 rounded-full border-2 border-[var(--gold)]/30 animate-spin"/>
              <div className="absolute inset-4 rounded-full border border-[var(--gold)]/20 animate-spin" style={{animationDuration:"3s",animationDirection:"reverse"}}/>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-3 h-3 rounded-full bg-[var(--gold)] animate-pulse"/>
            </div>
            <h2 className="text-xl font-bold mb-2 serif">正在排布天纪星盘…</h2>
            <p className="text-sm text-gray-400">观星测运，片刻即达</p>
          </motion.section>
        )}

        {/* ═══ PREVIEW ═══ */}
        {state==="preview"&&result&&(
          <motion.section key="preview" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            className="w-full max-w-xl mx-auto px-4">

            {/* ── 四柱八字 ── */}
            <div className="mb-6">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/>
                <h2 className="text-sm font-semibold text-gray-500 tracking-wider">四柱八字</h2>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {result.pillars.map((p,i)=>(
                  <div key={p.label} className={`bg-white rounded-2xl p-4 text-center shadow-sm border ${
                    i===2?"border-[var(--gold)] shadow-[0_0_16px_rgba(197,160,89,0.15)]":"border-gray-100"
                  }`}>
                    <div className="text-[10px] text-gray-400 mb-2 tracking-wider">{p.label}{i===2&&" · 日主"}</div>
                    <div className="text-2xl font-bold serif mb-1"
                      style={{color:({木:"#6fe3a8",火:"#ff897a",土:"#e8c079",金:"#d3d6ea",水:"#6fb8ff"} as any)[
                        (WUXING_MAP as any)[p.gan]]||"var(--ink)"}}>
                      {p.gan}{p.zhi}
                    </div>
                    <div className="text-[10px] text-gray-300">{p.nayin}</div>
                    {i===2&&<div className="mt-2 inline-block bg-[var(--gold)] text-white text-[9px] rounded-full px-2 py-0.5 font-bold">日主</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 五行 ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <div className="flex items-center gap-2 mb-4">
                <span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/>
                <h2 className="text-sm font-semibold text-gray-500 tracking-wider">五行</h2>
                <span className="ml-auto text-[10px] text-gray-400">
                  日主{result.wuxingBars.find(b=>b.el===result.dayMaster)?.el||"—"} · {result.strength}
                </span>
              </div>
              <div className="flex items-end gap-3 h-24">
                {result.wuxingBars.map(w=>{
                  const pct=Math.max((w.count/result.maxWx)*100,8);
                  return(
                    <div key={w.el} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                      <div className="text-[10px] text-gray-400">{w.count}</div>
                      <div className="w-full rounded-t-lg transition-all duration-700 shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]"
                        style={{height:`${pct}%`,background:w.color,opacity:result.dayMaster===w.el?1:0.7}}/>
                      <div className={`text-xs font-semibold serif ${result.dayMaster===w.el?"text-[var(--ink)]":"text-gray-400"}`}>
                        {w.el}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* ── 大运 ── */}
            <div className="mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/>
                <h2 className="text-sm font-semibold text-gray-500 tracking-wider">大运</h2>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                {result.dayun.map(d=>(
                  <div key={d.age} className={`flex-shrink-0 rounded-2xl px-5 py-3 text-center border shadow-sm ${
                    d.isCurrent?"border-[var(--gold)] bg-[var(--gold)]/5 shadow-[0_0_12px_rgba(197,160,89,0.15)]":"bg-white border-gray-100"
                  }`}>
                    <div className="text-[10px] text-gray-400 mb-1">{d.age}岁</div>
                    <div className="text-lg font-bold serif">{d.gan}{d.zhi}</div>
                    <div className="text-[9px] text-gray-400 mt-1">{d.age}-{d.age+9}岁</div>
                    {d.isCurrent&&<div className="mt-1 text-[9px] text-[var(--gold)] font-medium">当前</div>}
                  </div>
                ))}
              </div>
            </div>

            {/* ── 紫微12宫 ── */}
            <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/>
                <h2 className="text-sm font-semibold text-gray-500 tracking-wider">紫微命盘</h2>
                <span className="ml-auto text-[10px] text-gray-400">点击宫位查看详情</span>
              </div>

              {/* Grid: 4x4, center merged */}
              <div className="grid grid-cols-4 gap-1.5 aspect-square mb-2 max-w-[320px] mx-auto">
                {[
                  [0,0],[0,1],[0,2],[0,3],
                  [1,0],[1,1],[1,2],[1,3],
                  [2,0],[2,1],[2,2],[2,3],
                  [3,0],[3,1],[3,2],[3,3],
                ].map(([r,c],gi)=>{
                  // Center 2x2 merge
                  if(r>=1&&r<=2&&c>=1&&c<=2){
                    if(gi!==5)return null; // only render once
                    return(
                      <div key="center" className="col-span-2 row-span-2 rounded-2xl flex flex-col items-center justify-center p-3 text-center"
                        style={{background:"rgba(245,240,232,0.5)",border:"1px solid rgba(197,160,89,0.15)",gridColumn:"2/4",gridRow:"2/4"}}>
                        <div className="w-8 h-8 rounded-full border border-[var(--gold)] flex items-center justify-center mb-1.5">
                          <span className="serif font-bold text-[#C5A059] text-xs">紫微</span>
                        </div>
                        <div className="text-[9px] text-gray-400 leading-tight">Hi, {displayName}</div>
                        <div className="text-[11px] font-bold mt-1">{result.mainStar}坐命</div>
                        <div className="text-[8px] text-gray-400 mt-0.5">{result.patternName}</div>
                      </div>
                    );
                  }

                  // Map grid position to palace index
                  const palMap = [11,0,1,2, 10,-1,-1,3, 9,-1,-1,4, 8,7,6,5];
                  const pi = palMap[gi];
                  if(pi===undefined||pi===-1)return null;
                  const p = result.palaceStars[pi];

                  return(
                    <div key={p.name} onClick={()=>setSelPalace(pi)}
                      className={`rounded-xl p-1.5 cursor-pointer transition-all flex flex-col justify-between relative text-[9px] leading-tight ${
                        selPalace===pi?"ring-2 ring-[var(--gold)] bg-[var(--gold)]/5":"hover:bg-gray-50"
                      } ${p.isMing?"border border-[var(--gold)]/50":""}`}
                      style={{background:selPalace===pi?"rgba(197,160,89,0.06)":""}}>
                      <div>
                        <div className={`font-bold text-[11px] leading-tight ${
                          p.isMing?"text-[var(--gold)]":"text-[var(--ink)]"
                        }`}>{p.main}</div>
                        <div className="text-[8px] text-gray-400 leading-tight">{p.aux[0]} {p.aux[1]}</div>
                      </div>
                      <div className="flex justify-between items-end mt-1">
                        <span className={`serif text-[10px] ${p.isMing?"text-[var(--gold)] font-bold":"text-gray-500"}`}>{p.name}</span>
                        <span className="text-[8px] text-gray-300">{p.branch}</span>
                      </div>
                      {p.isShen&&<div className="absolute top-0.5 left-0.5 bg-[var(--gold)] text-white text-[7px] px-1 rounded font-bold">身</div>}
                    </div>
                  );
                })}
              </div>

              {/* Selected palace detail */}
              {result.palaceStars[selPalace]&&(
                <div className="mt-3 p-3 rounded-xl" style={{background:"rgba(197,160,89,0.06)"}}>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-sm font-bold serif text-[var(--gold)]">{result.palaceStars[selPalace].name}</span>
                    <span className="text-xs text-gray-400">{result.palaceStars[selPalace].branch} · 大限 {result.palaceStars[selPalace].limit}</span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <span className="font-semibold text-[var(--ink)]">{result.palaceStars[selPalace].main}</span>
                    <span className="text-gray-400">{result.palaceStars[selPalace].aux.join(" · ")}</span>
                  </div>
                </div>
              )}
            </div>

            {/* ── 格局 ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/>
                <h2 className="text-sm font-semibold text-gray-500 tracking-wider">格局</h2>
              </div>
              {result.gejuList.map((g,i)=>(
                <div key={i} className={`py-3 ${i<result.gejuList.length-1?"border-b border-gray-50":""}`}>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      g.level==="exc"?"bg-[var(--gold)]":g.level==="good"?"bg-[var(--pine)]":g.level==="cau"?"bg-[var(--rose)]":"bg-gray-300"
                    }`}/>
                    <span className="font-bold text-sm serif">{g.name}</span>
                    <span className={`text-[9px] rounded-full px-2 py-0.5 font-semibold ${gejuLevelClass[g.level]}`}>
                      {g.level==="exc"?"极品":g.level==="good"?"吉格":g.level==="cau"?"慎格":"平格"}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p>
                </div>
              ))}
            </div>

            {/* ── 中医养生 ── */}
            <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5">
              <div className="flex items-center gap-2 mb-3">
                <span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/>
                <h2 className="text-sm font-semibold text-gray-500 tracking-wider">中医养生 · 先天体质</h2>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <span className="text-2xl font-bold serif"
                  style={{color:({木:"#6fe3a8",火:"#ff897a",土:"#e8c079",金:"#d3d6ea",水:"#6fb8ff"} as any)[result.tcm.element]||"var(--ink)"}}>
                  {wuxingEmoji[result.tcm.element]} {result.tcm.element}
                </span>
                <div>
                  <span className="text-sm font-semibold">{result.tcm.zang}·{result.tcm.fu}</span>
                  <span className="text-xs text-gray-400 ml-1">（五行属{result.tcm.element}）</span>
                </div>
              </div>
              <p className="text-xs text-gray-500 leading-relaxed mb-3">{result.tcm.desc}</p>
              <div className="grid grid-cols-2 gap-3">
                <div className="bg-[var(--pine-bg)] rounded-xl p-3">
                  <span className="inline-block bg-[var(--pine)] text-white text-[9px] px-2 py-0.5 rounded mb-2">宜</span>
                  <ul className="text-[11px] leading-relaxed text-gray-700 space-y-0.5">
                    {result.tcm.dos.map((d,i)=><li key={i}>· {d}</li>)}
                  </ul>
                </div>
                <div className="bg-[var(--rose-bg)] rounded-xl p-3">
                  <span className="inline-block bg-[var(--rose)] text-white text-[9px] px-2 py-0.5 rounded mb-2">忌</span>
                  <ul className="text-[11px] leading-relaxed text-gray-700 space-y-0.5">
                    {result.tcm.donts.map((d,i)=><li key={i}>· {d}</li>)}
                  </ul>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-3">
                <span className="text-[10px] text-gray-400">本草：</span>
                {result.tcm.herbs.map(h=><span key={h} className="text-[10px] bg-[var(--gold)]/10 text-[var(--gold)] rounded-full px-2.5 py-0.5">🌿 {h}</span>)}
              </div>
            </div>

            {/* ── AI Paywall ── */}
            <div className="relative pb-10">
              <div className="blur-[2px] opacity-40 pointer-events-none select-none space-y-3">
                <div className="bg-white p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-[var(--gold)] mb-2">事业与财富 · 破局之钥</h4>
                  <p className="text-xs text-gray-500">你真正适合的方向是什么？哪一年是转折点？</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-[var(--gold)] mb-2">感情与归宿 · 聆听委屈</h4>
                  <p className="text-xs text-gray-500">你需要的是一个什么样的伴侣——不是条件，是感觉。</p>
                </div>
              </div>

              <div className="absolute inset-0 flex items-center justify-center">
                <div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white w-full max-w-xs text-center">
                  <h3 className="text-lg font-bold mb-2 serif">上面只是轮廓。<br/>故事的后半段，在盘里。</h3>
                  <ul className="text-xs text-gray-600 space-y-1.5 mb-5 mx-auto w-fit text-left">
                    <li>💰 财富卡点与爆发年</li>
                    <li>💕 正缘画像与相遇时机</li>
                    <li>📈 未来十年大限策略</li>
                    <li>🌿 专属中医体质调理方案</li>
                  </ul>
                  {!aiLoading?(
                    <button onClick={fetchAI}
                      className="w-full bg-[var(--ink)] text-[var(--gold)] rounded-full py-3 font-bold text-sm shadow-lg hover:bg-black">
                      解锁 AI 深度命书 · 免费
                    </button>
                  ):(
                    <div className="py-3 text-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto mb-2" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/>
                      <p className="text-xs text-gray-400">AI 正在解读命盘…</p>
                    </div>
                  )}
                  <p className="text-[10px] text-gray-300 mt-3">已有 3,428 位行路人在此找到心安</p>
                </div>
              </div>
            </div>
          </motion.section>
        )}

        {/* ═══ PAID REPORT ═══ */}
        {state==="paid"&&result&&(
          <motion.section key="paid" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            className="w-full max-w-xl mx-auto px-4">
            <div className="text-center mb-6">
              <div className="inline-block bg-[var(--gold)] text-white px-4 py-1 rounded-full text-xs tracking-wider mb-3">
                已解锁 · 深度命理档案
              </div>
              <h2 className="text-2xl font-bold mb-1 serif">Hi, {displayName}</h2>
              <p className="text-xs text-gray-400">{result.mainStar}坐命 · {result.patternName} · 喜{result.favorable}</p>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-5">
              <h3 className="text-lg font-bold text-[var(--gold)] mb-4 flex items-center gap-2 serif">
                <span className="w-5 h-5 rounded-full bg-[var(--gold)]/10 flex items-center justify-center text-[10px]">✦</span> AI 命盘详解
              </h3>
              <div className="text-sm text-gray-700 leading-loose whitespace-pre-line">
                {aiText||<div className="text-center py-4"><div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto mb-2" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/></div>}
              </div>
            </div>

            <div className="text-center space-y-3 pb-10">
              <button className="bg-white border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white rounded-full px-6 py-2.5 text-sm font-semibold shadow-sm w-full">
                生成我的今日留白箴言卡
              </button>
              <button onClick={()=>{setState("preview");setAiText("")}} className="text-xs text-gray-300 hover:text-gray-500">重新排盘</button>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
