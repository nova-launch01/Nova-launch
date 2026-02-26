# Animation Timing Reference

Quick reference for all animation timings and easing functions used in NovaLaunch.

## Animation Duration Chart

```
┌─────────────────────────────────────────────────────────────────┐
│ Animation Type          │ Duration │ Easing                     │
├─────────────────────────────────────────────────────────────────┤
│ Button Press            │  100ms   │ cubic-bezier(0.4,0,0.2,1) │
│ Hover Effects           │  200ms   │ cubic-bezier(0.4,0,0.2,1) │
│ Accordion Expand        │  300ms   │ cubic-bezier(0.4,0,0.2,1) │
│ Card Hover              │  300ms   │ cubic-bezier(0.4,0,0.2,1) │
│ Page Load (Fade-in-up)  │  600ms   │ cubic-bezier(0.4,0,0.2,1) │
│ Smooth Scroll           │  700ms   │ easeInOutCubic            │
│ Glow Pulse (loop)       │  2000ms  │ cubic-bezier(0.4,0,0.6,1) │
└─────────────────────────────────────────────────────────────────┘
```

## Page Load Timeline

```
Hero Section Load Animation:
0ms     ─────────────────────────────────────────────────────────
        │
        ├─ Headline starts (fade-in-up, 600ms)
        │
100ms   ├─ Description starts (fade-in-up, 600ms)
        │
200ms   ├─ Social proof starts (fade-in-up, 600ms)
        │
300ms   ├─ CTA buttons start (fade-in-up, 600ms)
        │
600ms   ├─ Headline complete
        │
700ms   ├─ Description complete
        │
800ms   ├─ Social proof complete
        │
900ms   └─ CTA buttons complete (all animations done)
```

## Feature Cards Stagger

```
Features Section Scroll-in:
0ms     ─────────────────────────────────────────────────────────
        │
        ├─ Card 1 starts (fade-in, 700ms)
        │
100ms   ├─ Card 2 starts (fade-in, 700ms)
        │
200ms   ├─ Card 3 starts (fade-in, 700ms)
        │
300ms   ├─ Card 4 starts (fade-in, 700ms)
        │
400ms   ├─ Card 5 starts (fade-in, 700ms)
        │
500ms   ├─ Card 6 starts (fade-in, 700ms)
        │
700ms   ├─ Card 1 complete
        │
800ms   ├─ Card 2 complete
        │
900ms   ├─ Card 3 complete
        │
1000ms  ├─ Card 4 complete
        │
1100ms  ├─ Card 5 complete
        │
1200ms  └─ Card 6 complete (all cards visible)
```

## Glow Pulse Cycle

```
Primary CTA Glow Animation (2s loop):
0ms     ─────────────────────────────────────────────────────────
        │ Shadow: 20px/40px/60px @ 40%/20%/10% opacity
        │
        ↓ (intensity increasing)
        │
1000ms  │ Shadow: 30px/60px/90px @ 60%/30%/15% opacity (peak)
        │
        ↓ (intensity decreasing)
        │
2000ms  │ Shadow: 20px/40px/60px @ 40%/20%/10% opacity
        │
        └─ Loop restarts
```

## Interaction Timings

### Button Press
```
0ms     ─ Normal state (scale: 1.0)
        │
        ↓ (user presses)
        │
50ms    ─ Pressed state (scale: 0.97)
        │
        ↓ (user releases)
        │
150ms   ─ Normal state (scale: 1.0)
```

### Card Hover
```
0ms     ─ Normal state (scale: 1.0, translateY: 0)
        │
        ↓ (user hovers)
        │
150ms   ─ Mid-transition
        │
300ms   ─ Hover state (scale: 1.02, translateY: -4px)
        │
        ↓ (user leaves)
        │
450ms   ─ Mid-transition
        │
600ms   ─ Normal state (scale: 1.0, translateY: 0)
```

### Accordion Expand
```
0ms     ─ Collapsed (max-height: 0, opacity: 0)
        │
        ↓ (user clicks)
        │
150ms   ─ Mid-transition
        │
300ms   ─ Expanded (max-height: 500px, opacity: 1)
```

## Easing Function Comparison

```
Linear (not used):
│
│     ╱
│   ╱
│ ╱
└─────────

Ease-out (cubic-bezier(0.4, 0, 0.2, 1)):
│
│ ╱╱╱
│╱
│
└─────────
Fast start, slow end - Used for most animations

Ease-in-out (easeInOutCubic):
│     ╱╱
│   ╱
│ ╱
└─────────
Slow start, fast middle, slow end - Used for smooth scroll
```

## Performance Targets

```
┌─────────────────────────────────────────────────────────────────┐
│ Metric                  │ Target   │ Actual                     │
├─────────────────────────────────────────────────────────────────┤
│ Frame Rate              │ 60 fps   │ ✓ 60 fps (GPU-accelerated)│
│ Layout Shift (CLS)      │ 0        │ ✓ 0 (transform/opacity)   │
│ Animation Start Delay   │ <16ms    │ ✓ Immediate               │
│ Hover Response Time     │ <100ms   │ ✓ Instant                 │
│ Button Press Feedback   │ <100ms   │ ✓ 100ms                   │
└─────────────────────────────────────────────────────────────────┘
```

## CSS Custom Properties

```css
/* Animation Durations */
--duration-instant: 100ms;
--duration-fast: 200ms;
--duration-normal: 300ms;
--duration-slow: 600ms;
--duration-slower: 700ms;

/* Easing Functions */
--ease-standard: cubic-bezier(0.4, 0, 0.2, 1);
--ease-glow: cubic-bezier(0.4, 0, 0.6, 1);

/* Transform Values */
--scale-press: 0.97;
--scale-hover: 1.02;
--scale-badge: 1.10;
--translate-lift: -4px;
--translate-lift-large: -8px;
```

## Animation Classes Quick Reference

```css
/* Page Load */
.animate-fade-in-up          /* 600ms fade + slide up */

/* Interactions */
.btn-press-feedback          /* 100ms scale down on press */
.animate-glow-pulse          /* 2s infinite glow pulse */

/* Hover Effects */
.card-parallax               /* 300ms lift + scale on hover */
.transition-all duration-300 /* Standard hover transition */

/* Scroll */
scroll-behavior: smooth      /* Native smooth scroll */
```

## Reduced Motion Overrides

When `prefers-reduced-motion: reduce` is active:

```
┌─────────────────────────────────────────────────────────────────┐
│ Animation               │ Normal    │ Reduced Motion           │
├─────────────────────────────────────────────────────────────────┤
│ Page Load               │ 600ms     │ 0.01ms (instant)         │
│ Scroll                  │ Smooth    │ Auto (instant)           │
│ Glow Pulse              │ 2s loop   │ None (disabled)          │
│ Hover Effects           │ 300ms     │ 0.01ms (instant)         │
│ Button Press            │ 100ms     │ None (disabled)          │
│ Accordion               │ 300ms     │ 0.01ms (instant)         │
└─────────────────────────────────────────────────────────────────┘
```

## Browser Compatibility

```
┌─────────────────────────────────────────────────────────────────┐
│ Feature                 │ Chrome │ Firefox │ Safari │ Edge     │
├─────────────────────────────────────────────────────────────────┤
│ CSS Animations          │ ✓ 90+  │ ✓ 88+   │ ✓ 14+  │ ✓ 90+   │
│ CSS Transforms          │ ✓ 90+  │ ✓ 88+   │ ✓ 14+  │ ✓ 90+   │
│ Intersection Observer   │ ✓ 90+  │ ✓ 88+   │ ✓ 14+  │ ✓ 90+   │
│ Prefers Reduced Motion  │ ✓ 90+  │ ✓ 88+   │ ✓ 14+  │ ✓ 90+   │
│ Smooth Scroll           │ ✓ 90+  │ ✓ 88+   │ ✓ 15.4+│ ✓ 90+   │
└─────────────────────────────────────────────────────────────────┘
```

## Tips for Developers

1. **Always use transform and opacity** for animations (GPU-accelerated)
2. **Avoid animating** width, height, top, left, margin, padding
3. **Use will-change** sparingly (only during animation)
4. **Test with reduced motion** enabled
5. **Keep durations under 1s** for interactions
6. **Use cubic-bezier** for natural easing
7. **Stagger animations** for visual interest (100-200ms delay)
8. **Test on low-end devices** to ensure 60fps

## Quick Copy-Paste Snippets

### Add fade-in-up to element
```tsx
<div className="animate-fade-in-up opacity-0" style={{ animationDelay: '0.1s' }}>
  Content
</div>
```

### Add hover lift effect
```tsx
<div className="transition-all duration-300 hover:scale-105 hover:-translate-y-2">
  Content
</div>
```

### Add button press feedback
```tsx
<button className="btn-press-feedback transition-all duration-200">
  Click Me
</button>
```

### Add glow pulse
```tsx
<button className="animate-glow-pulse">
  Primary CTA
</button>
```

### Add scroll-triggered animation
```tsx
const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

<div ref={ref} className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
  Content
</div>
```
