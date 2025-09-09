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
    
    // Clear existing content safely
    content.textContent = '';

    let hasResults = false;

    // Products
    if (data.resources.results.products.length > 0) {
      content.appendChild(this.renderProducts(data.resources.results.products));
      hasResults = true;
    }

    // Collections
    if (data.resources.results.collections.length > 0) {
      content.appendChild(this.renderCollections(data.resources.results.collections));
      hasResults = true;
    }

    // Articles
    if (data.resources.results.articles.length > 0) {
      content.appendChild(this.renderArticles(data.resources.results.articles));
      hasResults = true;
    }

    // No results
    if (!hasResults) {
      content.appendChild(this.renderNoResults(query));
    }

    this.showResults();
    
    // Add "View all results" link
    this.addViewAllLink(query);
  }

  renderProducts(products) {
    const section = document.createElement('div');
    section.className = 'search-section';
    
    const title = document.createElement('h3');
    title.className = 'search-section-title';
    title.textContent = 'Products';
    section.appendChild(title);
    
    const container = document.createElement('div');
    container.className = 'search-products';
    
    products.forEach(product => {
      const item = document.createElement('a');
      item.href = product.url;
      item.className = 'search-product-item';
      
      const imageDiv = document.createElement('div');
      imageDiv.className = 'search-product-image';
      const img = document.createElement('img');
      img.src = product.featured_image?.url || '';
      img.alt = product.title; // Safe: alt attribute is escaped by browser
      img.loading = 'lazy';
      imageDiv.appendChild(img);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'search-product-content';
      
      const titleEl = document.createElement('h4');
      titleEl.className = 'search-product-title';
      titleEl.textContent = product.title; // Safe: textContent prevents XSS
      
      const priceEl = document.createElement('div');
      priceEl.className = 'search-product-price';
      priceEl.textContent = this.formatPrice(product.price); // Safe: formatted price
      
      contentDiv.appendChild(titleEl);
      contentDiv.appendChild(priceEl);
      
      item.appendChild(imageDiv);
      item.appendChild(contentDiv);
      container.appendChild(item);
    });
    
    section.appendChild(container);
    return section;
  }

  renderCollections(collections) {
    const section = document.createElement('div');
    section.className = 'search-section';
    
    const title = document.createElement('h3');
    title.className = 'search-section-title';
    title.textContent = 'Collections';
    section.appendChild(title);
    
    const container = document.createElement('div');
    container.className = 'search-collections';
    
    collections.forEach(collection => {
      const item = document.createElement('a');
      item.href = collection.url;
      item.className = 'search-collection-item';
      
      const imageDiv = document.createElement('div');
      imageDiv.className = 'search-collection-image';
      const img = document.createElement('img');
      img.src = collection.featured_image?.url || '';
      img.alt = collection.title; // Safe: alt attribute is escaped by browser
      img.loading = 'lazy';
      imageDiv.appendChild(img);
      
      const contentDiv = document.createElement('div');
      contentDiv.className = 'search-collection-content';
      
      const titleEl = document.createElement('h4');
      titleEl.className = 'search-collection-title';
      titleEl.textContent = collection.title; // Safe: textContent prevents XSS
      
      const countEl = document.createElement('p');
      countEl.className = 'search-collection-count';
      countEl.textContent = `${collection.products_count || 0} products`; // Safe: number + text
      
      contentDiv.appendChild(titleEl);
      contentDiv.appendChild(countEl);
      
      item.appendChild(imageDiv);
      item.appendChild(contentDiv);
      container.appendChild(item);
    });
    
    section.appendChild(container);
    return section;
  }

  renderArticles(articles) {
    const section = document.createElement('div');
    section.className = 'search-section';
    
    const title = document.createElement('h3');
    title.className = 'search-section-title';
    title.textContent = 'Articles';
    section.appendChild(title);
    
    const container = document.createElement('div');
    container.className = 'search-articles';
    
    articles.forEach(article => {
      const item = document.createElement('a');
      item.href = article.url;
      item.className = 'search-article-item';
      
      const titleEl = document.createElement('h4');
      titleEl.className = 'search-article-title';
      titleEl.textContent = article.title; // Safe: textContent prevents XSS
      
      const summaryEl = document.createElement('p');
      summaryEl.className = 'search-article-summary';
      summaryEl.textContent = article.summary || ''; // Safe: textContent prevents XSS
      
      item.appendChild(titleEl);
      item.appendChild(summaryEl);
      container.appendChild(item);
    });
    
    section.appendChild(container);
    return section;
  }

  renderNoResults(query) {
    const container = document.createElement('div');
    container.className = 'search-no-results';
    
    const title = document.createElement('h3');
    title.textContent = `No results found for "${query}"`; // Safe: textContent prevents XSS
    
    const message = document.createElement('p');
    message.textContent = 'Try searching for something else or browse our collections';
    
    const suggestions = document.createElement('div');
    suggestions.className = 'search-suggestions-fallback';
    
    const browseLink = document.createElement('a');
    browseLink.href = '/collections';
    browseLink.className = 'btn btn--secondary';
    browseLink.textContent = 'Browse Collections';
    
    suggestions.appendChild(browseLink);
    container.appendChild(title);
    container.appendChild(message);
    container.appendChild(suggestions);
    
    return container;
  }

  addViewAllLink(query) {
    const content = this.searchResults.querySelector('[data-search-content]');
    const viewAllLink = document.createElement('div');
    viewAllLink.className = 'search-view-all';
    
    const link = document.createElement('a');
    link.href = `/search?q=${encodeURIComponent(query)}`; // Safe: URL encoding
    link.className = 'search-view-all-link';
    link.textContent = `View all results for "${query}" →`; // Safe: textContent prevents XSS
    
    viewAllLink.appendChild(link);
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