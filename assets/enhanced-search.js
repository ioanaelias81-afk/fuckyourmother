/**
 * ===== ENHANCED PREDICTIVE SEARCH =====
 * Smart search with better UX and performance
 */

class EnhancedPredictiveSearch {
  constructor() {
    this.searchInput = document.querySelector('[data-search-input]');
    this.searchResults = document.querySelector('[data-search-results]');
    this.searchForm = document.querySelector('[data-search-form]');
    this.debounceTimer = null;
    this.currentQuery = '';
    this.searchHistory = JSON.parse(localStorage.getItem('searchHistory') || '[]');
    
    if (this.searchInput) {
      this.init();
    }
  }

  init() {
    this.bindEvents();
    this.addSearchEnhancements();
  }

  bindEvents() {
    // Enhanced search input with debouncing
    this.searchInput.addEventListener('input', (e) => {
      const query = e.target.value.trim();
      
      clearTimeout(this.debounceTimer);
      this.debounceTimer = setTimeout(() => {
        this.handleSearch(query);
      }, 300);
    });

    // Keyboard navigation
    this.searchInput.addEventListener('keydown', (e) => {
      this.handleKeyboardNavigation(e);
    });

    // Click outside to close
    document.addEventListener('click', (e) => {
      if (!e.target.closest('[data-search-container]')) {
        this.hideResults();
      }
    });

    // Search form submission tracking
    if (this.searchForm) {
      this.searchForm.addEventListener('submit', (e) => {
        const query = this.searchInput.value.trim();
        if (query) {
          this.addToSearchHistory(query);
        }
      });
    }
  }

  addSearchEnhancements() {
    // Add search suggestions container
    if (!this.searchResults) {
      this.createSearchContainer();
    }

    // Add recent searches and popular searches
    this.addSearchSuggestions();
  }

  createSearchContainer() {
    const container = document.createElement('div');
    container.setAttribute('data-search-results', '');
    container.className = 'predictive-search-results';
    container.innerHTML = `
      <div class="search-suggestions" data-search-suggestions>
        <div class="search-recent" data-search-recent></div>
        <div class="search-popular" data-search-popular></div>
      </div>
      <div class="search-results-content" data-search-content></div>
    `;
    
    this.searchInput.parentNode.appendChild(container);
    this.searchResults = container;
  }

  handleSearch(query) {
    if (query.length < 2) {
      this.showSuggestions();
      return;
    }

    if (query === this.currentQuery) return;
    this.currentQuery = query;

    // Show loading state
    this.showLoading();

    // Fetch results
    this.fetchSearchResults(query);
  }

  async fetchSearchResults(query) {
    try {
      const url = `/search/suggest.json?q=${encodeURIComponent(query)}&resources[type]=product,collection,article&resources[limit]=8`;
      
      const response = await fetch(url);
      const data = await response.json();
      
      this.displayResults(data, query);
    } catch (error) {
      console.error('Search error:', error);
      this.hideResults();
    }
  }

  displayResults(data, query) {
    const content = this.searchResults.querySelector('[data-search-content]');
    
    let resultsHTML = '';

    // Products
    if (data.resources.results.products.length > 0) {
      resultsHTML += this.renderProducts(data.resources.results.products);
    }

    // Collections
    if (data.resources.results.collections.length > 0) {
      resultsHTML += this.renderCollections(data.resources.results.collections);
    }

    // Articles
    if (data.resources.results.articles.length > 0) {
      resultsHTML += this.renderArticles(data.resources.results.articles);
    }

    // No results
    if (!resultsHTML) {
      resultsHTML = this.renderNoResults(query);
    }

    content.innerHTML = resultsHTML;
    this.showResults();
    
    // Add "View all results" link
    this.addViewAllLink(query);
  }

  renderProducts(products) {
    return `
      <div class="search-section">
        <h3 class="search-section-title">Products</h3>
        <div class="search-products">
          ${products.map(product => `
            <a href="${product.url}" class="search-product-item">
              <div class="search-product-image">
                <img src="${product.featured_image?.url || ''}" alt="${product.title}" loading="lazy">
              </div>
              <div class="search-product-content">
                <h4 class="search-product-title">${product.title}</h4>
                <div class="search-product-price">${this.formatPrice(product.price)}</div>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderCollections(collections) {
    return `
      <div class="search-section">
        <h3 class="search-section-title">Collections</h3>
        <div class="search-collections">
          ${collections.map(collection => `
            <a href="${collection.url}" class="search-collection-item">
              <div class="search-collection-image">
                <img src="${collection.featured_image?.url || ''}" alt="${collection.title}" loading="lazy">
              </div>
              <div class="search-collection-content">
                <h4 class="search-collection-title">${collection.title}</h4>
                <p class="search-collection-count">${collection.products_count || 0} products</p>
              </div>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderArticles(articles) {
    return `
      <div class="search-section">
        <h3 class="search-section-title">Articles</h3>
        <div class="search-articles">
          ${articles.map(article => `
            <a href="${article.url}" class="search-article-item">
              <h4 class="search-article-title">${article.title}</h4>
              <p class="search-article-summary">${article.summary || ''}</p>
            </a>
          `).join('')}
        </div>
      </div>
    `;
  }

  renderNoResults(query) {
    return `
      <div class="search-no-results">
        <h3>No results found for "${query}"</h3>
        <p>Try searching for something else or browse our collections</p>
        <div class="search-suggestions-fallback">
          <a href="/collections" class="btn btn--secondary">Browse Collections</a>
        </div>
      </div>
    `;
  }

  addViewAllLink(query) {
    const content = this.searchResults.querySelector('[data-search-content]');
    const viewAllLink = document.createElement('div');
    viewAllLink.className = 'search-view-all';
    viewAllLink.innerHTML = `
      <a href="/search?q=${encodeURIComponent(query)}" class="search-view-all-link">
        View all results for "${query}" →
      </a>
    `;
    content.appendChild(viewAllLink);
  }

  showSuggestions() {
    const suggestions = this.searchResults.querySelector('[data-search-suggestions]');
    const content = this.searchResults.querySelector('[data-search-content]');
    
    suggestions.style.display = 'block';
    content.style.display = 'none';
    this.searchResults.classList.add('predictive-search-results--show');
  }

  showLoading() {
    const content = this.searchResults.querySelector('[data-search-content]');
    content.innerHTML = `
      <div class="search-loading">
        <div class="search-loading-spinner"></div>
        <p>Searching...</p>
      </div>
    `;
    this.showResults();
  }

  showResults() {
    const suggestions = this.searchResults.querySelector('[data-search-suggestions]');
    const content = this.searchResults.querySelector('[data-search-content]');
    
    suggestions.style.display = 'none';
    content.style.display = 'block';
    this.searchResults.classList.add('predictive-search-results--show');
  }

  hideResults() {
    this.searchResults.classList.remove('predictive-search-results--show');
    this.currentQuery = '';
  }

  addSearchSuggestions() {
    const recent = this.searchResults.querySelector('[data-search-recent]');
    const popular = this.searchResults.querySelector('[data-search-popular]');
    
    // Recent searches
    if (this.searchHistory.length > 0) {
      recent.innerHTML = `
        <h3>Recent Searches</h3>
        <div class="search-history">
        </div>
      `;
      
      const historyContainer = recent.querySelector('.search-history');
      this.searchHistory.slice(0, 5).forEach(term => {
        const button = document.createElement('button');
        button.className = 'search-history-item';
        button.setAttribute('data-search-term', term);
        
        button.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 16A8 8 0 1 0 8 0a8 8 0 0 0 0 16zm3.5-9L9 8.5l1.5 1.5-.5.5L8.5 9 7 10.5 6.5 10l1.5-1.5L6.5 7 7 6.5 8.5 8 10 6.5l.5.5z"/>
          </svg>
        `;
        
        const textNode = document.createTextNode(term);
        button.appendChild(textNode);
        historyContainer.appendChild(button);
      });
    }

    // Popular searches (hardcoded for demo, could be dynamic)
    popular.innerHTML = `
      <h3>Popular Searches</h3>
      <div class="search-popular-terms">
        ${['new arrivals', 'bestsellers', 'sale', 'accessories'].map(term => `
          <button class="search-popular-item" data-search-term="${term}">
            ${term}
          </button>
        `).join('')}
      </div>
    `;

    // Bind suggestion clicks
    this.searchResults.addEventListener('click', (e) => {
      const searchTerm = e.target.closest('[data-search-term]');
      if (searchTerm) {
        e.preventDefault();
        const term = searchTerm.dataset.searchTerm;
        this.searchInput.value = term;
        this.handleSearch(term);
      }
    });
  }

  addToSearchHistory(query) {
    this.searchHistory = this.searchHistory.filter(term => term !== query);
    this.searchHistory.unshift(query);
    this.searchHistory = this.searchHistory.slice(0, 10);
    localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
  }

  handleKeyboardNavigation(e) {
    // Implement keyboard navigation for search results
    // This would handle arrow keys, enter, escape etc.
    if (e.key === 'Escape') {
      this.hideResults();
    }
  }

  formatPrice(price) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price / 100);
  }
}

// Initialize enhanced search
document.addEventListener('DOMContentLoaded', () => {
  new EnhancedPredictiveSearch();
});