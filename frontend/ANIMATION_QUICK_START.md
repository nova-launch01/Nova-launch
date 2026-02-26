# Animation Quick Start Guide

Get up and running with NovaLaunch animations in 5 minutes.

## 🚀 Quick Setup

```bash
cd frontend
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

## 📋 What's Included

✅ Page load animations (fade-in + slide-up)  
✅ Scroll progress indicator  
✅ Scroll-triggered animations  
✅ Hover micro-interactions  
✅ Button press feedback  
✅ Glow pulse effect on CTAs  
✅ Smooth accordion animations  
✅ Smooth scroll behavior  
✅ Full accessibility (reduced motion)  
✅ 60fps performance  

## 🎨 Using Animations in Your Components

### 1. Page Load Animation

```tsx
<div 
  className="animate-fade-in-up opacity-0"
  style={{ animationDelay: '0.2s' }}
>
  Your content
</div>
```

### 2. Scroll-Triggered Animation

```tsx
import { useIntersectionObserver } from "../../hooks/useIntersectionObserver";

function MyComponent() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div 
      ref={ref}
      className={`transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}
    >
      Your content
    </div>
  );
}
```

### 3. Hover Effect

```tsx
<div className="transition-all duration-300 hover:scale-105 hover:-translate-y-2">
  Your content
</div>
```

### 4. Button with Press Feedback

```tsx
<button className="btn-press-feedback transition-all duration-200">
  Click Me
</button>
```

### 5. Glow Pulse (Primary CTA)

```tsx
<button className="animate-glow-pulse bg-primary">
  Connect Wallet
</button>
```

## 🎯 Animation Classes

| Class | Effect | Duration |
|-------|--------|----------|
| `animate-fade-in-up` | Fade in + slide up | 600ms |
| `animate-glow-pulse` | Pulsing glow | 2s loop |
| `btn-press-feedback` | Scale down on press | 100ms |
| `transition-all duration-300` | Smooth transitions | 300ms |
| `hover:scale-105` | Scale up 5% | - |
| `hover:-translate-y-2` | Lift up 8px | - |

## 🔧 Customizing Animations

### Change Duration

```tsx
<div className="transition-all duration-500"> {/* 500ms instead of 300ms */}
  Your content
</div>
```

### Change Delay

```tsx
<div 
  className="animate-fade-in-up"
  style={{ animationDelay: '0.5s' }} {/* Delay by 500ms */}
>
  Your content
</div>
```

### Stagger Multiple Items

```tsx
{items.map((item, index) => (
  <div
    key={index}
    className="animate-fade-in-up opacity-0"
    style={{ animationDelay: `${index * 100}ms` }}
  >
    {item}
  </div>
))}
```

## ♿ Accessibility

All animations automatically respect `prefers-reduced-motion`. No extra code needed!

To test:
- **Windows**: Settings > Ease of Access > Display > Show animations (OFF)
- **macOS**: System Preferences > Accessibility > Display > Reduce motion (ON)

## 📊 Performance Tips

1. ✅ **DO** use `transform` and `opacity`
2. ✅ **DO** add `will-change` for active animations
3. ❌ **DON'T** animate `width`, `height`, `top`, `left`
4. ❌ **DON'T** use `will-change` on everything

Good:
```tsx
<div className="transition-transform duration-300 hover:scale-105">
  Content
</div>
```

Bad:
```tsx
<div className="transition-all duration-300 hover:w-full">
  Content
</div>
```

## 🧪 Testing

### Visual Test
```bash
npm run dev
```
Open browser and interact with the page.

### Unit Tests
```bash
npm run test
```

### Performance Test
1. Open Chrome DevTools (F12)
2. Go to Performance tab
3. Record while scrolling/interacting
4. Check for 60fps

## 📚 Documentation

- **Full Guide**: `ANIMATION_GUIDE.md`
- **Implementation Summary**: `ANIMATION_IMPLEMENTATION_SUMMARY.md`
- **Testing Checklist**: `ANIMATION_TESTING_CHECKLIST.md`
- **Timing Reference**: `ANIMATION_TIMING_REFERENCE.md`

## 🐛 Common Issues

### Animations not working?
- Check if CSS is loaded: `frontend/src/index.css`
- Check browser console for errors
- Verify class names are correct

### Choppy animations?
- Close other tabs/applications
- Check if hardware acceleration is enabled
- Test on different browser

### Reduced motion not working?
- Verify OS setting is enabled
- Refresh the page
- Check browser support

## 💡 Examples

### Example 1: Animated Card Grid

```tsx
function CardGrid() {
  const [ref, isVisible] = useIntersectionObserver({ threshold: 0.1 });

  return (
    <div ref={ref} className="grid grid-cols-3 gap-4">
      {cards.map((card, i) => (
        <div
          key={i}
          className={`
            transition-all duration-300
            hover:scale-105 hover:-translate-y-2
            ${isVisible ? 'opacity-100' : 'opacity-0'}
          `}
          style={{ transitionDelay: `${i * 100}ms` }}
        >
          {card.content}
        </div>
      ))}
    </div>
  );
}
```

### Example 2: Animated Button

```tsx
function AnimatedButton() {
  return (
    <button className="
      btn-press-feedback
      animate-glow-pulse
      bg-primary
      px-6 py-3
      rounded-xl
      transition-all duration-300
      hover:bg-primary-dark
      hover:shadow-glow-red
    ">
      Get Started
    </button>
  );
}
```

### Example 3: Staggered List

```tsx
function StaggeredList({ items }) {
  return (
    <ul>
      {items.map((item, i) => (
        <li
          key={i}
          className="animate-fade-in-up opacity-0"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {item}
        </li>
      ))}
    </ul>
  );
}
```

## 🎓 Next Steps

1. Read `ANIMATION_GUIDE.md` for detailed documentation
2. Run through `ANIMATION_TESTING_CHECKLIST.md`
3. Check `ANIMATION_TIMING_REFERENCE.md` for timing specs
4. Experiment with different animations
5. Test on multiple devices/browsers

## 🤝 Contributing

When adding new animations:

1. Use GPU-accelerated properties (`transform`, `opacity`)
2. Keep durations under 1s for interactions
3. Add reduced motion support
4. Test on low-end devices
5. Update documentation
6. Add unit tests

## 📞 Support

Issues? Check:
- Browser console for errors
- CSS is loaded correctly
- Class names are spelled correctly
- Component is rendered

Still stuck? Review the full documentation in `ANIMATION_GUIDE.md`.

---

**Happy animating! 🎉**
