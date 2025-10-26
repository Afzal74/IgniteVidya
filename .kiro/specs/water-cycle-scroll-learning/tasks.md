# Implementation Plan

- [x] 1. Install and configure GSAP dependencies

  - Add GSAP package to project dependencies
  - Verify GSAP and ScrollTrigger plugin are properly imported
  - _Requirements: 5.4_

- [-] 2. Create water cycle data structure and content

  - [x] 2.1 Define TypeScript interfaces for water cycle stages

    - Create `WaterCycleStage` interface with all required properties
    - Create `WaterCycleScrollProps` interface for main component
    - Create `StageSectionProps` interface for stage sections
    - Create `ProgressIndicatorProps` interface for progress tracking
    - _Requirements: 1.1, 3.1, 3.2_

  - [x] 2.2 Create water cycle stage data array

    - Define data for evaporation stage with title, description, media, and key points
    - Define data for condensation stage with title, description, media, and key points
    - Define data for precipitation stage with title, description, media, and key points
    - Define data for collection stage with title, description, media, and key points
    - Include vocabulary terms for each stage
    - _Requirements: 1.2, 3.1, 3.2, 3.3_

- [ ] 3. Implement ProgressIndicator component

  - [x] 3.1 Create ProgressIndicator component file

    - Create component with props for current stage, total stages, and stage names
    - Implement visual progress bar showing completion percentage
    - Add stage markers/dots for each water cycle stage
    - Style with Tailwind CSS matching existing design system
    - _Requirements: 6.1, 6.2, 6.3_

  - [x] 3.2 Add navigation functionality to ProgressIndicator

    - Implement click handlers for stage markers to enable direct navigation
    - Add smooth scroll to target stage when marker is clicked
    - Highlight current active stage in the indicator
    - _Requirements: 6.4_

- [ ] 4. Implement StageSection component

  - [x] 4.1 Create StageSection component structure

    - Create component file with TypeScript interface
    - Implement layout with media container and content container
    - Add responsive grid/flex layout for desktop and mobile
    - Create refs for GSAP animation targets
    - _Requirements: 1.1, 1.3, 4.1, 4.2_

  - [x] 4.2 Implement media rendering with error handling

    - Add conditional rendering for image vs video media types
    - Implement image loading with Next.js Image component for optimization
    - Implement video element with controls and autoplay options
    - Add error handling with fallback UI for failed media loads
    - Add loading states for media
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

  - [x] 4.3 Implement content rendering

    - Render stage title with proper heading hierarchy
    - Render stage description with age-appropriate text styling
    - Render key points as a list with proper formatting
    - Render vocabulary terms with term and definition styling
    - Ensure proper text contrast and readability
    - _Requirements: 3.1, 3.2, 3.3, 3.4_

- [ ] 5. Implement WaterCycleScroll main component

  - [x] 5.1 Create WaterCycleScroll component with basic structure

    - Create component file with TypeScript interface
    - Set up component state for tracking current stage
    - Create refs for section elements
    - Implement container layout with proper spacing
    - _Requirements: 1.1, 5.1, 5.2_

  - [x] 5.2 Initialize GSAP and ScrollTrigger

    - Import and register GSAP ScrollTrigger plugin
    - Create useEffect hook for GSAP initialization
    - Implement cleanup function to kill ScrollTrigger instances on unmount
    - Add error handling for GSAP initialization failures
    - _Requirements: 5.4, 5.5_

  - [ ] 5.3 Implement scroll-based animations for stage entry

    - Create GSAP timeline for media fade-in and scale animation
    - Add animation for title sliding in from left
    - Add animation for description fading in with delay
    - Add staggered animation for key points appearing sequentially
    - Add animation for vocabulary cards sliding up from bottom
    - Configure ScrollTrigger with appropriate start/end points
    - _Requirements: 1.2, 1.3_

  - [ ] 5.4 Configure ScrollTrigger for each stage section

    - Create ScrollTrigger instance for each stage with proper trigger element
    - Set start trigger at "top 80%" for smooth entry
    - Set end trigger at "bottom 20%" for smooth exit
    - Enable scrub for smooth scroll-linked animations
    - Add callbacks for onEnter, onLeave, onEnterBack, onLeaveBack
    - Update current stage state based on scroll position
    - _Requirements: 1.2, 1.3, 1.4_

  - [x] 5.5 Implement progress tracking

    - Calculate progress percentage based on scroll position
    - Update progress state as user scrolls through stages
    - Pass progress data to ProgressIndicator component
    - Trigger completion callback when all stages are viewed
    - _Requirements: 6.1, 6.2, 6.3_

- [x] 6. Implement responsive design and device optimization

  - [ ] 6.1 Add responsive layout styles

    - Implement two-column layout for desktop (media left, content right)
    - Implement single-column layout for tablet and mobile
    - Add responsive media sizing with Tailwind breakpoints
    - Adjust spacing and typography for different screen sizes
    - _Requirements: 4.1, 4.2_

  - [x] 6.2 Optimize animations for different devices

    - Adjust animation directions for mobile (vertical instead of horizontal)
    - Simplify animations for smaller screens if needed
    - Ensure touch scrolling works smoothly on mobile devices
    - Test and adjust ScrollTrigger start/end points for mobile viewports
    - _Requirements: 4.2, 4.3_

  - [x] 6.3 Implement reduced motion support

    - Detect prefers-reduced-motion media query
    - Disable or simplify animations when reduced motion is preferred
    - Use instant transitions instead of animated ones for accessibility
    - Ensure content is still accessible without animations
    - _Requirements: 4.4_

- [ ] 7. Create main page route for water cycle

  - [x] 7.1 Create water cycle main page

    - Create `/app/grade/6/science/water-cycle/page.tsx` file
    - Implement page layout with header and navigation
    - Add introduction section explaining the water cycle
    - Add button/link to launch scroll-based learning experience
    - Include back button to return to science topics page
    - Style with Tailwind CSS matching existing pages
    - _Requirements: 5.1, 5.3_

  - [x] 7.2 Create scroll-based learning page route

    - Create `/app/grade/6/science/water-cycle/scroll-learning/page.tsx` file
    - Import and render WaterCycleScroll component
    - Pass water cycle stage data to component
    - Implement page layout with proper spacing and background
    - Add back button to return to water cycle main page
    - Ensure dark mode support
    - _Requirements: 5.1, 5.2, 5.3_


- [x] 8. Integrate with existing science page navigation

  - Add water cycle link/card to `/app/grade/6/science/page.tsx`
  - Use consistent card styling with other science topics
  - Add appropriate icon or thumbnail for water cycle
  - Ensure navigation flow is intuitive
  - _Requirements: 5.1_

- [ ] 9. Add accessibility features

  - [ ] 9.1 Implement semantic HTML and ARIA labels

    - Use proper heading hierarchy (h1, h2, h3) throughout components
    - Add ARIA labels to interactive elements (buttons, navigation)
    - Add ARIA live regions for progress updates
    - Ensure proper landmark roles for sections
    - _Requirements: 3.3, 6.4_

  - [ ] 9.2 Implement keyboard navigation

    - Ensure all interactive elements are keyboard accessible
    - Add keyboard shortcuts for navigation (arrow keys, space)
    - Implement proper focus management and visible focus indicators
    - Test tab order for logical flow
    - _Requirements: 6.4_

  - [ ] 9.3 Add alternative text and captions
    - Add descriptive alt text to all images
    - Add aria-label to video elements
    - Include text transcripts or captions for video content
    - Ensure vocabulary definitions are accessible to screen readers
    - _Requirements: 2.1, 2.2, 3.4_

- [ ] 10. Write unit tests for components

  - [ ] 10.1 Write tests for StageSection component

    - Test rendering with image media type
    - Test rendering with video media type
    - Test media error handling and fallback UI
    - Test content rendering (title, description, key points, vocabulary)
    - _Requirements: 1.1, 2.1, 2.4, 3.1_

  - [ ] 10.2 Write tests for ProgressIndicator component

    - Test progress calculation and display
    - Test stage marker rendering
    - Test navigation functionality when markers are clicked
    - Test active stage highlighting
    - _Requirements: 6.1, 6.2, 6.3, 6.4_

  - [ ] 10.3 Write tests for WaterCycleScroll component
    - Test component initialization and GSAP setup
    - Test cleanup on unmount (ScrollTrigger instances killed)
    - Test stage tracking state updates
    - Test progress tracking calculations
    - Test error handling for GSAP failures
    - _Requirements: 1.1, 1.2, 5.5_

- [ ] 11. Perform integration and manual testing

  - [ ] 11.1 Test scroll behavior across devices

    - Test smooth scrolling on desktop with mouse/trackpad
    - Test touch scrolling on tablet and mobile devices
    - Test animation performance at 60fps
    - Verify ScrollTrigger start/end points work correctly on all screen sizes
    - _Requirements: 4.1, 4.2, 4.3_

  - [ ] 11.2 Test with different browser and accessibility settings

    - Test on Chrome, Firefox, Safari, and Edge browsers
    - Test with reduced motion preferences enabled
    - Test with screen readers (NVDA, JAWS, VoiceOver)
    - Test keyboard-only navigation
    - Verify color contrast ratios meet WCAG AA standards
    - _Requirements: 4.4, 6.4_

  - [ ] 11.3 Test media loading and error scenarios
    - Test with slow network conditions (throttle network in DevTools)
    - Test with missing media files (404 errors)
    - Verify fallback UI displays correctly
    - Test video playback controls and autoplay behavior
    - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [ ] 12. Optimize performance
  - Implement lazy loading for images using Next.js Image component
  - Add code splitting for GSAP library if bundle size is large
  - Optimize images (compress, use appropriate formats)
  - Use CSS transforms for animations (GPU-accelerated)
  - Verify performance metrics (FCP, LCP, CLS, FID) meet targets
  - Profile scroll performance with Chrome DevTools
  - _Requirements: 4.1, 4.2, 4.3, 5.4_
