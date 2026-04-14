# Visual Design & UI Characteristics

## Color Palette
| Element | Color | Notes |
|---------|-------|-------|
| Table background | `radial-gradient(#1a4d2e → #0d2818 → #091a10)` | Dark green felt |
| Header / overlays | `bg-black/40` to `bg-black/70` | Semi-transparent dark |
| Card face | `#e8e4dc` | Off-white parchment |
| Card back | Diagonal stripe `#1e3a5f` / `#1a3355` | Navy blue pattern |
| Red suits (♥♦) | `#de4b4b` | |
| Black suits (♠♣) | `#141414` | |
| Amber (primary accent) | `#fbbf24` / amber-300 | Scores, selected, buttons |
| Green (secondary) | `#22c55e` / green-400 | Opponent, online, accept |
| Red (danger) | `#ef4444` / red-700 | Decline, claim 31, stake |
| Turn indicator (active) | `bg-amber-600/80` | Bright amber pill |
| Turn indicator (waiting) | `bg-black/30 text-green-400/70` | Dim |

## Card Design
- **Size classes**: normal (5rem), medium (4.2rem), small (3.2rem)
- **Aspect ratio**: 2:3
- **Corner layout**: Top-left rank + suit (stacked)
- **Center**: Large watermark suit at 90% card width, 15% opacity
- **Selected state**: Yellow border, lifted up 0.8rem, scale 1.06, golden glow shadow
- **Fan layout**: 3 cards with -10°, 0°, +10° rotation from center 140% origin

## Card Back
```css
repeating-linear-gradient(45deg, #1e3a5f, #1e3a5f 4px, #1a3355 4px, #1a3355 8px)
```
With inner border frame (8% inset, rounded, subtle blue border)

## Trump Card
- Displayed in left sidebar with golden glow:
```css
box-shadow: 0 0 18px 4px rgba(251,191,36,0.35), 0 6px 20px rgba(0,0,0,0.4)
```

## Layout
```
┌─────────────────────────────────────────────┐
│  Header: [Title+Score] [Stake+Turn] [Status]│
├────────┬────────────────────────────────────┤
│ Trump  │  Opponent hand (face-down)    Pile │
│ Stock  │                                    │
│ Last   │  ── Trick area ──                  │
│ trick  │  (opponent cards / VS / my cards)  │
│        │                                    │
│        │  My hand (face-up, fan)       Pile │
│        │  [Double] [Play]                   │
├────────┴────────────────────────────────────┤
│                              [Chat bubble]  │
└─────────────────────────────────────────────┘
```

## Animation Style
- **Easing**: `cubic-bezier(0.22, 1, 0.36, 1)` for deals (smooth deceleration)
- **Easing**: `cubic-bezier(0.34, 1.56, 0.64, 1)` for plays/bounces (slight overshoot)
- **Multi-keyframe**: Most animations use 4-5 keyframe stops (not just 0%→100%)
- **Brightness shifts**: Cards brighten slightly mid-flight, settle to normal
- **Rotation**: Slight rotation during movement for natural card-toss feel
- **Stagger**: Cards animate with 120-350ms delays between each

## Typography
- **Font**: Space Grotesk (Google Fonts)
- **Weights**: 300 (light), 500 (medium), 700 (bold)
- Card ranks: Bold, 32% of card width
- Card suits: 24% of card width

## Responsive
- Cards scale up on `sm:` (640px+) breakpoint
- Sidebar width: 6rem default, 8rem on sm+
- Hand gap tightens on mobile
