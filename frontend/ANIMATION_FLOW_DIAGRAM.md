# Animation Flow Diagram

Visual representation of all animations in the NovaLaunch landing page.

## Page Load Sequence

```
┌─────────────────────────────────────────────────────────────────┐
│                         PAGE LOADS                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                      HERO SECTION (0ms)                         │
├─────────────────────────────────────────────────────────────────┤
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Headline (0ms)                                           │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ "Launch Your Token on Stellar in Minutes"         │   │  │
│  │ │ [fade-in-up, 600ms]                                │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼ (100ms delay)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Description (100ms)                                      │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ "Premium, secure, and effortless..."              │   │  │
│  │ │ [fade-in-up, 600ms]                                │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼ (200ms delay)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Social Proof (200ms)                                     │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ [●●●] 1,000+ tokens deployed                       │   │  │
│  │ │ [fade-in-up, 600ms]                                │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
│                              │                                  │
│                              ▼ (300ms delay)                    │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ CTA Buttons (300ms)                                      │  │
│  │ ┌────────────────────────────────────────────────────┐   │  │
│  │ │ [Connect Wallet] [Learn More]                      │   │  │
│  │ │ [fade-in-up, 600ms] + [glow-pulse, infinite]       │   │  │
│  │ └────────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (user scrolls)
┌─────────────────────────────────────────────────────────────────┐
│                    FEATURES SECTION                             │
├─────────────────────────────────────────────────────────────────┤
│  [IntersectionObserver triggers when visible]                  │
│                                                                 │
│  Card 1 (0ms)    ──┐                                           │
│  Card 2 (100ms)  ──┤                                           │
│  Card 3 (200ms)  ──┼─► [fade-in, 700ms each]                  │
│  Card 4 (300ms)  ──┤                                           │
│  Card 5 (400ms)  ──┤                                           │
│  Card 6 (500ms)  ──┘                                           │
│                                                                 │
│  [Hover: lift -8px + glow shadow, 300ms]                       │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (user scrolls)
┌─────────────────────────────────────────────────────────────────┐
│                   HOW IT WORKS SECTION                          │
├─────────────────────────────────────────────────────────────────┤
│  [Bento Cards Grid]                                             │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐                             │
│  │   Card 1    │  │   Card 2    │                             │
│  │  [Hover]    │  │  [Hover]    │                             │
│  └─────────────┘  └─────────────┘                             │
│                                                                 │
│  Hover Effects (300ms):                                         │
│  • Scale: 1.0 → 1.02                                           │
│  • Translate: 0 → -4px                                         │
│  • Badge scale: 1.0 → 1.10                                     │
│  • Icon scale: 1.0 → 1.10                                      │
│  • Title color: white → primary                                │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼ (user scrolls)
┌─────────────────────────────────────────────────────────────────┐
│                      FAQ SECTION                                │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▶ What does deployment cost?                           │   │
│  │   [Click to expand]                                     │   │
│  └─────────────────────────────────────────────────────────┘   │
│                              │                                  │
│                              ▼ (user clicks)                    │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │ ▼ What does deployment cost?                           │   │
│  │ ┌───────────────────────────────────────────────────┐   │   │
│  │ │ Network fees are shown before confirmation...     │   │   │
│  │ │ [expand animation, 300ms]                         │   │   │
│  │ │ • Max-height: 0 → 500px                           │   │   │
│  │ │ • Opacity: 0 → 1                                  │   │   │
│  │ │ • Icon rotate: 0° → 45°                           │   │   │
│  │ └───────────────────────────────────────────────────┘   │   │
│  └─────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

## Interaction Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    USER INTERACTIONS                            │
└─────────────────────────────────────────────────────────────────┘

1. BUTTON PRESS
   ┌──────────┐
   │  Normal  │  scale: 1.0
   └──────────┘
        │
        ▼ (user presses)
   ┌──────────┐
   │ Pressed  │  scale: 0.97 [100ms]
   └──────────┘
        │
        ▼ (user releases)
   ┌──────────┐
   │  Normal  │  scale: 1.0 [100ms]
   └──────────┘

2. CARD HOVER
   ┌──────────┐
   │  Normal  │  scale: 1.0, y: 0
   └──────────┘
        │
        ▼ (user hovers)
   ┌──────────┐
   │  Hover   │  scale: 1.02, y: -4px [300ms]
   └──────────┘
        │
        ▼ (user leaves)
   ┌──────────┐
   │  Normal  │  scale: 1.0, y: 0 [300ms]
   └──────────┘

3. ACCORDION TOGGLE
   ┌──────────┐
   │ Collapsed│  max-height: 0, opacity: 0
   └──────────┘
        │
        ▼ (user clicks)
   ┌──────────┐
   │ Expanding│  [300ms transition]
   └──────────┘
        │
        ▼
   ┌──────────┐
   │ Expanded │  max-height: 500px, opacity: 1
   └──────────┘
        │
        ▼ (user clicks again)
   ┌──────────┐
   │Collapsing│  [300ms transition]
   └──────────┘
        │
        ▼
   ┌──────────┐
   │ Collapsed│  max-height: 0, opacity: 0
   └──────────┘

4. GLOW PULSE (Continuous)
   ┌──────────┐
   │  Glow 1  │  shadow: 20px @ 40% opacity
   └──────────┘
        │
        ▼ (1000ms)
   ┌──────────┐
   │  Glow 2  │  shadow: 30px @ 60% opacity (peak)
   └──────────┘
        │
        ▼ (1000ms)
   ┌──────────┐
   │  Glow 1  │  shadow: 20px @ 40% opacity
   └──────────┘
        │
        └──► (loop forever)
```

## Scroll Progress Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                    SCROLL PROGRESS                              │
└─────────────────────────────────────────────────────────────────┘

Page Top (0%)
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │ ← Progress bar (0% width)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      HERO SECTION                               │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

User Scrolls Down (25%)
┌─────────────────────────────────────────────────────────────────┐
│████████████████                                                │ ← Progress bar (25% width)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                    FEATURES SECTION                             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

User Scrolls Down (50%)
┌─────────────────────────────────────────────────────────────────┐
│████████████████████████████████                                │ ← Progress bar (50% width)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                  HOW IT WORKS SECTION                           │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

User Scrolls Down (75%)
┌─────────────────────────────────────────────────────────────────┐
│████████████████████████████████████████████████                │ ← Progress bar (75% width)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                      FAQ SECTION                                │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘

Page Bottom (100%)
┌─────────────────────────────────────────────────────────────────┐
│████████████████████████████████████████████████████████████████│ ← Progress bar (100% width)
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│                       FOOTER                                    │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

## Animation State Machine

```
┌─────────────────────────────────────────────────────────────────┐
│                   ANIMATION STATES                              │
└─────────────────────────────────────────────────────────────────┘

                    ┌──────────────┐
                    │  Page Load   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Initial    │ (opacity: 0)
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │  Animating   │ (fade-in-up, 600ms)
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Visible    │ (opacity: 1)
                    └──────────────┘
                           │
                           ├──► Hover ──► Hover State ──► Normal
                           │
                           ├──► Click ──► Pressed ──► Normal
                           │
                           └──► Scroll ──► Trigger Animations

Reduced Motion Enabled:
                    ┌──────────────┐
                    │  Page Load   │
                    └──────────────┘
                           │
                           ▼
                    ┌──────────────┐
                    │   Visible    │ (instant, no animation)
                    └──────────────┘
```

## Component Hierarchy

```
App
 │
 └─ LandingPage
     │
     ├─ ScrollProgress ──────────► [Fixed, z-index: 50]
     │                             [Updates on scroll]
     │
     ├─ Header ─────────────────► [Sticky, z-index: 20]
     │   │                         [Backdrop blur]
     │   └─ Navigation
     │       └─ Button ──────────► [Press feedback]
     │
     ├─ Hero ───────────────────► [Page load animations]
     │   │                         [Staggered fade-in-up]
     │   ├─ Headline ────────────► [0ms delay]
     │   ├─ Description ─────────► [100ms delay]
     │   ├─ Social Proof ────────► [200ms delay]
     │   └─ CTA Buttons ─────────► [300ms delay]
     │       └─ Button ──────────► [Glow pulse + press feedback]
     │
     ├─ HowItWorks ─────────────► [Bento cards]
     │   └─ BentoCard ──────────► [Hover: scale + lift]
     │                             [Badge + icon animation]
     │
     ├─ Features ───────────────► [Scroll-triggered]
     │   └─ FeatureCard ────────► [Stagger: 100ms delay]
     │                             [Hover: lift + glow]
     │
     ├─ FAQ ────────────────────► [Accordion]
     │   └─ Accordion ──────────► [Expand/collapse: 300ms]
     │                             [Icon rotation]
     │
     └─ Footer ─────────────────► [Lazy loaded]
```

## Performance Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                   PERFORMANCE PIPELINE                          │
└─────────────────────────────────────────────────────────────────┘

User Action
    │
    ▼
┌─────────────────┐
│ Event Triggered │ (click, hover, scroll)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ CSS Transition  │ (transform, opacity only)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ GPU Compositing │ (hardware accelerated)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ Paint & Render  │ (60fps, no layout shift)
└─────────────────┘
    │
    ▼
┌─────────────────┐
│ User Sees       │ (smooth animation)
└─────────────────┘

Optimization Techniques:
• transform: translateZ(0)     ──► Force GPU layer
• will-change: transform        ──► Hint to browser
• backface-visibility: hidden   ──► Prevent flicker
• Passive event listeners       ──► Better scroll perf
• IntersectionObserver          ──► Efficient triggers
```

## Accessibility Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                  ACCESSIBILITY FLOW                             │
└─────────────────────────────────────────────────────────────────┘

User Preference Check
    │
    ├─ prefers-reduced-motion: no-preference
    │   │
    │   ▼
    │  ┌─────────────────┐
    │  │ Full Animations │ (600ms, smooth transitions)
    │  └─────────────────┘
    │
    └─ prefers-reduced-motion: reduce
        │
        ▼
       ┌─────────────────┐
       │ Minimal Motion  │ (0.01ms, instant)
       └─────────────────┘
            │
            ├─ Glow pulse: disabled
            ├─ Scroll: instant (not smooth)
            ├─ Hover: instant
            └─ Press feedback: disabled

ARIA Support:
• ScrollProgress ──► role="progressbar"
• Buttons ────────► aria-label
• Accordion ──────► aria-expanded, aria-controls
• Loading ────────► aria-label="Loading..."
```

## Legend

```
┌─────────────────────────────────────────────────────────────────┐
│                         LEGEND                                  │
├─────────────────────────────────────────────────────────────────┤
│ │  Flow direction                                               │
│ ▼  Next step                                                    │
│ ──► Action/transition                                           │
│ [  ] Component or state                                         │
│ ┌──┐ Box/container                                              │
│ ●  Bullet point                                                 │
│ ═  Strong emphasis                                              │
│ ─  Connection                                                   │
└─────────────────────────────────────────────────────────────────┘
```
