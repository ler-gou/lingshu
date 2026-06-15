"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const STEMS = ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"];
const BRANCHES = ["子","丑","寅","卯","辰","巳","午","未","申","酉","戌","亥"];
const EL:Record<string,string>={"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水","子":"水","丑":"土","寅":"木","卯":"木","辰":"土","巳":"火","午":"火","未":"土","申":"金","酉":"金","戌":"土","亥":"水"};

interface Bazi {yearPillar:string;monthPillar:string;dayPillar:string;hourPillar:string;dayMaster:string;dayMasterElement:string;strength:string;favorable:string;pattern:string;wuxing:Record<string,number>;dayun:string[]}

function calc(year:number,month:number,day:number,hour:number):Bazi{
  const by=year-4,ySi=by%10,yBi=by%12,yp=STEMS[ySi]+BRANCHES[yBi];
  const mSi=(by%10*2+month)%10,mBi=(month+1)%12,mp=STEMS[mSi]+BRANCHES[mBi];
  const doff=Math.floor((Date.UTC(year,month-1,day)-Date.UTC(1900,0,1))/864e5)+10;
  const dSi=doff%10,dBi=doff%12,dp=STEMS[dSi]+BRANCHES[dBi];
  const hBi=Math.floor((hour+1)/2)%12,hSi=(doff%10*2+hBi)%10,hp=STEMS[hSi]+BRANCHES[hBi];
  const dm=STEMS[dSi],dme=EL[dm]||"土";
  const c:Record<string,number>={木:0,火:0,土:0,金:0,水:0};
  [STEMS[ySi],BRANCHES[yBi],STEMS[mSi],BRANCHES[mBi],STEMS[dSi],BRANCHES[dBi],STEMS[hSi],BRANCHES[hBi]].forEach(ch=>{const e=EL[ch];if(e)c[e]++});
  const strength=c[dme]>3?"身强":"身弱";
  const el=dme,fav=el==="木"?"金水":el==="火"?"水土":el==="土"?"金水":el==="金"?"木火":"木火";
  const pat=["正官","七杀","正印","偏印","正财","偏财","食神","伤官","建禄","阳刃"][doff%10]+"格";
  return {yearPillar:yp,monthPillar:mp,dayPillar:dp,hourPillar:hp,dayMaster:dm,dayMasterElement:dme,strength,favorable:fav,pattern:pat,wuxing:c,dayun:["24-33 乙巳","34-43 甲辰","44-53 癸卯","54-63 壬寅"]};
}

export default function BaziPage(){
  const [year,setYear]=useState("1990");const [month,setMonth]=useState("6");
  const [day,setDay]=useState("15");const [hour,setHour]=useState("12");
  const [city,setCity]=useState("北京");
  const [result,setResult]=useState<Bazi|null>(null);
  const [aiText,setAiText]=useState("");
  const [aiLoading,setAiLoading]=useState(false);
  const [state,setState]=useState<"input"|"preview"|"paid">("input");

  const handleCalc = ()=>{
    setResult(calc(+year,+month,+day,+hour));
    setState("preview");
  };

  const fetchAI = async ()=>{
    if(!result)return;
    setAiLoading(true);setAiText("");
    try{
      const resp=await fetch("/api/interpret",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({module:"bazi",data:result})});
      const j=await resp.json();
      setAiText(j.content||j.error||"解读失败");
      setState("paid");
    }catch{setAiText("网络错误");}
    setAiLoading(false);
  };

  return(
    <main className="min-h-screen pb-20 selection:bg-[var(--gold)] selection:text-white">
      {/* Nav */}
      <div className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">← 灵枢</Link>
      </div>

      {/* STATE 1: Input */}
      <AnimatePresence mode="wait">
        {state==="input"&&(
          <motion.section key="input" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="w-full max-w-xl mx-auto px-6 mt-4 text-center">
            <h1 className="text-3xl md:text-4xl font-bold leading-snug mb-4 serif">
              揭开你命盘里的<br/>第一层密码。
            </h1>
            <p className="text-gray-400 mb-10 text-sm leading-relaxed">
              每一个对自己认真的人，<br/>都值得被古老的智慧温柔注视一次。
            </p>

            <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 text-left">
              <div className="mb-4">
                <label className="block text-xs text-gray-400 mb-1.5">出生地</label>
                <input type="text" value={city} onChange={e=>setCity(e.target.value)} placeholder="如：北京"
                  className="w-full bg-[var(--silk)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all"/>
              </div>
              <div className="grid grid-cols-2 gap-4">
                {[{l:"出生年",v:year,s:setYear},{l:"月",v:month,s:setMonth},{l:"日",v:day,s:setDay},{l:"时(0-23)",v:hour,s:setHour}].map(f=>(
                  <div key={f.l}>
                    <label className="block text-xs text-gray-400 mb-1.5">{f.l}</label>
                    <input type="number" value={f.v} onChange={e=>f.s(e.target.value)}
                      className="w-full bg-[var(--silk)] rounded-xl px-4 py-3 text-sm outline-none focus:ring-2 focus:ring-[var(--gold)] transition-all"
                      placeholder={f.l}/>
                  </div>
                ))}
              </div>
              <button onClick={handleCalc}
                className="w-full bg-[var(--ink)] hover:bg-black text-white rounded-full py-4 mt-6 font-semibold tracking-wider transition-all shadow-lg">
                开启我的命运密钥
              </button>
            </div>
          </motion.section>
        )}

        {/* STATE 2: Preview (blurred content + paywall) */}
        {state==="preview"&&result&&(
          <motion.section key="preview" initial={{opacity:0}} animate={{opacity:1}}
            className="w-full max-w-xl mx-auto px-6 mt-4">
            {/* Free preview — readable */}
            <div className="text-center mb-8">
              <div className="inline-block bg-[var(--gold)] text-white px-4 py-1 rounded-full text-xs tracking-wider mb-5">
                命宫 · {result.dayMaster}{result.dayMasterElement}日主
              </div>
              <h2 className="text-2xl font-bold mb-3 serif">
                {result.strength==="身强"?"【 天生的扛事者 】":"【 细腻的洞察者 】"}
              </h2>

              {/* Four pillars */}
              <div className="flex justify-center gap-3 mb-6">
                {[{l:"年",v:result.yearPillar},{l:"月",v:result.monthPillar},{l:"日",v:result.dayPillar},{l:"时",v:result.hourPillar}].map(p=>(
                  <div key={p.l} className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                    <div className="text-xl font-bold serif">{p.v}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.l}柱</div>
                  </div>
                ))}
              </div>

              <p className="text-gray-600 text-base leading-loose text-left bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                你的日主是{result.dayMaster}{result.dayMasterElement}，生在{result.monthPillar}月。
                {result.strength==="身强"?
                  "说白了，你这种人天生扛得住事。别人慌了你还在稳着，别人散了你还在撑着。但有一个副作用你可能从来没跟人说过——你累。不是身体的累，是那种所有人都觉得你没问题、所以你不好意思说自己有问题的累。":
                  "你是那种能在嘈杂房间里听出一个人情绪变化的人。你比多数人更早知道事情不对劲，也更早感受到别人的冷淡。这种敏感让你比别人容易受伤，但它也是你最大的天赋——你看得见别人看不见的东西。"}
              </p>
            </div>

            {/* Blurred preview + paywall */}
            <div className="relative mt-6">
              {/* Blurred preview of what you'll unlock */}
              <div className="blur-[2px] opacity-40 pointer-events-none select-none space-y-4">
                <div className="bg-white p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-[var(--gold)] mb-2">事业与财运 · 破局之钥</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">你的正财稳健，但偏财常有起伏。这意味着你无法通过单纯的机械工作致富，财富爆发力藏在你一直想做却不敢启动的那个念头里。</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-[var(--gold)] mb-2">感情与归宿 · 聆听委屈</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">你在感情中最大的软肋，是习惯性地把委屈藏在心里，用沉默来消化伤害。你需要的是一个能听懂你沉默背后疲惫的人。</p>
                </div>
                <div className="bg-white p-5 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-[var(--gold)] mb-2">健康与调理 · 倪师养生</h4>
                  <p className="text-xs text-gray-500 leading-relaxed">思虑过度易伤脾胃。依据《人纪》调理原则，为你定制专属生活处方——从饮食到作息，从经络到情志。</p>
                </div>
              </div>

              {/* Paywall overlay */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  initial={{scale:0.95}} animate={{scale:1}} transition={{delay:0.3}}
                  className="bg-white/90 backdrop-blur-xl p-8 rounded-3xl shadow-xl border border-white max-w-sm w-full text-center">
                  <h3 className="text-xl font-bold mb-2 serif">刚才那些话，只是开场。</h3>
                  <p className="text-gray-400 text-sm mb-6">
                    你真正在意的——钱、感情、身体、<br/>未来这几年该往哪走——还在后面。</p>
                  {!aiLoading&&(
                    <button onClick={fetchAI}
                      className="w-full bg-[var(--ink)] text-[var(--gold)] rounded-full py-4 font-bold text-base shadow-lg flex items-center justify-center gap-2 hover:bg-black transition-colors">
                      <span>解锁 AI 深度命书</span>
                      <span className="text-white ml-1">· 免费</span>
                    </button>
                  )}
                  {aiLoading&&(
                    <div className="py-4 text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto mb-2" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/>
                      <p className="text-xs text-gray-400">AI 正在为你撰写命书…</p>
                    </div>
                  )}
                  <p className="text-xs text-gray-300 mt-4">已有 1,286 位行路人在此找到心安</p>
                </motion.div>
              </div>
            </div>
          </motion.section>
        )}

        {/* STATE 3: Full Paid Report */}
        {state==="paid"&&result&&(
          <motion.section key="paid" initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}
            className="w-full max-w-xl mx-auto px-6 mt-4">
            <div className="text-center mb-8">
              <div className="inline-block bg-[var(--gold)] text-white px-4 py-1 rounded-full text-xs tracking-wider mb-5">
                已解锁 · 全盘命理档案
              </div>
              <h2 className="text-2xl font-bold mb-3 serif">
                {result.strength==="身强"?"【 天生的破局者 】":"【 细腻的洞察者 】"}
              </h2>

              {/* Pillars row */}
              <div className="flex justify-center gap-3 mb-4">
                {[{l:"年",v:result.yearPillar},{l:"月",v:result.monthPillar},{l:"日",v:result.dayPillar},{l:"时",v:result.hourPillar}].map(p=>(
                  <div key={p.l} className="bg-white rounded-2xl px-4 py-3 shadow-sm border border-gray-100">
                    <div className="text-xl font-bold serif">{p.v}</div>
                    <div className="text-xs text-gray-400 mt-0.5">{p.l}柱</div>
                  </div>
                ))}
              </div>
              <p className="text-sm text-gray-400">
                {result.dayMaster}{result.dayMasterElement}日主 · {result.strength} · {result.pattern} · 喜{result.favorable}
              </p>
            </div>

            {/* Wuxing bars */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
              <h3 className="text-sm font-semibold text-gray-500 mb-4">五行能量分布</h3>
              <div className="space-y-2">
                {Object.entries(result.wuxing).map(([el,cnt])=>{
                  const pct=Math.min(cnt*14,100);
                  return(
                    <div key={el} className="flex items-center gap-3 text-sm">
                      <span className="w-6 text-gray-500">{el}</span>
                      <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all duration-700"
                          style={{width:`${pct}%`,background:el===result.dayMasterElement?"var(--gold)":"var(--border)"}}/>
                      </div>
                      <span className="w-6 text-right text-xs text-gray-400">{cnt}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI report sections */}
            <div className="space-y-6">
              {aiText?(
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
                  <h3 className="text-lg font-bold text-[var(--gold)] mb-6 flex items-center gap-2 serif">
                    <span className="w-1.5 h-1.5 bg-[var(--gold)] rounded-full"/> AI 命书详解
                  </h3>
                  <div className="text-sm text-gray-700 leading-loose whitespace-pre-line">
                    {aiText}
                  </div>
                </div>
              ):(
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-t-transparent mx-auto mb-3" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/>
                  <p className="text-xs text-gray-400">正在解读…</p>
                </div>
              )}

              {/* Dayun */}
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                <h3 className="text-sm font-semibold text-gray-500 mb-4">大运走势</h3>
                <div className="space-y-2">
                  {result.dayun.map((d,i)=>(
                    <div key={i} className={`flex items-center gap-3 text-sm py-1.5 px-3 rounded-xl ${i===1?"bg-[var(--gold)/10]":""}`}>
                      <div className={`w-1.5 h-1.5 rounded-full ${i===1?"bg-[var(--gold)]":"bg-gray-200"}`}/>
                      <span className={i===1?"font-semibold":""}>{d}{i===1&&" ← 当前"}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Share */}
              <div className="text-center pt-4 space-y-3">
                <button className="bg-white border border-[var(--gold)] text-[var(--gold)] hover:bg-[var(--gold)] hover:text-white transition-colors rounded-full px-6 py-2.5 text-sm font-semibold tracking-wider shadow-sm w-full">
                  生成我的今日留白箴言卡
                </button>
                <button onClick={()=>{setState("preview");setAiText("")}}
                  className="text-xs text-gray-300 hover:text-gray-500 transition-colors">
                  重新排盘
                </button>
              </div>
            </div>
          </motion.section>
        )}
      </AnimatePresence>
    </main>
  );
}
