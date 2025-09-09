/**
 * ===== MOBILE UX ENHANCEMENTS =====
 * Implements mobile-first UX improvements for better conversion
 */

class MobileUXEnhancer {
  constructor() {
    this.init();
  }

  init() {
    this.setupStickyCartBar();
    this.enhanceSwipeableCarousels();
    this.optimizeTouchTargets();
    this.setupProgressBars();
  }

  /**
   * Sticky Add to Cart Bar for Mobile Product Pages
   */
  setupStickyCartBar() {
    // Only run on product pages
    if (!document.body.classList.contains('template-product')) return;

    const addToCartBtn = document.querySelector('.product-form__buttons [name="add"]');
    if (!addToCartBtn) return;

    // Create sticky cart bar
    const stickyBar = document.createElement('div');
    stickyBar.className = 'sticky-cart-mobile';
    stickyBar.innerHTML = `
      <div class="sticky-cart-content">
        <div class="sticky-cart-price">
          <span class="price" data-sticky-price></span>
        </div>
        <button type="button" class="btn btn--primary sticky-cart-btn" data-sticky-add-to-cart>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M3 1a1 1 0 000 2h1.22l.305 1.222a.997.997 0 00.01.042l1.358 5.43-.893.892C3.74 11.846 4.632 14 6.414 14H15a1 1 0 000-2H6.414l1-1H14a1 1 0 00.894-.553l3-6A1 1 0 0017 3H6.28l-.31-1.243A1 1 0 005 1H3zM16 16.5a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0zM6.5 18a1.5 1.5 0 100-3 1.5 1.5 0 000 3z"/>
          </svg>
          Add to Cart
        </button>
      </div>
    `;

    document.body.appendChild(stickyBar);

    // Show/hide based on scroll position
    let lastScrollY = window.scrollY;
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[0];
        const currentScrollY = window.scrollY;
        
        if (!entry.isIntersecting && currentScrollY > lastScrollY) {
          stickyBar.classList.add('active');
        } else {
          stickyBar.classList.remove('active');
        }
        lastScrollY = currentScrollY;
      },
      { threshold: 0.1 }
    );

    observer.observe(addToCartBtn);

    // Sync price updates
    this.syncStickyPrice();

    // Handle sticky cart button click
    const stickyAddToCart = stickyBar.querySelector('[data-sticky-add-to-cart]');
    if (stickyAddToCart && addToCartBtn instanceof HTMLElement) {
      stickyAddToCart.addEventListener('click', () => {
        addToCartBtn.click();
      });
    }
  }

  /**
   * Sync price in sticky bar with main product price
   */
  syncStickyPrice() {
    const mainPrice = document.querySelector('.product-price .price');
    const stickyPrice = document.querySelector('[data-sticky-price]');
    
    if (!mainPrice || !stickyPrice) return;

    const updateStickyPrice = () => {
      // Safely clone the price structure instead of using innerHTML
      stickyPrice.replaceChildren(...Array.from(mainPrice.childNodes).map(node => node.cloneNode(true)));
    };

    // Initial sync
    updateStickyPrice();

    // Watch for price changes (variant updates)
    const observer = new MutationObserver(updateStickyPrice);
    observer.observe(mainPrice, { childList: true, subtree: true });
  }

  /**
   * Enhanced Swipeable Carousels
   */
  enhanceSwipeableCarousels() {
    const carousels = document.querySelectorAll('[data-carousel]');
    
    carousels.forEach(carousel => {
      this.makeCarouselSwipeable(carousel);
    });
  }

  makeCarouselSwipeable(carousel) {
    let startX = 0;
    let currentX = 0;
    let isDragging = false;
    let currentSlide = 0;
    const slides = carousel.querySelectorAll('[data-slide]');
    const totalSlides = slides.length;

    if (totalSlides <= 1) return;

    // Add dots indicator
    this.addCarouselDots(carousel, totalSlides);

    // Touch events
    carousel.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
      carousel.style.transition = 'none';
    });

    carousel.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      currentX = e.touches[0].clientX;
      const diffX = startX - currentX;
      
      // Add resistance at the edges
      const resistance = Math.abs(diffX) > 50 ? 0.3 : 1;
      carousel.style.transform = `translateX(${-currentSlide * 100 - (diffX * resistance) / carousel.offsetWidth * 100}%)`;
    });

    carousel.addEventListener('touchend', (e) => {
      if (!isDragging) return;
      isDragging = false;
      
      const diffX = startX - currentX;
      const threshold = carousel.offsetWidth * 0.3;

      carousel.style.transition = 'transform 0.3s ease';

      if (Math.abs(diffX) > threshold) {
        if (diffX > 0 && currentSlide < totalSlides - 1) {
          currentSlide++;
        } else if (diffX < 0 && currentSlide > 0) {
          currentSlide--;
        }
      }

      this.goToSlide(carousel, currentSlide);
    });
  }

  addCarouselDots(carousel, totalSlides) {
    const dotsContainer = document.createElement('div');
    dotsContainer.className = 'carousel-controls';
    
    for (let i = 0; i < totalSlides; i++) {
      const dot = document.createElement('button');
      dot.className = `carousel-dot ${i === 0 ? 'active' : ''}`;
      dot.setAttribute('aria-label', `Go to slide ${i + 1}`);
      dot.addEventListener('click', () => this.goToSlide(carousel, i));
      dotsContainer.appendChild(dot);
    }

    carousel.parentNode.appendChild(dotsContainer);
  }

  goToSlide(carousel, slideIndex) {
    carousel.style.transform = `translateX(-${slideIndex * 100}%)`;
    
    // Update dots
    const dots = carousel.parentNode.querySelectorAll('.carousel-dot');
    dots.forEach((dot, index) => {
      dot.classList.toggle('active', index === slideIndex);
    });
  }

  /**
   * Ensure all interactive elements meet touch target requirements
   */
  optimizeTouchTargets() {
    const interactiveElements = document.querySelectorAll('button, a, input[type="checkbox"], input[type="radio"], .swatch, .variant-option');
    
    interactiveElements.forEach(element => {
      const styles = window.getComputedStyle(element);
      const height = parseInt(styles.height);
      const width = parseInt(styles.width);
      
      // Ensure minimum 44px touch target
      if (height < 44) {
        element.style.minHeight = '44px';
        element.style.display = element.style.display || 'flex';
        element.style.alignItems = 'center';
        element.style.justifyContent = 'center';
      }
      
      if (width < 44) {
        element.style.minWidth = '44px';
      }
    });
  }

  /**
   * Free Shipping Progress Bar
   */
  setupProgressBars() {
    this.setupShippingProgressBar();
  }

  setupShippingProgressBar() {
    const cart = document.querySelector('[data-cart]');
    if (!cart) return;

    const freeShippingThreshold = 75; // $75 for free shipping - this should be configurable
    
    const createProgressBar = () => {
      const progressContainer = document.createElement('div');
      progressContainer.className = 'shipping-progress';
      progressContainer.innerHTML = `
        <div class="shipping-progress__bar">
          <div class="shipping-progress__fill" data-progress-fill></div>
        </div>
        <div class="shipping-progress__text" data-progress-text></div>
      `;
      
      return progressContainer;
    };

    const updateProgress = (cartTotal) => {
      const progressFill = document.querySelector('[data-progress-fill]');
      const progressText = document.querySelector('[data-progress-text]');
      
      if (!progressFill || !progressText) return;

      const remaining = Math.max(0, freeShippingThreshold - cartTotal);
      const progress = Math.min(100, (cartTotal / freeShippingThreshold) * 100);
      
      progressFill.style.width = `${progress}%`;
      
      if (remaining === 0) {
        progressText.textContent = '🎉 You qualify for free shipping!';
        progressText.className = 'shipping-progress__text shipping-progress__text--complete';
      } else {
        progressText.textContent = `Add $${remaining.toFixed(2)} more for free shipping`;
        progressText.className = 'shipping-progress__text';
      }
    };

    // Add progress bar to cart and monitor changes
    const cartDrawer = document.querySelector('[data-cart-drawer]');
    if (cartDrawer && !cartDrawer.querySelector('.shipping-progress')) {
      const progressBar = createProgressBar();
      cartDrawer.insertBefore(progressBar, cartDrawer.firstChild);
      
      // Monitor cart changes
      const observer = new MutationObserver(() => {
        const totalElement = document.querySelector('[data-cart-total]');
        if (totalElement) {
          const total = parseFloat(totalElement.textContent.replace(/[^0-9.]/g, ''));
          updateProgress(total);
        }
      });
      
      observer.observe(cartDrawer, { childList: true, subtree: true });
    }
  }
}

// Initialize when DOM is loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => new MobileUXEnhancer());
} else {
  new MobileUXEnhancer();
}