import React from 'react';

/**
 * Advanced SVG Filters for Risograph, Gradient Mapping, and Engraving.
 * 
 * Techniques used:
 * - LuminanceToAlpha: To "cut out" the subject by turning white areas transparent.
 * - ConvolveMatrix: For edge detection (Copperplate/Etching look).
 * - ComponentTransfer: For re-mapping colors (Gradient Map).
 */
const SvgFilters = () => {
  return (
    <svg className="absolute w-0 h-0 pointer-events-none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        {/* --- COMMON: Texture --- */}
        <filter id="paper-texture">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" result="noise" />
          <feColorMatrix type="matrix" values="0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0 0.5  0 0 0 0.1 0" in="noise" result="coloredNoise" />
          <feComposite operator="in" in="coloredNoise" in2="SourceGraphic" result="composite" />
          <feBlend mode="multiply" in="composite" in2="SourceGraphic" />
        </filter>

        {/* --- INK FILTERS (For Risograph Style) --- 
            These filters convert the image to a single color "ink" and make the light areas transparent.
        */}

        {/* 1. Violet Ink (for Mint Paper) */}
        <filter id="ink-violet">
           {/* Grayscale */}
           <feColorMatrix type="matrix" values="0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" result="gray" />
           {/* Map Luminance to Alpha (White -> Transparent, Dark -> Opaque) */}
           <feColorMatrix type="luminanceToAlpha" in="gray" result="alphaMap"/>
           <feComponentTransfer in="alphaMap" result="invertedAlpha">
              <feFuncA type="table" tableValues="1 0.1" /> 
           </feComponentTransfer>
           {/* The Ink Color: Deep Violet #4c1d95 */}
           <feFlood flood-color="#4c1d95" result="inkColor" />
           <feComposite in="inkColor" in2="invertedAlpha" operator="in" result="inkOnly" />
        </filter>

        {/* 2. Red Ink (for Blue Paper) */}
        <filter id="ink-red">
           <feColorMatrix type="matrix" values="0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" result="gray" />
           <feColorMatrix type="luminanceToAlpha" in="gray" result="alphaMap"/>
           <feComponentTransfer in="alphaMap" result="invertedAlpha">
              <feFuncA type="table" tableValues="1 0" /> 
           </feComponentTransfer>
           {/* Ink Color: Bright Red #dc2626 */}
           <feFlood flood-color="#dc2626" result="inkColor" />
           <feComposite in="inkColor" in2="invertedAlpha" operator="in" />
        </filter>

        {/* 3. Blue Ink (for Cream Paper) */}
        <filter id="ink-blue">
           <feColorMatrix type="matrix" values="0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" result="gray" />
           <feColorMatrix type="luminanceToAlpha" in="gray" result="alphaMap"/>
           <feComponentTransfer in="alphaMap" result="invertedAlpha">
              <feFuncA type="table" tableValues="1 0.05" /> 
           </feComponentTransfer>
           {/* Ink Color: Royal Blue #1e3a8a */}
           <feFlood flood-color="#1e3a8a" result="inkColor" />
           <feComposite in="inkColor" in2="invertedAlpha" operator="in" />
        </filter>

        {/* 4. Black Ink (for Yellow Paper) - Halftone feel */}
        <filter id="ink-black">
           <feColorMatrix type="matrix" values="0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" result="gray" />
           {/* High Contrast */}
           <feComponentTransfer in="gray" result="contrast">
              <feFuncR type="linear" slope="1.5" intercept="-0.2"/>
              <feFuncG type="linear" slope="1.5" intercept="-0.2"/>
              <feFuncB type="linear" slope="1.5" intercept="-0.2"/>
           </feComponentTransfer>
           <feColorMatrix type="luminanceToAlpha" in="contrast" result="alphaMap"/>
           <feComponentTransfer in="alphaMap" result="invertedAlpha">
              <feFuncA type="table" tableValues="1 0" /> 
           </feComponentTransfer>
           <feFlood flood-color="#111111" result="inkColor" />
           <feComposite in="inkColor" in2="invertedAlpha" operator="in" />
        </filter>

        {/* --- GRADIENT MAPS --- */}

        {/* 5. Duotone Sunset */}
        <filter id="duotone-sunset">
           <feColorMatrix type="matrix" values="0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" result="gray" />
           <feComponentTransfer colorInterpolationFilters="sRGB">
              <feFuncR type="table" tableValues="0.2 1.0" /> {/* Dark Purple -> Orange */}
              <feFuncG type="table" tableValues="0.0 0.8" /> 
              <feFuncB type="table" tableValues="0.4 0.2" /> 
           </feComponentTransfer>
        </filter>

        {/* 6. Duotone Marine */}
        <filter id="duotone-marine">
           <feColorMatrix type="matrix" values="0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0.21 0.72 0.07 0 0  0 0 0 1 0" result="gray" />
           <feComponentTransfer colorInterpolationFilters="sRGB">
              <feFuncR type="table" tableValues="0.0 0.5" /> {/* Deep Blue -> Cyan */}
              <feFuncG type="table" tableValues="0.1 0.9" /> 
              <feFuncB type="table" tableValues="0.4 0.9" /> 
           </feComponentTransfer>
        </filter>

        {/* --- ENGRAVING / ETCHING --- */}

        {/* 7. Etching Charcoal */}
        <filter id="etching-charcoal">
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" result="gray"/>
            {/* Edge Detection Kernel */}
            <feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 4 -1 0 -1 0" in="gray" result="edges"/>
            {/* Invert edges to get dark lines on white */}
            <feColorMatrix type="matrix" values="-1.5 0 0 0 1.2  -1.5 0 0 0 1.2  -1.5 0 0 0 1.2  0 0 0 1 0" in="edges" result="invertedEdges"/>
            {/* Add some noise for paper grain */}
             <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" result="noise"/>
             <feBlend mode="multiply" in="noise" in2="invertedEdges" />
        </filter>

        {/* 8. Etching Sepia */}
        <filter id="etching-sepia">
            <feColorMatrix type="matrix" values="0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0.33 0.33 0.33 0 0 0 0 0 1 0" result="gray"/>
            <feConvolveMatrix order="3" kernelMatrix="0 -1 0 -1 4 -1 0 -1 0" in="gray" result="edges"/>
            <feColorMatrix type="matrix" values="-2 0 0 0 1  -2 0 0 0 1  -2 0 0 0 1  0 0 0 1 0" in="edges" result="invertedEdges"/>
            {/* Map to Sepia tones */}
            <feComponentTransfer in="invertedEdges" colorInterpolationFilters="sRGB">
               <feFuncR type="table" tableValues="0.3 0.9" />
               <feFuncG type="table" tableValues="0.2 0.8" />
               <feFuncB type="table" tableValues="0.1 0.6" />
            </feComponentTransfer>
        </filter>

      </defs>
    </svg>
  );
};

export default SvgFilters;