import { useEffect, useRef, useState } from 'react';

/**
 * ScrollableMarquee
 * Wraps card tracks in an infinitely scrolling, interactive container.
 * - Allows users to freely scroll horizontally (touch swipe, trackpad, mouse wheel, mouse drag)
 * - Auto-scrolls continuously with requestAnimationFrame
 * - Auto-pauses on hover, mouse drag, touch, or when an interactive card is flipped
 * - Smoothly wraps infinitely in both directions using 3 repeated sets of cards
 * - Does NOT add any scroll buttons
 */
export default function ScrollableMarquee({
  children,
  speed = 36, // px per second
  direction = 'left', // 'left' moves cards left (increasing scrollLeft), 'right' moves cards right (decreasing scrollLeft)
  baseCount, // Number of items in 1 set (out of 3 sets)
  className = '',
}) {
  const containerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const track = container.firstElementChild;
    if (!track) return;

    let isVisible = true;
    let isHovered = false;
    let isUserInteracting = false;
    let interactionTimer = null;
    let rafId = null;
    let lastTime = performance.now();

    // Bounds calculation for seamless 3-set wrap
    let startOffset = 0;
    let endOffset = 0;
    let setWidth = 0;

    const measureBounds = () => {
      if (!track || !track.children || track.children.length === 0) return;

      const totalChildren = track.children.length;
      const count =
        baseCount && totalChildren >= baseCount * 2
          ? baseCount
          : Math.floor(totalChildren / 3);

      if (count > 0 && track.children[count] && track.children[count * 2]) {
        startOffset = track.children[count].offsetLeft;
        endOffset = track.children[count * 2].offsetLeft;
        setWidth = endOffset - startOffset;
      } else {
        setWidth = track.scrollWidth / 3;
        startOffset = setWidth;
        endOffset = setWidth * 2;
      }
    };

    // Initial measurement
    measureBounds();

    // Position in middle set (Set 2) if near beginning
    if (startOffset > 0 && container.scrollLeft < startOffset * 0.5) {
      container.scrollLeft = startOffset;
    }
    let currentScroll = container.scrollLeft;

    // IntersectionObserver to pause when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0.05 }
    );
    observer.observe(container);

    // ResizeObserver on track to adapt when dynamic items or images load
    let resizeObserver = null;
    if (window.ResizeObserver) {
      resizeObserver = new ResizeObserver(() => {
        measureBounds();
      });
      resizeObserver.observe(track);
    }

    // Main animation loop
    const animate = (now) => {
      const dt = Math.min((now - lastTime) / 1000, 0.1);
      lastTime = now;

      // Check if any card inside is flipped open (e.g. in Sponsors)
      const hasFlippedCard = Boolean(
        container.querySelector('.card-is-flipped, .sponsor-flipped')
      );

      if (
        isVisible &&
        !isHovered &&
        !isUserInteracting &&
        !hasFlippedCard &&
        setWidth > 0
      ) {
        const move = (direction === 'right' ? -1 : 1) * speed * dt;
        currentScroll += move;

        // Wrap seamlessly
        if (currentScroll >= endOffset) {
          currentScroll -= setWidth;
        } else if (currentScroll < startOffset) {
          currentScroll += setWidth;
        }

        container.scrollLeft = currentScroll;
      } else {
        // Keep currentScroll synchronized with manual user scrolling
        currentScroll = container.scrollLeft;
      }

      rafId = requestAnimationFrame(animate);
    };

    rafId = requestAnimationFrame(animate);

    // Hover listeners to pause auto-scroll
    const handleMouseEnter = () => {
      isHovered = true;
    };
    const handleMouseLeave = () => {
      isHovered = false;
    };

    // Manual scroll / touch momentum listener with infinite wrap
    const handleScroll = () => {
      if (setWidth <= 0) return;

      if (container.scrollLeft >= endOffset) {
        container.scrollLeft -= setWidth;
        currentScroll = container.scrollLeft;
      } else if (container.scrollLeft < startOffset) {
        container.scrollLeft += setWidth;
        currentScroll = container.scrollLeft;
      } else {
        currentScroll = container.scrollLeft;
      }
    };

    // Wheel listener: support horizontal trackpad scroll or Shift+Wheel
    // Momentum animation reference
    let momentumRafId = null;

    const stopMomentum = () => {
      if (momentumRafId) {
        cancelAnimationFrame(momentumRafId);
        momentumRafId = null;
      }
    };

    // Wheel listener: support horizontal trackpad scroll or Shift+Wheel
    const handleWheel = (e) => {
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY) || e.shiftKey) {
        const delta = e.shiftKey ? e.deltaY : e.deltaX;
        if (Math.abs(delta) > 0) {
          e.preventDefault();
          stopMomentum();
          container.scrollLeft += delta;
          handleScroll();
          isUserInteracting = true;
          clearTimeout(interactionTimer);
          interactionTimer = setTimeout(() => {
            isUserInteracting = false;
          }, 1200);
        }
      }
    };

    // Touch gesture implementation for phones and mobile devices
    let touchStartX = 0;
    let touchStartY = 0;
    let lastTouchX = 0;
    let lastTouchTime = 0;
    let touchStartScroll = 0;
    let touchVelocity = 0;
    let dragAxis = null; // 'x' for horizontal swipe, 'y' for vertical page scroll, or null
    let isTouchActive = false;

    const handleTouchStart = (e) => {
      if (!e.touches || e.touches.length !== 1) return;
      stopMomentum();
      isTouchActive = true;
      isUserInteracting = true;
      clearTimeout(interactionTimer);

      const touch = e.touches[0];
      touchStartX = touch.clientX;
      touchStartY = touch.clientY;
      lastTouchX = touch.clientX;
      lastTouchTime = performance.now();
      touchStartScroll = container.scrollLeft;
      touchVelocity = 0;
      dragAxis = null;
    };

    const handleTouchMove = (e) => {
      if (!isTouchActive || !e.touches || e.touches.length !== 1) return;

      const touch = e.touches[0];
      const dx = touch.clientX - touchStartX;
      const dy = touch.clientY - touchStartY;
      const absDx = Math.abs(dx);
      const absDy = Math.abs(dy);

      // Lock in gesture intent once finger moves beyond threshold
      if (dragAxis === null) {
        if (absDx > 6 || absDy > 6) {
          if (absDx > absDy) {
            dragAxis = 'x';
            setIsDragging(true);
          } else {
            dragAxis = 'y';
          }
        }
      }

      // If user is scrolling vertically down the page, let the browser handle it naturally
      if (dragAxis === 'y') {
        return;
      }

      // If user is swiping horizontally across the cards, take control
      if (dragAxis === 'x') {
        if (e.cancelable) {
          e.preventDefault();
        }

        const now = performance.now();
        const dt = now - lastTouchTime;
        if (dt > 0) {
          touchVelocity = (touch.clientX - lastTouchX) / dt;
          lastTouchX = touch.clientX;
          lastTouchTime = now;
        }

        let targetScroll = touchStartScroll - dx;

        // Seamless wrap while dragging
        if (setWidth > 0) {
          if (targetScroll >= endOffset) {
            targetScroll -= setWidth;
            touchStartScroll -= setWidth;
          } else if (targetScroll < startOffset) {
            targetScroll += setWidth;
            touchStartScroll += setWidth;
          }
        }

        container.scrollLeft = targetScroll;
        currentScroll = targetScroll;
      }
    };

    const handleTouchEnd = (e) => {
      if (!isTouchActive) return;
      isTouchActive = false;
      const wasHorizontalDrag = dragAxis === 'x';
      setIsDragging(false);

      if (wasHorizontalDrag) {
        // Suppress accidental click/flip triggers if user swiped
        const captureClick = (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          window.removeEventListener('click', captureClick, true);
        };
        window.addEventListener('click', captureClick, true);
        setTimeout(() => {
          window.removeEventListener('click', captureClick, true);
        }, 120);

        // Apply smooth momentum glide if user flicked with velocity
        if (Math.abs(touchVelocity) > 0.12) {
          let velocity = touchVelocity * 1000; // convert to px/s
          velocity = Math.max(Math.min(velocity, 2400), -2400);

          let lastMomentumTime = performance.now();
          const stepMomentum = (now) => {
            const dt = Math.min((now - lastMomentumTime) / 1000, 0.05);
            lastMomentumTime = now;

            // Exponential friction deceleration
            velocity *= Math.pow(0.91, dt * 60);

            if (Math.abs(velocity) > 18 && isUserInteracting) {
              currentScroll -= velocity * dt;

              if (setWidth > 0) {
                if (currentScroll >= endOffset) {
                  currentScroll -= setWidth;
                } else if (currentScroll < startOffset) {
                  currentScroll += setWidth;
                }
              }

              container.scrollLeft = currentScroll;
              momentumRafId = requestAnimationFrame(stepMomentum);
            } else {
              // Momentum finished; wait a comfortable reading buffer before resuming auto-scroll
              interactionTimer = setTimeout(() => {
                isUserInteracting = false;
              }, 1800);
            }
          };

          momentumRafId = requestAnimationFrame(stepMomentum);
          dragAxis = null;
          return;
        }
      }

      dragAxis = null;
      clearTimeout(interactionTimer);
      interactionTimer = setTimeout(() => {
        isUserInteracting = false;
      }, wasHorizontalDrag ? 1800 : 1200);
    };

    const handleTouchCancel = () => {
      isTouchActive = false;
      dragAxis = null;
      setIsDragging(false);
      clearTimeout(interactionTimer);
      interactionTimer = setTimeout(() => {
        isUserInteracting = false;
      }, 1000);
    };

    // Mouse drag-to-scroll implementation
    let isMouseDown = false;
    let startX = 0;
    let startScroll = 0;
    let dragDist = 0;

    const handleMouseDown = (e) => {
      if (e.button !== 0) return; // Left mouse button only
      stopMomentum();
      isMouseDown = true;
      setIsDragging(true);
      startX = e.pageX;
      startScroll = container.scrollLeft;
      dragDist = 0;
      isUserInteracting = true;
      clearTimeout(interactionTimer);
    };

    const handleMouseMove = (e) => {
      if (!isMouseDown) return;
      const dx = e.pageX - startX;
      dragDist += Math.abs(dx);
      let targetScroll = startScroll - dx;

      if (setWidth > 0) {
        if (targetScroll >= endOffset) {
          targetScroll -= setWidth;
          startScroll -= setWidth;
        } else if (targetScroll < startOffset) {
          targetScroll += setWidth;
          startScroll += setWidth;
        }
      }

      container.scrollLeft = targetScroll;
      currentScroll = targetScroll;
    };

    const handleMouseUp = () => {
      if (!isMouseDown) return;
      isMouseDown = false;
      setIsDragging(false);

      if (dragDist > 6) {
        // Suppress accidental click trigger on cards/buttons when dragging
        const captureClick = (clickEvent) => {
          clickEvent.stopPropagation();
          clickEvent.preventDefault();
          window.removeEventListener('click', captureClick, true);
        };
        window.addEventListener('click', captureClick, true);
        setTimeout(() => {
          window.removeEventListener('click', captureClick, true);
        }, 100);
      }

      clearTimeout(interactionTimer);
      interactionTimer = setTimeout(() => {
        isUserInteracting = false;
      }, 1200);
    };

    // Window resize
    const handleResize = () => {
      measureBounds();
    };

    container.addEventListener('mouseenter', handleMouseEnter);
    container.addEventListener('mouseleave', handleMouseLeave);
    container.addEventListener('scroll', handleScroll, { passive: true });
    container.addEventListener('wheel', handleWheel, { passive: false });
    container.addEventListener('touchstart', handleTouchStart, { passive: true });
    container.addEventListener('touchmove', handleTouchMove, { passive: false });
    container.addEventListener('touchend', handleTouchEnd, { passive: true });
    container.addEventListener('touchcancel', handleTouchCancel, { passive: true });
    container.addEventListener('mousedown', handleMouseDown);
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('resize', handleResize);

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      stopMomentum();
      clearTimeout(interactionTimer);
      observer.disconnect();
      if (resizeObserver) resizeObserver.disconnect();

      container.removeEventListener('mouseenter', handleMouseEnter);
      container.removeEventListener('mouseleave', handleMouseLeave);
      container.removeEventListener('scroll', handleScroll);
      container.removeEventListener('wheel', handleWheel);
      container.removeEventListener('touchstart', handleTouchStart);
      container.removeEventListener('touchmove', handleTouchMove);
      container.removeEventListener('touchend', handleTouchEnd);
      container.removeEventListener('touchcancel', handleTouchCancel);
      container.removeEventListener('mousedown', handleMouseDown);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('resize', handleResize);
    };
  }, [baseCount, direction, speed]);

  return (
    <div
      ref={containerRef}
      className={`marquee-scroll-container ${isDragging ? 'is-dragging' : ''} ${className}`}
    >
      {children}
    </div>
  );
}
