"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
const PAIRS: Record<string,{best:string[];ok:string[];avoid:string[];desc:string}> = {
  "鼠":{best:["牛","龙","猴"],ok:["鼠","蛇","狗"],avoid:["马","兔","羊"],desc:"机智灵活，性格温和。与牛最配——一个机灵一个稳重，天作之合。"},
  "牛":{best:["鼠","蛇","鸡"],ok:["牛","虎","猪"],avoid:["马","羊"],desc:"勤劳踏实，忠诚可靠。与鼠互补——一个实干一个动脑。"},
  "虎":{best:["马","狗","猪"],ok:["虎","兔","蛇"],avoid:["猴","蛇"],desc:"勇敢自信，天生领袖。"},
  "兔":{best:["羊","狗","猪"],ok:["兔","虎","猴"],avoid:["鼠","鸡"],desc:"温柔善良，心思细腻。"},
  "龙":{best:["鼠","猴","鸡"],ok:["龙","蛇","马"],avoid:["狗","兔"],desc:"气场强大，自带光芒。"},
  "蛇":{best:["猴","鸡","牛"],ok:["蛇","龙","马"],avoid:["虎","猪"],desc:"智慧深沉的行动派。"},
  "马":{best:["虎","羊","狗"],ok:["马","龙","蛇"],avoid:["鼠","牛"],desc:"热情奔放，自由不羁。"},
  "羊":{best:["兔","马","猪"],ok:["羊","虎","猴"],avoid:["牛","鼠"],desc:"温和体贴的暖男/暖女。"},
  "猴":{best:["鼠","龙","蛇"],ok:["猴","牛","鸡"],avoid:["虎","猪"],desc:"古灵精怪的开心果。"},
  "鸡":{best:["牛","龙","蛇"],ok:["鸡","猴","狗"],avoid:["兔","鼠"],desc:"精致讲究的生活家。"},
  "狗":{best:["虎","兔","马"],ok:["狗","猪","猴"],avoid:["龙","羊"],desc:"忠诚正直，用情至深。"},
  "猪":{best:["虎","兔","羊"],ok:["猪","狗","牛"],avoid:["蛇","猴"],desc:"乐观豁达，福气满满。"},
};

const SIGN_TITLES = ["白羊","金牛","双子","巨蟹","狮子","处女","天秤","天蝎","射手","摩羯","水瓶","双鱼"];
const SIGN_MATCH: Record<string,string> = {};
SIGN_TITLES.forEach((s,i)=>{
  const bestIdx = (i+5)%12;
  SIGN_MATCH[s] = SIGN_TITLES[bestIdx];
});

const SIGN_EMOJIS: Record<string,string> = {
  "白羊":"♈","金牛":"♉","双子":"♊","巨蟹":"♋","狮子":"♌","处女":"♍",
  "天秤":"♎","天蝎":"♏","射手":"♐","摩羯":"♑","水瓶":"♒","双鱼":"♓",
};

export default function YinYuanPage(){
  const [mode,setMode]=useState<"zodiac"|"star"|null>(null);
  const [me,setMe]=useState("鼠");const [partner,setPartner]=useState("牛");
  const [meSign,setMeSign]=useState("白羊");const [ptSign,setPtSign]=useState("狮子");
  const [result,setResult]=useState<string|null>(null);

  const calcZodiac = ()=>{
    const pm = PAIRS[me];
    const best = pm.best.includes(partner)?"💯 天作之合 — 生肖最佳的搭配！":
      pm.ok.includes(partner)?"✅ 还不错 — 有磨合空间但不冲突":
      pm.avoid.includes(partner)?"⚠️ 要注意 — 传统上不太合，需要多包容":
      "🤝 一般 — 既不太合也不太冲，看缘分";
    setResult(`${me}🐭 vs ${partner}🐮\n\n${best}\n\n${pm.desc}\n\n月老说：生肖只是一小部分，真心才是关键 💕`);
  };

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>💕 姻缘测算</motion.h1>
      <p className="text-sm opacity-50 mb-8">赛博月老 · 缘来是你</p>

      {!mode&&(
        <div className="grid grid-cols-2 gap-4">
          {[{id:"zodiac",icon:"🐲",title:"生肖配对",desc:"看十二生肖合不合"},{id:"star",icon:"🌟",title:"星座速配",desc:"十二星座恋爱指数"}].map(m=>(
            <button key={m.id} onClick={()=>setMode(m.id as any)}
              className="rounded-2xl p-6 text-center hover:-translate-y-1 transition-all"
              style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
              <div className="text-4xl mb-3">{m.icon}</div>
              <h3 className="font-semibold text-sm mb-1">{m.title}</h3>
              <p className="text-xs opacity-50">{m.desc}</p>
            </button>
          ))}
        </div>
      )}

      {mode==="zodiac"&&(
        <div className="rounded-2xl p-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
          <button onClick={()=>setMode(null)} className="text-xs mb-4 block" style={{color:"var(--color-sandalwood)"}}>← 返回</button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs opacity-50 mb-1 block">你的生肖</label>
              <select value={me} onChange={e=>setMe(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm border-0" style={{background:"rgba(245,240,232,0.8)"}}>
                {ZODIAC.map(z=><option key={z} value={z}>{z}</option>)}
              </select></div>
            <div><label className="text-xs opacity-50 mb-1 block">对方生肖</label>
              <select value={partner} onChange={e=>setPartner(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm border-0" style={{background:"rgba(245,240,232,0.8)"}}>
                {ZODIAC.map(z=><option key={z} value={z}>{z}</option>)}
              </select></div>
          </div>
          <button onClick={calcZodiac}
            className="w-full rounded-xl py-3 text-sm font-semibold"
            style={{background:"linear-gradient(135deg,#B8656A,#E8A0A4)",color:"#fff"}}>看姻缘</button>
          {result&&<AnimatePresence><motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-4 p-4 rounded-xl whitespace-pre-line text-sm" style={{background:"rgba(184,101,106,0.08)"}}>{result}</motion.div></AnimatePresence>}
        </div>
      )}

      {mode==="star"&&(
        <div className="rounded-2xl p-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
          <button onClick={()=>setMode(null)} className="text-xs mb-4 block" style={{color:"var(--color-sandalwood)"}}>← 返回</button>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div><label className="text-xs opacity-50 mb-1 block">你的星座</label>
              <select value={meSign} onChange={e=>setMeSign(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm border-0" style={{background:"rgba(245,240,232,0.8)"}}>
                {SIGN_TITLES.map(s=><option key={s} value={s}>{SIGN_EMOJIS[s]} {s}</option>)}
              </select></div>
            <div><label className="text-xs opacity-50 mb-1 block">对方星座</label>
              <select value={ptSign} onChange={e=>setPtSign(e.target.value)}
                className="w-full rounded-xl px-3 py-2.5 text-sm border-0" style={{background:"rgba(245,240,232,0.8)"}}>
                {SIGN_TITLES.map(s=><option key={s} value={s}>{SIGN_EMOJIS[s]} {s}</option>)}
              </select></div>
          </div>
          <button onClick={()=>{
            const best = SIGN_MATCH[meSign]===ptSign;
            setResult(`${SIGN_EMOJIS[meSign]}${meSign} × ${SIGN_EMOJIS[ptSign]}${ptSign}\n\n${best?`💯 天生一对！${meSign}的最佳搭配就是${ptSign}`:"✨ 缘分指数70%，需要沟通但可以很美好"}\n\n星座匹配度仅供参考，真爱面前星座只是玩笑 💕`);
          }}
            className="w-full rounded-xl py-3 text-sm font-semibold"
            style={{background:"linear-gradient(135deg,#7B5EA8,#B89CD8)",color:"#fff"}}>测契合度</button>
          {result&&<AnimatePresence><motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} className="mt-4 p-4 rounded-xl whitespace-pre-line text-sm" style={{background:"rgba(123,94,168,0.08)"}}>{result}</motion.div></AnimatePresence>}
        </div>
      )}
    </main>
  );
}
