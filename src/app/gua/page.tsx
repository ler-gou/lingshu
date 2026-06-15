"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

// ── 64卦 ──
const GUA:Record<number,{name:string;symbol:string;desc:string}> = {
  1:{name:"乾为天",symbol:"䷀",desc:"刚健中正，自强不息。最阳的一卦，万物资始。"},
  2:{name:"坤为地",symbol:"䷁",desc:"柔顺承载，厚德载物。最阴的一卦，大地之象。"},
  3:{name:"水雷屯",symbol:"䷂",desc:"万物始生，艰难屯蹇。初生之难，守正则吉。"},
  4:{name:"山水蒙",symbol:"䷃",desc:"童蒙求我，启蒙发智。教育之卦，因材施教。"},
  5:{name:"水天需",symbol:"䷄",desc:"待时之象，需于郊野。耐心等待，时机成熟自然会来。"},
  6:{name:"天水讼",symbol:"䷅",desc:"争讼之象，有孚窒惕。争论不如和解，见好就收。"},
  7:{name:"地水师",symbol:"䷆",desc:"行险而顺，师出有名。用兵之道，正义为先。"},
  8:{name:"水地比",symbol:"䷇",desc:"亲比辅佐，上下相亲。团结之卦，善择所从。"},
  9:{name:"风天小畜",symbol:"䷈",desc:"密云不雨，蓄积待发。小有积蓄，厚积薄发。"},
  10:{name:"天泽履",symbol:"䷉",desc:"如履虎尾，谨慎行事。身在高位更要如履薄冰。"},
  11:{name:"地天泰",symbol:"䷊",desc:"天地交而万物通。大吉，阴阳和谐之象。"},
  12:{name:"天地否",symbol:"䷋",desc:"天地不交，万物不通。小人道长，君子韬光养晦。"},
  13:{name:"天火同人",symbol:"䷌",desc:"与人同心，其利断金。团结合作之卦。"},
  14:{name:"火天大有",symbol:"䷍",desc:"柔得尊位，大中而上下应之。富足丰盛，大获所有。"},
  15:{name:"地山谦",symbol:"䷎",desc:"谦谦君子，卑以自牧。满招损谦受益。"},
  16:{name:"雷地豫",symbol:"䷏",desc:"顺以动，愉悦之象。建侯行师，乐以忘忧。"},
  23:{name:"山地剥",symbol:"䷖",desc:"剥床以足，小人道长。顺而止之，以观消息。"},
  24:{name:"地雷复",symbol:"䷗",desc:"一阳来复，七日来复。冬至阳生，回归正道。"},
  25:{name:"天雷无妄",symbol:"䷘",desc:"真实无妄，不利有攸往。守正无贪，自然无咎。"},
  26:{name:"山天大畜",symbol:"䷙",desc:"刚健笃实辉光。积蓄力量，厚积以待时机。"},
  27:{name:"山雷颐",symbol:"䷚",desc:"颐养之道，自求口实。养身养德，言语饮食有节。"},
  28:{name:"泽风大过",symbol:"䷛",desc:"栋桡之象，过犹不及。非常之时，需要非常之举。"},
  29:{name:"坎为水",symbol:"䷜",desc:"重险也，水流而不盈。身陷险境，守心则可度。"},
  30:{name:"离为火",symbol:"䷝",desc:"依附之象，明两作离。借光借力，顺势而为。"},
  31:{name:"泽山咸",symbol:"䷞",desc:"感而遂通，二气相与。感应之卦，男女之情。"},
  32:{name:"雷风恒",symbol:"䷟",desc:"恒久之道，雷风相与。守常不变，持之以恒。"},
  33:{name:"天山遁",symbol:"䷠",desc:"天下有山，遁世无闷。急流勇退，避祸为智。"},
  34:{name:"雷天大壮",symbol:"䷡",desc:"大者壮也，刚以动。正当其壮，利有攸往。"},
  35:{name:"火地晋",symbol:"䷢",desc:"明出地上，自昭明德。蒸蒸日上，光明在前。"},
  36:{name:"地火明夷",symbol:"䷣",desc:"明入地中，利艰贞。暗夜将尽，守正待明。"},
  37:{name:"风火家人",symbol:"䷤",desc:"风自火出，言有物而行有恒。家道之卦，各正其位。"},
  38:{name:"火泽睽",symbol:"䷥",desc:"二女同居其志不同行。求同存异，化异为和。"},
  39:{name:"水山蹇",symbol:"䷦",desc:"山上有水，蹇难之象。利见大人，渡难关需贵人。"},
  40:{name:"雷水解",symbol:"䷧",desc:"险以动，动而免乎险。解困之卦，云开见日。"},
  41:{name:"山泽损",symbol:"䷨",desc:"损下益上，损刚益柔。有所舍弃，方有所得。"},
  42:{name:"风雷益",symbol:"䷩",desc:"益利有攸往。增益之卦，天施地生。"},
  43:{name:"泽天夬",symbol:"䷪",desc:"决也，刚决柔也。当断则断，快刀斩乱麻。"},
  44:{name:"天风姤",symbol:"䷫",desc:"遇也，柔遇刚也。邂逅之卦，不期而遇。"},
  45:{name:"泽地萃",symbol:"䷬",desc:"聚也，观其所聚。聚集之卦，众人同心。"},
  46:{name:"地风升",symbol:"䷭",desc:"柔以时升，积小以高大。如地中木，节节高升。"},
  47:{name:"泽水困",symbol:"䷮",desc:"困而不失其所，亨。身在困境，守住初心。"},
  48:{name:"水风井",symbol:"䷯",desc:"改邑不改井，养而不穷。恒久之道，修旧如新。"},
  49:{name:"泽火革",symbol:"䷰",desc:"革故鼎新，顺天应人。变则通不变则壅。"},
  50:{name:"火风鼎",symbol:"䷱",desc:"鼎器之象，以木巽火。革故鼎新，破而后立。"},
  51:{name:"震为雷",symbol:"䷲",desc:"震惊百里，不丧匕鬯。临危不惧，笑对风雷。"},
  52:{name:"艮为山",symbol:"䷳",desc:"艮其背，不获其身。知止不殆，适可而止。"},
  53:{name:"风山渐",symbol:"䷴",desc:"女归吉也，进得位。循序渐进，心急吃不了热豆腐。"},
  54:{name:"雷泽归妹",symbol:"䷵",desc:"归妹天地之大义。婚嫁之卦，阴阳和合。"},
  55:{name:"雷火丰",symbol:"䷶",desc:"日中则昃，月盈则食。盛极必衰，得意不可忘形。"},
  56:{name:"火山旅",symbol:"䷷",desc:"旅而无所容，利旅贞。人在旅途，得意失意皆短暂。"},
  57:{name:"巽为风",symbol:"䷸",desc:"随风巽，君子以申命行事。风行草偃，柔顺而入。"},
  58:{name:"兑为泽",symbol:"䷹",desc:"兑说也，刚中而柔外。悦而应之，以和为贵。"},
  59:{name:"风水涣",symbol:"䷺",desc:"涣散之象，风行水上。分而合之，散而聚之。"},
  60:{name:"水泽节",symbol:"䷻",desc:"节以制度，不伤财不害民。凡事有度，过犹不及。"},
  61:{name:"风泽中孚",symbol:"䷼",desc:"信及豚鱼，中心愿也。诚信之卦，以诚待人。"},
  62:{name:"雷山小过",symbol:"䷽",desc:"小者过而亨。小事可越矩，大事不可轻率。"},
  63:{name:"水火既济",symbol:"䷾",desc:"亨小利贞。初吉终乱——事情看似成了，不要松懈。"},
  64:{name:"火水未济",symbol:"䷿",desc:"未济亨，小狐汔济。还没到终点，但曙光在前。"},
};

// 3 coins × 6 = 18 tosses → hexagram
function tossYao():{value:number;changing:boolean}{const v=Math.floor(Math.random()*2)+Math.floor(Math.random()*2)+Math.floor(Math.random()*2)+3;return{value:v,changing:v===6||v===9}};
function getHexagramNum(lines:{value:number}[]):number{
  let num = 0;
  for(let i=0;i<6;i++){num=(num<<1)|(lines[i].value%2)};
  return num+1;
}

export default function GuaPage(){
  const [question,setQuestion]=useState("");
  const [lines,setLines]=useState<{value:number;changing:boolean}[]|null>(null);
  const [showResult,setShowResult]=useState(false);
  const [aiText,setAiText]=useState("");const [aiLoading,setAiLoading]=useState(false);

  const cast = ()=>{
    const yao = Array.from({length:6},()=>tossYao());
    setLines(yao);
    setShowResult(true);setAiText("");
  };

  const yaos = ["初爻","二爻","三爻","四爻","五爻","上爻"];

  let guaNum = 1, changeNum = 0;
  let guaName = "", guaSymbol = "", guaDesc = "";
  let changeName = "", changeSymbol = "";

  if(lines){
    guaNum = getHexagramNum(lines);
    const g = GUA[guaNum] || GUA[1];
    guaName = g.name;guaSymbol = g.symbol;guaDesc = g.desc;
    // Changed lines
    const changed = lines.map((l,i)=>l.changing?(l.value===6?7:8):l.value);
    changeNum = getHexagramNum(changed.map(v=>({value:v})));
    if(changeNum !== guaNum){
      const cg = GUA[changeNum]||GUA[1];
      changeName = cg.name;changeSymbol = cg.symbol;
    }
  }

  const fetchAI = async ()=>{
    if(!lines)return;setAiLoading(true);
    const data={
      gua:guaName,symbol:guaSymbol,desc:guaDesc,
      changeTo:changeName?(changeName+changeSymbol):null,
      question:question||"未说明",
      changingLines:lines.map((l,i)=>l.changing?yaos[i]:null).filter(Boolean).join("、"),
    };
    try{
      const resp=await fetch("/api/interpret",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({module:"gua",data})});
      const j=await resp.json();
      setAiText(j.content||j.error||"解读失败");
    }catch{setAiText("网络错误");}
    setAiLoading(false);
  };

  const hasChange = changeName && changeName !== guaName;

  return(
    <main className="min-h-screen pb-20 selection:bg-[var(--gold)] selection:text-white">
      <div className="w-full max-w-3xl mx-auto px-6 pt-8 pb-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600">← 灵枢</Link>
      </div>

      <section className="w-full max-w-xl mx-auto px-6 mt-4">
        <div className="text-center mb-8">
          <div className="text-4xl mb-4 serif text-[var(--gold)]">卦</div>
          <h1 className="text-2xl font-bold mb-2 serif">易经卜卦</h1>
          <p className="text-sm text-gray-400">心诚则灵 · 一事一占</p>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6">
          <label className="block text-xs text-gray-400 mb-2">心中所问（可留空）</label>
          <textarea value={question} onChange={e=>setQuestion(e.target.value)} rows={2}
            placeholder="默念一件事，再起卦。如：近期是否宜变动工作？"
            className="w-full bg-[var(--silk)] rounded-xl p-4 text-sm outline-none resize-none focus:ring-2 focus:ring-[var(--gold)] mb-4"/>
          <button onClick={()=>{cast();setAiText("")}}
            className="w-full bg-[var(--ink)] hover:bg-black text-white rounded-full py-4 font-semibold tracking-wider shadow-lg">
            起 卦
          </button>
        </div>

        <AnimatePresence>
          {showResult&&lines&&(
            <motion.div initial={{opacity:0,y:12}} animate={{opacity:1,y:0}}>

              {/* Hexagram display */}
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-5">
                <div className="flex items-center justify-center gap-6 flex-wrap mb-4">
                  {/* 本卦 */}
                  <div className="text-center">
                    <div className="text-[10px] text-gray-400 mb-2 tracking-wider">本卦</div>
                    <div className="text-4xl mb-2">{guaSymbol}</div>
                    <div className="text-lg font-bold serif">{guaName}</div>
                    <div className="text-[10px] text-gray-400 mt-1">#{guaNum}</div>
                  </div>

                  {/* Arrow */}
                  {hasChange&&(
                    <div className="text-[var(--rose)] text-sm">→</div>
                  )}

                  {/* 变卦 */}
                  {hasChange&&(
                    <div className="text-center">
                      <div className="text-[10px] text-gray-400 mb-2 tracking-wider">变卦</div>
                      <div className="text-4xl mb-2">{changeSymbol}</div>
                      <div className="text-lg font-bold serif text-[var(--rose)]">{changeName}</div>
                      <div className="text-[10px] text-gray-400 mt-1">#{changeNum}</div>
                    </div>
                  )}
                </div>

                {/* Yao lines */}
                <div className="flex flex-col items-center gap-1.5 mb-4">
                  {lines.slice().reverse().map((l,i)=>{
                    const idx = 5-i;
                    const yaoname = yaos[idx];
                    const yin = l.value%2===0;
                    return(
                      <div key={i} className="relative">
                        <div className={`text-[7px] text-gray-400 text-center ${l.changing?"text-[var(--rose)]":""}`}>{yaoname}</div>
                        <div className={`flex gap-3 justify-center ${l.changing?"border border-[var(--rose)]/30 rounded-lg py-0.5 px-2" : ""}`}>
                          {yin?(
                            <div className="flex gap-2">
                              <div className="w-12 h-2 rounded-sm bg-[var(--ink)] opacity-60"/>
                              <div className="w-12 h-2 rounded-sm bg-[var(--ink)] opacity-60"/>
                            </div>
                          ):(
                            <div className="w-[104px] h-2 rounded-sm bg-[var(--ink)]"/>
                          )}
                        </div>
                        {l.changing&&(<div className="text-[8px] text-[var(--rose)] text-center mt-0.5">{l.value===6?"老阴":"老阳"} · 动爻</div>)}
                      </div>
                    );
                  })}
                </div>

                {/* Gua description */}
                <div className="text-sm text-gray-600 text-center leading-relaxed mb-4 p-3 rounded-xl bg-[var(--silk)]">
                  {guaDesc}
                </div>

                {/* AI interpret button */}
                {!aiText&&!aiLoading&&(
                  <button onClick={fetchAI}
                    className="w-full bg-[var(--ink)] text-[var(--gold)] rounded-full py-3 font-bold text-sm hover:bg-black shadow-sm">
                    解卦 · AI 解读
                  </button>
                )}
                {aiLoading&&(
                  <div className="text-center py-3"><div className="animate-spin rounded-full h-6 w-6 border-2 border-t-transparent mx-auto mb-2" style={{borderColor:"var(--gold)",borderTopColor:"transparent"}}/></div>
                )}
              </div>

              {/* AI Result */}
              {aiText&&(
                <motion.div initial={{opacity:0,y:8}} animate={{opacity:1,y:0}}
                  className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-5">
                  <h3 className="text-sm font-bold text-[var(--gold)] mb-3 serif flex items-center gap-2">
                    <span className="w-1.5 h-4 bg-[var(--gold)] rounded-sm"/> AI 解卦
                  </h3>
                  <div className="text-sm text-gray-700 leading-loose whitespace-pre-line">{aiText}</div>
                </motion.div>
              )}

              {/* Recast */}
              <div className="text-center">
                <button onClick={()=>{cast();setAiText("")}}
                  className="text-xs text-gray-300 hover:text-gray-500">重新起卦</button>
              </div>

            </motion.div>
          )}
        </AnimatePresence>
      </section>
    </main>
  );
}
