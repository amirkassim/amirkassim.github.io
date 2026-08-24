/**
 * ============================================================================
 * Amir Kassim Portfolio - Vanilla JavaScript Infinite Carousel Engine
 * ============================================================================
 * Features:
 * - Pure Vanilla JavaScript (No frameworks, No libraries)
 * - True infinite looping with clone buffers
 * - Responsive breakpoints: 3 cards (desktop >= 992px), 2 cards (tablet 768-991px), 1 card (mobile < 768px)
 * - Auto-slide every 5s with pause on hover/focus/modal
 * - Touch swipe support for mobile
 * - Mouse drag support for desktop with velocity/threshold
 * - 60fps GPU-accelerated transforms using translate3d()
 * - Animated expanding pagination indicator dots
 * - Keyboard arrow navigation & full accessibility (ARIA)
 * - Reusable: supports any number of cards dynamically
 */

class VanillaInfiniteCarousel {
  constructor(options = {}) {
    this.container = document.querySelector(options.container || '#projectsSliderContainer');
    this.viewport = document.querySelector(options.viewport || '#projectsSliderViewport');
    this.track = document.querySelector(options.track || '#projectsSliderTrack');
    this.prevBtn = document.querySelector(options.prevBtn || '#projects-side-prev-btn');
    this.nextBtn = document.querySelector(options.nextBtn || '#projects-side-next-btn');
    this.topPrevBtn = document.querySelector(options.topPrevBtn || '#projects-prev-btn');
    this.topNextBtn = document.querySelector(options.topNextBtn || '#projects-next-btn');
    this.counterEl = document.querySelector(options.counter || '#projects-slide-counter');
    this.dotsContainer = document.querySelector(options.dotsContainer || '#projectsSliderDots');

    this.cardSelector = options.cardSelector || '.project-slide-card';
    this.autoSlideInterval = options.autoSlideInterval || 5000;
    this.gap = options.gap !== undefined ? options.gap : 24;

    if (!this.container || !this.viewport || !this.track) {
      return;
    }

    // Capture original cards before any cloning
    this.originalCards = Array.from(this.track.querySelectorAll(this.cardSelector));
    this.totalCards = this.originalCards.length;
    if (this.totalCards === 0) return;

    this.currentIndex = 0;
    this.visibleCount = 3;
    this.cardWidth = 0;
    this.isTransitioning = false;
    this.autoSlideTimer = null;
    this.isHovered = false;
    this.isModalOpen = false;
    this.isSectionVisible = false;
    this.observer = null;

    // Drag & Swipe states
    this.isDragging = false;
    this.dragStartX = 0;
    this.currentDragX = 0;
    this.dragOffset = 0;
    this.hasMoved = false;

    this.init();
  }

  init() {
    this.updateVisibleCount();
    this.buildInfiniteTrack();
    this.setupPaginationDots();
    this.updatePosition(false);
    this.attachEventListeners();
    this.setupIntersectionObserver();
  }

  setupIntersectionObserver() {
    if (!('IntersectionObserver' in window)) {
      // Fallback for older browsers without IntersectionObserver
      this.isSectionVisible = true;
      this.startAutoSlide();
      return;
    }

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }

    // Detect when at least 40% of the carousel is visible in the viewport
    this.observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        const isVisibleEnough = entry.isIntersecting && entry.intersectionRatio >= 0.39;

        if (isVisibleEnough) {
          if (!this.isSectionVisible) {
            this.isSectionVisible = true;
            this.startAutoSlide();
          }
        } else {
          if (this.isSectionVisible) {
            this.isSectionVisible = false;
            this.stopAutoSlide();
          }
        }
      });
    }, {
      root: null,
      threshold: [0, 0.4]
    });

    this.observer.observe(this.container);
  }

  updateVisibleCount() {
    const width = window.innerWidth;
    if (width >= 992) {
      this.visibleCount = 3; // Desktop & Laptop: 3 cards
      this.gap = 24;
    } else if (width >= 768) {
      this.visibleCount = 2; // Tablet: 2 cards
      this.gap = 20;
    } else {
      this.visibleCount = 1; // Mobile: 1 card
      this.gap = 16;
    }
  }

  calculateDimensions() {
    const viewportWidth = this.viewport.clientWidth;
    // Calculate card width: (viewportWidth - totalGaps) / visibleCount
    const totalGaps = (this.visibleCount - 1) * this.gap;
    this.cardWidth = Math.max(0, (viewportWidth - totalGaps) / this.visibleCount);

    const allCards = this.track.querySelectorAll(this.cardSelector);
    allCards.forEach(card => {
      card.style.flex = `0 0 ${this.cardWidth}px`;
      card.style.width = `${this.cardWidth}px`;
      card.style.maxWidth = `${this.cardWidth}px`;
    });

    this.track.style.gap = `${this.gap}px`;
  }

  buildInfiniteTrack() {
    // Clear track and clone cards for infinite loop
    this.track.innerHTML = '';
    this.cloneCount = Math.max(this.visibleCount + 1, 3);

    // 1. Prepend clones of the last cards
    const prependCards = this.originalCards.slice(-this.cloneCount);
    prependCards.forEach((card, index) => {
      const clone = card.cloneNode(true);
      clone.classList.add('carousel-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-clone-index', `prepend-${index}`);
      this.track.appendChild(clone);
    });

    // 2. Append original cards
    this.originalCards.forEach((card, index) => {
      card.classList.remove('carousel-clone');
      card.removeAttribute('aria-hidden');
      card.setAttribute('data-original-index', index);
      this.track.appendChild(card);
    });

    // 3. Append clones of the first cards
    const appendCards = this.originalCards.slice(0, this.cloneCount);
    appendCards.forEach((card, index) => {
      const clone = card.cloneNode(true);
      clone.classList.add('carousel-clone');
      clone.setAttribute('aria-hidden', 'true');
      clone.setAttribute('data-clone-index', `append-${index}`);
      this.track.appendChild(clone);
    });

    this.currentIndex = this.cloneCount; // Start at first original card
    this.calculateDimensions();
    this.ensureTrackImages();
  }

  ensureTrackImages() {
    const images = this.track.querySelectorAll('img.project-slide-img');
    images.forEach(img => {
      img.loading = 'eager';
      img.decoding = 'async';
      if (!img.complete || img.naturalWidth === 0) {
        const src = img.getAttribute('src');
        if (src) {
          img.src = src;
        }
      }
    });
  }

  setupPaginationDots() {
    if (!this.dotsContainer) return;
    this.dotsContainer.innerHTML = '';

    for (let i = 0; i < this.totalCards; i++) {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.className = 'slider-dot';
      dot.setAttribute('aria-label', `Navigate to project ${i + 1} of ${this.totalCards}`);
      dot.setAttribute('data-dot-index', i);

      dot.addEventListener('click', () => {
        this.goToSlide(i);
        this.restartAutoSlide();
      });

      this.dotsContainer.appendChild(dot);
    }

    this.updateActiveDot();
  }

  getRealIndex() {
    // Maps track index to original 0..(totalCards - 1) index
    let normalized = (this.currentIndex - this.cloneCount) % this.totalCards;
    if (normalized < 0) {
      normalized += this.totalCards;
    }
    return normalized;
  }

  updateActiveDot() {
    const realIndex = this.getRealIndex();
    if (this.dotsContainer) {
      const dots = this.dotsContainer.querySelectorAll('.slider-dot');
      dots.forEach((dot, idx) => {
        if (idx === realIndex) {
          dot.classList.add('active');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('active');
          dot.removeAttribute('aria-current');
        }
      });
    }

    if (this.counterEl) {
      const currentNum = String(realIndex + 1).padStart(2, '0');
      const totalNum = String(this.totalCards).padStart(2, '0');
      this.counterEl.textContent = `${currentNum} / ${totalNum}`;
    }
  }

  getTranslateOffset(index) {
    return index * (this.cardWidth + this.gap);
  }

  updatePosition(animate = true) {
    if (animate) {
      this.track.style.transition = 'transform 0.5s cubic-bezier(0.2, 0.8, 0.2, 1)';
    } else {
      this.track.style.transition = 'none';
    }

    const offset = this.getTranslateOffset(this.currentIndex);
    this.track.style.transform = `translate3d(-${offset}px, 0, 0)`;
    this.updateActiveDot();
  }

  slideNext() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex++;
    this.updatePosition(true);
  }

  slidePrev() {
    if (this.isTransitioning) return;
    this.isTransitioning = true;
    this.currentIndex--;
    this.updatePosition(true);
  }

  goToSlide(targetRealIndex) {
    if (this.isTransitioning) return;
    const currentRealIndex = this.getRealIndex();
    const diff = targetRealIndex - currentRealIndex;
    this.currentIndex += diff;
    this.isTransitioning = true;
    this.updatePosition(true);
  }

  handleTransitionEnd() {
    this.isTransitioning = false;

    // Check if we slid past the original cards into append clones
    if (this.currentIndex >= this.cloneCount + this.totalCards) {
      this.currentIndex = this.currentIndex - this.totalCards;
      this.updatePosition(false);
    }
    // Check if we slid before the original cards into prepend clones
    else if (this.currentIndex < this.cloneCount) {
      this.currentIndex = this.currentIndex + this.totalCards;
      this.updatePosition(false);
    }
  }

  startAutoSlide() {
    this.stopAutoSlide();
    // Only start timer if carousel is currently visible in viewport and not paused by user
    if (!this.isSectionVisible || this.isModalOpen) return;

    this.autoSlideTimer = setInterval(() => {
      if (!this.isHovered && !this.isModalOpen && !this.isDragging && this.isSectionVisible) {
        this.slideNext();
      }
    }, this.autoSlideInterval);
  }

  stopAutoSlide() {
    if (this.autoSlideTimer) {
      clearInterval(this.autoSlideTimer);
      this.autoSlideTimer = null;
    }
  }

  restartAutoSlide() {
    this.stopAutoSlide();
    if (this.isSectionVisible && !this.isHovered && !this.isModalOpen && !this.isDragging) {
      this.startAutoSlide();
    }
  }

  attachEventListeners() {
    // 1. Navigation Buttons
    if (this.prevBtn) {
      this.prevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.slidePrev();
        this.restartAutoSlide();
      });
    }

    if (this.nextBtn) {
      this.nextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.slideNext();
        this.restartAutoSlide();
      });
    }

    if (this.topPrevBtn) {
      this.topPrevBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.slidePrev();
        this.restartAutoSlide();
      });
    }

    if (this.topNextBtn) {
      this.topNextBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.slideNext();
        this.restartAutoSlide();
      });
    }

    // 2. Track transition end for infinite looping
    this.track.addEventListener('transitionend', () => {
      this.handleTransitionEnd();
    });

    // 3. Hover pause & resume
    this.container.addEventListener('mouseenter', () => {
      this.isHovered = true;
    });

    this.container.addEventListener('mouseleave', () => {
      this.isHovered = false;
      this.restartAutoSlide();
    });

    this.container.addEventListener('focusin', () => {
      this.isHovered = true;
    });

    this.container.addEventListener('focusout', () => {
      this.isHovered = false;
      this.restartAutoSlide();
    });

    // 4. Keyboard Navigation
    this.container.setAttribute('tabindex', '0');
    this.container.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowLeft') {
        e.preventDefault();
        this.slidePrev();
        this.restartAutoSlide();
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        this.slideNext();
        this.restartAutoSlide();
      }
    });

    // 5. Mouse Dragging (Desktop)
    this.track.addEventListener('mousedown', (e) => this.onDragStart(e));
    window.addEventListener('mousemove', (e) => this.onDragMove(e));
    window.addEventListener('mouseup', (e) => this.onDragEnd(e));

    // Prevent click events on buttons if user was actively dragging
    this.track.addEventListener('click', (e) => {
      if (this.hasMoved) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);

    // 6. Touch Swiping (Mobile & Tablet)
    this.viewport.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
    this.viewport.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
    this.viewport.addEventListener('touchend', (e) => this.onTouchEnd(e), { passive: true });

    // 7. Modal Listeners (Pause auto-slide when modal is active)
    window.addEventListener('projectModalOpened', () => {
      this.isModalOpen = true;
    });

    window.addEventListener('projectModalClosed', () => {
      this.isModalOpen = false;
      this.restartAutoSlide();
    });

    // 8. Responsive Resize with Debounce
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const prevVisible = this.visibleCount;
        this.updateVisibleCount();
        if (prevVisible !== this.visibleCount) {
          this.buildInfiniteTrack();
        } else {
          this.calculateDimensions();
        }
        this.updatePosition(false);
      }, 120);
    });
  }

  // --- Mouse Drag Implementation ---
  onDragStart(e) {
    if (e.button !== 0) return; // Left click only
    if (e.target.closest('.project-view-more-btn') && !this.isDragging) {
      // Allow button clicks unless dragging occurs
    }
    this.isDragging = true;
    this.hasMoved = false;
    this.dragStartX = e.pageX;
    this.currentDragX = e.pageX;
    this.dragOffset = 0;

    this.track.style.transition = 'none';
    this.track.classList.add('is-dragging');
    this.stopAutoSlide();
  }

  onDragMove(e) {
    if (!this.isDragging) return;
    this.currentDragX = e.pageX;
    this.dragOffset = this.currentDragX - this.dragStartX;

    if (Math.abs(this.dragOffset) > 6) {
      this.hasMoved = true;
    }

    const baseOffset = this.getTranslateOffset(this.currentIndex);
    const totalOffset = baseOffset - this.dragOffset;
    this.track.style.transform = `translate3d(-${totalOffset}px, 0, 0)`;
  }

  onDragEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;
    this.track.classList.remove('is-dragging');

    const threshold = this.cardWidth * 0.2 || 50;

    if (this.dragOffset > threshold) {
      // Dragged right -> Previous
      this.slidePrev();
    } else if (this.dragOffset < -threshold) {
      // Dragged left -> Next
      this.slideNext();
    } else {
      // Return to current position
      this.updatePosition(true);
    }

    this.dragOffset = 0;
    setTimeout(() => {
      this.hasMoved = false;
    }, 50);

    this.restartAutoSlide();
  }

  // --- Touch Swipe Implementation ---
  onTouchStart(e) {
    if (e.touches.length !== 1) return;
    this.isDragging = true;
    this.hasMoved = false;
    this.dragStartX = e.touches[0].pageX;
    this.currentDragX = e.touches[0].pageX;
    this.dragOffset = 0;

    this.track.style.transition = 'none';
    this.stopAutoSlide();
  }

  onTouchMove(e) {
    if (!this.isDragging || e.touches.length !== 1) return;
    this.currentDragX = e.touches[0].pageX;
    this.dragOffset = this.currentDragX - this.dragStartX;

    if (Math.abs(this.dragOffset) > 6) {
      this.hasMoved = true;
    }

    const baseOffset = this.getTranslateOffset(this.currentIndex);
    const totalOffset = baseOffset - this.dragOffset;
    this.track.style.transform = `translate3d(-${totalOffset}px, 0, 0)`;
  }

  onTouchEnd() {
    if (!this.isDragging) return;
    this.isDragging = false;

    const threshold = this.cardWidth * 0.2 || 40;

    if (this.dragOffset > threshold) {
      this.slidePrev();
    } else if (this.dragOffset < -threshold) {
      this.slideNext();
    } else {
      this.updatePosition(true);
    }

    this.dragOffset = 0;
    setTimeout(() => {
      this.hasMoved = false;
    }, 50);

    this.restartAutoSlide();
  }
}

// Global initialization function
window.initVanillaInfiniteCarousel = function(options) {
  return new VanillaInfiniteCarousel(options);
};
