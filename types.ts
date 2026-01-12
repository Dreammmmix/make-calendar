export enum MonthName {
  JAN = 'January',
  FEB = 'February',
  MAR = 'March',
  APR = 'April',
  MAY = 'May',
  JUN = 'June',
  JUL = 'July',
  AUG = 'August',
  SEP = 'September',
  OCT = 'October',
  NOV = 'November',
  DEC = 'December',
}

export const MONTHS_LIST = Object.values(MonthName);

export enum FilterType {
  NONE = 'none',
  // Risograph Styles (Ink on Paper with Cutout)
  RISO_VIOLET_MINT = 'riso-violet-mint', // Violet Ink on Mint Paper
  RISO_RED_BLUE = 'riso-red-blue',       // Red Ink on Pale Blue Paper
  RISO_BLUE_CREAM = 'riso-blue-cream',   // Blue Ink on Cream Paper
  RISO_BLACK_YELLOW = 'riso-black-yellow', // Black Ink on Yellow Paper
  
  // Gradient Maps (Duotone)
  DUOTONE_SUNSET = 'duotone-sunset',     // Deep Purple to Orange
  DUOTONE_MARINE = 'duotone-marine',     // Navy to Aqua
  
  // Engraving / Etching
  ETCHING_CHARCOAL = 'etching-charcoal', // Charcoal lines on White
  ETCHING_SEPIA = 'etching-sepia',       // Brown lines on Tan
}

export interface MonthData {
  id: number; // 0-11
  name: MonthName;
  image: string | null; // Base64 or URL
  caption: string;
  filter: FilterType;
}

export enum CalendarTheme {
  MINIMAL = 'minimal',
  ELEGANT = 'elegant',
  BOLD = 'bold',
}

export interface AppState {
  months: MonthData[];
  selectedMonthIndex: number;
  theme: CalendarTheme;
  primaryColor: string;
  isGenerating: boolean;
}