"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

const SYMPTOMS: Record<string,string[]> = {
  "感冒怕冷":["桂枝汤","麻黄汤","葛根汤","小青龙汤"],
  "咳嗽痰多":["二陈汤","小青龙汤","苓甘五味姜辛汤","止嗽散"],
  "头痛眩晕":["天麻钩藤饮","半夏白术天麻汤","川芎茶调散"],
  "失眠多梦":["酸枣仁汤","归脾汤","黄连阿胶汤","朱砂安神丸"],
  "胃痛腹胀":["平胃散","保和丸","理中汤","半夏泻心汤"],
  "腰膝酸软":["六味地黄丸","金匮肾气丸","左归丸","右归丸"],
};

const HERBS: Record<string,{taste:string;nature:string;meridian:string;action:string}> = {
  "桂枝":{taste:"辛甘",nature:"温",meridian:"心/肺/膀胱",action:"发汗解肌，温通经脉"},
  "麻黄":{taste:"辛苦",nature:"温",meridian:"肺/膀胱",action:"发汗散寒，宣肺平喘"},
  "白芍":{taste:"苦酸",nature:"微寒",meridian:"肝/脾",action:"养血敛阴，柔肝止痛"},
  "甘草":{taste:"甘",nature:"平",meridian:"心/肺/脾/胃",action:"补脾益气，调和诸药"},
  "生姜":{taste:"辛",nature:"微温",meridian:"肺/脾/胃",action:"发汗解表，温中止呕"},
  "大枣":{taste:"甘",nature:"温",meridian:"脾/胃",action:"补中益气，养血安神"},
  "半夏":{taste:"辛",nature:"温",meridian:"脾/胃/肺",action:"燥湿化痰，降逆止呕"},
  "茯苓":{taste:"甘淡",nature:"平",meridian:"心/脾/肾",action:"利水渗湿，健脾宁心"},
  "酸枣仁":{taste:"甘酸",nature:"平",meridian:"心/肝/胆",action:"养心安神，敛汗生津"},
  "黄连":{taste:"苦",nature:"寒",meridian:"心/肝/胃/大肠",action:"清热燥湿，泻火解毒"},
  "当归":{taste:"甘辛",nature:"温",meridian:"肝/心/脾",action:"补血活血，调经止痛"},
  "川芎":{taste:"辛",nature:"温",meridian:"肝/胆/心包",action:"活血行气，祛风止痛"},
};

const ACUPOINTS: Record<string,{location:string;action:string}> = {
  "合谷":{location:"手背虎口处",action:"头痛牙痛感冒"},
  "足三里":{location:"膝下三寸",action:"脾胃调理强壮"},
  "三阴交":{location:"内踝尖上三寸",action:"妇科月经失眠"},
  "百会":{location:"头顶正中央",action:"头痛眩晕失眠"},
  "内关":{location:"腕横纹上二寸",action:"心悸胸闷恶心"},
  "风池":{location:"后颈枕骨下",action:"感冒头痛颈椎"},
};

export default function TCMPage(){
  const [tab,setTab]=useState<"herbs"|"acupoint"|"symptom">("herbs");
  const [search,setSearch]=useState("");
  const [selected,setSelected]=useState<string|null>(null);

  const tabs = [
    {id:"herbs" as const,label:"本草药性",icon:"🌿"},
    {id:"acupoint" as const,label:"穴位查询",icon:"📍"},
    {id:"symptom" as const,label:"症状查方",icon:"🤒"},
  ];

  return(
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回首页</Link>
      <motion.h1 initial={{opacity:0}} animate={{opacity:1}} className="text-2xl font-bold mt-4 mb-2" style={{fontFamily:'"Songti SC",serif'}}>🌿 中医养生</motion.h1>
      <p className="text-sm opacity-50 mb-6">倪师传承 · 方证检索</p>

      {/* Tabs */}
      <div className="flex gap-2 mb-5">
        {tabs.map(t=>(
          <button key={t.id} onClick={()=>{setTab(t.id);setSelected(null);setSearch("")}}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-all"
            style={{background:tab===t.id?"var(--color-pine)":"var(--color-rice-paper)",color:tab===t.id?"#fff":"var(--color-ink)"}}>
            {t.icon} {t.label}
          </button>
        ))}
      </div>

      {/* Search */}
      <input type="text" value={search} onChange={e=>setSearch(e.target.value)}
        placeholder={tab==="herbs"?"搜中药名…":tab==="acupoint"?"搜穴位名…":"描述你的症状…"}
        className="w-full rounded-xl px-4 py-3 text-sm mb-4 border-0 outline-none"
        style={{background:"var(--color-rice-paper)"}}/>

      {/* Results */}
      <div className="rounded-2xl p-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
        {tab==="herbs"&&(
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(HERBS).filter(([n])=>!search||n.includes(search)).map(([name,info])=>(
              <button key={name} onClick={()=>setSelected(name)}
                className="rounded-xl p-3 text-left hover:-translate-y-0.5 transition-all"
                style={{background:selected===name?"rgba(60,90,75,0.1)":"rgba(245,240,232,0.5)",border:selected===name?"0.5px solid var(--color-pine)":"0.5px solid transparent"}}>
                <div className="text-lg mb-1">🌱 {name}</div>
                <div className="text-xs opacity-50">{info.taste} · {info.nature}</div>
              </button>
            ))}
          </div>
        )}

        {tab==="acupoint"&&(
          <div className="grid grid-cols-2 gap-2">
            {Object.entries(ACUPOINTS).filter(([n])=>!search||n.includes(search)).map(([name,info])=>(
              <button key={name} onClick={()=>setSelected(name)}
                className="rounded-xl p-3 text-left hover:-translate-y-0.5 transition-all"
                style={{background:selected===name?"rgba(60,90,75,0.1)":"rgba(245,240,232,0.5)",border:selected===name?"0.5px solid var(--color-pine)":"0.5px solid transparent"}}>
                <div className="text-lg mb-1">📍 {name}</div>
                <div className="text-xs opacity-50">{info.location}</div>
              </button>
            ))}
          </div>
        )}

        {tab==="symptom"&&(
          <div className="space-y-2">
            {Object.entries(SYMPTOMS).filter(([n])=>!search||n.includes(search)||SYMPTOMS[n].some(s=>s.includes(search))).map(([symptom,formulas])=>(
              <button key={symptom} onClick={()=>setSelected(symptom)}
                className="w-full rounded-xl p-4 text-left"
                style={{background:selected===symptom?"rgba(60,90,75,0.1)":"rgba(245,240,232,0.5)"}}>
                <div className="text-sm font-medium mb-2">🤒 {symptom}</div>
                <div className="flex flex-wrap gap-2">
                  {formulas.map(f=><span key={f} className="text-xs rounded-lg px-2 py-1" style={{background:"rgba(60,90,75,0.15)",color:"var(--color-pine)"}}>{f}</span>)}
                </div>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Detail panel */}
      <AnimatePresence>
        {selected&&(
          <motion.div initial={{opacity:0,y:10}} animate={{opacity:1,y:0}} exit={{opacity:0}}
            className="mt-4 rounded-2xl p-5" style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)"}}>
            {tab==="herbs"&&HERBS[selected]&&(
              <div>
                <h3 className="font-bold text-lg mb-2">🌿 {selected}</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="opacity-50">性味：</span>{HERBS[selected].taste}</div>
                  <div><span className="opacity-50">归经：</span>{HERBS[selected].nature}</div>
                  <div><span className="opacity-50">经络：</span>{HERBS[selected].meridian}</div>
                </div>
                <p className="mt-2 text-sm opacity-70">{HERBS[selected].action}</p>
              </div>
            )}
            {tab==="acupoint"&&selected&&ACUPOINTS[selected]&&(
              <div>
                <h3 className="font-bold text-lg mb-2">📍 {selected}</h3>
                <p className="text-sm opacity-70 mb-1">位置：{ACUPOINTS[selected].location}</p>
                <p className="text-sm opacity-70">主治：{ACUPOINTS[selected].action}</p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      <p className="mt-6 text-xs text-center opacity-30">以上信息仅供中医学习参考 · 不构成医疗建议</p>
    </main>
  );
}
