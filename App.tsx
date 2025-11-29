import React, { useState, useMemo } from 'react';
import { Scene } from './components/Simulation3D';
import { Calculator, HelpCircle, CheckCircle2, AlertTriangle, RefreshCcw, Droplets } from 'lucide-react';
import { getSimpleExplanation } from './services/geminiService';
import { OIL_DATA } from './constants';

export default function App() {
  const [volA, setVolA] = useState<number>(OIL_DATA.A.DEFAULT_VOLUME);
  const [volB, setVolB] = useState<number>(OIL_DATA.B.DEFAULT_VOLUME);
  const [bottleSize, setBottleSize] = useState<number>(1);
  const [showExplanation, setShowExplanation] = useState(false);
  const [aiContent, setAiContent] = useState<string>("");
  const [loadingAi, setLoadingAi] = useState(false);

  // Math Logic
  const { countA, countB, remA, remB, isValidDivisor, isGCD, gcdValue } = useMemo(() => {
    const cA = Math.floor(volA / bottleSize);
    const rA = volA % bottleSize;
    
    const cB = Math.floor(volB / bottleSize);
    const rB = volB % bottleSize;

    const valid = rA === 0 && rB === 0;

    // Calculate actual GCD
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const trueGCD = gcd(volA, volB);
    const isEBOB = valid && bottleSize === trueGCD;

    return {
        countA: cA,
        countB: cB,
        remA: rA,
        remB: rB,
        isValidDivisor: valid,
        isGCD: isEBOB,
        gcdValue: trueGCD
    };
  }, [volA, volB, bottleSize]);

  const handleAiExplain = async () => {
    setShowExplanation(true);
    setLoadingAi(true);
    setAiContent("");
    
    const text = await getSimpleExplanation({
      volA,
      volB,
      bottleSize,
      countA,
      countB,
      remainderA: remA,
      remainderB: remB,
      isGCD
    });
    
    setAiContent(text);
    setLoadingAi(false);
  };

  return (
    <div className="w-full h-screen relative flex flex-col bg-[#1c1917] text-orange-50 overflow-hidden font-sans">
      
      {/* Header */}
      <header className="absolute top-0 left-0 w-full p-6 z-20 pointer-events-none flex justify-between items-start">
        <div className="bg-stone-900/90 backdrop-blur-xl border border-orange-500/20 p-5 rounded-2xl shadow-2xl pointer-events-auto max-w-md">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-orange-400 to-amber-200 bg-clip-text text-transparent flex items-center gap-3">
            <Droplets className="text-orange-400" />
            Zeytinyağı Şişeleme
          </h1>
          <p className="text-stone-400 text-sm mt-3 leading-relaxed">
            İki farklı zeytinyağını hiç artmayacak şekilde eşit şişelere doldur. 
            En az şişe için <strong>En Büyük Ortak Bölen (EBOB)</strong> hacmini bul.
          </p>
        </div>

        {/* Status Panel */}
        <div className={`pointer-events-auto backdrop-blur-md border rounded-2xl p-5 min-w-[300px] transition-all duration-500 shadow-xl
            ${isGCD ? 'bg-emerald-900/90 border-emerald-500 shadow-emerald-500/20' : 
              isValidDivisor ? 'bg-amber-900/80 border-amber-500' : 'bg-red-900/80 border-red-500'}`}>
             
             <div className="flex items-center justify-between mb-4 border-b border-white/10 pb-2">
                 <span className="text-xs uppercase tracking-widest font-semibold opacity-90">Durum Paneli</span>
                 {isGCD ? <CheckCircle2 className="text-emerald-400" /> : isValidDivisor ? <AlertTriangle className="text-amber-400" /> : <AlertTriangle className="text-red-400" />}
             </div>
             
             <div className="space-y-3 font-mono">
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-orange-300">A Marka Şişe:</span>
                     <span className="font-bold text-white">{countA} adet {remA > 0 && <span className="text-red-400 text-xs">({remA}L Artan)</span>}</span>
                 </div>
                 <div className="flex justify-between items-center text-sm">
                     <span className="text-blue-300">B Marka Şişe:</span>
                     <span className="font-bold text-white">{countB} adet {remB > 0 && <span className="text-red-400 text-xs">({remB}L Artan)</span>}</span>
                 </div>
                 
                 <div className="mt-2 pt-3 border-t border-white/10 text-center">
                    {isGCD ? (
                        <div className="animate-pulse">
                            <div className="text-emerald-300 font-bold text-lg mb-1">MÜKEMMEL! (EBOB)</div>
                            <div className="text-emerald-100 text-sm">Toplam Şişe: <span className="text-xl font-bold text-white">{countA + countB}</span></div>
                        </div>
                    ) : isValidDivisor ? (
                        <div>
                           <div className="text-amber-300 font-bold">Bölünüyor ama en az değil!</div>
                           <div className="text-amber-200/60 text-xs mt-1">Daha büyük bir şişe bulabilirsin.</div>
                        </div>
                    ) : (
                        <div className="text-red-300 font-bold flex flex-col items-center">
                             <span>Yağ Artıyor!</span>
                             <span className="text-xs font-normal opacity-80">Şişe boyutu tam bölmüyor.</span>
                        </div>
                    )}
                 </div>
             </div>
        </div>
      </header>

      {/* 3D Scene */}
      <main className="flex-1 w-full h-full cursor-move z-10">
        <Scene volA={volA} volB={volB} bottleSize={bottleSize} />
      </main>

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 w-full p-6 z-30 flex justify-center pointer-events-none">
          <div className="bg-stone-900/90 backdrop-blur-xl border border-orange-500/20 p-6 rounded-2xl shadow-2xl pointer-events-auto w-full max-w-4xl flex flex-col gap-6">
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Inputs */}
                <div className="space-y-4 md:col-span-2">
                    {/* Vol A */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-orange-400">
                            <span>A Marka Miktarı</span>
                            <span>{volA} L</span>
                        </div>
                        <input 
                            type="range" min="10" max="200" step="1" 
                            value={volA} onChange={(e) => setVolA(parseInt(e.target.value))}
                            className="w-full accent-orange-500 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Vol B */}
                    <div className="space-y-1">
                        <div className="flex justify-between text-xs font-bold uppercase tracking-wider text-blue-400">
                            <span>B Marka Miktarı</span>
                            <span>{volB} L</span>
                        </div>
                        <input 
                            type="range" min="10" max="200" step="1" 
                            value={volB} onChange={(e) => setVolB(parseInt(e.target.value))}
                            className="w-full accent-blue-500 h-1.5 bg-stone-700 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                    {/* Bottle Size */}
                    <div className="space-y-1 pt-2">
                        <div className="flex justify-between text-sm font-bold uppercase tracking-wider text-white">
                            <span>Şişe Boyutu (Bölen)</span>
                            <span className="bg-white text-black px-2 py-0.5 rounded">{bottleSize} L</span>
                        </div>
                        <input 
                            type="range" min="1" max="50" step="1" 
                            value={bottleSize} onChange={(e) => setBottleSize(parseInt(e.target.value))}
                            className="w-full accent-white h-3 bg-stone-600 rounded-lg appearance-none cursor-pointer"
                        />
                    </div>
                </div>

                {/* Actions */}
                <div className="flex flex-col justify-end gap-3">
                     <button 
                        onClick={() => { setVolA(72); setVolB(48); setBottleSize(24); }} 
                        className="py-3 px-4 rounded-xl border border-stone-600 hover:bg-stone-800 text-stone-300 transition-colors flex items-center justify-center gap-2 text-sm font-medium"
                    >
                        <RefreshCcw size={16} />
                        Örnek Soruya Dön (72, 48)
                    </button>
                    <button 
                        onClick={handleAiExplain}
                        className="py-4 px-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-2"
                    >
                        <HelpCircle size={20} />
                        Yapay Zeka ile Çöz
                    </button>
                </div>
            </div>
          </div>
      </div>

      {/* AI Modal */}
      {showExplanation && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-stone-900 rounded-2xl border border-orange-500/30 shadow-2xl w-full max-w-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[80vh]">
            <div className="p-5 border-b border-white/10 flex justify-between items-center bg-orange-950/20 shrink-0">
              <h2 className="text-xl font-bold text-orange-400 flex items-center gap-2">
                <Calculator size={24} />
                EBOB Çözüm Adımları
              </h2>
              <button onClick={() => setShowExplanation(false)} className="text-stone-400 hover:text-white transition-colors bg-white/5 p-2 rounded-lg hover:bg-white/10">
                Kapat
              </button>
            </div>
            <div className="p-8 overflow-y-auto math-container bg-[#1c1917] grow">
              {loadingAi ? (
                <div className="flex flex-col items-center justify-center h-full space-y-6">
                  <div className="relative">
                    <div className="w-16 h-16 border-4 border-orange-500/30 rounded-full"></div>
                    <div className="w-16 h-16 border-4 border-orange-500 border-t-transparent rounded-full animate-spin absolute top-0 left-0"></div>
                  </div>
                  <p className="text-orange-300 animate-pulse text-lg font-medium">Bakkal Hesabı Yapılıyor...</p>
                </div>
              ) : (
                <div 
                    className="text-stone-200 leading-loose text-lg space-y-4"
                    dangerouslySetInnerHTML={{ __html: aiContent }}
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
