# Design Document: Water Cycle Scroll-Based Learning

## Overview

This feature implements an interactive, scroll-based learning experience for the water cycle topic in 6th grade science using GSAP (GreenSock Animation Platform) and its ScrollTrigger plugin. The design follows a vertical scrolling narrative where each stage of the water cycle is revealed and animated as the student scrolls through the content. The implementation will integrate seamlessly with the existing Next.js 14+ application structure, using TypeScript and Tailwind CSS.

The water cycle will be broken into four main stages:
1. **Evaporation** - Water turning into vapor from oceans, lakes, and rivers
2. **Condensation** - Water vapor forming clouds
3. **Precipitation** - Rain, snow, or hail falling from clouds
4. **Collection** - Water gathering back into bodies of water

## Architecture

### Component Structure

```
app/grade/6/science/water-cycle/
├── page.tsx                          # Main page component (route)
└── scroll-learning/
    └── page.tsx                      # Scroll-based learning experience

components/
└── water-cycle-scroll.tsx            # Main scroll animation component
```

### Technology Stack

- **Next.js 14+**: App router for routing and server components
- **React 18**: Component framework
- **TypeScript**: Type safety
- **GSAP 3.x**: Animation library
- **ScrollTrigger Plugin**: Scroll-based animation triggers
- **Tailwind CSS**: Styling framework
- **Framer Motion**: Supplementary animations (already in project)

### Dependencies to Add

```json
{
  "gsap": "^3.12.5"
}
```

## Components and Interfaces

### 1. WaterCycleScroll Component

Main component that orchestrates the scroll-based learning experience.

```typescript
interface WaterCycleStage {
  id: string;
  title: string;
  description: string;
  mediaType: 'image' | 'video';
  mediaSrc: string;
  mediaAlt?: string;
  keyPoints: string[];
  vocabulary?: { term: string; definition: string }[];
}

interface WaterCycleScrollProps {
  stages: WaterCycleStage[];
  onComplete?: () => void;
}
```

**Responsibilities:**
- Initialize GSAP and ScrollTrigger on component mount
- Manage scroll-based animations for each stage
- Handle cleanup on component unmount
- Provide progress tracking
- Ensure responsive behavior across devices

### 2. StageSection Component

Individual section for each water cycle stage.

```typescript
interface StageSectionProps {
  stage: WaterCycleStage;
  index: number;
  totalStages: number;
}
```

**Responsibilities:**
- Render stage content (media + text)
- Apply GSAP animations via refs
- Handle media loading states
- Provide fallback for failed media loads

### 3. ProgressIndicator Component

Visual indicator showing progress through the content.

```typescript
interface ProgressIndicatorProps {
  currentStage: number;
  totalStages: number;
  stageNames: string[];
  onNavigate?: (stageIndex: number) => void;
}
```

**Responsibilities:**
- Display current position in the learning journey
- Show stage markers
- Allow direct navigation to stages (optional)
- Update based on scroll position

## Data Models

### WaterCycleStage Data

```typescript
const waterCycleStages: WaterCycleStage[] = [
  {
    id: 'evaporation',
    title: 'Evaporation',
    description: 'The sun heats up water in rivers, lakes, and oceans, turning it into water vapor that rises into the air.',
    mediaType: 'image',
    mediaSrc: '/water-cycle/evaporation.jpg',
    mediaAlt: 'Illustration of water evaporating from a lake',
    keyPoints: [
      'Heat from the sun causes water to evaporate',
      'Water changes from liquid to gas (water vapor)',
      'Water vapor is invisible and rises into the atmosphere'
    ],
    vocabulary: [
      { term: 'Evaporation', definition: 'The process of liquid water changing into water vapor' },
      { term: 'Water Vapor', definition: 'Water in its gas form, invisible to the eye' }
    ]
  },
  // ... other stages
];
```

## GSAP Animation Strategy

### ScrollTrigger Configuration

Each stage section will have its own ScrollTrigger instance:

```typescript
// Pseudo-code for animation setup
gsap.registerPlugin(ScrollTrigger);

// For each stage section
ScrollTrigger.create({
  trigger: sectionRef.current,
  start: 'top 80%',      // Animation starts when top of section is 80% down viewport
  end: 'bottom 20%',     // Animation ends when bottom is 20% down viewport
  scrub: 1,              // Smooth scrubbing effect
  markers: false,        // Debug markers (disable in production)
  onEnter: () => {},     // Callback when entering section
  onLeave: () => {},     // Callback when leaving section
  onEnterBack: () => {}, // Callback when scrolling back into section
  onLeaveBack: () => {}  // Callback when scrolling back out of section
});
```

### Animation Sequences

**Stage Entry Animation:**
1. Media fades in and scales from 0.8 to 1
2. Title slides in from left
3. Description fades in with slight delay
4. Key points animate in sequentially
5. Vocabulary cards slide up from bottom

**Stage Exit Animation:**
1. Content fades out slightly (maintains visibility for scroll-back)
2. Next stage begins its entry animation

### Performance Optimizations

- Use `will-change` CSS property sparingly
- Leverage GSAP's `force3D` for GPU acceleration
- Implement lazy loading for images
- Debounce scroll events if needed
- Clean up ScrollTrigger instances on unmount

## Responsive Design

### Desktop (≥1024px)
- Two-column layout: media on left, content on right
- Larger media sizes
- Horizontal animations (slide from sides)

### Tablet (768px - 1023px)
- Single column layout
- Medium media sizes
- Vertical animations (slide from top/bottom)

### Mobile (<768px)
- Single column layout
- Smaller media sizes
- Simplified animations
- Touch-optimized scrolling

### Reduced Motion Support

```typescript
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

if (prefersReducedMotion) {
  // Disable or simplify animations
  // Use instant transitions instead of animated ones
}
```

## Error Handling

### Media Loading Failures

```typescript
const [mediaError, setMediaError] = useState(false);

const handleMediaError = () => {
  setMediaError(true);
  // Log error for monitoring
  console.error('Failed to load media:', stage.mediaSrc);
};

// Render fallback UI
{mediaError && (
  <div className="fallback-content">
    <p>{stage.description}</p>
  </div>
)}
```

### GSAP Initialization Failures

```typescript
useEffect(() => {
  try {
    gsap.registerPlugin(ScrollTrigger);
    // Initialize animations
  } catch (error) {
    console.error('GSAP initialization failed:', error);
    // Fallback to static content
  }
  
  return () => {
    // Cleanup
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
  };
}, []);
```

## Testing Strategy

### Unit Tests
- Test component rendering with different stage data
- Test media loading error handling
- Test progress calculation logic
- Test navigation functionality

### Integration Tests
- Test scroll behavior across different viewport sizes
- Test GSAP animation initialization and cleanup
- Test stage transitions
- Test progress indicator updates

### Manual Testing
- Test on different browsers (Chrome, Firefox, Safari, Edge)
- Test on different devices (desktop, tablet, mobile)
- Test with reduced motion preferences enabled
- Test with slow network conditions (media loading)
- Test scroll performance with DevTools performance profiler

### Accessibility Testing
- Keyboard navigation support
- Screen reader compatibility
- Color contrast ratios
- Focus indicators
- Alternative text for media

## Accessibility Considerations

1. **Semantic HTML**: Use proper heading hierarchy (h1, h2, h3)
2. **ARIA Labels**: Add appropriate ARIA labels for interactive elements
3. **Alt Text**: Provide descriptive alt text for all images
4. **Video Captions**: Include captions/transcripts for videos
5. **Keyboard Navigation**: Ensure all interactive elements are keyboard accessible
6. **Focus Management**: Maintain logical focus order
7. **Reduced Motion**: Respect prefers-reduced-motion setting
8. **Color Contrast**: Ensure WCAG AA compliance (4.5:1 for text)

## Integration with Existing Application

### Route Structure
- Main page: `/app/grade/6/science/water-cycle/page.tsx`
- Scroll learning: `/app/grade/6/science/water-cycle/scroll-learning/page.tsx`

### Navigation Integration
- Add link from science subject page (`/app/grade/6/science/page.tsx`)
- Include back button to return to science topics
- Maintain consistent header/navigation with other pages

### Styling Consistency
- Use existing Tailwind theme colors
- Match dark mode implementation
- Follow existing button and card styles
- Use consistent spacing and typography

### State Management
- Use React hooks for local state (useState, useEffect, useRef)
- No global state needed for this feature
- Track completion status locally

## Performance Metrics

### Target Metrics
- First Contentful Paint (FCP): < 1.5s
- Largest Contentful Paint (LCP): < 2.5s
- Cumulative Layout Shift (CLS): < 0.1
- First Input Delay (FID): < 100ms
- Smooth scrolling: 60fps

### Optimization Techniques
- Image optimization (Next.js Image component)
- Lazy loading for off-screen content
- Code splitting for GSAP library
- Minimize JavaScript bundle size
- Use CSS transforms for animations (GPU-accelerated)

## Future Enhancements

1. **Interactive Elements**: Add clickable hotspots on images
2. **Quiz Integration**: Add knowledge checks between stages
3. **Audio Narration**: Include optional audio explanations
4. **3D Animations**: Upgrade to 3D water cycle visualization
5. **Gamification**: Add points/badges for completion
6. **Multi-language Support**: Translate content to other languages
7. **Analytics**: Track student engagement and completion rates
