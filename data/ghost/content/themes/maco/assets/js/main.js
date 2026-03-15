/**
 * Maco Theme - Main JavaScript
 * Apple-inspired interactions and utilities
 */

(function() {
  'use strict';
  
  // ============================================
  // Mobile Menu Toggle
  // ============================================
  
  const mobileMenuToggle = document.getElementById('mobile-menu-toggle');
  const navbarMenu = document.getElementById('navbar-menu');
  
  if (mobileMenuToggle && navbarMenu) {
    mobileMenuToggle.addEventListener('click', function() {
      navbarMenu.classList.toggle('active');
      
      // Toggle aria-expanded
      const isExpanded = navbarMenu.classList.contains('active');
      mobileMenuToggle.setAttribute('aria-expanded', isExpanded);
      
      // Toggle icon
      const icon = mobileMenuToggle.querySelector('svg');
      if (isExpanded) {
        icon.innerHTML = '<path d="M18 6 6 18M6 6l12 12"></path>';
      } else {
        icon.innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"></path>';
      }
    });
    
    // Close menu when clicking outside
    document.addEventListener('click', function(event) {
      if (!mobileMenuToggle.contains(event.target) && !navbarMenu.contains(event.target)) {
        navbarMenu.classList.remove('active');
        mobileMenuToggle.setAttribute('aria-expanded', 'false');
        mobileMenuToggle.querySelector('svg').innerHTML = '<path d="M3 12h18M3 6h18M3 18h18"></path>';
      }
    });
  }
  
  // ============================================
  // Search Functionality (Optional)
  // ============================================
  
  const searchToggle = document.getElementById('search-toggle');
  const searchOverlay = document.getElementById('search-overlay');
  const searchInput = document.getElementById('search-input');
  const searchClose = document.getElementById('search-close');
  
  if (searchToggle && searchOverlay && searchInput) {
    searchToggle.addEventListener('click', function() {
      searchOverlay.style.display = 'block';
      setTimeout(() => searchInput.focus(), 100);
    });
    
    if (searchClose) {
      searchClose.addEventListener('click', function() {
        searchOverlay.style.display = 'none';
        searchInput.value = '';
      });
    }
    
    // Close on Escape key
    document.addEventListener('keydown', function(event) {
      if (event.key === 'Escape' && searchOverlay.style.display === 'block') {
        searchOverlay.style.display = 'none';
        searchInput.value = '';
      }
    });
    
    // Close on overlay click
    searchOverlay.addEventListener('click', function(event) {
      if (event.target === searchOverlay) {
        searchOverlay.style.display = 'none';
        searchInput.value = '';
      }
    });
  }
  
  // ============================================
  // Smooth Scroll for Anchor Links
  // ============================================
  
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const target = document.querySelector(targetId);
      if (target) {
        e.preventDefault();
        const navbarHeight = document.querySelector('.navbar')?.offsetHeight || 0;
        const targetPosition = target.offsetTop - navbarHeight;
        
        window.scrollTo({
          top: targetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
  
  // ============================================
  // Navbar Scroll Effect
  // ============================================
  
  const navbar = document.querySelector('.navbar');
  let lastScrollY = window.scrollY;
  
  if (navbar) {
    window.addEventListener('scroll', function() {
      const currentScrollY = window.scrollY;
      
      // Add shadow on scroll
      if (currentScrollY > 10) {
        navbar.style.boxShadow = 'var(--shadow-sm)';
      } else {
        navbar.style.boxShadow = 'none';
      }
      
      // Hide/show navbar on scroll (optional)
      // Uncomment to enable auto-hide navbar
      /*
      if (currentScrollY > lastScrollY && currentScrollY > 100) {
        navbar.style.transform = 'translateY(-100%)';
      } else {
        navbar.style.transform = 'translateY(0)';
      }
      */
      
      lastScrollY = currentScrollY;
    }, { passive: true });
  }
  
  // ============================================
  // Lazy Loading Images
  // ============================================
  
  if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const img = entry.target;
          if (img.dataset.src) {
            img.src = img.dataset.src;
            img.removeAttribute('data-src');
          }
          observer.unobserve(img);
        }
      });
    }, {
      rootMargin: '50px 0px',
      threshold: 0.01
    });
    
    document.querySelectorAll('img[data-src]').forEach(img => {
      imageObserver.observe(img);
    });
  }
  
  // ============================================
  // Copy Code Button for Code Blocks
  // ============================================
  
  document.querySelectorAll('pre').forEach(pre => {
    const code = pre.querySelector('code');
    if (!code) return;
    
    // Create copy button
    const button = document.createElement('button');
    button.className = 'copy-code-btn';
    button.textContent = 'Copy';
    button.type = 'button';
    button.style.cssText = `
      position: absolute;
      top: 8px;
      right: 8px;
      padding: 4px 12px;
      font-size: 12px;
      background: rgba(0, 122, 255, 0.1);
      color: var(--color-primary);
      border: none;
      border-radius: 6px;
      cursor: pointer;
      transition: all 0.2s;
    `;
    
    button.addEventListener('mouseenter', () => {
      button.style.background = 'rgba(0, 122, 255, 0.2)';
    });
    
    button.addEventListener('mouseleave', () => {
      button.style.background = 'rgba(0, 122, 255, 0.1)';
    });
    
    button.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(code.textContent);
        button.textContent = 'Copied!';
        button.style.background = 'rgba(52, 199, 89, 0.2)';
        button.style.color = 'var(--color-success)';
        
        setTimeout(() => {
          button.textContent = 'Copy';
          button.style.background = 'rgba(0, 122, 255, 0.1)';
          button.style.color = 'var(--color-primary)';
        }, 2000);
      } catch (err) {
        console.error('Failed to copy:', err);
        button.textContent = 'Failed';
      }
    });
    
    // Wrap pre in relative container
    pre.style.position = 'relative';
    pre.appendChild(button);
  });
  
  // ============================================
  // Reading Progress Bar (Optional)
  // ============================================
  
  // Uncomment to enable reading progress bar
  /*
  const progressBar = document.createElement('div');
  progressBar.className = 'reading-progress';
  progressBar.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    height: 3px;
    background: var(--color-primary);
    z-index: 9999;
    transition: width 0.1s;
  `;
  document.body.appendChild(progressBar);
  
  window.addEventListener('scroll', function() {
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight - windowHeight;
    const scrolled = window.scrollY;
    const progress = (scrolled / documentHeight) * 100;
    progressBar.style.width = progress + '%';
  }, { passive: true });
  */
  
  // ============================================
  // External Links - Add Icon
  // ============================================
  
  document.querySelectorAll('.post-content a, .page-content a').forEach(link => {
    const href = link.getAttribute('href');
    if (href && href.startsWith('http') && !href.includes(window.location.hostname)) {
      link.setAttribute('target', '_blank');
      link.setAttribute('rel', 'noopener noreferrer');
      
      // Add external link icon
      const icon = document.createElement('span');
      icon.innerHTML = ' ↗';
      icon.style.fontSize = '0.8em';
      link.appendChild(icon);
    }
  });
  
  // ============================================
  // Table of Contents (Optional - for long articles)
  // ============================================
  
  // Uncomment and customize to auto-generate TOC
  /*
  const content = document.querySelector('.post-content');
  if (content) {
    const headings = content.querySelectorAll('h2, h3');
    if (headings.length > 2) {
      const toc = document.createElement('nav');
      toc.className = 'table-of-contents';
      toc.innerHTML = '<h4>Table of Contents</h4><ul></ul>';
      
      headings.forEach((heading, index) => {
        const id = 'toc-' + index;
        heading.id = id;
        
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + id;
        a.textContent = heading.textContent;
        a.style.marginLeft = heading.tagName === 'H3' ? '16px' : '0';
        
        li.appendChild(a);
        toc.querySelector('ul').appendChild(li);
      });
      
      content.insertBefore(toc, content.firstChild);
    }
  }
  */
  
  // ============================================
  // Initialize on DOM Ready
  // ============================================
  
  console.log('🍎 Maco Theme loaded successfully');
  
})();
