import React, { useState, useRef, useEffect } from 'react';
import { MONTHS_LIST, MonthData, CalendarTheme, FilterType } from './types';
import { generateAllCaptions, generateCalendarCaption, remixImageWithAI } from './services/geminiService';
import CalendarView from './components/CalendarView';
import SvgFilters from './components/SvgFilters';
import { readFileAsBase64, downloadCalendarAsImage } from './utils/imageUtils';
import { 
  UploadIcon, LeftIcon, RightIcon, MagicIcon, DownloadIcon, 
  ImageIconIcon, ResetIcon, PaletteIcon, LayoutIcon, SparklesIcon
} from './components/Icons';

// Initial Data
const INITIAL_DATA: MonthData[] = MONTHS_LIST.map((name, index) => ({
  id: index,
  name,
  image: null,
  caption: '',
  filter: FilterType.NONE,
}));

export default function App() {
  const [hasApiKey, setHasApiKey] = useState(false);
  const [months, setMonths] = useState<MonthData[]>(INITIAL_DATA);
  const [currentMonthIdx, setCurrentMonthIdx] = useState(0);
  const [theme, setTheme] = useState<CalendarTheme>(CalendarTheme.MINIMAL);
  const [primaryColor, setPrimaryColor] = useState('#2C2C2C');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isRemixing, setIsRemixing] = useState(false);
  const [remixPrompt, setRemixPrompt] = useState('');
  
  const calendarRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // --- API Key Check ---
  useEffect(() => {
    const checkKey = async () => {
      // @ts-ignore
      if (window.aistudio) {
        // @ts-ignore
        const hasKey = await window.aistudio.hasSelectedApiKey();
        setHasApiKey(hasKey);
      }
    };
    checkKey();
  }, []);

  const handleConnect = async () => {
    // @ts-ignore
    if (window.aistudio) {
      // @ts-ignore
      await window.aistudio.openSelectKey();
      // Assume success after interaction to avoid race conditions
      setHasApiKey(true);
    }
  };

  // --- Handlers ---

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, index?: number) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // If specific index (single upload)
    if (typeof index === 'number') {
      const file = files[0];
      const base64 = await readFileAsBase64(file);
      updateMonth(index, { image: base64 });
    } else {
      // Bulk upload (fill starting from current or 0?)
      const newMonths = [...months];
      for (let i = 0; i < Math.min(files.length, 12); i++) {
        const base64 = await readFileAsBase64(files[i]);
        newMonths[i].image = base64;
      }
      setMonths(newMonths);
    }
    // Reset input
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const updateMonth = (index: number, data: Partial<MonthData>) => {
    setMonths(prev => {
      const next = [...prev];
      next[index] = { ...next[index], ...data };
      return next;
    });
  };

  const handleMagicFill = async () => {
    const currentData = months[currentMonthIdx];
    if (!currentData.image) return;

    setIsProcessing(true);
    try {
      const caption = await generateCalendarCaption(currentData.image.split(',')[1], currentData.name);
      updateMonth(currentMonthIdx, { caption });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMagicFillAll = async () => {
    // Check if any images exist
    const hasImages = months.some(m => m.image);
    if (!hasImages) {
        alert("Please upload at least one image.");
        return;
    }

    setIsProcessing(true);
    try {
      const results = await generateAllCaptions(months);
      setMonths(prev => {
        const next = [...prev];
        results.forEach(({ id, caption }) => {
          next[id].caption = caption;
        });
        return next;
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRemixImage = async () => {
    const currentData = months[currentMonthIdx];
    if (!currentData.image || !remixPrompt.trim()) return;

    setIsRemixing(true);
    try {
      const base64Clean = currentData.image.split(',')[1];
      const newImage = await remixImageWithAI(base64Clean, remixPrompt);
      if (newImage) {
        updateMonth(currentMonthIdx, { image: newImage });
        setRemixPrompt(''); // Clear prompt on success
      }
    } catch (e) {
      alert("Failed to remix image. Please try a different prompt or check API limits.");
    } finally {
      setIsRemixing(false);
    }
  };

  const handleDownload = () => {
    if (calendarRef.current) {
      downloadCalendarAsImage(calendarRef.current, `Calendar-${months[currentMonthIdx].name}-2025`);
    }
  };

  const triggerSingleUpload = (index: number) => {
    document.getElementById(`file-input-${index}`)?.click();
  };


  // --- Render Helpers ---
  const currentMonth = months[currentMonthIdx];

  const getFilterPreviewColor = (type: FilterType) => {
    switch (type) {
      case FilterType.RISO_VIOLET_MINT: return 'linear-gradient(135deg, #d1fae5 50%, #4c1d95 50%)';
      case FilterType.RISO_RED_BLUE: return 'linear-gradient(135deg, #e0f2fe 50%, #dc2626 50%)';
      case FilterType.RISO_BLUE_CREAM: return 'linear-gradient(135deg, #fef3c7 50%, #1e3a8a 50%)';
      case FilterType.RISO_BLACK_YELLOW: return 'linear-gradient(135deg, #fde047 50%, #111 50%)';
      case FilterType.DUOTONE_SUNSET: return 'linear-gradient(135deg, #581c87 0%, #ea580c 100%)';
      case FilterType.DUOTONE_MARINE: return 'linear-gradient(135deg, #0f172a 0%, #06b6d4 100%)';
      case FilterType.ETCHING_CHARCOAL: return 'linear-gradient(135deg, #fff 50%, #333 50%)';
      case FilterType.ETCHING_SEPIA: return 'linear-gradient(135deg, #f5f5dc 50%, #78350f 50%)';
      default: return '#eee';
    }
  };

  const getFilterName = (type: FilterType) => {
    switch (type) {
      case FilterType.RISO_VIOLET_MINT: return 'Mint/Vio';
      case FilterType.RISO_RED_BLUE: return 'Blue/Red';
      case FilterType.RISO_BLUE_CREAM: return 'Cream/Blue';
      case FilterType.RISO_BLACK_YELLOW: return 'Yell/Blk';
      case FilterType.DUOTONE_SUNSET: return 'Sunset';
      case FilterType.DUOTONE_MARINE: return 'Marine';
      case FilterType.ETCHING_CHARCOAL: return 'Etch B&W';
      case FilterType.ETCHING_SEPIA: return 'Etch Sepia';
      default: return 'None';
    }
  };
  
  const getPreviewFilterStyle = (filter: FilterType) => {
    switch (filter) {
      case FilterType.RISO_VIOLET_MINT: return { filter: 'url(#ink-violet)', backgroundColor: '#d1fae5', mixBlendMode: 'multiply' };
      case FilterType.RISO_RED_BLUE: return { filter: 'url(#ink-red)', backgroundColor: '#e0f2fe', mixBlendMode: 'multiply' };
      case FilterType.RISO_BLUE_CREAM: return { filter: 'url(#ink-blue)', backgroundColor: '#fef3c7', mixBlendMode: 'multiply' };
      case FilterType.RISO_BLACK_YELLOW: return { filter: 'url(#ink-black)', backgroundColor: '#fde047', mixBlendMode: 'multiply' };
      case FilterType.DUOTONE_SUNSET: return { filter: 'url(#duotone-sunset)' };
      case FilterType.DUOTONE_MARINE: return { filter: 'url(#duotone-marine)' };
      case FilterType.ETCHING_CHARCOAL: return { filter: 'url(#etching-charcoal)' };
      case FilterType.ETCHING_SEPIA: return { filter: 'url(#etching-sepia)', backgroundColor: '#f5f5dc', mixBlendMode: 'multiply' };
      default: return {};
    }
  };

  // --- Landing Screen for API Key ---
  if (!hasApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
        <div className="max-w-md w-full bg-white shadow-2xl rounded-2xl p-10">
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">Yearly</h1>
          <p className="text-gray-500 mb-8">
            Create beautiful, AI-powered calendars using the latest Gemini models.
          </p>
          <div className="space-y-4">
             <button
              onClick={handleConnect}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
               Connect Google AI
            </button>
            <p className="text-xs text-gray-400">
               Access to <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="underline hover:text-blue-500">paid Gemini models</a> is required for image generation.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F0F0F0] text-gray-800 font-sans flex flex-col md:flex-row overflow-hidden">
      <SvgFilters />

      {/* LEFT SIDEBAR: Controls & Grid */}
      <aside className="w-full md:w-[400px] bg-white border-r border-gray-200 flex flex-col h-screen z-20 shadow-xl">
        <div className="p-6 border-b border-gray-100">
          <h1 className="text-2xl font-serif font-bold text-charcoal tracking-tight flex items-center gap-2">
            <span className="text-3xl">✦</span> Yearly
          </h1>
          <p className="text-xs text-gray-500 mt-1 uppercase tracking-widest">AI Calendar Studio</p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-8 no-scrollbar">
          {/* 1. Theme Selection */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <LayoutIcon size={14} /> Style
            </h3>
            <div className="grid grid-cols-3 gap-2">
              {Object.values(CalendarTheme).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={`py-2 px-1 text-xs font-medium rounded-md border transition-all capitalize
                    ${theme === t 
                      ? 'border-gray-800 bg-gray-800 text-white' 
                      : 'border-gray-200 text-gray-600 hover:border-gray-400'
                    }`}
                >
                  {t}
                </button>
              ))}
            </div>
          </section>

          {/* 2. Color Selection */}
          <section>
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
              <PaletteIcon size={14} /> Accent Color
            </h3>
            <div className="flex gap-3">
              {['#2C2C2C', '#5D4037', '#1976D2', '#388E3C', '#C2185B', '#F57C00'].map(c => (
                <button
                  key={c}
                  onClick={() => setPrimaryColor(c)}
                  className={`w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 ${primaryColor === c ? 'border-gray-900 ring-1 ring-offset-2 ring-gray-300' : 'border-transparent'}`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
          </section>

          {/* 3. Global Actions */}
          <section className="bg-gray-50 p-4 rounded-xl border border-gray-100">
            <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2">
              <MagicIcon size={14} /> AI Tools
            </h3>
            <button
              onClick={handleMagicFillAll}
              disabled={isProcessing}
              className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-sm font-medium py-3 rounded-lg shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isProcessing ? (
                <span className="animate-pulse">Thinking...</span>
              ) : (
                <>
                  <MagicIcon size={16} /> Auto-Caption All
                </>
              )}
            </button>
          </section>

          {/* 4. Month Grid Navigation */}
          <section>
             <div className="flex justify-between items-end mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <ImageIconIcon size={14} /> Months
                </h3>
                <label className="text-[10px] text-blue-600 cursor-pointer font-medium hover:underline">
                  Bulk Upload
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    className="hidden" 
                    onChange={(e) => handleFileUpload(e)} 
                  />
                </label>
             </div>
            
            <div className="grid grid-cols-3 gap-3">
              {months.map((m, idx) => (
                <div 
                  key={m.id}
                  onClick={() => setCurrentMonthIdx(idx)}
                  className={`relative aspect-square rounded-lg border-2 cursor-pointer overflow-hidden group transition-all
                    ${currentMonthIdx === idx ? 'border-gray-800 ring-2 ring-gray-100' : 'border-transparent hover:border-gray-300'}
                  `}
                >
                  <div 
                     className="absolute inset-0 z-0 bg-gray-100 overflow-hidden"
                     style={{ backgroundColor: (getPreviewFilterStyle(m.filter) as any).backgroundColor || '#f3f4f6' }}
                  >
                    {m.image ? (
                      <img 
                        src={m.image} 
                        alt={m.name} 
                        className="w-full h-full object-cover" 
                        style={{ 
                          filter: (getPreviewFilterStyle(m.filter) as any).filter,
                          mixBlendMode: (getPreviewFilterStyle(m.filter) as any).mixBlendMode 
                        }}
                      />
                    ) : (
                       <div className="w-full h-full flex items-center justify-center">
                         <span className="text-xs text-gray-400 font-medium">{m.name.slice(0, 3)}</span>
                      </div>
                    )}
                  </div>
                  {currentMonthIdx === idx && (
                    <div className="absolute inset-0 z-10 bg-black/10 flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full shadow-sm"></div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </div>
      </aside>

      {/* MAIN CONTENT: Editor & Preview */}
      <main className="flex-1 relative flex flex-col h-screen overflow-hidden">
        
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-200 bg-white flex items-center justify-between px-8 shadow-sm z-10">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setCurrentMonthIdx(prev => Math.max(0, prev - 1))}
              disabled={currentMonthIdx === 0}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <LeftIcon size={20} />
            </button>
            <span className="text-lg font-serif font-bold min-w-[120px] text-center">
              {currentMonth.name}
            </span>
            <button 
              onClick={() => setCurrentMonthIdx(prev => Math.min(11, prev + 1))}
              disabled={currentMonthIdx === 11}
              className="p-2 rounded-full hover:bg-gray-100 disabled:opacity-30 transition-colors"
            >
              <RightIcon size={20} />
            </button>
          </div>

          <div className="flex gap-3">
             <button 
                onClick={() => updateMonth(currentMonthIdx, { caption: '', image: null, filter: FilterType.NONE })}
                className="px-4 py-2 text-sm text-gray-500 hover:text-red-500 font-medium transition-colors flex items-center gap-2"
              >
                <ResetIcon size={16} /> Reset
              </button>
             <button 
              onClick={handleDownload}
              className="px-6 py-2 bg-charcoal text-white rounded-full text-sm font-medium shadow-lg hover:shadow-xl hover:bg-black transition-all flex items-center gap-2"
            >
              <DownloadIcon size={16} /> Download Card
            </button>
          </div>
        </div>

        {/* Workspace */}
        <div className="flex-1 bg-[#E5E5E5] flex items-center justify-center p-8 relative overflow-hidden">
           <div className="absolute inset-0 opacity-5" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>

           <div className="flex gap-8 items-start h-full max-h-[700px]">
              
              <div className="shadow-2xl rounded-sm overflow-hidden transform transition-transform duration-500 ease-out hover:scale-[1.01]">
                <CalendarView 
                  ref={calendarRef}
                  data={currentMonth} 
                  theme={theme}
                  primaryColor={primaryColor}
                />
              </div>

              {/* Quick Editor Floating Panel */}
              <div className="w-80 max-h-full overflow-y-auto bg-white/90 backdrop-blur-md rounded-2xl shadow-xl p-6 flex flex-col gap-6 border border-white/50 no-scrollbar">
                 
                 {/* Image Control */}
                 <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-widest">
                      Image
                    </label>
                    <div 
                      onClick={() => triggerSingleUpload(currentMonthIdx)}
                      className="w-full aspect-video rounded-lg border-2 border-dashed border-gray-300 hover:border-blue-400 hover:bg-blue-50 transition-all cursor-pointer flex flex-col items-center justify-center gap-2 group overflow-hidden relative bg-gray-50"
                      style={{ backgroundColor: (getPreviewFilterStyle(currentMonth.filter) as any).backgroundColor || '#f9fafb' }}
                    >
                       {currentMonth.image ? (
                         <img 
                           src={currentMonth.image} 
                           className="w-full h-full object-cover group-hover:opacity-100 transition-all" 
                           style={{
                              filter: (getPreviewFilterStyle(currentMonth.filter) as any).filter,
                              mixBlendMode: (getPreviewFilterStyle(currentMonth.filter) as any).mixBlendMode 
                           }}
                         />
                       ) : (
                         <>
                           <UploadIcon className="text-gray-400 group-hover:text-blue-500" />
                           <span className="text-xs text-gray-400 font-medium">Click to upload</span>
                         </>
                       )}
                       <input 
                          id={`file-input-${currentMonthIdx}`}
                          type="file" 
                          accept="image/*" 
                          className="hidden" 
                          onChange={(e) => handleFileUpload(e, currentMonthIdx)} 
                        />
                    </div>
                 </div>

                 {/* Magic Remix Control (New) */}
                 {currentMonth.image && (
                   <div className="bg-purple-50 p-3 rounded-lg border border-purple-100">
                      <label className="text-[10px] uppercase font-bold text-purple-800 mb-2 flex items-center gap-1 tracking-widest">
                         <SparklesIcon size={12} /> Magic Remix
                      </label>
                      <div className="flex gap-2">
                        <input 
                          type="text" 
                          value={remixPrompt}
                          onChange={(e) => setRemixPrompt(e.target.value)}
                          placeholder="e.g. watercolor painting..."
                          className="flex-1 text-xs p-2 rounded border border-purple-200 outline-none focus:border-purple-400 bg-white"
                        />
                        <button
                          onClick={handleRemixImage}
                          disabled={isRemixing || !remixPrompt}
                          className="bg-purple-600 text-white rounded p-2 hover:bg-purple-700 disabled:opacity-50 transition-colors"
                        >
                           {isRemixing ? <MagicIcon className="animate-spin" size={14} /> : <MagicIcon size={14} />}
                        </button>
                      </div>
                   </div>
                 )}

                 {/* Filter Control */}
                 <div>
                    <label className="text-[10px] uppercase font-bold text-gray-400 mb-2 block tracking-widest">
                      Artistic Style
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                       <button 
                         onClick={() => updateMonth(currentMonthIdx, { filter: FilterType.NONE })}
                         className={`h-12 rounded-lg border-2 overflow-hidden relative group transition-all ${currentMonth.filter === FilterType.NONE ? 'border-gray-900 ring-1 ring-gray-300' : 'border-transparent hover:border-gray-200'}`}
                         title="None"
                       >
                         <div className="absolute inset-0 bg-gray-200 flex items-center justify-center text-[10px] font-bold text-gray-500">Normal</div>
                       </button>
                       {[
                         FilterType.RISO_VIOLET_MINT,
                         FilterType.RISO_RED_BLUE,
                         FilterType.RISO_BLUE_CREAM,
                         FilterType.RISO_BLACK_YELLOW,
                         FilterType.DUOTONE_SUNSET,
                         FilterType.DUOTONE_MARINE,
                         FilterType.ETCHING_CHARCOAL,
                         FilterType.ETCHING_SEPIA
                       ].map((f) => (
                         <button
                           key={f}
                           onClick={() => updateMonth(currentMonthIdx, { filter: f })}
                           className={`h-12 rounded-lg border-2 overflow-hidden relative transition-all ${currentMonth.filter === f ? 'border-gray-900 ring-1 ring-gray-300 scale-105' : 'border-transparent hover:scale-105 shadow-sm'}`}
                           title={getFilterName(f)}
                         >
                            <div className="absolute inset-0" style={{ background: getFilterPreviewColor(f) }}></div>
                            <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                               <span className="text-[9px] font-bold text-white uppercase tracking-wide drop-shadow-md">{getFilterName(f).split(' ')[0]}</span>
                            </div>
                         </button>
                       ))}
                    </div>
                 </div>

                 {/* Caption Control */}
                 <div>
                    <div className="flex justify-between items-center mb-2">
                       <label className="text-[10px] uppercase font-bold text-gray-400 tracking-widest">
                        Caption
                      </label>
                      <button 
                        onClick={handleMagicFill}
                        disabled={isProcessing || !currentMonth.image}
                        className="text-[10px] flex items-center gap-1 text-purple-600 font-bold hover:text-purple-800 disabled:opacity-50"
                      >
                         <MagicIcon size={10} /> {isProcessing ? 'Thinking...' : 'AI Generate'}
                      </button>
                    </div>
                    <textarea 
                      value={currentMonth.caption}
                      onChange={(e) => updateMonth(currentMonthIdx, { caption: e.target.value })}
                      placeholder="Enter a quote or caption..."
                      className="w-full h-24 p-3 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none resize-none bg-white font-serif"
                    />
                 </div>
              </div>
           </div>
        </div>
      </main>
    </div>
  );
}