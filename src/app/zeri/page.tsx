"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const ACTIVITIES = ["嫁娶","入宅","开业","动土","出行","安葬","祭祀","签约","装修","搬家","开市","订婚"];

const LUNAR_MONTHS = ["正月","二月","三月","四月","五月","六月","七月","八月","九月","十月","冬月","腊月"];
const LUNAR_DAYS = Array.from({length:30},(_,i)=>String(i+1));

function simpleZeri(month:string,day:string,activity:string):{yi:string[];ji:string[];verdict:string}{
  const seed = (LUNAR_MONTHS.indexOf(month)*31 + parseInt(day))*7 + ACTIVITIES.indexOf(activity)*13;
  const yiPool = ["出行","祭祀","嫁娶","签约","纳采","开市","入宅","安床"];
  const jiPool = ["动土","破土","安葬","开仓","上梁","伐木"];
  const yi: string[] = [], ji: string[] = [];
  const rng = (i:number)=>Math.abs(Math.sin(seed+i*123.456))*1000%1;
  yiPool.forEach((y,i)=>{if(rng(i)>0.4)yi.push(y)});
  jiPool.forEach((j,i)=>{if(rng(i+10)>0.55)ji.push(j)});
  if(yi.length<2)yi.push("祈福","会友");
  if(ji.length===0)ji.push("诸事不宜");

  const good = yi.includes(activity);
  return {yi:yi.slice(0,4),ji:ji.slice(0,3),verdict:good?`✅ ${LUNAR_MONTHS[LUNAR_MONTHS.indexOf(month)]}${day}日 · 宜${activity}`:`⚠️ 当日忌${activity}，建议另择吉日`};
}

export default function ZeRiPage(){
  const [month,setMonth]=useState(LUNAR_MONTHS[new Date().getMonth()]);
  const [day,setDay]=useState(String(new Date().getDate()));
  const [activity,setActivity]=useState("入宅");
  const [result,setResult]=useState<{yi:string[];ji:string[];verdict:string}|null>(null);

  // Build a simple calendar grid
  const today = new Date();
  const daysInMonth = new Date(today.getFullYear(),today.getMonth()+1,0).getDate();
  const firstDay = new Date(today.getFullYear(),today.getMonth(),1).getDay();
  const calendar = Array.from({length:42},(_,i)=>{
    const d = i-firstDay+1;
    return d>0&&d<=daysInMonth?String(d):null;
  });

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>📅 择日黄历</motion.h1>
      <p className="text-sm opacity-50 mb-6">吉日挑选 · 神煞宜忌</p>

      {/* Simple calendar */}
      <div className="rounded-2xl p-4 mb-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
        <p className="text-center text-sm font-semibold mb-3" style={{fontFamily:'"Songti SC",serif'}}>
          {today.getFullYear()}年{LUNAR_MONTHS[today.getMonth()]} · {today.getMonth()+1}月
        </p>
        <div className="grid grid-cols-7 gap-1 text-center text-xs">
          {["日","一","二","三","四","五","六"].map(w=><div key={w} className="opacity-30 py-1">{w}</div>)}
          {calendar.map((d,i)=>{
            if(!d)return <div key={i}/>;
            const isToday = parseInt(d)===today.getDate();
            return(
              <button key={i} onClick={()=>setDay(d)}
                className="py-1.5 rounded-lg transition-all"
                style={{background:day===d?"var(--color-antique-gold)":isToday?"rgba(201,169,110,0.2)":"transparent",
                  color:day===d?"#fff":isToday?"var(--color-antique-gold)":"var(--color-ink)",fontWeight:isToday?600:400}}>
                {d}
              </button>
            );
          })}
        </div>
      </div>

      {/* Activity picker */}
      <div className="rounded-2xl p-4 mb-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
        <label className="text-xs opacity-50 mb-2 block">选择要做的事</label>
        <div className="flex flex-wrap gap-2 mb-4">
          {ACTIVITIES.map(a=>(
            <button key={a} onClick={()=>setActivity(a)}
              className="rounded-lg px-3 py-1.5 text-xs transition-all"
              style={{background:activity===a?"var(--color-antique-gold)":"rgba(139,115,85,0.08)",color:activity===a?"#fff":"var(--color-ink)"}}>
              {a}
            </button>
          ))}
        </div>
        <button onClick={()=>setResult(simpleZeri(LUNAR_MONTHS[today.getMonth()],day,activity))}
          className="w-full rounded-xl py-3 text-sm font-semibold"
          style={{background:"linear-gradient(135deg,#B8735A,#D4957E)",color:"#fff"}}>查看宜忌</button>
      </div>

      {result&&(
        <AnimatePresence><motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
          className="rounded-2xl p-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
          <p className="text-sm font-semibold mb-3">{result.verdict}</p>
          <div className="grid grid-cols-2 gap-4">
            <div><p className="text-xs mb-2" style={{color:"var(--color-pine)"}}>✅ 宜</p>
              {result.yi.map(y=><span key={y} className="inline-block text-xs rounded-lg px-2 py-1 mr-1 mb-1" style={{background:"rgba(60,90,75,0.1)",color:"var(--color-pine)"}}>{y}</span>)}</div>
            <div><p className="text-xs mb-2" style={{color:"var(--color-vermillion)"}}>❌ 忌</p>
              {result.ji.map(j=><span key={j} className="inline-block text-xs rounded-lg px-2 py-1 mr-1 mb-1" style={{background:"rgba(160,82,77,0.1)",color:"var(--color-vermillion)"}}>{j}</span>)}</div>
          </div>
          <p className="mt-4 text-xs text-center opacity-30">择日仅供文化参考 · 请结合实际安排</p>
        </motion.div></AnimatePresence>
      )}
    </main>
  );
}
