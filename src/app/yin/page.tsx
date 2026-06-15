"use client";

import { useState } from "react";
import Link from "next/link";

const ZODIAC = ["鼠","牛","虎","兔","龙","蛇","马","羊","猴","鸡","狗","猪"];
const ELEMENTS:Record<string,string>={"甲":"木","乙":"木","丙":"火","丁":"火","戊":"土","己":"土","庚":"金","辛":"金","壬":"水","癸":"水"};
const ZODIAC_MATCH:Record<string,{best:string[];ok:string[];avoid:string[];desc:string}> = {
  "鼠":{best:["牛","龙","猴"],ok:["鼠","蛇","狗"],avoid:["马","兔","羊"],desc:"机智灵活，择偶最看重精神的交流。牛是鼠最好的搭档——一个机灵一个稳重。"},
  "牛":{best:["鼠","蛇","鸡"],ok:["牛","虎","猪"],avoid:["马","羊"],desc:"踏实可靠，在感情里是最不擅长表达但最长情的人。需要被主动看见。"},
  "虎":{best:["马","狗","猪"],ok:["虎","兔","蛇"],avoid:["猴"],desc:"敢爱敢恨，感情里需要对方也有自己的独立世界。不喜欢被黏太紧。"},
  "兔":{best:["羊","狗","猪"],ok:["兔","虎","猴"],avoid:["鼠","鸡"],desc:"温柔细腻，最需要安全感的生肖。看似柔弱但内心有韧劲。"},
  "龙":{best:["鼠","猴","鸡"],ok:["龙","蛇","马"],avoid:["狗"],desc:"气场强大但在爱人面前像个小孩。需要一个能接住他所有情绪的伴侣。"},
  "蛇":{best:["猴","鸡","牛"],ok:["蛇","龙","马"],avoid:["虎","猪"],desc:"神秘深沉，对感情极其认真。一旦认定一个人很难放手。"},
  "马":{best:["虎","羊","狗"],ok:["马","龙","蛇"],avoid:["鼠","牛"],desc:"自由奔放，最怕被束缚。最适合的是能一起奔跑而不是拽着他走的人。"},
  "羊":{best:["兔","马","猪"],ok:["羊","虎","猴"],avoid:["牛","鼠"],desc:"最温柔体贴的生肖。在感情里容易被辜负，因为太会照顾人。"},
  "猴":{best:["鼠","龙","蛇"],ok:["猴","牛","鸡"],avoid:["虎","猪"],desc:"聪明有趣，最怕无聊。能让他一直有新鲜感的人，就是最好的伴侣。"},
  "鸡":{best:["牛","龙","蛇"],ok:["鸡","猴","狗"],avoid:["兔","鼠"],desc:"精致讲究，在感情里也需要被认真对待。最讨厌敷衍。"},
  "狗":{best:["虎","兔","马"],ok:["狗","猪","猴"],avoid:["龙","羊"],desc:"忠诚如狗，最值得信赖的伴侣。感情里最怕的不是吵架，是背叛。"},
  "猪":{best:["虎","兔","羊"],ok:["猪","狗","牛"],avoid:["蛇","猴"],desc:"乐观豁达，对爱情充满浪漫想象。最怕现实打碎幻想。"},
};

export default function YinPage(){
  const [aYear,setAYear]=useState("1990");const [aMonth,setAMonth]=useState("6");const [aDay,setADay]=useState("15");const [aHour,setAHour]=useState("12");
  const [bYear,setBYear]=useState("1990");const [bMonth,setBMonth]=useState("6");const [bDay,setBDay]=useState("15");const [bHour,setBHour]=useState("12");
  const [showResult,setShowResult]=useState(false);
  const [aiText,setAiText]=useState("");const [aiLoading,setAiLoading]=useState(false);
  const [aiParsed,setAiParsed]=useState<{summary:string;career?:string;relationship?:string;health?:string}|null>(null);

  const getZodiac = (y:number)=>ZODIAC[(y-4)%12];
  const getDayStem = (y:number,m:number,d:number)=>{
    const off = Math.floor((Date.UTC(y,m-1,d)-Date.UTC(1900,0,1))/864e5)+10;
    return ["甲","乙","丙","丁","戊","己","庚","辛","壬","癸"][off%10];
  };

  const aZodiac = getZodiac(+aYear);const bZodiac = getZodiac(+bYear);
  const aElement = ELEMENTS[getDayStem(+aYear,+aMonth,+aDay)]||"土";
  const bElement = ELEMENTS[getDayStem(+bYear,+bMonth,+bDay)]||"土";

  const genCycle:Record<string,string>={"木":"火","火":"土","土":"金","金":"水","水":"木"};
  const ctrlCycle:Record<string,string>={"木":"土","土":"水","水":"火","火":"金","金":"木"};

  let zodiacScore = 0,zodiacText = "";
  const aMatch = ZODIAC_MATCH[aZodiac];
  if(aMatch.best.includes(bZodiac)){zodiacScore=95;zodiacText="天生一对。这两个生肖放在一起，是老祖宗盖章的好搭配。"}
  else if(aMatch.ok.includes(bZodiac)){zodiacScore=70;zodiacText="还不错。没有天生的冲突，但需要双方互相迁就。"}
  else if(aMatch.avoid.includes(bZodiac)){zodiacScore=35;zodiacText="传统上看这对组合有挑战——但不是不能在一起。就是需要双方都比别人多些耐心和包容。"}
  else {zodiacScore=55;zodiacText="普普通通。生肖不是决定因素，真正重要的是两个人愿不愿意为彼此努力。"}

  let elemScore=0,elemText="";
  if(genCycle[aElement]===bElement){elemScore=90;elemText=`${aElement}生${bElement}——你天然地在滋养对方。这种五行关系里，你是给予者，ta是被滋养的一方。`}
  else if(genCycle[bElement]===aElement){elemScore=90;elemText=`${bElement}生${aElement}——对方天然地在滋养你。被爱是好的，但记得也要回头看看那个一直付出的人。`}
  else if(aElement===bElement){elemScore=80;elemText=`同为${aElement}——你们是同一种人。默契满分，但也容易谁都不肯先让步。`}
  else if(ctrlCycle[aElement]===bElement){elemScore=40;elemText=`${aElement}克${bElement}——你的气场压着对方。在一起久了对方可能会不自觉紧张。这不是谁的错，但需要有意识地给对方空间。`}
  else if(ctrlCycle[bElement]===aElement){elemScore=40;elemText=`${bElement}克${aElement}——对方的气场压着你。你可能常常觉得自己在迁就，但又说不清楚为什么累。`}
  else {elemScore=60;elemText="五行之间没有直接关系——你们是两个独立的世界在试着碰撞融合。挺好的，求同存异就是最大的默契。"}

  const overall = Math.round((zodiacScore+elemScore)/2);

  const fetchAI = async ()=>{
    setAiLoading(true);
    const data = {
      a:{zodiac:aZodiac,element:aElement,year:aYear,month:aMonth,day:aDay,hour:aHour},
      b:{zodiac:bZodiac,element:bElement,year:bYear,month:bMonth,day:bDay,hour:bHour},
      zodiacScore,elemScore,overall,
      zodiacText,elemText,
    };
    try{
      const resp=await fetch("/api/interpret",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({module:"yin",data})});
      const j=await resp.json();
      if(j.parsed){setAiParsed(j.parsed);setAiText("")}
      else{setAiText(j.content||j.error||"解读失败");setAiParsed(null)}
    }catch{setAiText("网络错误");setAiParsed(null)}
    setAiLoading(false);
  };

  const field = (label:string,value:string,set:(v:string)=>void)=>(
    <div><label className="block text-[10px] text-gray-400 mb-1">{label}</label>
    <input type="number" value={value} onChange={e=>set(e.target.value)}
      className="w-full bg-[var(--silk)] rounded-xl px-3 py-2.5 text-xs outline-none focus:ring-2 focus:ring-[var(--gold)]"/></div>
  );

  return(
    <main className="min-h-screen pb-20 selection:bg-[var(--gold)] selection:text-white">
      <div className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 灵枢</Link>
      </div>

      <section className="w-full max-w-xl mx-auto px-6 mt-4">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4 serif" style={{color:"#a66a6a"}}>缘</div>
          <h1 className="text-2xl font-bold mb-2 serif">姻缘合婚</h1>
          <p className="text-sm text-gray-400">生肖相合 · 五行生克</p>
        </div>

        {/* Person A */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-4">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{background:"#5a7d92"}}>男</span>
            <span className="text-xs text-gray-500">男生</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{l:"出生年",v:aYear,s:setAYear},{l:"月",v:aMonth,s:setAMonth},{l:"日",v:aDay,s:setADay},{l:"时",v:aHour,s:setAHour}].map(f=>field(f.l,f.v,f.s))}
          </div>
        </div>

        {/* Person B */}
        <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 mb-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white"
              style={{background:"#a66a6a"}}>女</span>
            <span className="text-xs text-gray-500">女生</span>
          </div>
          <div className="grid grid-cols-2 gap-3">
            {[{l:"出生年",v:bYear,s:setBYear},{l:"月",v:bMonth,s:setBMonth},{l:"日",v:bDay,s:setBDay},{l:"时",v:bHour,s:setBHour}].map(f=>field(f.l,f.v,f.s))}
          </div>
        </div>

        <button type="button" onClick={()=>{setShowResult(true);setAiText("");setAiParsed(null)}}
          className="w-full bg-[var(--ink)] hover:bg-black text-white rounded-full py-4 font-semibold tracking-wider shadow-lg mb-6">
          合 婚
        </button>

        {/* AnimatePresence */}
          {showResult&&(
            <div>
              {/* Scores */}
              <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 mb-4">
                <div className="text-center mb-4">
                  <div className="text-3xl font-bold serif mb-1" style={{color:"#a66a6a"}}>{overall}</div>
                  <div className="text-xs text-gray-400">综合匹配度</div>
                </div>

                <div className="space-y-3 mb-4">
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-16 text-right text-gray-400">生肖</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${zodiacScore}%`,background:"#a66a6a"}}/>
                    </div>
                    <span className="text-xs w-8">{zodiacScore}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm w-16 text-right text-gray-400">五行</span>
                    <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all duration-700" style={{width:`${elemScore}%`,background:"#a66a6a"}}/>
                    </div>
                    <span className="text-xs w-8">{elemScore}</span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-[var(--silk)] text-xs text-gray-600 leading-relaxed mb-1">
                  🐲 {aZodiac}{aElement} vs 🐯 {bZodiac}{bElement}&nbsp;·&nbsp;{zodiacText}
                </div>
                <div className="p-3 rounded-xl bg-[var(--silk)] text-xs text-gray-600 leading-relaxed">
                  {elemText}
                </div>
              </div>

              {/* AI */}
              {!aiText&&!aiLoading&&!aiParsed&&(
                <button type="button" onClick={fetchAI}
                  className="w-full bg-[var(--ink)] text-[var(--gold)] rounded-full py-3 font-bold text-sm hover:bg-black shadow-sm mb-4">
                  月老详解
                </button>
              )}
              {aiLoading&&(
                <div className="text-center py-3"><div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto" style={{borderColor:"#a66a6a",borderTopColor:"transparent"}}/></div>
              )}
              {(aiParsed||aiText)&&(
                <div
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-4">
                  <h3 className="text-sm font-bold mb-3 serif flex items-center gap-2" style={{color:"#a66a6a"}}>
                    <span className="w-1.5 h-4 rounded-sm" style={{background:"#a66a6a"}}/> 月老详解
                  </h3>
                  {aiParsed ? (
                    <div className="text-sm text-gray-700 leading-loose whitespace-pre-line">
                      {aiParsed.summary}
                      {aiParsed.relationship&&(<div className="mt-4 pt-4 border-t border-gray-50">{aiParsed.relationship}</div>)}
                    </div>
                  ) : (
                    <div className="text-sm text-gray-700 leading-loose whitespace-pre-line">{aiText}</div>
                  )}
                </div>
              )}
              <div className="text-center pb-10">
                <button type="button" onClick={()=>{setShowResult(false);setAiText("");setAiParsed(null)}}
                  className="text-xs text-gray-300 hover:text-gray-500">重新测算</button>
              </div>
            </div>
          )}
        {/* /AnimatePresence */}
      </section>
    </main>
  );
}
