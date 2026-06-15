"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const DIRECTIONS = ["坐北朝南","坐南朝北","坐东朝西","坐西朝东","坐东北朝西南","坐西南朝东北","坐东南朝西北","坐西北朝东南"];
const PERIODS = [8,9];
const PERIOD_DESC: Record<number,string> = {8:"2004-2023 八运 (艮卦主事)",9:"2024-2043 九运 (离卦主事)"};

const STAR_MEANINGS: Record<number,{name:string;luck:string;desc:string}> = {
  1:{name:"一白 贪狼",luck:"吉",desc:"桃花位 · 主姻缘人缘，宜用清水或金属摆设催旺"},
  2:{name:"二黑 巨门",luck:"凶",desc:"病符位 · 主疾病伤痛，宜放铜铃或金属物件化解"},
  3:{name:"三碧 禄存",luck:"凶",desc:"是非位 · 主口舌官非，宜用红色物品化解"},
  4:{name:"四绿 文曲",luck:"吉",desc:"文昌位 · 主学业事业，宜放书桌或绿色植物"},
  5:{name:"五黄 廉贞",luck:"大凶",desc:"五黄煞 · 最凶之位，宜用金属风铃或铜钱化解"},
  6:{name:"六白 武曲",luck:"吉",desc:"偏财位 · 主横财权势，宜放黄水晶或金属摆件"},
  7:{name:"七赤 破军",luck:"凶",desc:"破财位 · 主盗贼火灾，宜用蓝色物品化解"},
  8:{name:"八白 左辅",luck:"大吉",desc:"正财位 · 主财运事业，宜保持明亮整洁"},
  9:{name:"九紫 右弼",luck:"吉",desc:"喜神位 · 主婚嫁添丁，宜放红色或紫色花卉"},
};

export default function FengShuiPage(){
  const [direction,setDirection]=useState("坐北朝南");
  const [period,setPeriod]=useState(9);
  const [result,setResult]=useState<{star:number;room:string}[]|null>(null);

  const calc = ()=>{
    const palaceNames = ["东南","正南","西南","正东","中宫","正西","东北","正北","西北"];
    const base = period===9 ? [9,5,7,8,1,3,4,6,2] : [8,4,6,7,9,2,3,5,1];
    const maps = base.map((s,i)=>({star:s,room:palaceNames[i]}));
    setResult(maps);
  };

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>🏯 风水堪舆</motion.h1>
      <p className="text-sm opacity-50 mb-8">玄空飞星 · 八宅布局</p>

      <div className="rounded-2xl p-5 mb-6" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div><label className="text-xs opacity-50 mb-1 block">房屋朝向</label>
            <select value={direction} onChange={e=>setDirection(e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border-0" style={{background:"rgba(245,240,232,0.8)"}}>
              {DIRECTIONS.map(d=><option key={d} value={d}>{d}</option>)}
            </select></div>
          <div><label className="text-xs opacity-50 mb-1 block">入住年份</label>
            <select value={period} onChange={e=>setPeriod(+e.target.value)}
              className="w-full rounded-xl px-3 py-2.5 text-sm border-0" style={{background:"rgba(245,240,232,0.8)"}}>
              {PERIODS.map(p=><option key={p} value={p}>{PERIOD_DESC[p]}</option>)}
            </select></div>
        </div>
        <button onClick={calc}
          className="w-full rounded-xl py-3 text-sm font-semibold"
          style={{background:"linear-gradient(135deg,#6B5B3E,#9B8B6E)",color:"#fff"}}>排飞星盘</button>
      </div>

      {result&&(
        <AnimatePresence><motion.div initial={{opacity:0}} animate={{opacity:1}}>
          <div className="rounded-2xl p-5 mb-4" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
            <p className="text-xs opacity-50 mb-3">飞星盘 · {direction} · {PERIOD_DESC[period]}</p>
            <div className="grid grid-cols-3 gap-2">
              {result.map((p,i)=>{
                const info = STAR_MEANINGS[p.star];
                const isGood = info.luck.includes("吉");
                return(
                  <div key={i} className="rounded-xl p-3 text-center"
                    style={{background:isGood?"rgba(60,90,75,0.1)":"rgba(160,82,77,0.08)",border:`0.5px solid ${isGood?"rgba(60,90,75,0.2)":"rgba(160,82,77,0.2)"}`}}>
                    <div className="text-xs opacity-40">{p.room}</div>
                    <div className="text-lg font-bold my-1" style={{color:isGood?"var(--color-pine)":"var(--color-vermillion)"}}>{info.name}</div>
                    <div className="text-xs opacity-50 leading-tight">{info.desc.slice(0,20)}…</div>
                  </div>
                );
              })}
            </div>
          </div><p className="text-xs text-center opacity-40">以上仅供参考 · 风水之道在于心</p></motion.div></AnimatePresence>
      )}
    </main>
  );
}
