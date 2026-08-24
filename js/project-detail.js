/**
 * Amir Kassim Portfolio - Dedicated Project Detail Page Controller
 * Handles Theme Toggle, Lightbox, Mobile Navigation, Zoom/Pan & Accessibility
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Theme Management (Synced with Main Portfolio)
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeToggleIcon = document.getElementById('theme-toggle-icon');
  const htmlRoot = document.documentElement;

  function initTheme() {
    const savedTheme = localStorage.getItem('amir-portfolio-theme') || 
      (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    setTheme(savedTheme, false);
  }

  function setTheme(theme, save = true) {
    htmlRoot.setAttribute('data-theme', theme);
    if (save) {
      localStorage.setItem('amir-portfolio-theme', theme);
    }

    if (themeToggleIcon) {
      if (theme === 'dark') {
        themeToggleIcon.src = '../icons/sun.svg';
        themeToggleIcon.alt = 'Switch to Light Mode';
      } else {
        themeToggleIcon.src = '../icons/moon.svg';
        themeToggleIcon.alt = 'Switch to Dark Mode';
      }
    }
  }

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const current = htmlRoot.getAttribute('data-theme') || 'light';
      const next = current === 'dark' ? 'light' : 'dark';
      setTheme(next, true);
    });
  }

  initTheme();

  // 2. Mobile Menu Toggle
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Close menu on link click
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });
  }

  // 3. Online/Offline Status Indicator
  const offlineBadge = document.getElementById('offline-badge');
  const offlineStatusText = document.getElementById('offline-status-text');
  const offlineBanner = document.getElementById('offline-banner');

  function updateOnlineStatus() {
    const isOnline = navigator.onLine;
    if (offlineStatusText) {
      offlineStatusText.textContent = isOnline ? 'Online' : 'Offline';
    }
    if (offlineBadge) {
      if (isOnline) {
        offlineBadge.classList.remove('is-offline');
      } else {
        offlineBadge.classList.add('is-offline');
      }
    }
    if (offlineBanner) {
      if (!isOnline) {
        offlineBanner.textContent = '⚡ You are viewing this project in offline mode. All cached data & diagrams remain accessible.';
        offlineBanner.classList.add('is-visible');
      } else {
        offlineBanner.classList.remove('is-visible');
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // 4. Back to Top Button
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // 5. Scroll Reveal Observer
  const revealElements = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window && revealElements.length > 0) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('active');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    revealElements.forEach(el => revealObserver.observe(el));
  } else {
    revealElements.forEach(el => el.classList.add('active'));
  }

  // 6. Interactive Lightbox for Project Gallery & Architecture Diagrams
  const lightbox = document.getElementById('diagramLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxZoomIn = document.getElementById('lightboxZoomIn');
  const lightboxZoomOut = document.getElementById('lightboxZoomOut');
  const lightboxZoomReset = document.getElementById('lightboxZoomReset');
  const lightboxZoomLevel = document.getElementById('lightboxZoomLevel');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxThumbnails = document.getElementById('lightboxThumbnails');
  const lightboxCanvas = document.getElementById('lightboxCanvas');

  let currentGallery = [];
  let currentIndex = 0;
  let zoomScale = 1;
  let isDragging = false;
  let startX = 0, startY = 0;
  let translateX = 0, translateY = 0;

  // Build gallery array from page elements
  const galleryCards = document.querySelectorAll('[data-gallery-item]');
  if (galleryCards.length > 0) {
    currentGallery = Array.from(galleryCards).map(card => ({
      image: card.getAttribute('data-gallery-src') || card.querySelector('img')?.src || '',
      title: card.getAttribute('data-gallery-title') || '',
      tag: card.getAttribute('data-gallery-tag') || 'Project Asset',
      caption: card.getAttribute('data-gallery-caption') || ''
    }));

    galleryCards.forEach((card, idx) => {
      card.addEventListener('click', () => openLightbox(idx));
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          openLightbox(idx);
        }
      });
    });
  }

  // Hero Zoom Button Trigger
  const heroZoomBtn = document.getElementById('heroZoomBtn');
  if (heroZoomBtn && currentGallery.length > 0) {
    heroZoomBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(0);
    });
  }

  function openLightbox(index) {
    if (!lightbox || currentGallery.length === 0) return;
    currentIndex = index;
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';

    renderThumbnails();
    updateLightboxImage(false);
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    resetZoom();
  }

  function updateLightboxImage(smooth = true) {
    if (currentIndex < 0) currentIndex = currentGallery.length - 1;
    if (currentIndex >= currentGallery.length) currentIndex = 0;

    const item = currentGallery[currentIndex];
    if (!item) return;

    resetZoom();

    if (lightboxImg) {
      if (smooth) {
        lightboxImg.style.opacity = '0';
        setTimeout(() => {
          lightboxImg.src = item.image;
          lightboxImg.alt = item.title;
          lightboxImg.style.opacity = '1';
        }, 120);
      } else {
        lightboxImg.src = item.image;
        lightboxImg.alt = item.title;
        lightboxImg.style.opacity = '1';
      }
    }

    if (lightboxTag) lightboxTag.textContent = item.tag;
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;
    if (lightboxCounter) lightboxCounter.textContent = `${currentIndex + 1} / ${currentGallery.length}`;

    // Update active thumbnail
    if (lightboxThumbnails) {
      const thumbs = lightboxThumbnails.querySelectorAll('.lightbox-thumb-btn');
      thumbs.forEach((thumb, idx) => {
        if (idx === currentIndex) {
          thumb.classList.add('is-active');
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('is-active');
        }
      });
    }
  }

  function renderThumbnails() {
    if (!lightboxThumbnails) return;
    lightboxThumbnails.innerHTML = '';

    currentGallery.forEach((item, idx) => {
      const btn = document.createElement('button');
      btn.type = 'button';
      btn.className = `lightbox-thumb-btn ${idx === currentIndex ? 'is-active' : ''}`;
      btn.setAttribute('aria-label', `View ${item.title}`);
      btn.innerHTML = `<img src="${item.image}" alt="${item.title}" loading="lazy">`;

      btn.addEventListener('click', () => {
        currentIndex = idx;
        updateLightboxImage(true);
      });

      lightboxThumbnails.appendChild(btn);
    });
  }

  function resetZoom() {
    zoomScale = 1;
    translateX = 0;
    translateY = 0;
    applyTransform();
  }

  function applyTransform() {
    if (lightboxImg) {
      lightboxImg.style.transform = `translate(${translateX}px, ${translateY}px) scale(${zoomScale})`;
      lightboxImg.style.cursor = zoomScale > 1 ? (isDragging ? 'grabbing' : 'grab') : 'default';
    }
    if (lightboxZoomLevel) {
      lightboxZoomLevel.textContent = `${Math.round(zoomScale * 100)}%`;
    }
  }

  function setZoom(newScale) {
    zoomScale = Math.min(Math.max(newScale, 0.6), 3.5);
    if (zoomScale === 1) {
      translateX = 0;
      translateY = 0;
    }
    applyTransform();
  }

  if (lightboxZoomIn) {
    lightboxZoomIn.addEventListener('click', () => setZoom(zoomScale + 0.25));
  }
  if (lightboxZoomOut) {
    lightboxZoomOut.addEventListener('click', () => setZoom(zoomScale - 0.25));
  }
  if (lightboxZoomReset) {
    lightboxZoomReset.addEventListener('click', resetZoom);
  }

  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', () => {
      currentIndex--;
      updateLightboxImage(true);
    });
  }
  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', () => {
      currentIndex++;
      updateLightboxImage(true);
    });
  }

  if (lightboxCloseBtn) lightboxCloseBtn.addEventListener('click', closeLightbox);
  if (lightboxBackdrop) lightboxBackdrop.addEventListener('click', closeLightbox);

  // Keyboard navigation
  window.addEventListener('keydown', (e) => {
    if (!lightbox || !lightbox.classList.contains('is-open')) return;

    if (e.key === 'Escape') {
      closeLightbox();
    } else if (e.key === 'ArrowLeft') {
      currentIndex--;
      updateLightboxImage(true);
    } else if (e.key === 'ArrowRight') {
      currentIndex++;
      updateLightboxImage(true);
    } else if (e.key === '+' || e.key === '=') {
      setZoom(zoomScale + 0.25);
    } else if (e.key === '-' || e.key === '_') {
      setZoom(zoomScale - 0.25);
    } else if (e.key === '0') {
      resetZoom();
    }
  });

  // Lightbox Pan / Drag when zoomed
  if (lightboxCanvas) {
    lightboxCanvas.addEventListener('mousedown', (e) => {
      if (zoomScale <= 1) return;
      isDragging = true;
      startX = e.clientX - translateX;
      startY = e.clientY - translateY;
      e.preventDefault();
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging || zoomScale <= 1) return;
      translateX = e.clientX - startX;
      translateY = e.clientY - startY;
      applyTransform();
    });

    window.addEventListener('mouseup', () => {
      if (isDragging) {
        isDragging = false;
        applyTransform();
      }
    });

    // Touch swipe support on mobile
    let touchStartX = 0;
    let touchEndX = 0;
    lightboxCanvas.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        touchStartX = e.touches[0].clientX;
      }
    }, { passive: true });

    lightboxCanvas.addEventListener('touchend', (e) => {
      if (e.changedTouches.length === 1 && zoomScale === 1) {
        touchEndX = e.changedTouches[0].clientX;
        const diff = touchEndX - touchStartX;
        if (diff > 50) {
          // Swipe Right -> Prev
          currentIndex--;
          updateLightboxImage(true);
        } else if (diff < -50) {
          // Swipe Left -> Next
          currentIndex++;
          updateLightboxImage(true);
        }
      }
    }, { passive: true });
  }
});
