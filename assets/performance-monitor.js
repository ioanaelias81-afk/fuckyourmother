/**
 * ===== PERFORMANCE MONITORING & OPTIMIZATION =====
 * Continuous performance monitoring and optimization toolkit
 */

class PerformanceMonitor {
  constructor() {
    this.metrics = new Map();
    this.observers = new Map();
    this.thresholds = {
      LCP: 2500, // Large Contentful Paint
      FID: 100,  // First Input Delay
      CLS: 0.1,  // Cumulative Layout Shift
      FCP: 1800, // First Contentful Paint
      TTFB: 800  // Time to First Byte
    };
    this.init();
  }

  init() {
    if (typeof window === 'undefined') return;
    
    this.measureCoreWebVitals();
    this.measureCustomMetrics();
    this.setupPerformanceObserver();
    this.trackResourceLoading();
    this.monitorMemoryUsage();
    this.setupErrorTracking();
  }

  measureCoreWebVitals() {
    // Largest Contentful Paint (LCP)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      const lastEntry = entries[entries.length - 1];
      const lcp = lastEntry.startTime;
      
      this.recordMetric('LCP', lcp);
      
      if (lcp > this.thresholds.LCP) {
        console.warn(`LCP is ${lcp}ms, exceeds threshold of ${this.thresholds.LCP}ms`);
        this.optimizeLCP();
      }
    }).observe({ entryTypes: ['largest-contentful-paint'] });

    // First Input Delay (FID)
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const fid = entry.processingStart - entry.startTime;
        this.recordMetric('FID', fid);
        
        if (fid > this.thresholds.FID) {
          console.warn(`FID is ${fid}ms, exceeds threshold of ${this.thresholds.FID}ms`);
          this.optimizeFID();
        }
      });
    }).observe({ entryTypes: ['first-input'] });

    // Cumulative Layout Shift (CLS)
    let clsValue = 0;
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (!entry.hadRecentInput) {
          clsValue += entry.value;
        }
      });
      
      this.recordMetric('CLS', clsValue);
      
      if (clsValue > this.thresholds.CLS) {
        console.warn(`CLS is ${clsValue}, exceeds threshold of ${this.thresholds.CLS}`);
        this.optimizeCLS();
      }
    }).observe({ entryTypes: ['layout-shift'] });
  }

  measureCustomMetrics() {
    // Time to Interactive (TTI)
    const ttiObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.name === 'first-contentful-paint') {
          this.recordMetric('FCP', entry.startTime);
        }
      });
    });
    ttiObserver.observe({ entryTypes: ['paint'] });

    // Navigation timing
    window.addEventListener('load', () => {
      const navTiming = performance.getEntriesByType('navigation')[0];
      if (navTiming) {
        this.recordMetric('TTFB', navTiming.responseStart - navTiming.requestStart);
        this.recordMetric('DOMContentLoaded', navTiming.domContentLoadedEventEnd - navTiming.domContentLoadedEventStart);
        this.recordMetric('LoadEvent', navTiming.loadEventEnd - navTiming.loadEventStart);
      }
    });
  }

  setupPerformanceObserver() {
    // Monitor long tasks
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        if (entry.duration > 50) {
          console.warn(`Long task detected: ${entry.duration}ms`);
          this.recordMetric('LongTask', entry.duration);
        }
      });
    }).observe({ entryTypes: ['longtask'] });

    // Monitor resource loading
    new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        this.analyzeResourceTiming(entry);
      });
    }).observe({ entryTypes: ['resource'] });
  }

  trackResourceLoading() {
    const resourceObserver = new PerformanceObserver((entryList) => {
      const entries = entryList.getEntries();
      entries.forEach(entry => {
        const duration = entry.responseEnd - entry.startTime;
        
        // Categorize resources
        let resourceType = 'other';
        if (entry.name.includes('.css')) resourceType = 'css';
        else if (entry.name.includes('.js')) resourceType = 'js';
        else if (/\.(jpg|jpeg|png|gif|webp|svg)/.test(entry.name)) resourceType = 'image';
        else if (/\.(woff|woff2|ttf|otf)/.test(entry.name)) resourceType = 'font';

        this.recordMetric(`resource_${resourceType}`, duration);

        // Warn about slow resources
        if (duration > 3000) {
          console.warn(`Slow ${resourceType} resource: ${entry.name} (${duration}ms)`);
        }
      });
    });
    resourceObserver.observe({ entryTypes: ['resource'] });
  }

  monitorMemoryUsage() {
    if ('memory' in performance) {
      setInterval(() => {
        const memory = performance.memory;
        this.recordMetric('heapUsed', memory.usedJSHeapSize);
        this.recordMetric('heapTotal', memory.totalJSHeapSize);
        this.recordMetric('heapLimit', memory.jsHeapSizeLimit);

        // Warn about high memory usage
        const usagePercent = (memory.usedJSHeapSize / memory.jsHeapSizeLimit) * 100;
        if (usagePercent > 70) {
          console.warn(`High memory usage: ${usagePercent.toFixed(2)}%`);
        }
      }, 5000);
    }
  }

  setupErrorTracking() {
    window.addEventListener('error', (event) => {
      this.recordMetric('JSError', {
        message: event.message,
        source: event.filename,
        line: event.lineno,
        column: event.colno,
        timestamp: Date.now()
      });
    });

    window.addEventListener('unhandledrejection', (event) => {
      this.recordMetric('UnhandledPromise', {
        reason: event.reason,
        timestamp: Date.now()
      });
    });
  }

  analyzeResourceTiming(entry) {
    const timing = {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ssl: entry.secureConnectionStart > 0 ? entry.connectEnd - entry.secureConnectionStart : 0,
      ttfb: entry.responseStart - entry.requestStart,
      download: entry.responseEnd - entry.responseStart,
      total: entry.responseEnd - entry.startTime
    };

    // Identify optimization opportunities
    if (timing.dns > 50) {
      console.warn(`Slow DNS lookup for ${entry.name}: ${timing.dns}ms`);
    }
    if (timing.ssl > 200) {
      console.warn(`Slow SSL negotiation for ${entry.name}: ${timing.ssl}ms`);
    }
    if (timing.ttfb > 500) {
      console.warn(`Slow server response for ${entry.name}: ${timing.ttfb}ms`);
    }
  }

  recordMetric(name, value) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, []);
    }
    this.metrics.get(name).push({
      value,
      timestamp: Date.now(),
      url: window.location.href
    });
  }

  getMetrics() {
    const summary = {};
    this.metrics.forEach((values, name) => {
      summary[name] = {
        count: values.length,
        latest: values[values.length - 1]?.value,
        average: values.reduce((sum, entry) => sum + (typeof entry.value === 'number' ? entry.value : 0), 0) / values.length
      };
    });
    return summary;
  }

  generatePerformanceReport() {
    const report = {
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      metrics: this.getMetrics(),
      recommendations: this.generateRecommendations()
    };

    console.group('🚀 Performance Report');
    console.table(report.metrics);
    console.log('Recommendations:', report.recommendations);
    console.groupEnd();

    return report;
  }

  generateRecommendations() {
    const recommendations = [];
    const metrics = this.getMetrics();

    // LCP recommendations
    if (metrics.LCP?.latest > this.thresholds.LCP) {
      recommendations.push({
        issue: 'Large Contentful Paint (LCP) is too slow',
        suggestion: 'Optimize largest content element, preload critical resources, use efficient image formats'
      });
    }

    // FID recommendations
    if (metrics.FID?.latest > this.thresholds.FID) {
      recommendations.push({
        issue: 'First Input Delay (FID) is too high',
        suggestion: 'Reduce JavaScript execution time, break up long tasks, use requestIdleCallback'
      });
    }

    // CLS recommendations
    if (metrics.CLS?.latest > this.thresholds.CLS) {
      recommendations.push({
        issue: 'Cumulative Layout Shift (CLS) is too high',
        suggestion: 'Set dimensions for images and videos, avoid inserting content above existing content'
      });
    }

    // Resource loading recommendations
    if (metrics.resource_css?.latest > 1000) {
      recommendations.push({
        issue: 'CSS loading is slow',
        suggestion: 'Minify CSS, eliminate unused styles, use critical CSS inlining'
      });
    }

    if (metrics.resource_js?.latest > 1500) {
      recommendations.push({
        issue: 'JavaScript loading is slow',
        suggestion: 'Minify and compress JS, use code splitting, defer non-critical scripts'
      });
    }

    return recommendations;
  }

  optimizeLCP() {
    // Preload LCP image if it's an image
    const lcpElements = document.querySelectorAll('img, video, svg');
    lcpElements.forEach(element => {
      if (element.getBoundingClientRect().top < window.innerHeight) {
        if (element.tagName === 'IMG' && !element.hasAttribute('loading')) {
          element.setAttribute('fetchpriority', 'high');
        }
      }
    });
  }

  optimizeFID() {
    // Break up long tasks
    if ('scheduler' in window && 'postTask' in scheduler) {
      // Use scheduler API to yield to browser
      console.info('Using Scheduler API for better task management');
    } else {
      // Fallback to setTimeout for yielding
      console.info('Using setTimeout fallback for task yielding');
    }
  }

  optimizeCLS() {
    // Add dimensions to images without them
    const images = document.querySelectorAll('img:not([width]):not([height])');
    images.forEach(img => {
      if (img.naturalWidth && img.naturalHeight) {
        img.setAttribute('width', img.naturalWidth.toString());
        img.setAttribute('height', img.naturalHeight.toString());
      }
    });
  }

  startContinuousMonitoring() {
    // Generate reports every 30 seconds
    setInterval(() => {
      this.generatePerformanceReport();
    }, 30000);

    // Send performance data to analytics (if available)
    setInterval(() => {
      this.sendToAnalytics();
    }, 60000);
  }

  sendToAnalytics() {
    const metrics = this.getMetrics();
    
    // Example: Send to Google Analytics 4
    if (typeof gtag === 'function') {
      Object.entries(metrics).forEach(([name, data]) => {
        if (typeof data.latest === 'number') {
          gtag('event', 'performance_metric', {
            event_category: 'Performance',
            event_label: name,
            value: Math.round(data.latest)
          });
        }
      });
    }

    // Example: Send to custom analytics endpoint
    if (window.PERFORMANCE_ENDPOINT) {
      fetch(window.PERFORMANCE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: window.location.href,
          metrics: metrics,
          timestamp: Date.now()
        })
      }).catch(err => console.warn('Failed to send performance data:', err));
    }
  }
}

// Initialize performance monitoring
const performanceMonitor = new PerformanceMonitor();

// Export for global access
window.performanceMonitor = performanceMonitor;

// Start continuous monitoring if not in development
if (!window.location.hostname.includes('localhost') && 
    !window.location.hostname.includes('127.0.0.1')) {
  performanceMonitor.startContinuousMonitoring();
}

// Add keyboard shortcut for performance report (Ctrl+Shift+P)
document.addEventListener('keydown', (e) => {
  if (e.ctrlKey && e.shiftKey && e.key === 'P') {
    e.preventDefault();
    performanceMonitor.generatePerformanceReport();
  }
});

export { performanceMonitor };