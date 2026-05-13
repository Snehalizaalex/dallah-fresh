/* ============================================
   DALLAH FRESH — Main JavaScript
   ============================================ */

document.addEventListener('DOMContentLoaded', () => {
  // ---- Page Loader ----
  const loader = document.querySelector('.loader');
  if (loader) {
    window.addEventListener('load', () => {
      setTimeout(() => loader.classList.add('hidden'), 600);
    });
    // Fallback
    setTimeout(() => loader.classList.add('hidden'), 2500);
  }

  // ---- Sticky Navbar ----
  const navbar = document.querySelector('.navbar');
  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };
  window.addEventListener('scroll', handleScroll);
  handleScroll();

  // ---- Mobile Menu ----
  const hamburger = document.querySelector('.hamburger');
  const navLinks = document.querySelector('.nav-links');
  const overlay = document.querySelector('.nav-overlay');

  if (hamburger) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('active');
      navLinks.classList.toggle('open');
      if (overlay) overlay.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      hamburger.classList.remove('active');
      navLinks.classList.remove('open');
      overlay.classList.remove('open');
      document.body.style.overflow = '';
    });
  }

  // Close mobile menu on link click
  document.querySelectorAll('.nav-links a').forEach(link => {
    link.addEventListener('click', () => {
      if (navLinks.classList.contains('open')) {
        hamburger.classList.remove('active');
        navLinks.classList.remove('open');
        if (overlay) overlay.classList.remove('open');
        document.body.style.overflow = '';
      }
    });
  });

  // ---- Scroll Reveal (Intersection Observer) ----
  const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('active');
      }
    });
  }, {
    threshold: 0.12,
    rootMargin: '0px 0px -40px 0px'
  });

  revealElements.forEach(el => revealObserver.observe(el));

  // ---- Counter Animation ----
  const counters = document.querySelectorAll('.stat-number[data-target]');

  const counterObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const el = entry.target;
        const target = +el.getAttribute('data-target');
        const suffix = el.querySelector('.suffix');
        const suffixText = suffix ? suffix.textContent : '';
        const duration = 1800;
        const startTime = performance.now();

        const animate = (currentTime) => {
          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          // Ease out cubic
          const eased = 1 - Math.pow(1 - progress, 3);
          const current = Math.floor(eased * target);
          el.textContent = current.toLocaleString();
          if (suffix) {
            el.innerHTML = current.toLocaleString() + `<span class="suffix">${suffixText}</span>`;
          }
          if (progress < 1) {
            requestAnimationFrame(animate);
          }
        };

        requestAnimationFrame(animate);
        counterObserver.unobserve(el);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => counterObserver.observe(counter));

  // ---- Hero Image Sequence Scroll Animation ----
  const heroSequence = document.getElementById('hero-sequence');
  const canvas = document.getElementById('hero-canvas');
  const context = canvas ? canvas.getContext('2d') : null;
  const textPart1 = document.getElementById('text-part-1');
  const textPart2 = document.getElementById('text-part-2');

  if (heroSequence && canvas && context) {
    const frameCount = 300;
    const images = [];
    let currentFrameIndex = 0;

    // Build image path
    const getFramePath = index => `frames_ultra/frame_${(index + 1).toString().padStart(4, '0')}.webp`;

    // Preload & Decode images for zero-latency rendering
    let loadedCount = 0;
    const loadingText = document.querySelector('.hero-sequence-sticky');
    async function preloadImages() {
      const promises = [];
      for (let i = 0; i < frameCount; i++) {
        const img = new Image();
        img.src = getFramePath(i);
        const promise = new Promise((resolve) => {
          img.onload = async () => {
            if (img.decode) {
              try { await img.decode(); } catch (e) {}
            }
            loadedCount++;
            const progress = Math.round((loadedCount / frameCount) * 100);
            if (loadingText) loadingText.setAttribute('data-progress', `Loading Freshness: ${progress}%`);
            
            if (i === 0) render(0);
            resolve();
          };
        });
        promises.push(promise);
        images.push(img);
      }
      await Promise.all(promises);
      heroSequence.classList.add('ready');
    }

    preloadImages();

    function render(index) {
      const img = images[index];
      if (!img || !img.complete) return;

      // Canvas Cover logic
      const canvasRatio = canvas.width / canvas.height;
      const imgRatio = img.width / img.height;
      let drawWidth, drawHeight, offsetX, offsetY;

      if (canvasRatio > imgRatio) {
        drawWidth = canvas.width;
        drawHeight = canvas.width / imgRatio;
        offsetX = 0;
        offsetY = (canvas.height - drawHeight) / 2;
      } else {
        drawWidth = canvas.height * imgRatio;
        drawHeight = canvas.height;
        offsetX = (canvas.width - drawWidth) / 2;
        offsetY = 0;
      }

      context.clearRect(0, 0, canvas.width, canvas.height);
      
      // Add a slight transparency factor based on scroll ending if needed
      context.globalAlpha = 1; 
      context.drawImage(img, offsetX, offsetY, drawWidth, drawHeight);
    }

    const updateCanvasSize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      render(currentFrameIndex);
    };

    window.addEventListener('resize', updateCanvasSize);
    updateCanvasSize();

    let targetScrollFraction = 0;
    let smoothScrollFraction = 0;

    const handleHeroScroll = () => {
      const scrollTop = window.scrollY;
      const containerTop = heroSequence.offsetTop;
      const containerHeight = heroSequence.offsetHeight;
      const windowHeight = window.innerHeight;

      // Update target progress
      targetScrollFraction = Math.max(0, Math.min(1, (scrollTop - containerTop) / (containerHeight - windowHeight)));
    };

    const updateSmoothAnimation = () => {
      // Improved Lerp for ultra-smooth buttery motion
      // Lower factor (0.07) for a more cinematic "floaty" feel
      const lerpFactor = 0.08;
      const progressDiff = targetScrollFraction - smoothScrollFraction;
      
      if (Math.abs(progressDiff) > 0.0001) {
        smoothScrollFraction += progressDiff * lerpFactor;
      } else {
        smoothScrollFraction = targetScrollFraction;
      }

      const frameIndex = Math.min(frameCount - 1, Math.floor(smoothScrollFraction * frameCount));
      
      if (frameIndex !== currentFrameIndex) {
        currentFrameIndex = frameIndex;
        render(currentFrameIndex);
      }

      // Text Fade-Up Animation Logic (using smooth progress)
      // Text 1: Delivered with Care
      if (smoothScrollFraction > 0.05 && smoothScrollFraction < 0.4) {
        textPart1.classList.add('active');
        textPart1.classList.remove('fade-up-init', 'fade-up-exit');
      } else if (smoothScrollFraction >= 0.4) {
        textPart1.classList.add('fade-up-exit');
        textPart1.classList.remove('active', 'fade-up-init');
      } else {
        textPart1.classList.add('fade-up-init');
        textPart1.classList.remove('active', 'fade-up-exit');
      }

      // Text 2: Freshly For You
      if (smoothScrollFraction > 0.45 && smoothScrollFraction < 0.85) {
        textPart2.classList.add('active');
        textPart2.classList.remove('fade-up-init', 'fade-up-exit');
      } else if (smoothScrollFraction >= 0.85) {
        textPart2.classList.add('fade-up-exit');
        textPart2.classList.remove('active', 'fade-up-init');
      } else {
        textPart2.classList.add('fade-up-init');
        textPart2.classList.remove('active', 'fade-up-exit');
      }

      // Smooth Hero Fade Out at the very end
      if (smoothScrollFraction > 0.92) {
        const fadeOut = Math.max(0, 1 - (smoothScrollFraction - 0.92) / 0.08);
        canvas.style.opacity = fadeOut;
        textPart2.style.opacity = fadeOut;
      } else {
        canvas.style.opacity = 1;
      }

      // Hide Scroll Hint
      const scrollHint = document.querySelector('.hero-scroll-hint');
      if (scrollHint) {
        scrollHint.style.opacity = smoothScrollFraction > 0.05 ? '0' : '0.7';
      }

      requestAnimationFrame(updateSmoothAnimation);
    };

    window.addEventListener('scroll', handleHeroScroll, { passive: true });
    requestAnimationFrame(updateSmoothAnimation);
    handleHeroScroll();
  }

  // ---- Page Hero (inner pages) Parallax ----
  const innerPageHero = document.querySelector('.page-hero');
  if (innerPageHero) {
    const fruits = innerPageHero.querySelectorAll('.floating-fruit');
    window.addEventListener('scroll', () => {
      const scrolled = window.scrollY;
      fruits.forEach((fruit, i) => {
        const speed = 0.3 + (i * 0.05);
        fruit.style.transform = `translateY(${scrolled * speed}px) rotate(${scrolled * 0.02 * (i % 2 === 0 ? 1 : -1)}deg)`;
      });
    });
  }

  // ---- Smooth Scroll for Anchor Links ----
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = document.querySelector(targetId);
      if (target) {
        const navHeight = navbar.offsetHeight;
        const targetPosition = target.getBoundingClientRect().top + window.scrollY - navHeight - 20;
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });

  // ---- Active Nav Link ----
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a:not(.nav-cta)').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });

  // ---- Contact Form Validation ----
  const contactForm = document.getElementById('contactForm');
  if (contactForm) {
    contactForm.addEventListener('submit', function (e) {
      e.preventDefault();
      const name = this.querySelector('#name').value.trim();
      const email = this.querySelector('#email').value.trim();
      const message = this.querySelector('#message').value.trim();

      if (!name || !email || !message) {
        showNotification('Please fill in all required fields.', 'error');
        return;
      }

      if (!isValidEmail(email)) {
        showNotification('Please enter a valid email address.', 'error');
        return;
      }

      // Simulate submission
      const btn = this.querySelector('button[type="submit"]');
      const originalText = btn.textContent;
      btn.textContent = 'Sending...';
      btn.disabled = true;

      setTimeout(() => {
        showNotification('Thank you! Your message has been sent successfully.', 'success');
        this.reset();
        btn.textContent = originalText;
        btn.disabled = false;
      }, 1500);
    });
  }

  function isValidEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  function showNotification(message, type) {
    const existing = document.querySelector('.notification');
    if (existing) existing.remove();

    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    notification.style.cssText = `
      position: fixed;
      top: 100px;
      right: 24px;
      padding: 16px 28px;
      border-radius: 12px;
      font-family: var(--font-body);
      font-size: 0.95rem;
      font-weight: 500;
      z-index: 9999;
      animation: slideIn 0.3s ease;
      max-width: 400px;
      box-shadow: 0 8px 30px rgba(0,0,0,0.15);
      ${type === 'success'
        ? 'background: #E8F5E9; color: #1A5C28; border-left: 4px solid #2D8C3C;'
        : 'background: #FDEAEA; color: #D32F2F; border-left: 4px solid #D32F2F;'}
    `;

    document.body.appendChild(notification);
    setTimeout(() => {
      notification.style.opacity = '0';
      notification.style.transform = 'translateX(20px)';
      notification.style.transition = '0.3s ease';
      setTimeout(() => notification.remove(), 300);
    }, 4000);
  }

  // ---- Add slideIn animation ----
  const style = document.createElement('style');
  style.textContent = `
    @keyframes slideIn {
      from { opacity: 0; transform: translateX(40px); }
      to { opacity: 1; transform: translateX(0); }
    }
  `;
  document.head.appendChild(style);
});
