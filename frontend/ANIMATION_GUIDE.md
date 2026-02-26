# Animation & Interaction Polish Guide

This document outlines all animations and micro-interactions implemented in the NovaLaunch landing page.

## Animation Principles

All animations follow these core principles:

- **GPU-Accelerated**: Use `transform` and `opacity` only for 60fps performance
- **Timing**: 200-400ms for interactions, 600ms for page load animations
- **Easing**: `cubic-bezier(0.4, 0, 0.2, 1)` for smooth, natural motion
- **Accessibility**: Full support for `prefers-reduced-motion`
- **Performance**: Hardware acceleration with `translateZ(0)` and `will-change`

## Implemented Animations

### 1. Page Load Animations

**Hero Section** (`Hero.tsx`)
- Fade in + slide up animation on load
- Staggered delays for headline, description, social proof, and CTA buttons
- Uses `animate-fade-in-up` class with custom delays (0s, 0.1s, 0.2s, 0.3s)

```tsx
className={`animate-fade-in-up opacity-0`}
style={{ animationDelay: '0.1s' }}
```

### 2. Scroll-Triggered Animations

**Features Section** (`Features.tsx`)
- Stagger animation on scroll into view
- Each feature card animates with 100ms delay between cards
- Uses `useIntersectionObserver` hook for performance

**Scroll Progress Indicator** (`ScrollProgress.tsx`)
- Fixed top bar showing page scroll progress
- Gradient color from primary to accent
- Smooth width transition with 150ms duration
- Accessible with ARIA progressbar role

### 3. Hover Micro-Interactions

**Bento Cards** (`BentoCard.tsx`)
- Scale up to 102% on hover
- Translate up by 4px for lift effect
- Step badge scales to 110% and increases opacity
- Icon scales to 110% and increases opacity
- Title color transitions to primary
- Border color intensifies
- 300ms transition duration

**Feature Cards** (`FeatureCard.tsx`)
- Translate up by 8px on hover
- Shadow glow effect (red)
- Icon background color intensifies
- 300ms transition duration

**Accordion Items** (`Accordion.tsx`)
- Border color change on hover
- Background color change on hover (white/5)
- Smooth expand/collapse with max-height transition
- Icon rotation (0° to 45°) for open/close state
- 300ms transition for all states

### 4. Button Interactions

**Press Feedback** (All buttons)
- Scale down to 97% on active/press
- 100ms transition for immediate feedback
- Applied via `btn-press-feedback` class

**Glow Pulse Effect** (Primary CTA)
- Continuous pulsing glow animation
- 2s duration with infinite loop
- Box-shadow intensity varies from 40% to 60%
- Applied via `animate-glow-pulse` class

```css
@keyframes glow-pulse {
  0%, 100% {
    box-shadow: 0 0 20px rgba(255, 59, 46, 0.4),
                0 0 40px rgba(255, 59, 46, 0.2),
                0 0 60px rgba(255, 59, 46, 0.1);
  }
  50% {
    box-shadow: 0 0 30px rgba(255, 59, 46, 0.6),
                0 0 60px rgba(255, 59, 46, 0.3),
                0 0 90px rgba(255, 59, 46, 0.15);
  }
}
```

### 5. Smooth Scroll Behavior

**Global Scroll** (`index.css`)
- Smooth scroll behavior enabled on `html` element
- Works with anchor links and programmatic scrolling
- Respects `prefers-reduced-motion`

**Custom Scroll Animation** (`LandingPage.tsx`)
- Eased scroll animation for section navigation
- 700ms duration with cubic easing
- Cancellable on user interaction

## CSS Classes Reference

### Animation Classes

| Class | Duration | Easing | Use Case |
|-------|----------|--------|----------|
| `animate-fade-in-up` | 600ms | cubic-bezier(0.4, 0, 0.2, 1) | Page load elements |
| `animate-glow-pulse` | 2s | cubic-bezier(0.4, 0, 0.6, 1) | CTA buttons |
| `btn-press-feedback` | 100ms | cubic-bezier(0.4, 0, 0.2, 1) | Button press |
| `card-parallax` | 300ms | cubic-bezier(0.4, 0, 0.2, 1) | Card hover |

### Utility Classes

- `transition-all duration-300` - Standard hover transitions
- `transition-transform duration-200` - Quick transform transitions
- `hover:scale-[1.02]` - Subtle scale on hover
- `hover:-translate-y-1` - Lift effect on hover

## Accessibility

### Reduced Motion Support

All animations respect `prefers-reduced-motion: reduce`:

```css
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }

  .animate-glow-pulse {
    animation: none !important;
  }

  .card-parallax:hover {
    transform: none !important;
  }

  .btn-press-feedback:active {
    transform: none !important;
  }
}
```

### ARIA Support

- Scroll progress has proper `progressbar` role
- Loading states have `aria-label` attributes
- All interactive elements have focus states

## Performance Optimization

### Hardware Acceleration

All animations use GPU-accelerated properties:

```css
.animate-fade-in-up {
  transform: translateZ(0);
  will-change: transform, opacity;
  backface-visibility: hidden;
}
```

### Intersection Observer

Scroll-triggered animations use `IntersectionObserver` API:
- Only animate when elements enter viewport
- `freezeOnceVisible` option prevents re-animation
- Threshold and rootMargin for optimal timing

### Lazy Loading

Below-the-fold components are lazy loaded:
- Features section
- FAQ section
- Footer
- Reduces initial bundle size and improves FCP

## Testing Checklist

- [ ] Animations run at 60fps on desktop
- [ ] Animations run smoothly on mobile devices
- [ ] No layout shift during animations
- [ ] Reduced motion preference is respected
- [ ] Scroll progress indicator updates smoothly
- [ ] Button press feedback is immediate
- [ ] Hover effects work on touch devices (tap)
- [ ] Accordion expand/collapse is smooth
- [ ] Page load animations complete without jank
- [ ] Glow pulse doesn't cause performance issues

## Browser Support

All animations are tested and supported on:
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile Safari 14+
- Chrome Android 90+

## Future Enhancements

Potential additions for future iterations:

1. **Parallax scrolling** for hero background
2. **Staggered list animations** for FAQ items
3. **Morphing shapes** in background
4. **Particle effects** on CTA hover
5. **Loading skeleton screens** for lazy-loaded content
6. **Page transition animations** between routes
7. **Confetti effect** on successful token deployment
8. **Toast notification animations** with slide-in

## Code Examples

### Adding Animation to New Component

```tsx
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

export function MyComponent() {
  const [ref, isVisible] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0.1,
    freezeOnceVisible: true,
  });

  return (
    <div 
      ref={ref}
      className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      {/* Content */}
    </div>
  );
}
```

### Adding Hover Effect

```tsx
<div className="transition-all duration-300 hover:scale-105 hover:-translate-y-2">
  {/* Content */}
</div>
```

### Adding Button Press Feedback

```tsx
<button className="btn-press-feedback transition-all duration-200">
  Click Me
</button>
```
