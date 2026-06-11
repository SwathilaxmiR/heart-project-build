// Whimsical SVG doodle background — newspapers, mics, suns, clouds, roads.
// Pure SVG so it stays sharp at any size and adds no extra requests.
export function DoodleBackdrop() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {/* gradient wash */}
      <div className="absolute inset-0 bg-gradient-to-b from-primary/5 via-background to-background" />
      <div className="absolute -top-32 -right-32 w-[420px] h-[420px] rounded-full bg-primary/10 blur-3xl" />
      <div className="absolute -bottom-40 -left-32 w-[480px] h-[480px] rounded-full bg-cat-weather-bg/40 blur-3xl" />

      <svg className="absolute inset-0 w-full h-full opacity-[0.18] dark:opacity-[0.12]" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <g id="sun">
            <circle cx="0" cy="0" r="10" fill="none" stroke="currentColor" strokeWidth="1.4" />
            {Array.from({ length: 8 }).map((_, i) => {
              const a = (i * Math.PI) / 4;
              const x1 = Math.cos(a) * 14, y1 = Math.sin(a) * 14;
              const x2 = Math.cos(a) * 20, y2 = Math.sin(a) * 20;
              return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />;
            })}
          </g>
          <g id="cloud">
            <path d="M0,0 q-10,-12 -22,-4 q-12,-4 -16,8 q-10,4 -4,14 h60 q8,-8 0,-14 q-4,-12 -18,-4 z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
          </g>
          <g id="news">
            <rect x="-22" y="-16" width="44" height="32" rx="2" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="-18" y1="-8" x2="18" y2="-8" stroke="currentColor" strokeWidth="1.4" />
            <line x1="-18" y1="-2" x2="6" y2="-2" stroke="currentColor" strokeWidth="1.2" />
            <line x1="-18" y1="3" x2="14" y2="3" stroke="currentColor" strokeWidth="1.2" />
            <line x1="-18" y1="8" x2="10" y2="8" stroke="currentColor" strokeWidth="1.2" />
          </g>
          <g id="mic">
            <rect x="-5" y="-14" width="10" height="18" rx="5" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <path d="M-10,0 q0,12 10,12 q10,0 10,-12" fill="none" stroke="currentColor" strokeWidth="1.5" />
            <line x1="0" y1="12" x2="0" y2="18" stroke="currentColor" strokeWidth="1.5" />
            <line x1="-6" y1="18" x2="6" y2="18" stroke="currentColor" strokeWidth="1.5" />
          </g>
          <g id="road">
            <path d="M-40,10 L-10,-20 L40,10 z" fill="none" stroke="currentColor" strokeWidth="1.4" />
            <line x1="-12" y1="-2" x2="-8" y2="-6" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
            <line x1="-4" y1="6" x2="0" y2="2" stroke="currentColor" strokeWidth="1.2" strokeDasharray="3 3" />
          </g>
          <g id="bolt">
            <path d="M-6,-16 L4,-2 L-2,-2 L6,16 L-4,2 L2,2 z" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinejoin="round" />
          </g>
        </defs>
        <g className="text-foreground">
          <use href="#sun" transform="translate(110 120)" />
          <use href="#cloud" transform="translate(220 80)" />
          <use href="#news" transform="translate(420 160) rotate(-8)" />
          <use href="#mic" transform="translate(620 110) rotate(12)" />
          <use href="#cloud" transform="translate(780 60) scale(0.9)" />
          <use href="#bolt" transform="translate(960 140) rotate(-10)" />
          <use href="#road" transform="translate(180 380)" />
          <use href="#news" transform="translate(340 480) rotate(6)" />
          <use href="#cloud" transform="translate(540 420) scale(1.1)" />
          <use href="#sun" transform="translate(740 360) scale(0.85)" />
          <use href="#mic" transform="translate(880 460) rotate(-14)" />
          <use href="#road" transform="translate(1040 380) scale(0.9)" />
          <use href="#bolt" transform="translate(80 620)" />
          <use href="#news" transform="translate(280 700) rotate(-4)" />
          <use href="#cloud" transform="translate(460 660)" />
          <use href="#sun" transform="translate(660 720)" />
          <use href="#mic" transform="translate(840 660) rotate(8)" />
          <use href="#road" transform="translate(1020 720) scale(0.8)" />
        </g>
      </svg>
    </div>
  );
}