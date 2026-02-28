import React from 'react';
import { LucideProps, Upload, ChevronLeft, ChevronRight, Wand2, Download, Image as ImageIcon, RotateCcw, Palette, Layout, Type } from 'lucide-react';

export const UploadIcon = (props: LucideProps) => <Upload {...props} />;
export const LeftIcon = (props: LucideProps) => <ChevronLeft {...props} />;
export const RightIcon = (props: LucideProps) => <ChevronRight {...props} />;
export const MagicIcon = (props: LucideProps) => <Wand2 {...props} />;
export const DownloadIcon = (props: LucideProps) => <Download {...props} />;
export const ImageIconIcon = (props: LucideProps) => <ImageIcon {...props} />;
export const ResetIcon = (props: LucideProps) => <RotateCcw {...props} />;
export const PaletteIcon = (props: LucideProps) => <Palette {...props} />;
export const LayoutIcon = (props: LucideProps) => <Layout {...props} />;
export const TextIcon = (props: LucideProps) => <Type {...props} />;