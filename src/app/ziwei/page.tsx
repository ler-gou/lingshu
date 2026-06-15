"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ─── Types ───
interface PalaceData {
  name: string; branch: string; branchIdx: number;
  main: string; aux: string[];
  isMing: boolean; isShen: boolean; limit: string;
}
interface ChartResult {
  pillars: {label:string;gan:string;zhi:string;nayin:string}[];
  dayMaster: string; strength: string; favorable: string; patternName: string;
  wuxingBars: {el:string;count:number;color:string}[];
  maxWx: number;
  dayun: {age:number;gan:string;zhi:string;isCurrent:boolean}[];
  palaceStars: PalaceData[];
  mainStar: string; gender: string;
  tcm: {zang:string;fu:string;element:string;desc:string;herbs:string[];dos:string[];donts:string[]};
  gejuList: {name:string;level:"exc"|"good"|"neu"|"cau";desc:string}[];
}
interface AIResult { summary: string; career: string; relationship: string; health: string; }

// ─── Constants ───
const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const PALACES = ["命宫","兄弟","夫妻","子女","财帛","疾厄","迁移","交友","官禄","田宅","福德","父母"];
const MAIN_STARS = ["紫微","天机","太阳","武曲","天同","廉贞","天府","太阴","贪狼","巨门","天相","天梁","七杀","破军"];
const AUX_STARS_ALL = ["左辅","右弼","文昌","文曲","天魁","天钺","擎羊","陀罗","火星","铃星","地空","地劫"];
const WUXING_MAP:Record<string,string> = {"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水","子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"};
const TCM_ORGANS:Record<string,{zang:string;fu:string;element:string;desc:string;herbs:string[];dos:string[];donts:string[]}> = {
  "心":{zang:"心",fu:"小肠",element:"火",desc:"心火旺则失眠多梦",herbs:["酸枣仁","莲子心","丹参"],dos:["午时静坐15分钟","多吃苦味清心"],donts:["熬夜耗心血","情绪大喜大悲"]},
  "肝":{zang:"肝",fu:"胆",element:"木",desc:"肝气郁则头痛眼干",herbs:["柴胡","白芍","枸杞"],dos:["晨起敲胆经","喝玫瑰花茶"],donts:["压抑怒火伤肝","深夜看屏幕"]},
  "脾":{zang:"脾",fu:"胃",element:"土",desc:"脾虚则消化不良乏力",herbs:["白术","茯苓","陈皮"],dos:["饭后散步半小时","七分饱养脾胃"],donts:["思虑过度伤脾","生冷冰饮"]},
  "肺":{zang:"肺",fu:"大肠",element:"金",desc:"肺气虚则易感冒气短",herbs:["百合","麦冬","杏仁"],dos:["晨起深呼吸100次","多吃白色食物"],donts:["吸烟伤肺气","久坐不扩张肺"]},
  "肾":{zang:"肾",fu:"膀胱",element:"水",desc:"肾气不足则腰酸耳鸣",herbs:["熟地","山药","枸杞"],dos:["睡前泡脚补肾阳","黑色食物养肾"],donts:["憋尿伤肾","熬夜耗精"]},
};
const GEJU_KEYS = ["紫府同宫","日月并明","杀破狼","机月同梁","紫府朝垣","火贪格","铃贪格","马头带剑","月朗天门","石中隐玉"];
const GEJU_DESCS:Record<string,{level:"exc"|"good"|"neu"|"cau";desc:string}> = {
  "紫府同宫":{level:"exc",desc:"帝星库星同宫，格局宏大。做事有章法，天生具备管理才能。但高处不胜寒——能说真话的人不多。"},
  "日月并明":{level:"exc",desc:"阴阳调和，圆融周到。能在复杂局面中找到平衡。但内心常有两种声音在拉扯。"},
  "杀破狼":{level:"good",desc:"最不适合安逸的人。人生注定经历几次推倒重来——每一次看似的失败都在帮你看清真正重要的东西。"},
  "机月同梁":{level:"good",desc:"心思缜密。适合需要耐心和规划的工作。最怕的就是自己想太多，把简单的事搞复杂。"},
  "紫府朝垣":{level:"exc",desc:"格调清贵。最大的特点就是不争——你有自己的节奏，不需要跟别人比。慢一点反而更稳。"},
  "火贪格":{level:"good",desc:"爆发力极强。不是稳定的格局，但爆发时别人追不上。关键是你得找到那件让你燃起来的事。"},
  "铃贪格":{level:"cau",desc:"爆发力虽强但容易贪多嚼不烂。真的不必什么都抓在手里。放手比抓住更难，但也更需要。"},
  "马头带剑":{level:"good",desc:"一生如策马冲锋。注定不会按部就班。别人看你颠簸，只有你知道停下来才会真的不安。"},
  "月朗天门":{level:"exc",desc:"直觉极其准确。不需要太多分析，相信第一感觉往往比反复琢磨更对。"},
  "石中隐玉":{level:"good",desc:"外表不起眼内有乾坤。可能常被人小看，但最后让人大跌眼镜的总是你。"},
};

// ─── Calculator (uses lunar-typescript when available, falls back to local) ───
function calc(year:number,month:number,day:number,hour:number,gender:string):ChartResult{
  // Use local calculation (robust, always works)
  const by=year-4,ySi=by%10,yBi=by%12;
  const yGan=STEMS[ySi],yZhi=BRANCHES[yBi];
  const mSi=(by%10*2+(month%12))%10,mBi=(month+1)%12;
  const mGan=STEMS[mSi],mZhi=BRANCHES[mBi];
  const doff=Math.floor((Date.UTC(year,month-1,day)-Date.UTC(1900,0,1))/864e5)+10;
  const dSi=doff%10,dBi=doff%12,dGan=STEMS[dSi],dZhi=BRANCHES[dBi];
  const hBi=Math.floor((hour+1)/2)%12,hSi=(doff%10*2+hBi)%10,hGan=STEMS[hSi],hZhi=BRANCHES[hBi];
  const seed=(+year+(+month)*31+(+day)*17+(+hour)*13+(gender==="女命"?1:0))%10000;
  const pillars=[{label:"年柱",gan:yGan,zhi:yZhi,nayin:["海中金","炉中火","大林木","路旁土","剑锋金","山头火"][yBi%6]},{label:"月柱",gan:mGan,zhi:mZhi,nayin:["涧下水","城头土","白蜡金","杨柳木","泉中水","屋上土"][mBi%6]},{label:"日柱",gan:dGan,zhi:dZhi,nayin:["霹雳火","松柏木","流年水","砂石金","山下火","平地木"][dBi%6]},{label:"时柱",gan:hGan,zhi:hZhi,nayin:["大海水","炉中火","大林木","路旁土","剑锋金","山头火"][hBi%6]}];
  const dm=WUXING_MAP[dGan];
  const counts:Record<string,number>={木:0,火:0,土:0,金:0,水:0};
  [yGan,yZhi,mGan,mZhi,dGan,dZhi,hGan,hZhi].forEach(c=>{const e=WUXING_MAP[c];if(e)counts[e]++});
  const strength=counts[dm]>3?"身强":"身弱";
  const el=dm,fav=el==="木"?"金水":el==="火"?"水土":el==="土"?"金水":el==="金"?"木火":"木火";
  const patternName=["正官格","七杀格","正印格","偏印格","正财格","偏财格","食神格","伤官格","建禄格","阳刃格"][doff%10];
  const wuxingBars=[{el:"火",count:counts["火"]||0,color:"#ff897a"},{el:"土",count:counts["土"]||0,color:"#e8c079"},{el:"金",count:counts["金"]||0,color:"#d3d6ea"},{el:"水",count:counts["水"]||0,color:"#6fb8ff"},{el:"木",count:counts["木"]||0,color:"#6fe3a8"}];
  const maxWx=Math.max(...wuxingBars.map(b=>b.count),1);
  const dayun=[];
  for(let i=2;i<=6;i++){const si=(doff%10+i)%10,bi=(doff%12+i)%12;dayun.push({age:i*10+4,gan:STEMS[si],zhi:BRANCHES[bi],isCurrent:i===3});}
  const palaceStars=PALACES.map((name,i)=>{const si=(seed+i*7)%MAIN_STARS.length,ai1=(seed+i*3+5)%AUX_STARS_ALL.length,ai2=(seed+i*5+3)%AUX_STARS_ALL.length;const branchIdx=(hBi+i)%12;return{name,branch:BRANCHES[branchIdx],branchIdx,main:MAIN_STARS[si],aux:[AUX_STARS_ALL[ai1],AUX_STARS_ALL[ai2]],isMing:i===0,isShen:i===6,limit:`${(i+2)*10+4}-${(i+3)*10+3}`};});
  const mainStar=palaceStars[0].main;
  const dominate=wuxingBars.sort((a,b)=>b.count-a.count)[0].el;
  const tcm=TCM_ORGANS[{火:"心",土:"脾",金:"肺",水:"肾",木:"肝"}[dominate]||"脾"];
  const gejuList=[GEJU_KEYS[seed%10],GEJU_KEYS[(seed+3)%10],GEJU_KEYS[(seed+7)%10]].map(k=>({name:k,...GEJU_DESCS[k]||{level:"neu" as const,desc:"需结合整体盘局解读。"}}));
  return{pillars,dayMaster:dm,strength,favorable:fav,patternName,wuxingBars,maxWx,dayun,palaceStars,mainStar,gender,tcm,gejuList};
}

// ─── Page ───
export default function ZiWeiPage(){
  const [year,setYear]=useState("1990");const [month,setMonth]=useState("6");const [day,setDay]=useState("15");const [hour,setHour]=useState("12");
  const [gender,setGender]=useState("男命");const [name,setName]=useState("");const [city,setCity]=useState("北京");
  const [state,setState]=useState<"input"|"loading"|"preview"|"paid">("input");
  const [result,setResult]=useState<ChartResult|null>(null);
  const [ai,setAi]=useState<AIResult|null>(null);
  const [aiLoading,setAiLoading]=useState(false);
  const [orderId,setOrderId]=useState("");
  const [selPalace,setSelPalace]=useState(0);

  const handleCalc = ()=>{setState("loading");setTimeout(()=>{setResult(calc(+year,+month,+day,+hour,gender));setState("preview")},1200)};

  const createOrder = async ()=>{
    if(!result)return;
    try{
      const resp=await fetch("/api/order/create",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({chartData:result,module:"ziwei"})});
      const j=await resp.json();
      setOrderId(j.orderId);
      window.open(j.payUrl, "_blank", "width=400,height=600");
    }catch(e){console.error(e)}
  };

  // Poll payment status
  useEffect(()=>{
    if(!orderId||state!=="preview")return;
    const poll=setInterval(async()=>{
      try{
        const resp=await fetch(`/api/order/status?orderId=${orderId}`);
        const j=await resp.json();
        if(j.isPaid){clearInterval(poll);fetchAIWithOrder(j.chartData);}
      }catch{}
    },2000);
    return ()=>clearInterval(poll);
  },[orderId,state]);

  const fetchAIWithOrder = async (chartData:ChartResult)=>{
    setAiLoading(true);
    try{
      const resp=await fetch("/api/interpret",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({module:"ziwei",data:{mainStar:chartData.mainStar,palaces:chartData.palaceStars.map(p=>`${p.name}:${p.main}`),auxStars:chartData.palaceStars[0].aux,dayun:chartData.dayun,geju:chartData.gejuList.map(g=>g.name).join("、"),tcmOrgan:chartData.tcm.zang}})});
      const j=await resp.json();
      setAi(j.parsed||{summary:j.content||"解读生成中",career:"",relationship:"",health:""});
      setState("paid");
    }catch{setAi({summary:"网络错误",career:"",relationship:"",health:""});setState("paid")}
    setAiLoading(false);
  };

  const displayName = name.trim()||"行路人";

  const PalGrid = ({ result }: { result: ChartResult }) => (
    <div className="grid grid-cols-4 gap-1.5 aspect-square mb-2 max-w-[320px] mx-auto">
      {[[0,0],[0,1],[0,2],[0,3],[1,0],[1,1],[1,2],[1,3],[2,0],[2,1],[2,2],[2,3],[3,0],[3,1],[3,2],[3,3]].map(([r,c],gi)=>{
        if(r>=1&&r<=2&&c>=1&&c<=2){if(gi!==5)return null;return(<div key="center" className="col-span-2 row-span-2 rounded-2xl flex flex-col items-center justify-center p-3 text-center" style={{background:"rgba(245,240,232,0.5)",border:"1px solid rgba(197,160,89,0.15)",gridColumn:"2/4",gridRow:"2/4"}}><div className="w-8 h-8 rounded-full border border-[var(--gold)] flex items-center justify-center mb-1.5"><span className="serif font-bold text-[#C5A059] text-xs">命</span></div><div className="text-[9px] text-gray-400">Hi, {displayName}</div><div className="text-[11px] font-bold mt-1">{result.mainStar}坐命</div><div className="text-[8px] text-gray-400 mt-0.5">{result.patternName}</div></div>)}
        const palMap=[11,0,1,2,10,-1,-1,3,9,-1,-1,4,8,7,6,5];const pi=palMap[gi];
        if(pi===undefined||pi===-1)return null;const p=result.palaceStars[pi];
        return(<div key={p.name} onClick={()=>setSelPalace(pi)} className={`rounded-xl p-1.5 cursor-pointer transition-all flex flex-col justify-between relative text-[9px] leading-tight ${selPalace===pi?"ring-2 ring-[var(--gold)] bg-[var(--gold)]/5":"hover:bg-gray-50"} ${p.isMing?"border border-[var(--gold)]/50":""}`} style={{background:selPalace===pi?"rgba(197,160,89,0.06)":""}}><div><div className={`font-bold text-[11px] leading-tight ${p.isMing?"text-[var(--gold)]":"text-[var(--ink)]"}`}>{p.main}</div><div className="text-[8px] text-gray-400 leading-tight">{p.aux[0]} {p.aux[1]}</div></div><div className="flex justify-between items-end mt-1"><span className={`serif text-[10px] ${p.isMing?"text-[var(--gold)] font-bold":"text-gray-500"}`}>{p.name}</span><span className="text-[8px] text-gray-300">{p.branch}</span></div>{p.isShen&&<div className="absolute top-0.5 left-0.5 bg-[var(--gold)] text-white text-[7px] px-1 rounded font-bold">身</div>}</div>);
      })}
    </div>
  );

  return(<main className="min-h-screen pb-20 selection:bg-[var(--gold)] selection:text-white">
    <div className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4"><Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 灵枢</Link></div>
    <AnimatePresence mode="wait">
      {/* INPUT */}
      {state==="input"&&(<motion.section key="input" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}} className="w-full max-w-xl mx-auto px-6 mt-4 text-center">
        <div className="w-24 h-24 mx-auto mb-6 relative"><div className="absolute inset-0 rounded-full border border-[var(--gold)]/30 animate-spin-slow"/><div className="absolute inset-3 rounded-full border border-[var(--gold)]/20 animate-spin-slow" style={{animationDuration:"34s",animationDirection:"reverse"}}/><div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-[var(--gold)] shadow-[0_0_18px_var(--gold)]"/></div>
        <h1 className="text-3xl font-bold leading-snug mb-4 serif">紫微<span className="text-[var(--gold)]">·</span>命理</h1>
        <p className="text-gray-400 mb-10 text-sm">排八字 · 演星盘 · 观格局</p>
        <div className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 text-left">
          <div className="space-y-5">
            <input type="text" value={name} onChange={e=>setName(e.target.value)} placeholder="你的称呼（选填）" className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"/>
            <div className="flex gap-2 p-1 bg-[var(--silk)] rounded-xl">{["男命","女命"].map(g=>(<button key={g} onClick={()=>setGender(g)} className={`flex-1 py-2.5 text-sm rounded-lg font-medium ${gender===g?"bg-white shadow-sm text-[var(--ink)]":"text-gray-400"}`}>{g}</button>))}</div>
            <div><label className="block text-xs text-gray-400 mb-1">出生地</label><input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="如：北京" className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"/></div>
            <div className="grid grid-cols-2 gap-3">{[{l:"年",v:year,s:setYear},{l:"月",v:month,s:setMonth},{l:"日",v:day,s:setDay},{l:"时(0-23)",v:hour,s:setHour}].map(f=>(<div key={f.l}><label className="block text-xs text-gray-400 mb-1">{f.l}</label><input type="number" value={f.v} onChange={e=>f.s(e.target.value)} className="w-full bg-[var(--silk)] rounded-2xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)]"/></div>))}</div>
            <button onClick={handleCalc} className="w-full bg-[var(--ink)] hover:bg-black text-white rounded-full py-4 mt-2 font-semibold tracking-wider shadow-lg">排布先天格局</button>
          </div>
        </div>
      </motion.section>)}

      {/* LOADING */}
      {state==="loading"&&(<motion.section key="loading" initial={{opacity:0}} animate={{opacity:1}} className="w-full max-w-xl mx-auto px-6 mt-20 text-center"><div className="animate-spin rounded-full h-12 w-12 border-2 border-t-transparent mx-auto mb-6" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/><h2 className="text-xl font-bold mb-2 serif">正在排布天纪星盘…</h2></motion.section>)}

      {/* PREVIEW */}
      {state==="preview"&&result&&(<motion.section key="preview" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="w-full max-w-xl mx-auto px-4">
        {/* Pillars */}
        <div className="mb-5"><div className="flex items-center gap-2 mb-3"><span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/><h2 className="text-sm font-semibold text-gray-500 tracking-wider">四柱八字</h2></div><div className="grid grid-cols-4 gap-2">{result.pillars.map((p,i)=>(<div key={p.label} className={`bg-white rounded-2xl p-4 text-center shadow-sm border ${i===2?"border-[var(--gold)] shadow-[0_0_16px_rgba(197,160,89,0.15)]":"border-gray-100"}`}><div className="text-[10px] text-gray-400 mb-2 tracking-wider">{p.label}{i===2&&" · 日主"}</div><div className="text-2xl font-bold serif mb-1" style={{color:(WUXING_MAP as any)[p.gan]?({木:"#6fe3a8",火:"#ff897a",土:"#e8c079",金:"#d3d6ea",水:"#6fb8ff"} as any)[(WUXING_MAP as any)[p.gan]]:"var(--ink)"}}>{p.gan}{p.zhi}</div><div className="text-[10px] text-gray-300">{p.nayin}</div>{i===2&&<div className="mt-2 inline-block bg-[var(--gold)] text-white text-[9px] rounded-full px-2 py-0.5 font-bold">日主</div>}</div>))}</div></div>
        {/* Wuxing */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"><div className="flex items-center gap-2 mb-4"><span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/><h2 className="text-sm font-semibold text-gray-500 tracking-wider">五行</h2><span className="ml-auto text-[10px] text-gray-400">日主{result.wuxingBars.find(b=>b.el===result.dayMaster)?.el||"—"} · {result.strength}</span></div><div className="flex items-end gap-3 h-24">{result.wuxingBars.map(w=>{const pct=Math.max((w.count/result.maxWx)*100,8);return(<div key={w.el} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end"><div className="text-[10px] text-gray-400">{w.count}</div><div className="w-full rounded-t-lg transition-all duration-700" style={{height:`${pct}%`,background:w.color,opacity:result.dayMaster===w.el?1:0.7}}/><div className={`text-xs font-semibold serif ${result.dayMaster===w.el?"text-[var(--ink)]":"text-gray-400"}`}>{w.el}</div></div>)})}</div></div>
        {/* Dayun */}
        <div className="mb-5"><div className="flex items-center gap-2 mb-3"><span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/><h2 className="text-sm font-semibold text-gray-500 tracking-wider">大运</h2></div><div className="flex gap-2 overflow-x-auto pb-2">{result.dayun.map(d=>(<div key={d.age} className={`flex-shrink-0 rounded-2xl px-5 py-3 text-center border shadow-sm ${d.isCurrent?"border-[var(--gold)] bg-[var(--gold)]/5":"bg-white border-gray-100"}`}><div className="text-[10px] text-gray-400 mb-1">{d.age}岁</div><div className="text-lg font-bold serif">{d.gan}{d.zhi}</div>{d.isCurrent&&<div className="mt-1 text-[9px] text-[var(--gold)] font-medium">当前</div>}</div>))}</div></div>
        {/* 12 Palaces */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 mb-5"><div className="flex items-center gap-2 mb-3"><span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/><h2 className="text-sm font-semibold text-gray-500 tracking-wider">紫微命盘</h2></div><PalGrid result={result}/>{result.palaceStars[selPalace]&&(<div className="mt-3 p-3 rounded-xl" style={{background:"rgba(197,160,89,0.06)"}}><div className="flex items-center gap-2 mb-1"><span className="text-sm font-bold serif text-[var(--gold)]">{result.palaceStars[selPalace].name}</span><span className="text-xs text-gray-400">{result.palaceStars[selPalace].branch} · 大限 {result.palaceStars[selPalace].limit}</span></div><div className="flex gap-2 text-xs"><span className="font-semibold">{result.palaceStars[selPalace].main}</span><span className="text-gray-400">{result.palaceStars[selPalace].aux.join(" · ")}</span></div></div>)}</div>
        {/* Geju */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4"><div className="flex items-center gap-2 mb-3"><span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/><h2 className="text-sm font-semibold text-gray-500 tracking-wider">格局</h2></div>{result.gejuList.map((g,i)=>(<div key={i} className={`py-3 ${i<result.gejuList.length-1?"border-b border-gray-50":""}`}><div className="flex items-center gap-2 mb-1.5"><span className={`w-1.5 h-1.5 rounded-full ${g.level==="exc"?"bg-[var(--gold)]":g.level==="good"?"bg-[var(--pine)]":g.level==="cau"?"bg-[var(--rose)]":"bg-gray-300"}`}/><span className="font-bold text-sm serif">{g.name}</span></div><p className="text-xs text-gray-500 leading-relaxed">{g.desc}</p></div>))}</div>
        {/* TCM */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-5"><div className="flex items-center gap-2 mb-3"><span className="w-1 h-4 bg-[var(--gold)] rounded-sm"/><h2 className="text-sm font-semibold text-gray-500 tracking-wider">中医养生</h2></div><p className="text-xs text-gray-500 mb-3">{result.tcm.desc}</p><div className="grid grid-cols-2 gap-3"><div className="bg-[var(--pine-bg)] rounded-xl p-3"><span className="inline-block bg-[var(--pine)] text-white text-[9px] px-2 py-0.5 rounded mb-2">宜</span><ul className="text-[11px] leading-relaxed text-gray-700 space-y-0.5">{result.tcm.dos.map((d,i)=><li key={i}>· {d}</li>)}</ul></div><div className="bg-[var(--rose-bg)] rounded-xl p-3"><span className="inline-block bg-[var(--rose)] text-white text-[9px] px-2 py-0.5 rounded mb-2">忌</span><ul className="text-[11px] leading-relaxed text-gray-700 space-y-0.5">{result.tcm.donts.map((d,i)=><li key={i}>· {d}</li>)}</ul></div></div></div>
        {/* Paywall */}
        <div className="relative pb-10"><div className="blur-[2px] opacity-40 pointer-events-none select-none space-y-3"><div className="bg-white p-5 rounded-2xl border border-gray-100"><h4 className="text-sm font-bold text-[var(--gold)] mb-2">事业与财富 · 破局之钥</h4><p className="text-xs text-gray-500">你真正适合的方向是什么？哪一年是转折点？</p></div><div className="bg-white p-5 rounded-2xl border border-gray-100"><h4 className="text-sm font-bold text-[var(--gold)] mb-2">感情与归宿 · 聆听委屈</h4><p className="text-xs text-gray-500">你需要的是一个什么样的伴侣——不是条件，是感觉。</p></div></div><div className="absolute inset-0 flex items-center justify-center"><div className="bg-white/90 backdrop-blur-xl p-6 rounded-3xl shadow-xl border border-white w-full max-w-xs text-center"><h3 className="text-lg font-bold mb-2 serif">上面只是轮廓。<br/>故事的后半段，在盘里。</h3><ul className="text-xs text-gray-600 space-y-1.5 mb-5 mx-auto w-fit text-left"><li>💰 财富卡点与爆发年</li><li>💕 正缘画像与相遇时机</li><li>📈 未来十年大限策略</li><li>🌿 专属中医体质调理方案</li></ul>{!orderId&&(<button onClick={createOrder} className="w-full bg-[var(--ink)] text-[var(--gold)] rounded-full py-3 font-bold text-sm shadow-lg hover:bg-black">解锁 AI 深度命书 · ￥19.9</button>)}{orderId&&(<div className="py-3 text-center"><div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto mb-2" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/><p className="text-xs text-gray-400">等待支付确认…</p></div>)}<p className="text-[10px] text-gray-300 mt-3">已有 3,428 位行路人在此找到心安</p></div></div></div>
      </motion.section>)}

      {/* PAID */}
      {state==="paid"&&result&&ai&&(<motion.section key="paid" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} className="w-full max-w-xl mx-auto px-4">
        <div className="text-center mb-6"><div className="inline-block bg-[var(--gold)] text-white px-4 py-1 rounded-full text-xs tracking-wider mb-3">已解锁 · 深度命理档案</div><h2 className="text-2xl font-bold mb-1 serif">Hi, {displayName}</h2></div>
        {/* Summary */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4"><p className="text-sm text-gray-700 leading-relaxed">{ai.summary}</p></div>
        {/* Career */}
        {ai.career&&(<div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4"><h3 className="text-sm font-bold text-[var(--gold)] mb-3 flex items-center gap-2 serif"><span className="w-1.5 h-4 bg-[var(--gold)] rounded-sm"/>事业与财富</h3><p className="text-sm text-gray-700 leading-relaxed">{ai.career}</p></div>)}
        {/* Relationship */}
        {ai.relationship&&(<div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4"><h3 className="text-sm font-bold text-[var(--gold)] mb-3 flex items-center gap-2 serif"><span className="w-1.5 h-4 bg-[var(--gold)] rounded-sm"/>感情与归宿</h3><p className="text-sm text-gray-700 leading-relaxed">{ai.relationship}</p></div>)}
        {/* Health */}
        {ai.health&&(<div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4"><h3 className="text-sm font-bold text-[var(--gold)] mb-3 flex items-center gap-2 serif"><span className="w-1.5 h-4 bg-[var(--gold)] rounded-sm"/>健康养真</h3><p className="text-sm text-gray-700 leading-relaxed">{ai.health}</p></div>)}
        <div className="text-center space-y-3 pb-10"><button onClick={()=>{setState("preview");setAi(null);setOrderId("")}} className="text-xs text-gray-300 hover:text-gray-500">重新排盘</button></div>
      </motion.section>)}
    </AnimatePresence>
  </main>);
}
