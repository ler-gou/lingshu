"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";

const CARDS = [
  { name:"愚者", emoji:"🃏", meaning:"新的开始，冒险，天真" },
  { name:"魔术师", emoji:"🎩", meaning:"创造力，技能，意志力" },
  { name:"女祭司", emoji:"🔮", meaning:"直觉，潜意识，神秘" },
  { name:"女皇", emoji:"👑", meaning:"丰饶，母性，自然" },
  { name:"皇帝", emoji:"🏰", meaning:"权威，结构，控制" },
  { name:"教皇", emoji:"📿", meaning:"传统，信仰，指导" },
  { name:"恋人", emoji:"💞", meaning:"爱情，和谐，选择" },
  { name:"战车", emoji:"⚔️", meaning:"意志，胜利，决心" },
];

export default function TarotPage() {
  const [selected, setSelected] = useState<number | null>(null);
  const [revealed, setRevealed] = useState(false);

  const draw = () => {
    const idx = Math.floor(Math.random() * CARDS.length);
    setSelected(idx);
    setRevealed(false);
    setTimeout(() => setRevealed(true), 600);
  };

  return (
    <main className="min-h-screen px-5 py-8 max-w-xl mx-auto">
      <Link href="/" className="text-sm" style={{color:"var(--color-sandalwood)"}}>← 返回</Link>
      <h1 className="text-2xl font-bold mt-6 mb-2" style={{fontFamily:'"Songti SC",serif'}}>🃏 塔罗占卜</h1>
      <p className="opacity-50 text-sm mb-8">心灵指引 · 牌阵解读</p>

      <div className="rounded-2xl p-8 text-center mb-6"
        style={{background:"var(--color-rice-paper)",border:"0.5px solid rgba(139,115,85,0.12)",minHeight:200}}>
        {selected === null ? (
          <div>
            <p className="opacity-50 text-sm mb-6">心中默念你的问题，然后点击下方按钮</p>
            <button onClick={draw}
              className="rounded-xl px-6 py-3 text-sm font-semibold"
              style={{background:"linear-gradient(135deg,#5A4A6A,#8B7E9A)",color:"#fff"}}>
              抽取一张牌
            </button>
          </div>
        ) : (
          <motion.div
            initial={{ rotateY: 90 }}
            animate={{ rotateY: revealed ? 0 : 90 }}
            transition={{ duration: 0.6 }}
          >
            <div className="text-5xl mb-3">{CARDS[selected].emoji}</div>
            <h3 className="text-xl font-bold mb-2" style={{fontFamily:'"Songti SC",serif'}}>
              {CARDS[selected].name}
            </h3>
            <p className="text-sm opacity-60">{CARDS[selected].meaning}</p>
            <button onClick={draw}
              className="mt-4 text-xs font-medium" style={{color:"var(--color-antique-gold)"}}>
              再抽一张
            </button>
          </motion.div>
        )}
      </div>
    </main>
  );
}
