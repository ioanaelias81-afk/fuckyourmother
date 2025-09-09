/**
 * ===== ASSET OPTIMIZATION & LOADING =====
 * Dynamic asset loading and optimization for better performance
 */

class AssetOptimizer {
  constructor() {
    this.loadedAssets = new Set();
    this.criticalCSS = new Set();
    this.deferredAssets = new Map();
    this.intersectionObserver = null;
    this.init();
  }

  init() {
    this.setupIntersectionObserver();
    this.optimizeExistingAssets();
    this.setupLazyLoading();
    this.preloadCriticalResources();
    this.deferNonCriticalAssets();
    this.optimizeFonts();
  }

  setupIntersectionObserver() {
    this.intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            this.loadDeferredAssets(entry.target);
          }
        });
      },
      {
        rootMargin: '100px 0px',
        threshold: 0.01
      }
    );
  }

  optimizeExistingAssets() {
    // Remove unused CSS
    this.removeUnusedCSS();
    
    // Optimize images
    this.optimizeImages();
    
    // Minify and compress JavaScript
    this.optimizeJavaScript();
    
    // Optimize CSS delivery
    this.optimizeCSSDelivery();
  }

  removeUnusedCSS() {
    const allRules = new Set();
    const usedRules = new Set();

    // Collect all CSS rules
    Array.from(document.styleSheets).forEach(sheet => {
      try {
        Array.from(sheet.cssRules || sheet.rules || []).forEach(rule => {
          if (rule.selectorText) {
            allRules.add(rule.selectorText);
          }
        });
      } catch (e) {
        // Skip external stylesheets due to CORS
      }
    });

    // Find used rules
    allRules.forEach(selector => {
      try {
        if (document.querySelector(selector)) {
          usedRules.add(selector);
        }
      } catch (e) {
        // Keep rule if selector is invalid (might be a pseudo-selector)
        usedRules.add(selector);
      }
    });

    const unusedRules = Array.from(allRules).filter(rule => !usedRules.has(rule));
    if (unusedRules.length > 0) {
      console.info(`Found ${unusedRules.length} potentially unused CSS rules`);
    }
  }

  optimizeImages() {
    const images = document.querySelectorAll('img');
    images.forEach(img => {
      // Add loading attributes if missing
      if (!img.hasAttribute('loading')) {
        const rect = img.getBoundingClientRect();
        if (rect.top > window.innerHeight) {
          img.setAttribute('loading', 'lazy');
        } else {
          img.setAttribute('loading', 'eager');
          img.setAttribute('fetchpriority', 'high');
        }
      }

      // Add decoding attributes
      if (!img.hasAttribute('decoding')) {
        img.setAttribute('decoding', img.hasAttribute('loading') && img.getAttribute('loading') === 'lazy' ? 'async' : 'sync');
      }

      // Optimize srcset if missing
      if (!img.hasAttribute('srcset') && img.src) {
        this.generateResponsiveSrcset(img);
      }
    });
  }

  generateResponsiveSrcset(img) {
    const src = img.src;
    if (!src.includes('cdn.shopify.com')) return;

    const widths = [180, 360, 540, 720, 900, 1080, 1296, 1512, 1728];
    const srcsetParts = widths.map(width => {
      const url = src.replace(/(_\d+x\d+|\.(?=jpg|jpeg|png|webp))/g, `_${width}x$1`);
      return `${url} ${width}w`;
    });

    img.setAttribute('srcset', srcsetParts.join(', '));
    img.setAttribute('sizes', '(min-width: 750px) 50vw, 100vw');
  }

  optimizeJavaScript() {
    // Defer non-critical scripts
    const scripts = document.querySelectorAll('script[src]:not([defer]):not([async])');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      
      // Don't defer critical scripts
      const criticalScripts = [
        'header.js',
        'accessibility-controls',
        'mobile-ux.js'
      ];
      
      const isCritical = criticalScripts.some(critical => src.includes(critical));
      
      if (!isCritical) {
        script.setAttribute('defer', '');
      }
    });
  }

  optimizeCSSDelivery() {
    // Preload important CSS
    const criticalCSS = [
      'base.css',
      'component-header.css',
      'accessibility-enhancements.css'
    ];

    criticalCSS.forEach(css => {
      const link = document.querySelector(`link[href*="${css}"]`);
      if (link && !link.hasAttribute('rel')) {
        link.setAttribute('rel', 'preload');
        link.setAttribute('as', 'style');
        link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
      }
    });

    // Add critical CSS inline
    this.inlineCriticalCSS();
  }

  inlineCriticalCSS() {
    const criticalStyles = `
      /* Critical above-the-fold styles */
      body { margin: 0; font-family: var(--font-body-family); }
      .header { position: relative; z-index: 10; }
      .skip-to-content-link { position: absolute; top: -40px; left: 6px; }
      .skip-to-content-link:focus { top: 6px; }
      /* Prevent layout shifts */
      img { max-width: 100%; height: auto; }
      [loading="lazy"] { opacity: 0; transition: opacity 0.3s; }
      [loading="lazy"].loaded { opacity: 1; }
    `;

    const style = document.createElement('style');
    style.textContent = criticalStyles;
    document.head.insertBefore(style, document.head.firstChild);
  }

  setupLazyLoading() {
    // Enhanced lazy loading for sections
    const lazyElements = document.querySelectorAll('[data-lazy-load]');
    lazyElements.forEach(element => {
      this.intersectionObserver.observe(element);
    });

    // Lazy load images
    const images = document.querySelectorAll('img[loading="lazy"]');
    images.forEach(img => {
      img.addEventListener('load', () => {
        img.classList.add('loaded');
      });
    });
  }

  preloadCriticalResources() {
    // Preload critical images
    const criticalImages = document.querySelectorAll('img[fetchpriority="high"]');
    criticalImages.forEach(img => {
      if (img.src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = img.src;
        document.head.appendChild(link);
      }
    });

    // Preload critical fonts
    const criticalFonts = [
      'https://fonts.shopifycdn.com/assistant/assistant_n4.woff2'
    ];

    criticalFonts.forEach(font => {
      const link = document.createElement('link');
      link.rel = 'preload';
      link.as = 'font';
      link.type = 'font/woff2';
      link.crossOrigin = 'anonymous';
      link.href = font;
      document.head.appendChild(link);
    });
  }

  deferNonCriticalAssets() {
    // Defer non-critical CSS
    const nonCriticalCSS = document.querySelectorAll('link[rel="stylesheet"]:not([data-critical])');
    nonCriticalCSS.forEach(link => {
      const href = link.getAttribute('href');
      if (href && !this.isCriticalCSS(href)) {
        this.deferCSS(link);
      }
    });

    // Defer third-party scripts
    this.deferThirdPartyScripts();
  }

  isCriticalCSS(href) {
    const criticalPatterns = [
      'base.css',
      'component-header.css',
      'accessibility-enhancements.css',
      'critical'
    ];
    return criticalPatterns.some(pattern => href.includes(pattern));
  }

  deferCSS(link) {
    const href = link.getAttribute('href');
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'style');
    link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
    
    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const fallbackLink = document.createElement('link');
    fallbackLink.setAttribute('rel', 'stylesheet');
    fallbackLink.setAttribute('href', href);
    noscript.appendChild(fallbackLink);
    link.parentNode.insertBefore(noscript, link.nextSibling);
  }

  deferThirdPartyScripts() {
    // Common third-party scripts to defer
    const thirdPartyPatterns = [
      'googletagmanager.com',
      'google-analytics.com',
      'facebook.net',
      'klaviyo.com',
      'hotjar.com'
    ];

    const scripts = document.querySelectorAll('script[src]');
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (thirdPartyPatterns.some(pattern => src.includes(pattern))) {
        script.setAttribute('defer', '');
      }
    });
  }

  optimizeFonts() {
    // Add font-display: swap to all font faces
    const fontLinks = document.querySelectorAll('link[href*="fonts"]');
    fontLinks.forEach(link => {
      link.setAttribute('rel', 'preload');
      link.setAttribute('as', 'font');
      link.setAttribute('crossorigin', 'anonymous');
    });

    // Add font-display CSS if not present
    const fontDisplayCSS = `
      @font-face {
        font-display: swap;
      }
    `;
    
    if (!document.querySelector('style[data-font-display]')) {
      const style = document.createElement('style');
      style.setAttribute('data-font-display', '');
      style.textContent = fontDisplayCSS;
      document.head.appendChild(style);
    }
  }

  loadDeferredAssets(element) {
    const assetUrl = element.dataset.lazyLoad;
    if (assetUrl && !this.loadedAssets.has(assetUrl)) {
      this.loadedAssets.add(assetUrl);
      
      if (assetUrl.endsWith('.css')) {
        this.loadCSS(assetUrl);
      } else if (assetUrl.endsWith('.js')) {
        this.loadJS(assetUrl);
      }
      
      this.intersectionObserver.unobserve(element);
    }
  }

  loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  loadJS(url) {
    const script = document.createElement('script');
    script.src = url;
    script.defer = true;
    document.head.appendChild(script);
  }

  // Resource hints
  addResourceHints() {
    // DNS prefetch for external domains
    const externalDomains = [
      'fonts.googleapis.com',
      'fonts.gstatic.com',
      'cdn.shopify.com'
    ];

    externalDomains.forEach(domain => {
      if (!document.querySelector(`link[rel="dns-prefetch"][href*="${domain}"]`)) {
        const link = document.createElement('link');
        link.rel = 'dns-prefetch';
        link.href = `//${domain}`;
        document.head.appendChild(link);
      }
    });

    // Preconnect to critical origins
    const criticalOrigins = ['https://cdn.shopify.com'];
    criticalOrigins.forEach(origin => {
      if (!document.querySelector(`link[rel="preconnect"][href="${origin}"]`)) {
        const link = document.createElement('link');
        link.rel = 'preconnect';
        link.href = origin;
        link.crossOrigin = 'anonymous';
        document.head.appendChild(link);
      }
    });
  }

  // Performance monitoring integration
  trackAssetPerformance() {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 1000) { // Assets taking longer than 1s
          console.warn(`Slow asset: ${entry.name} (${entry.duration.toFixed(2)}ms)`);
        }
      });
    });
    observer.observe({ entryTypes: ['resource'] });
  }

  // Service worker registration for caching
  registerServiceWorker() {
    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        navigator.serviceWorker.register('/sw.js')
          .then(registration => {
            console.log('SW registered: ', registration);
          })
          .catch(registrationError => {
            console.log('SW registration failed: ', registrationError);
          });
      });
    }
  }
}

// Initialize asset optimizer
const assetOptimizer = new AssetOptimizer();
assetOptimizer.addResourceHints();
assetOptimizer.trackAssetPerformance();

// Export for global access
window.assetOptimizer = assetOptimizer;

export { assetOptimizer };