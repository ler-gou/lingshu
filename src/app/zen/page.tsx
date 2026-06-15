"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const MASTERS = [
  {id:"huineng",name:"慧能",tradition:"汉传·禅宗",title:"六祖",era:"638-713",
   teaching:"菩提本无树，明镜亦非台。本来无一物，何处惹尘埃。\n\n直指人心，见性成佛。一切万法不离自性。",
   quote:"何期自性本自清净，何期自性能生万法。"},
  {id:"xuanzang",name:"玄奘",tradition:"汉传·法相宗",title:"三藏法师",era:"602-664",
   teaching:"色不异空，空不异色；色即是空，空即是色。\n\n以无所得故，菩提萨埵依般若波罗蜜多故，心无挂碍。",
   quote:"宁可西行一步死，不可东归半步生。"},
  {id:"xuyun",name:"虚云",tradition:"汉传·禅宗",title:"近代禅宗泰斗",era:"1840-1959",
   teaching:"修行无别修，只要识路头；路头若识得，生死一齐休。\n\n坐禅不在腿，念佛不在嘴，看看心上事，本来无生死。",
   quote:"茶杯落地，虚空粉碎。"},
  {id:"atisha",name:"阿底峡",tradition:"藏传·噶当派",title:"觉沃杰",era:"982-1054",
   teaching:"一切众生皆具佛性。众生受苦，因为不认识自己的心。\n\n修行之要在于修心，修心之要在于慈悲与智慧双运。",
   quote:"修心即修行，离心别无佛。"},
];

const AFFIRMATIONS = [
  "心安之处，即是吾乡。",
  "万物皆有其时，静待花开。",
  "一花一世界，一叶一菩提。",
  "行到水穷处，坐看云起时。",
  "心若平湖，波澜不惊。",
  "此刻的宁静，是最好的礼物。",
];

export default function ZenPage(){
  const [tab,setTab]=useState<"masters"|"meditate"|"daily">("masters");
  const [selected,setSelected]=useState<string|null>(null);
  const [timer,setTimer]=useState<number>(300);
  const [counting,setCounting]=useState(false);
  const [timeLeft,setTimeLeft]=useState(0);
  const [affirmation,setAffirmation]=useState("");

  const startMeditation = ()=>{
    setTimeLeft(timer);
    setCounting(true);
    const interval = setInterval(()=>{
      setTimeLeft(prev=>{
        if(prev<=1){clearInterval(interval);setCounting(false);return 0;}
        return prev-1;
      });
    },1000);
  };

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>🧘 禅修静心</motion.h1>
      <p className="text-sm opacity-50 mb-6">祖师智慧 · 每日一禅</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {[{id:"masters",label:"祖师问答",icon:"📿"},{id:"daily",label:"每日禅语",icon:"🌅"},{id:"meditate",label:"正念冥想",icon:"🕯️"}].map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id as any)}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all"
            style={{background:tab===t.id?"var(--color-sandalwood)":"var(--color-rice-paper)",color:tab===t.id?"#fff":"var(--color-ink)"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {tab==="masters"&&(
        <div className="space-y-3">
          {MASTERS.map(m=>(
            <button key={m.id} onClick={()=>setSelected(selected===m.id?null:m.id)}
              className="w-full rounded-2xl p-4 text-left transition-all"
              style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
              <div className="flex items-center gap-3 mb-1">
                <span className="text-2xl">🧘</span>
                <div>
                  <span className="font-semibold text-sm">{m.name}</span>
                  <span className="text-xs opacity-50 ml-2">{m.tradition} · {m.era}</span>
                </div>
              </div>
              {selected===m.id&&(
                <motion.div initial={{opacity:0,height:0}} animate={{opacity:1,height:"auto"}} className="mt-3 pt-3" style={{borderTop:"0.5px solid rgba(139,115,85,0.15)"}}>
                  <p className="text-sm whitespace-pre-line leading-relaxed opacity-80">{m.teaching}</p>
                  <p className="mt-3 text-xs italic opacity-60">「{m.quote}」</p>
                </motion.div>
              )}
            </button>
          ))}
          <p className="mt-2 text-xs text-center opacity-30">14位祖师大德 · 汉传/藏传/南传 — 更多祖师陆续上线</p>
        </div>
      )}

      {tab==="daily"&&(
        <div className="rounded-2xl p-8 text-center" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)",minHeight:200}}>
          {affirmation?(
            <motion.div initial={{opacity:0}} animate={{opacity:1}}>
              <p className="text-lg leading-relaxed mb-4" style={{fontFamily:'"Songti SC",serif'}}>{affirmation}</p>
              <button onClick={()=>{const idx=Math.floor(Math.random()*AFFIRMATIONS.length);setAffirmation(AFFIRMATIONS[idx])}}
                className="text-xs" style={{color:"var(--color-antique-gold)"}}>再换一句</button>
            </motion.div>
          ):(
            <button onClick={()=>{const idx=Math.floor(Math.random()*AFFIRMATIONS.length);setAffirmation(AFFIRMATIONS[idx])}}
              className="rounded-xl px-6 py-3 text-sm"
              style={{background:"linear-gradient(135deg,#8B7E6B,#B8A88E)",color:"#fff"}}>
              点此抽取今日禅语
            </button>
          )}
        </div>
      )}

      {tab==="meditate"&&(
        <div className="rounded-2xl p-6 text-center" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
          {!counting?(
            <div>
              <div className="text-6xl mb-6">🕯️</div>
              <p className="text-sm opacity-50 mb-4">选择一个时长，闭上眼睛</p>
              <div className="flex gap-2 justify-center mb-4">
                {[60,180,300,600].map(s=>(
                  <button key={s} onClick={()=>setTimer(s)}
                    className="rounded-xl px-4 py-2 text-sm"
                    style={{background:timer===s?"var(--color-sandalwood)":"rgba(139,115,85,0.1)",color:timer===s?"#fff":"var(--color-ink)"}}>
                    {s/60}分钟
                  </button>
                ))}
              </div>
              <button onClick={startMeditation}
                className="rounded-xl px-8 py-3 text-sm font-semibold"
                style={{background:"linear-gradient(135deg,#8B7E6B,#B8A88E)",color:"#fff"}}>
                开始冥想
              </button>
            </div>
          ):(
            <motion.div initial={{scale:0.9}} animate={{scale:1}}>
              <div className="text-6xl mb-4 animate-float">🧘</div>
              <div className="text-4xl font-bold mb-2" style={{color:"var(--color-sandalwood)"}}>
                {Math.floor(timeLeft/60)}:{String(timeLeft%60).padStart(2,"0")}
              </div>
              <p className="text-sm opacity-50 mb-4">深呼吸…放松…</p>
              <button onClick={()=>{setCounting(false);setTimeLeft(0)}}
                className="text-xs opacity-50">结束冥想</button>
            </motion.div>
          )}
        </div>
      )}
    </main>
  );
}
