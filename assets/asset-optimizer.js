/**
 * ===== ASSET OPTIMIZATION & LOADING =====
 * Dynamic asset loading and optimization for better performance
 * @ts-check
 */

// Extend Window interface for TypeScript compatibility
/** @typedef {Window & { assetOptimizer?: AssetOptimizer }} WindowWithAssetOptimizer */

// Type definitions
/** @typedef {CSSStyleRule | CSSImportRule | CSSMediaRule} CSSRuleWithSelector */
/** @typedef {HTMLImageElement} ImageElement */
/** @typedef {HTMLLinkElement} LinkElement */
/** @typedef {HTMLScriptElement} ScriptElement */

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
          // Type guard for CSS rules with selectors
          const styleRule = /** @type {CSSRuleWithSelector} */ (rule);
          if (styleRule && 'selectorText' in styleRule && styleRule.selectorText) {
            allRules.add(styleRule.selectorText);
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

  /**
   * Generate responsive srcset for images
   * @param {ImageElement} img - The image element to optimize
   */
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
      
      const isCritical = src ? criticalScripts.some(critical => src.includes(critical)) : false;
      
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
      if (this.intersectionObserver) {
        this.intersectionObserver.observe(element);
      }
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
      const imageElement = /** @type {ImageElement} */ (img);
      if (imageElement && imageElement.src) {
        const link = document.createElement('link');
        link.rel = 'preload';
        link.as = 'image';
        link.href = imageElement.src;
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
      const linkElement = /** @type {LinkElement} */ (link);
      const href = linkElement.getAttribute('href');
      if (href && !this.isCriticalCSS(href)) {
        this.deferCSS(linkElement);
      }
    });

    // Defer third-party scripts
    this.deferThirdPartyScripts();
  }

  /**
   * Check if CSS file is critical
   * @param {string} href - The CSS file href
   * @returns {boolean} Whether the CSS is critical
   */
  isCriticalCSS(href) {
    const criticalPatterns = [
      'base.css',
      'component-header.css',
      'accessibility-enhancements.css',
      'critical'
    ];
    return criticalPatterns.some(pattern => href.includes(pattern));
  }

  /**
   * Defer CSS loading for better performance
   * @param {LinkElement} link - The link element to defer
   */
  deferCSS(link) {
    const href = link.getAttribute('href');
    if (!href) return; // Early return if href is null
    
    link.setAttribute('rel', 'preload');
    link.setAttribute('as', 'style');
    link.setAttribute('onload', "this.onload=null;this.rel='stylesheet'");
    
    // Add noscript fallback
    const noscript = document.createElement('noscript');
    const fallbackLink = document.createElement('link');
    fallbackLink.setAttribute('rel', 'stylesheet');
    fallbackLink.setAttribute('href', href);
    noscript.appendChild(fallbackLink);
    
    // Safe parentNode access with null check
    const parentNode = link.parentNode;
    if (parentNode) {
      parentNode.insertBefore(noscript, link.nextSibling);
    }
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
      if (src && thirdPartyPatterns.some(pattern => src.includes(pattern))) {
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

  /**
   * Load deferred assets when they come into view
   * @param {Element} element - The element with deferred assets
   */
  loadDeferredAssets(element) {
    // Safe casting to HTMLElement to access dataset
    const htmlElement = /** @type {HTMLElement} */ (element);
    const assetUrl = htmlElement.dataset?.lazyLoad;
    
    if (assetUrl && !this.loadedAssets.has(assetUrl)) {
      this.loadedAssets.add(assetUrl);
      
      if (assetUrl.endsWith('.css')) {
        this.loadCSS(assetUrl);
      } else if (assetUrl.endsWith('.js')) {
        this.loadJS(assetUrl);
      }
      
      if (this.intersectionObserver) {
        this.intersectionObserver.unobserve(element);
      }
    }
  }

  /**
   * Dynamically load CSS file
   * @param {string} url - The CSS file URL
   */
  loadCSS(url) {
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = url;
    document.head.appendChild(link);
  }

  /**
   * Dynamically load JavaScript file
   * @param {string} url - The JavaScript file URL
   */
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

// Export for global access with proper typing
/** @type {WindowWithAssetOptimizer} */ (window).assetOptimizer = assetOptimizer;

export { assetOptimizer };