"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const WUXING = ["金","木","水","火","土"];
const RELATIONS: Record<string,{generate:string;control:string;generated:string;controlled:string;color:string;desc:string;season:string;emotion:string}> = {
  "金":{generate:"土",control:"木",generated:"水",controlled:"火",color:"#C9A96E",desc:"从革 · 变革决断，锐利如锋",season:"秋",emotion:"悲"},
  "木":{generate:"水",control:"土",generated:"火",controlled:"金",color:"#3C5A4B",desc:"曲直 · 生长向上，生机勃勃",season:"春",emotion:"怒"},
  "水":{generate:"金",control:"火",generated:"木",controlled:"土",color:"#4A6A8A",desc:"润下 · 智慧流动，深远包容",season:"冬",emotion:"恐"},
  "火":{generate:"木",control:"金",generated:"土",controlled:"水",color:"#A0524D",desc:"炎上 · 热情绽放，光明热烈",season:"夏",emotion:"喜"},
  "土":{generate:"火",control:"水",generated:"金",controlled:"木",color:"#8B7355",desc:"稼穑 · 承载包容，厚德载物",season:"长夏",emotion:"思"},
};

export default function SajuPage(){
  const [selected,setSelected]=useState<string>("木");
  const info = RELATIONS[selected];

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>☯️ 五行探秘</motion.h1>
      <p className="text-sm opacity-50 mb-6">生克制化 · 平衡之道</p>

      {/* Element selector */}
      <div className="flex justify-center gap-3 mb-6">
        {WUXING.map(el=>(
          <button key={el} onClick={()=>setSelected(el)}
            className="rounded-full w-14 h-14 text-xl font-bold flex items-center justify-center transition-all hover:scale-110"
            style={{background:selected===el?RELATIONS[el].color:"var(--color-rice-paper)",color:selected===el?"#fff":"var(--color-ink)",border:`2px solid ${RELATIONS[el].color}`,transform:selected===el?"scale(1.15)":"scale(1)"}}>
            {el}
          </button>
        ))}
      </div>

      {/* Detail */}
      <motion.div key={selected} initial={{opacity:0,y:10}} animate={{opacity:1,y:0}}
        className="rounded-2xl p-6 mb-4" style={{background:`${info.color}10`,border:`0.5px solid ${info.color}30`}}>
        <div className="text-center mb-4">
          <div className="text-5xl font-bold mb-2" style={{fontFamily:'"Songti SC",serif',color:info.color}}>{selected}</div>
          <p className="text-sm opacity-70">{info.desc}</p>
        </div>

        <div className="grid grid-cols-2 gap-4 text-sm">
          <div className="rounded-xl p-3" style={{background:"var(--color-rice-paper)"}}>
            <p className="text-xs opacity-50 mb-1">相生</p>
            <p>生我：<span style={{color:"var(--color-pine)",fontWeight:600}}>{info.generate}</span></p>
            <p>我生：<span style={{color:"var(--color-pine)",fontWeight:600}}>{info.generated}</span></p>
          </div>
          <div className="rounded-xl p-3" style={{background:"var(--color-rice-paper)"}}>
            <p className="text-xs opacity-50 mb-1">相克</p>
            <p>克我：<span style={{color:"var(--color-vermillion)",fontWeight:600}}>{info.controlled}</span></p>
            <p>我克：<span style={{color:"var(--color-vermillion)",fontWeight:600}}>{info.control}</span></p>
          </div>
        </div>

        <div className="mt-4 rounded-xl p-4" style={{background:"var(--color-rice-paper)"}}>
          <div className="flex justify-between text-sm">
            <span className="opacity-50">对应季节</span><span style={{color:info.color,fontWeight:600}}>{info.season}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="opacity-50">五行之德</span><span style={{color:info.color,fontWeight:600}}>{info.desc}</span>
          </div>
          <div className="flex justify-between text-sm mt-2">
            <span className="opacity-50">对应情绪</span><span style={{color:info.color,fontWeight:600}}>{info.emotion}</span>
          </div>
        </div>
      </motion.div>

      {/* Interaction diagram */}
      <div className="rounded-2xl p-5 mb-4" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
        <p className="text-xs opacity-50 mb-3 text-center">生克环图 — 点击元素看详情</p>
        <div className="flex justify-center">
          <svg width="200" height="200" viewBox="0 0 200 200">
            {WUXING.map((el,i)=>{
              const angle = (i*72-90)*Math.PI/180;
              const cx = 100 + Math.cos(angle)*75;
              const cy = 100 + Math.sin(angle)*75;
              const info = RELATIONS[el];
              return(
                <g key={el}>
                  <circle cx={cx} cy={cy} r={22} fill={info.color} fillOpacity={selected===el?1:0.3}
                    stroke={info.color} strokeWidth={2} onClick={()=>setSelected(el)} style={{cursor:"pointer"}}/>
                  <text x={cx} y={cy} textAnchor="middle" dy=".35em" fill={selected===el?"#fff":info.color} fontSize={16} fontWeight="bold" style={{pointerEvents:"none"}}>{el}</text>
                </g>
              );
            })}
            {/* Connecting lines: generate cycle */}
            {WUXING.map((el,i)=>{
              const info = RELATIONS[el];
              const genIdx = WUXING.indexOf(info.generated);
              const a1 = (i*72-90)*Math.PI/180, a2 = (genIdx*72-90)*Math.PI/180;
              const x1=100+Math.cos(a1)*55, y1=100+Math.sin(a1)*55, x2=100+Math.cos(a2)*55, y2=100+Math.sin(a2)*55;
              return <line key={el} x1={x1} y1={y1} x2={x2} y2={y2} stroke="var(--color-pine)" strokeWidth={1} opacity={0.3} strokeDasharray="4 4"/>;
            })}
          </svg>
        </div>
        <p className="text-xs text-center opacity-30 mt-2">虚线：相生；点五角形：循环</p>
      </div>
    </main>
  );
}
