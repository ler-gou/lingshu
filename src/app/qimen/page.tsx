"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const DOORS = ["休","生","伤","杜","景","死","惊","开"];
const STARS = ["蓬","任","冲","辅","英","芮","柱","心"];
const GODS = ["符","蛇","阴","合","白","玄","地","天"];
const DIRECTIONS = ["北","东北","东","东南","南","西南","西","西北"];

export default function QiMenPage(){
  const [question,setQuestion]=useState("");
  const [result,setResult]=useState<null|{door:string;star:string;god:string;direction:string;advice:string}>(null);

  const calc = ()=>{
    const seed = question.split("").reduce((a,c)=>a+c.charCodeAt(0),Date.now());
    const dI = Math.abs(seed*7)%8, sI = Math.abs(seed*13)%8, gI = Math.abs(seed*17)%8;
    const door = DOORS[dI], star = STARS[sI], god = GODS[gI];
    const goodDoors = ["休","生","开"];
    const isGood = goodDoors.includes(door);

    const advices = [
      `吉门「${door}」+ 吉星「${star}」+ 值符「${god}」—— 万事俱备，宜果断行动。`,
      `方位在「${DIRECTIONS[dI]}」，可优先考虑。今日宜静不宜动，凌晨3-7点（寅卯时）最利。`,
      `神明「${god}」显象，需注意${god==="符"?"贵人相助":god==="蛇"?"暗中变动":god==="合"?"合伙之事":"时机未到"}。`,
    ];

    setResult({
      door,star,god,
      direction:DIRECTIONS[dI],
      advice:isGood?`⚡ 吉门大开！${advices[dI%3]}`:`⚠️ 凶门「${door}」当值，建议再等一个时辰或换个方位。${DIRECTIONS[(dI+4)%8]}方或许更好。`
    });
  };

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>🎴 奇门遁甲</motion.h1>
      <p className="text-sm opacity-50 mb-6">时空推演 · 方位判断</p>

      <div className="rounded-2xl p-5 mb-6" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
        <label className="text-xs opacity-50 mb-2 block">你想问什么？（默念即可）</label>
        <textarea value={question} onChange={e=>setQuestion(e.target.value)}
          placeholder="例如：今天的财运如何？这份工作适合我吗？"
          rows={3}
          className="w-full rounded-xl p-3 text-sm border-0 outline-none resize-none mb-4"
          style={{background:"rgba(245,240,232,0.8)"}}/>
        <button onClick={calc}
          className="w-full rounded-xl py-3 text-sm font-semibold"
          style={{background:"linear-gradient(135deg,#2C4A52,#4A6A72)",color:"#fff"}}>🪷 起局推演</button>
      </div>

      {result&&(
        <AnimatePresence><motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
          className="rounded-2xl p-5 mb-4" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
          {/* 3x3 Grid */}
          <p className="text-xs opacity-50 mb-3 text-center">奇门活盘</p>
          <div className="grid grid-cols-3 gap-2 mb-4">
            {Array.from({length:9},(_,i)=>{
              const dI=(i+DATE_CYCLE+0)%8,sI=(i+DATE_CYCLE+2)%8,gI=(i+DATE_CYCLE+4)%8;
              const door = DOORS[dI];
              const isCenter = i===4;
              return(
                <div key={i} className="text-center rounded-lg p-2"
                  style={{background:isCenter?"rgba(201,169,110,0.15)":"rgba(44,36,22,0.03)",border:isCenter?"0.5px solid var(--color-antique-gold)":"0.5px solid transparent",gridColumn:isCenter?"2":"auto"}}>
                  {isCenter?(
                    <div>
                      <div className="text-2xl mb-1">☯️</div>
                      <div className="text-xs font-bold">{result.god}</div>
                    </div>
                  ):(
                    <div>
                      <div className="text-sm font-bold mb-0.5" style={{color:["休","生","开"].includes(door)?"var(--color-pine)":"var(--color-vermillion)"}}>{door}</div>
                      <div className="text-xs opacity-40">{STARS[sI].replace("蓬",result.star===STARS[sI]?"★蓬":"蓬")}</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <div className="grid grid-cols-3 gap-1 text-xs opacity-40 text-center mb-4">
            {["东南","南","西南","东","中宫","西","东北","北","西北"].map((d,i)=><div key={i}>{d}</div>)}
          </div>

          <div className="rounded-xl p-4" style={{background:"rgba(44,74,82,0.06)"}}>
            <div className="flex gap-4 mb-3 text-sm">
              <span>门：<b style={{color:"var(--color-antique-gold)"}}>{result.door}</b></span>
              <span>星：<b style={{color:"var(--color-antique-gold)"}}>{result.star}</b></span>
              <span>神：<b style={{color:"var(--color-antique-gold)"}}>{result.god}</b></span>
              <span>向：<b style={{color:"var(--color-antique-gold)"}}>{result.direction}</b></span>
            </div>
            <p className="text-sm leading-relaxed opacity-80">{result.advice}</p>
          </div>
        </motion.div></AnimatePresence>
      )}
      <p className="text-xs text-center opacity-30 mt-2">奇门遁甲源于上古兵法 · 仅供传统文化体验</p>
    </main>
  );
}
const DATE_CYCLE = Math.floor(Date.now()/86400000)%8;
