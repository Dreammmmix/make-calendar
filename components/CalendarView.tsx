import React, { forwardRef } from 'react';
import { MonthData, CalendarTheme, FilterType } from '../types';

interface CalendarViewProps {
  data: MonthData;
  theme: CalendarTheme;
  primaryColor: string;
}

const CalendarView = forwardRef<HTMLDivElement, CalendarViewProps>(({ data, theme, primaryColor }, ref) => {
  
  // Helper to generate days for the specific month (Year 2026)
  const renderCalendarGrid = (monthIndex: number) => {
    const daysInMonth = new Date(2026, monthIndex + 1, 0).getDate();
    const startDay = new Date(2026, monthIndex, 1).getDay(); // 0 = Sun
    
    const days = [];
    // Empty slots for start
    for (let i = 0; i < startDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-8"></div>);
    }
    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      days.push(
        <div key={d} className="h-8 w-8 flex items-center justify-center text-sm font-medium text-inherit opacity-90 mx-auto">
          {d}
        </div>
      );
    }
    return days;
  };

  const weekDays = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

  /**
   * Defines the "Paper Color" and the specific SVG filter ID for each style.
   * This achieves the "Cutout" effect where the filter handles the ink, 
   * and the CSS background handles the paper.
   */
  const getFilterConfig = (filter: FilterType) => {
    switch (filter) {
      case FilterType.RISO_VIOLET_MINT:
        return { paper: '#d1fae5', filterId: 'ink-violet', blend: 'multiply' }; // Mint Paper
      case FilterType.RISO_RED_BLUE:
        return { paper: '#e0f2fe', filterId: 'ink-red', blend: 'multiply' };    // Pale Blue Paper
      case FilterType.RISO_BLUE_CREAM:
        return { paper: '#fef3c7', filterId: 'ink-blue', blend: 'multiply' };   // Cream Paper
      case FilterType.RISO_BLACK_YELLOW:
        return { paper: '#fde047', filterId: 'ink-black', blend: 'multiply' };  // Yellow Paper
      case FilterType.DUOTONE_SUNSET:
        return { paper: '#fff', filterId: 'duotone-sunset', blend: 'normal' };
      case FilterType.DUOTONE_MARINE:
        return { paper: '#fff', filterId: 'duotone-marine', blend: 'normal' };
      case FilterType.ETCHING_CHARCOAL:
        return { paper: '#ffffff', filterId: 'etching-charcoal', blend: 'normal' };
      case FilterType.ETCHING_SEPIA:
        return { paper: '#f5f5dc', filterId: 'etching-sepia', blend: 'multiply' };
      default:
        return { paper: '#f3f4f6', filterId: 'none', blend: 'normal' };
    }
  };

  const { paper, filterId, blend } = getFilterConfig(data.filter);
  const filterStyle = filterId !== 'none' ? { filter: `url(#${filterId})` } : {};
  
  // Paper texture overlay
  const PaperOverlay = () => (
     <div className="absolute inset-0 pointer-events-none z-20 opacity-40 mix-blend-multiply" 
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.4'/%3E%3C/svg%3E")` }}>
     </div>
  );

  // --- Theme: Minimal ---
  if (theme === CalendarTheme.MINIMAL) {
    return (
      <div 
        ref={ref} 
        className="w-[500px] h-[700px] bg-white shadow-2xl flex flex-col relative overflow-hidden"
        style={{ color: primaryColor }}
      >
        <PaperOverlay />
        {/* Top Image Area */}
        {/* We apply the paper color here to the background of the image container */}
        <div 
          className="h-[55%] w-full relative overflow-hidden group transition-colors duration-300"
          style={{ backgroundColor: paper }}
        >
          {data.image ? (
            <img 
              src={data.image} 
              alt={data.name} 
              className="w-full h-full object-cover transition-all duration-300"
              style={{ ...filterStyle, mixBlendMode: blend as any }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 opacity-50">
              <span className="text-4xl opacity-20">No Image</span>
            </div>
          )}
        </div>

        {/* Bottom Calendar Area */}
        <div className="h-[45%] p-8 flex flex-col items-center justify-between relative z-10">
          <div className="text-center">
            <h2 className="text-4xl font-serif tracking-widest uppercase mb-2">{data.name}</h2>
            {data.caption && (
              <p className="text-xs font-sans text-gray-400 max-w-xs mx-auto leading-relaxed">
                "{data.caption}"
              </p>
            )}
          </div>

          <div className="w-full max-w-xs mt-4">
            <div className="grid grid-cols-7 mb-2 text-center">
              {weekDays.map(d => (
                <div key={d} className="text-xs font-bold opacity-60">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-y-1 text-center">
              {renderCalendarGrid(data.id)}
            </div>
          </div>
          <div className="text-[10px] opacity-40 font-sans tracking-widest mt-4">2026</div>
        </div>
      </div>
    );
  }

  // --- Theme: Elegant (Overlay) ---
  if (theme === CalendarTheme.ELEGANT) {
    return (
      <div 
        ref={ref} 
        className="w-[500px] h-[700px] bg-white shadow-2xl relative overflow-hidden flex flex-col"
      >
        <PaperOverlay />
        {/* Full Background Image */}
        <div className="absolute inset-0 z-0" style={{ backgroundColor: paper }}>
           {data.image && (
            <img 
              src={data.image} 
              alt={data.name} 
              className="w-full h-full object-cover"
              style={{ ...filterStyle, mixBlendMode: blend as any }}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-white via-white/80 to-transparent" style={{ height: '60%', top: '40%' }}></div>
        </div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col justify-end p-10">
          <div className="mb-8">
            <h2 className="text-6xl font-alt italic text-charcoal mb-4" style={{ color: primaryColor }}>{data.name}</h2>
            {data.caption && (
               <p className="text-sm font-sans text-gray-600 border-l-2 pl-3 border-gray-300 max-w-sm">
                {data.caption}
              </p>
            )}
          </div>
          
          <div className="w-full">
            <div className="grid grid-cols-7 border-b border-gray-300 pb-2 mb-4 text-center">
               {weekDays.map(d => (
                <div key={d} className="text-xs font-bold text-gray-400">{d}</div>
              ))}
            </div>
             <div className="grid grid-cols-7 gap-y-2 text-center text-charcoal">
              {renderCalendarGrid(data.id)}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // --- Theme: Bold (Graphic) ---
  return (
    <div 
      ref={ref} 
      className="w-[500px] h-[700px] bg-paper shadow-2xl flex flex-col p-6 relative"
    >
      <PaperOverlay />
      <div className="h-full border-4 border-charcoal flex flex-col z-10 relative" style={{ borderColor: primaryColor }}>
        <div className="h-16 flex items-center justify-between px-6 border-b-4 border-charcoal" style={{ borderColor: primaryColor }}>
           <h2 className="text-3xl font-bold font-sans uppercase tracking-tighter" style={{ color: primaryColor }}>{data.name}</h2>
           <span className="text-xl font-bold text-gray-400">2026</span>
        </div>
        
        <div className="flex-grow relative overflow-hidden" style={{ backgroundColor: paper }}>
           {data.image && (
            <img 
              src={data.image} 
              alt={data.name} 
              className="w-full h-full object-cover" 
              style={{ ...filterStyle, mixBlendMode: blend as any }}
            />
          )}
          {/* Overlay text if image exists, or black if not */}
           <div className="absolute bottom-4 right-4 bg-white px-3 py-1 text-xs font-bold uppercase tracking-widest shadow-lg text-charcoal border border-charcoal">
             {data.caption || "Design System"}
           </div>
        </div>

        <div className="h-auto p-6 bg-white">
           <div className="grid grid-cols-7 mb-2 text-center">
              {weekDays.map(d => (
                <div key={d} className="text-xs font-black bg-gray-100 py-1 text-charcoal">{d}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1 text-center font-mono text-sm text-charcoal">
              {renderCalendarGrid(data.id)}
            </div>
        </div>
      </div>
    </div>
  );
});

CalendarView.displayName = 'CalendarView';

export default CalendarView;