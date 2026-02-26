# Animation Testing Checklist

Use this checklist to verify all animations and interactions are working correctly.

## Setup

```bash
cd frontend
npm install
npm run dev
```

Open browser to `http://localhost:5173` (or the port shown in terminal)

---

## ✅ Page Load Animations

### Hero Section
- [ ] Headline fades in and slides up smoothly
- [ ] Description appears after headline (0.1s delay)
- [ ] Social proof appears after description (0.2s delay)
- [ ] CTA buttons appear last (0.3s delay)
- [ ] All animations complete in ~600ms
- [ ] No layout shift during animation

**How to test**: Refresh the page and observe the hero section

---

## ✅ Scroll Progress Indicator

- [ ] Red gradient bar appears at top of page
- [ ] Bar width increases as you scroll down
- [ ] Bar reaches 100% at bottom of page
- [ ] Smooth transition (no jank)
- [ ] Bar is visible above all content (z-index 50)

**How to test**: Scroll up and down the page slowly

---

## ✅ Scroll-Triggered Animations

### Features Section
- [ ] Features fade in when scrolling into view
- [ ] Each card appears with 100ms stagger
- [ ] Animation only plays once (doesn't repeat on scroll up/down)
- [ ] Smooth opacity transition

**How to test**: Scroll down to the Features section

---

## ✅ Bento Card Hover Effects

### How It Works Section
- [ ] Card scales up to 102% on hover
- [ ] Card lifts up (translates -4px)
- [ ] Step badge scales to 110%
- [ ] Step badge opacity increases
- [ ] Title color transitions to primary/red
- [ ] Icon scales to 110%
- [ ] Icon opacity increases
- [ ] Border color intensifies
- [ ] All transitions are smooth (300ms)
- [ ] Card returns to normal when hover ends

**How to test**: Hover over each "How It Works" bento card

---

## ✅ Feature Card Hover Effects

### Features Section
- [ ] Card lifts up 8px on hover
- [ ] Red glow shadow appears
- [ ] Icon background color intensifies
- [ ] Smooth 300ms transition
- [ ] Card returns to normal when hover ends

**How to test**: Hover over each feature card

---

## ✅ Accordion Animations

### FAQ Section
- [ ] Accordion item border changes on hover
- [ ] Background color changes on hover (subtle white overlay)
- [ ] Content expands smoothly when clicked
- [ ] Content collapses smoothly when clicked again
- [ ] Plus icon rotates 45° when opening
- [ ] Plus icon rotates back to 0° when closing
- [ ] Max-height transition is smooth (300ms)
- [ ] No content cut-off during animation

**How to test**: 
1. Hover over accordion items
2. Click to expand/collapse each item
3. Rapidly click to test animation cancellation

---

## ✅ Button Press Feedback

### All Buttons
- [ ] Button scales down to 97% when clicked
- [ ] Immediate feedback (100ms)
- [ ] Returns to normal size when released
- [ ] Works on "Connect Wallet" button
- [ ] Works on "Learn More" button
- [ ] Works on header buttons

**How to test**: Click and hold each button, then release

---

## ✅ Glow Pulse Effect

### Primary CTA Button (Hero)
- [ ] "Connect Wallet" button has pulsing glow
- [ ] Glow intensity increases and decreases
- [ ] Animation loops continuously (2s cycle)
- [ ] Glow is red/primary color
- [ ] Multiple shadow layers visible
- [ ] Doesn't interfere with hover effects

**How to test**: Observe the "Connect Wallet" button in the hero section for 4-6 seconds

---

## ✅ Smooth Scroll Behavior

### Navigation Links
- [ ] Clicking "Features" scrolls smoothly
- [ ] Clicking "How It Works" scrolls smoothly
- [ ] Clicking "FAQ" scrolls smoothly
- [ ] Clicking "Home" scrolls to top smoothly
- [ ] Scroll duration is ~700ms
- [ ] Easing feels natural (not linear)
- [ ] Can interrupt scroll by scrolling manually

**How to test**: Click each navigation link in the header

---

## ✅ Reduced Motion Support

### Accessibility
- [ ] Enable "Reduce motion" in OS settings:
  - **Windows**: Settings > Ease of Access > Display > Show animations
  - **macOS**: System Preferences > Accessibility > Display > Reduce motion
  - **Linux**: Depends on desktop environment
- [ ] Refresh the page
- [ ] All animations are instant or disabled
- [ ] Glow pulse is disabled
- [ ] Scroll is instant (not smooth)
- [ ] Hover effects are minimal
- [ ] Button press feedback is disabled
- [ ] Page is still fully functional

**How to test**: Enable reduced motion in OS, then test all interactions

---

## ✅ Mobile Device Testing

### Touch Interactions
- [ ] Tap buttons for press feedback
- [ ] Scroll progress indicator works
- [ ] Smooth scroll works on touch
- [ ] Accordion expands/collapses on tap
- [ ] No hover effects stuck on tap
- [ ] Animations are smooth (no jank)
- [ ] Page is responsive

**How to test**: 
1. Open DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Select a mobile device
4. Test all interactions

---

## ✅ Performance Testing

### Chrome DevTools
- [ ] Open DevTools (F12)
- [ ] Go to Performance tab
- [ ] Click Record
- [ ] Scroll up and down the page
- [ ] Hover over cards
- [ ] Click buttons
- [ ] Stop recording
- [ ] Check frame rate (should be 60fps)
- [ ] Check for layout shifts (should be 0)
- [ ] Check for long tasks (should be minimal)

**How to test**: Follow steps above

### Lighthouse
- [ ] Open DevTools (F12)
- [ ] Go to Lighthouse tab
- [ ] Select "Performance" and "Accessibility"
- [ ] Click "Analyze page load"
- [ ] Performance score should be 90+
- [ ] Accessibility score should be 90+
- [ ] No layout shift warnings

**How to test**: Run Lighthouse audit

---

## ✅ Browser Compatibility

Test on multiple browsers:

### Chrome/Edge
- [ ] All animations work
- [ ] 60fps performance
- [ ] No visual glitches

### Firefox
- [ ] All animations work
- [ ] 60fps performance
- [ ] No visual glitches

### Safari (if available)
- [ ] All animations work
- [ ] 60fps performance
- [ ] No visual glitches

**How to test**: Open the page in each browser and run through all tests

---

## ✅ Visual Quality

### Overall Polish
- [ ] Animations feel premium and polished
- [ ] No jarring or sudden movements
- [ ] Timing feels natural
- [ ] Easing is smooth (not linear)
- [ ] Colors transition smoothly
- [ ] Shadows appear/disappear smoothly
- [ ] No flickering or flashing
- [ ] Animations enhance UX (not distract)

**How to test**: Use the page naturally and observe the overall feel

---

## Common Issues & Solutions

### Issue: Animations are choppy
**Solution**: 
- Check if hardware acceleration is enabled in browser
- Close other tabs/applications
- Check CPU usage in Task Manager

### Issue: Glow pulse not visible
**Solution**:
- Check if element has `animate-glow-pulse` class
- Verify CSS is loaded correctly
- Check browser console for errors

### Issue: Scroll progress not updating
**Solution**:
- Check browser console for errors
- Verify component is rendered
- Check if scroll event listener is attached

### Issue: Reduced motion not working
**Solution**:
- Verify OS setting is enabled
- Refresh the page after enabling
- Check if media query is supported in browser

### Issue: Accordion animation is jumpy
**Solution**:
- Check if max-height value is sufficient (500px)
- Verify transition properties are correct
- Check for conflicting CSS

---

## Sign-off

Once all items are checked:

- [ ] All animations work as expected
- [ ] Performance is 60fps
- [ ] Accessibility is maintained
- [ ] Mobile experience is smooth
- [ ] No visual glitches
- [ ] Ready for production

**Tested by**: _______________  
**Date**: _______________  
**Browser(s)**: _______________  
**Device(s)**: _______________  

---

## Notes

Use this space to document any issues found or additional observations:

```
[Your notes here]
```
