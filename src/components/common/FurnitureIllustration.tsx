import React from 'react';

interface FurnitureIllustrationProps {
  silhouette: string;
  colorHex?: string;
  angle?: 'front' | 'perspective' | 'detail';
  className?: string;
}

/**
 * Studio-lit architectural furniture plates rendered as crisp scalable vector scenes.
 * Reflects the active color finish, timber grain, and selected gallery viewing angle.
 */
export const FurnitureIllustration: React.FC<FurnitureIllustrationProps> = ({
  silhouette,
  colorHex = '#5C4033',
  angle = 'front',
  className = 'w-full h-full',
}) => {
  const uid = React.useId().replace(/:/g, '');
  const isLightColor =
    colorHex.toLowerCase().startsWith('#e') ||
    colorHex.toLowerCase().startsWith('#d') ||
    colorHex.toLowerCase().startsWith('#c');
  const woodDark = isLightColor ? '#4D3628' : colorHex;
  const cushionTone = colorHex;
  const trimTone = isLightColor ? '#8A6240' : '#D5C7B6';

  const transformGroup =
    angle === 'perspective'
      ? 'translate(200, 155) skewY(-2) scale(0.96) translate(-200, -155)'
      : angle === 'detail'
      ? 'translate(200, 155) scale(1.24) translate(-200, -162)'
      : '';

  const renderPiece = () => {
    switch (silhouette) {
      case 'sofa-modular':
      case 'sofa-curved':
      case 'outdoor-sofa': {
        const isCurved = silhouette === 'sofa-curved';
        const isOutdoor = silhouette === 'outdoor-sofa';
        return (
          <g transform={transformGroup}>
            {/* Shadow */}
            <ellipse cx="200" cy="242" rx="135" ry="14" fill="#2A1D15" opacity="0.12" />
            {/* Plinth / Legs */}
            {isOutdoor ? (
              <>
                <rect x="78" y="210" width="10" height="28" rx="2" fill="#8C623E" />
                <rect x="312" y="210" width="10" height="28" rx="2" fill="#8C623E" />
                <rect x="72" y="206" width="256" height="9" rx="3" fill="#9E734B" />
              </>
            ) : (
              <>
                <rect x="76" y="214" width="248" height="14" rx="2" fill="#3D281D" />
                <rect x="92" y="228" width="10" height="10" fill="#2B1A12" />
                <rect x="298" y="228" width="10" height="10" fill="#2B1A12" />
              </>
            )}
            {/* Backrest */}
            <rect
              x="74"
              y={isCurved ? 114 : 118}
              width="252"
              height="68"
              rx={isCurved ? 28 : 10}
              fill={cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.16"
              strokeWidth="1.5"
            />
            {isOutdoor && (
              <path
                d="M84 128 H316 M84 140 H316 M84 152 H316"
                stroke="#3D281D"
                strokeOpacity="0.18"
                strokeWidth="2"
              />
            )}
            {/* Seat Cushions */}
            <rect
              x="82"
              y="164"
              width="116"
              height="44"
              rx="8"
              fill={cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.16"
              strokeWidth="1.5"
            />
            <rect
              x="202"
              y="164"
              width="116"
              height="44"
              rx="8"
              fill={cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.16"
              strokeWidth="1.5"
            />
            {/* Armrests */}
            <rect
              x="64"
              y="142"
              width="26"
              height="68"
              rx="8"
              fill={cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            <rect
              x="310"
              y="142"
              width="26"
              height="68"
              rx="8"
              fill={cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            {/* Throw Pillows */}
            <rect x="96" y="132" width="36" height="32" rx="6" fill={trimTone} opacity="0.85" />
            <rect x="268" y="132" width="36" height="32" rx="6" fill={trimTone} opacity="0.85" />
          </g>
        );
      }

      case 'lounge-cane':
      case 'dining-chair':
      case 'outdoor-chair':
      case 'task-chair': {
        const isTask = silhouette === 'task-chair';
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="244" rx="76" ry="11" fill="#2A1D15" opacity="0.12" />
            {isTask ? (
              <>
                <line x1="200" y1="186" x2="200" y2="232" stroke="#302D2A" strokeWidth="8" />
                <path d="M145 236 L200 226 L255 236" stroke="#302D2A" strokeWidth="6" strokeLinecap="round" fill="none" />
                <circle cx="145" cy="240" r="5" fill="#241913" />
                <circle cx="200" cy="240" r="5" fill="#241913" />
                <circle cx="255" cy="240" r="5" fill="#241913" />
              </>
            ) : (
              <>
                <line x1="145" y1="175" x2="136" y2="240" stroke={woodDark} strokeWidth="9" strokeLinecap="round" />
                <line x1="255" y1="175" x2="264" y2="240" stroke={woodDark} strokeWidth="9" strokeLinecap="round" />
                <line x1="158" y1="175" x2="152" y2="230" stroke={woodDark} strokeWidth="7" strokeLinecap="round" opacity="0.7" />
                <line x1="242" y1="175" x2="248" y2="230" stroke={woodDark} strokeWidth="7" strokeLinecap="round" opacity="0.7" />
              </>
            )}
            {/* Backrest Frame */}
            <path
              d="M142 158 C142 100, 258 100, 258 158"
              fill="none"
              stroke={woodDark}
              strokeWidth="12"
              strokeLinecap="round"
            />
            {/* Woven Cane / Upholstery Panel */}
            <path
              d="M150 156 C150 112, 250 112, 250 156 Z"
              fill={silhouette === 'lounge-cane' ? '#D6C2A5' : cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.18"
            />
            {silhouette === 'lounge-cane' && (
              <path
                d="M162 146 H238 M168 134 H232 M180 124 H220"
                stroke="#8C6D4B"
                strokeOpacity="0.45"
                strokeWidth="1.5"
              />
            )}
            {/* Seat */}
            <rect
              x="138"
              y="162"
              width="124"
              height="24"
              rx="8"
              fill={cushionTone}
              stroke="#2C1E16"
              strokeOpacity="0.2"
              strokeWidth="1.5"
            />
            {/* Armrests */}
            <path d="M132 144 H158" stroke={woodDark} strokeWidth="8" strokeLinecap="round" />
            <path d="M242 144 H268" stroke={woodDark} strokeWidth="8" strokeLinecap="round" />
          </g>
        );
      }

      case 'dining-table':
      case 'dining-round':
      case 'outdoor-table':
      case 'boardroom-table':
      case 'desk-executive':
      case 'desk-compact': {
        const isRound = silhouette === 'dining-round';
        const isDesk = silhouette === 'desk-executive' || silhouette === 'desk-compact';
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="242" rx="135" ry="12" fill="#2A1D15" opacity="0.12" />
            {isRound ? (
              <>
                <rect x="172" y="138" width="56" height="96" rx="4" fill={woodDark} />
                <path d="M182 142 V232 M194 142 V232 M206 142 V232 M218 142 V232" stroke="#1E130D" strokeOpacity="0.25" strokeWidth="2" />
                <ellipse cx="200" cy="134" rx="115" ry="22" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.2" strokeWidth="1.5" />
                <ellipse cx="200" cy="130" rx="112" ry="19" fill="#EAE2D6" fillOpacity="0.35" />
              </>
            ) : (
              <>
                {/* Legs / Trestle */}
                <rect x="92" y="144" width="16" height="94" rx="2" fill={woodDark} />
                <rect x="292" y="144" width="16" height="94" rx="2" fill={woodDark} />
                <rect x="104" y="196" width="192" height="8" fill={woodDark} opacity="0.7" />
                {isDesk && (
                  <>
                    <rect x="108" y="144" width="184" height="24" fill={woodDark} opacity="0.9" />
                    <line x1="200" y1="144" x2="200" y2="168" stroke="#FAF8F5" strokeOpacity="0.25" strokeWidth="1.5" />
                    <rect x="142" y="154" width="22" height="3" rx="1" fill="#C9A87C" />
                    <rect x="236" y="154" width="22" height="3" rx="1" fill="#C9A87C" />
                  </>
                )}
                {/* Tabletop */}
                <rect
                  x="64"
                  y="128"
                  width="272"
                  height="18"
                  rx="4"
                  fill={woodDark}
                  stroke="#2C1E16"
                  strokeOpacity="0.22"
                />
                {silhouette === 'outdoor-table' && (
                  <path d="M74 134 H326 M74 140 H326" stroke="#FAF8F5" strokeOpacity="0.25" strokeWidth="1.5" />
                )}
                {/* Architectural vessel on top */}
                <path d="M188 128 L192 104 H208 L212 128 Z" fill="#D5C7B6" stroke="#8C7D70" strokeWidth="1" />
              </>
            )}
          </g>
        );
      }

      case 'coffee-table':
      case 'outdoor-drum': {
        const isDrum = silhouette === 'outdoor-drum';
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="236" rx={isDrum ? 58 : 118} ry="12" fill="#2A1D15" opacity="0.12" />
            {isDrum ? (
              <>
                <path
                  d="M158 145 Q176 190 154 232 H246 Q224 190 242 145 Z"
                  fill={cushionTone}
                  stroke="#2C1E16"
                  strokeOpacity="0.2"
                  strokeWidth="1.5"
                />
                <ellipse cx="200" cy="145" rx="42" ry="9" fill="#EAE2D6" stroke="#2C1E16" strokeOpacity="0.16" />
              </>
            ) : (
              <>
                <rect x="115" y="182" width="44" height="48" rx="3" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.18" />
                <rect x="241" y="182" width="44" height="48" rx="3" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.18" />
                <rect x="84" y="160" width="232" height="24" rx="4" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.2" />
                <rect x="172" y="150" width="56" height="10" rx="2" fill="#3D281D" />
              </>
            )}
          </g>
        );
      }

      case 'credenza':
      case 'sideboard':
      case 'dresser':
      case 'nightstand':
      case 'pedestal': {
        const isTall = silhouette === 'sideboard' || silhouette === 'dresser';
        const isCompact = silhouette === 'nightstand' || silhouette === 'pedestal';
        const w = isCompact ? 124 : 236;
        const x = (400 - w) / 2;
        const h = isTall ? 98 : isCompact ? 88 : 74;
        const y = isTall ? 124 : isCompact ? 132 : 144;
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="242" rx={w / 2 + 12} ry="11" fill="#2A1D15" opacity="0.12" />
            <rect x={x + 14} y={y + h} width="10" height="20" fill="#2C1E16" />
            <rect x={x + w - 24} y={y + h} width="10" height="20" fill="#2C1E16" />
            <rect
              x={x}
              y={y}
              width={w}
              height={h}
              rx="4"
              fill={woodDark}
              stroke="#2C1E16"
              strokeOpacity="0.22"
              strokeWidth="1.5"
            />
            {isCompact ? (
              <>
                <rect x={x + 10} y={y - 6} width={w - 20} height="6" rx="1" fill="#DFD6C7" />
                <line x1={x + 12} y1={y + h / 2} x2={x + w - 12} y2={y + h / 2} stroke="#FAF8F5" strokeOpacity="0.25" />
                <rect x="190" y={y + 18} width="20" height="3" rx="1" fill="#C9A87C" />
                <rect x="190" y={y + h / 2 + 18} width="20" height="3" rx="1" fill="#C9A87C" />
              </>
            ) : (
              <>
                <line x1={x + w / 3} y1={y + 8} x2={x + w / 3} y2={y + h - 8} stroke="#FAF8F5" strokeOpacity="0.22" strokeWidth="1.5" />
                <line x1={x + (2 * w) / 3} y1={y + 8} x2={x + (2 * w) / 3} y2={y + h - 8} stroke="#FAF8F5" strokeOpacity="0.22" strokeWidth="1.5" />
                {/* Fluting texture */}
                <path
                  d={`M${x + 18} ${y + 10} V${y + h - 10} M${x + 30} ${y + 10} V${y + h - 10} M${x + 42} ${y + 10} V${y + h - 10} M${x + w - 18} ${y + 10} V${y + h - 10} M${x + w - 30} ${y + 10} V${y + h - 10}`}
                  stroke="#1E120C"
                  strokeOpacity="0.22"
                  strokeWidth="2"
                />
                {/* Brass pulls */}
                <rect x={x + w / 2 - 14} y={y + h / 2 - 2} width="28" height="4" rx="2" fill="#C9A87C" />
              </>
            )}
          </g>
        );
      }

      case 'bed-king':
      case 'bed-queen': {
        const w = silhouette === 'bed-king' ? 248 : 210;
        const x = (400 - w) / 2;
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="242" rx={w / 2 + 18} ry="12" fill="#2A1D15" opacity="0.12" />
            {/* Headboard */}
            <rect x={x - 10} y="92" width={w + 20} height="86" rx="6" fill={woodDark} />
            <rect x={x + 6} y="104" width={w - 12} height="56" rx="4" fill="#E8E1D5" stroke="#2C1E16" strokeOpacity="0.15" />
            {/* Pillows */}
            <rect x={x + 18} y="128" width={w / 2 - 26} height="28" rx="6" fill="#FAF8F5" stroke="#D5C7B6" />
            <rect x={208} y="128" width={w / 2 - 26} height="28" rx="6" fill="#FAF8F5" stroke="#D5C7B6" />
            {/* Mattress & Duvet */}
            <rect x={x + 4} y="156" width={w - 8} height="54" rx="6" fill="#F4EFE7" stroke="#C7B8A5" />
            <rect x={x + 4} y="174" width={w - 8} height="36" rx="4" fill="#D9CEBF" />
            {/* Timber Bed Frame */}
            <rect x={x - 8} y="206" width={w + 16} height="16" rx="3" fill={woodDark} />
            <rect x={x + 10} y="222" width="12" height="14" fill="#2C1E16" />
            <rect x={x + w - 22} y="222" width="12" height="14" fill="#2C1E16" />
          </g>
        );
      }

      case 'shelving':
      case 'bookcase':
      case 'wardrobe': {
        const isWardrobe = silhouette === 'wardrobe';
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="244" rx="92" ry="11" fill="#2A1D15" opacity="0.12" />
            <rect x="128" y="64" width="144" height="172" rx="4" fill={isWardrobe ? woodDark : 'none'} stroke={woodDark} strokeWidth="6" />
            {isWardrobe ? (
              <>
                <line x1="200" y1="64" x2="200" y2="236" stroke="#FAF8F5" strokeOpacity="0.3" strokeWidth="2" />
                <path d="M140 82 H188 M140 94 H188 M140 106 H188 M212 82 H260 M212 94 H260 M212 106 H260" stroke="#1E130D" strokeOpacity="0.25" strokeWidth="2" />
                <rect x="188" y="142" width="5" height="24" rx="2" fill="#C9A87C" />
                <rect x="207" y="142" width="5" height="24" rx="2" fill="#C9A87C" />
              </>
            ) : (
              <>
                <line x1="128" y1="106" x2="272" y2="106" stroke={woodDark} strokeWidth="5" />
                <line x1="128" y1="150" x2="272" y2="150" stroke={woodDark} strokeWidth="5" />
                <line x1="128" y1="194" x2="272" y2="194" stroke={woodDark} strokeWidth="5" />
                <rect x="148" y="84" width="22" height="22" rx="2" fill="#D5C7B6" />
                <rect x="218" y="124" width="32" height="26" rx="2" fill="#8A6240" opacity="0.7" />
              </>
            )}
          </g>
        );
      }

      case 'bench':
      case 'bench-upholstered':
      case 'sun-lounger': {
        const isLounger = silhouette === 'sun-lounger';
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="238" rx="125" ry="11" fill="#2A1D15" opacity="0.12" />
            {isLounger ? (
              <>
                <path d="M90 198 L145 148 L158 156 L110 202 Z" fill={cushionTone} />
                <rect x="108" y="186" width="196" height="16" rx="6" fill="#EFECE6" stroke="#C7B8A5" />
                <rect x="92" y="200" width="218" height="10" rx="2" fill={woodDark} />
                <circle cx="106" cy="222" r="10" fill={woodDark} />
                <rect x="282" y="210" width="10" height="22" fill={woodDark} />
              </>
            ) : (
              <>
                <rect x="102" y="180" width="10" height="52" fill={woodDark} />
                <rect x="288" y="180" width="10" height="52" fill={woodDark} />
                <rect x="84" y="156" width="232" height="28" rx="7" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.2" />
              </>
            )}
          </g>
        );
      }

      case 'bar-stool': {
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="244" rx="54" ry="9" fill="#2A1D15" opacity="0.12" />
            <line x1="168" y1="152" x2="156" y2="240" stroke="#3D281D" strokeWidth="8" strokeLinecap="round" />
            <line x1="232" y1="152" x2="244" y2="240" stroke="#3D281D" strokeWidth="8" strokeLinecap="round" />
            <line x1="162" y1="205" x2="238" y2="205" stroke="#C9A87C" strokeWidth="4" />
            <rect x="158" y="114" width="84" height="36" rx="10" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.2" />
          </g>
        );
      }

      case 'bistro-set':
      default: {
        return (
          <g transform={transformGroup}>
            <ellipse cx="200" cy="240" rx="115" ry="12" fill="#2A1D15" opacity="0.12" />
            {/* Left Chair */}
            <path d="M98 158 C98 124, 146 124, 146 158" fill="none" stroke={cushionTone} strokeWidth="7" />
            <rect x="98" y="158" width="48" height="12" rx="4" fill={cushionTone} />
            <line x1="104" y1="170" x2="100" y2="228" stroke="#3D281D" strokeWidth="5" />
            <line x1="140" y1="170" x2="144" y2="228" stroke="#3D281D" strokeWidth="5" />
            {/* Center Bistro Table */}
            <line x1="200" y1="144" x2="200" y2="232" stroke="#3D281D" strokeWidth="7" />
            <line x1="176" y1="232" x2="224" y2="232" stroke="#3D281D" strokeWidth="6" strokeLinecap="round" />
            <ellipse cx="200" cy="144" rx="46" ry="10" fill={cushionTone} stroke="#2C1E16" strokeOpacity="0.2" />
            {/* Right Chair */}
            <path d="M254 158 C254 124, 302 124, 302 158" fill="none" stroke={cushionTone} strokeWidth="7" />
            <rect x="254" y="158" width="48" height="12" rx="4" fill={cushionTone} />
            <line x1="260" y1="170" x2="256" y2="228" stroke="#3D281D" strokeWidth="5" />
            <line x1="296" y1="170" x2="300" y2="228" stroke="#3D281D" strokeWidth="5" />
          </g>
        );
      }
    }
  };

  return (
    <svg
      viewBox="0 0 400 300"
      className={className}
      role="img"
      aria-label={`Studio view of ${silhouette}`}
    >
      <defs>
        <radialGradient id={`studio-${uid}`} cx="50%" cy="40%" r="65%">
          <stop offset="0%" stopColor="#FAF7F2" />
          <stop offset="65%" stopColor="#EFE7DB" />
          <stop offset="100%" stopColor="#E4D9C8" />
        </radialGradient>
        <linearGradient id={`plinth-${uid}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#E7DEC9" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#D7CBB9" stopOpacity="0.7" />
        </linearGradient>
      </defs>
      <rect width="400" height="300" fill={`url(#studio-${uid})`} />
      {/* Subtle architectural gallery horizon */}
      <rect y="220" width="400" height="80" fill={`url(#plinth-${uid})`} />
      <line x1="0" y1="220" x2="400" y2="220" stroke="#D1C4B2" strokeWidth="1" />
      {renderPiece()}
    </svg>
  );
};
