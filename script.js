/* ===== AUSTIN ELECTRONICS — INTERACTIVITY ===== */

(() => {
  'use strict';

  // ── Config ──
  const WHATSAPP_NUMBER = '23481045730';
  const STORE_NAME = 'Austin Electronics';

  // ── DOM Cache ──
  const $ = (sel, ctx = document) => ctx.querySelector(sel);
  const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

  // ── Navbar Scroll Effect ──
  const navbar = $('.navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 50);
  }, { passive: true });

  // ── Active Nav Link on Scroll ──
  const sections = $$('section[id]');
  function updateActiveNav() {
    const scrollPos = window.scrollY + 120;
    sections.forEach(section => {
      const top = section.offsetTop;
      const height = section.offsetHeight;
      const id = section.getAttribute('id');
      const navLink = $(`.nav-links a[href="#${id}"]`);
      if (navLink) {
        if (scrollPos >= top && scrollPos < top + height) {
          $$('.nav-links a').forEach(a => a.classList.remove('active'));
          navLink.classList.add('active');
        }
      }
    });
  }
  window.addEventListener('scroll', updateActiveNav, { passive: true });

  // ── Mobile Navigation ──
  const navToggle = $('.nav-toggle');
  const navLinks = $('.nav-links');

  if (navToggle) {
    navToggle.addEventListener('click', () => {
      navToggle.classList.toggle('active');
      navLinks.classList.toggle('open');
      document.body.style.overflow = navLinks.classList.contains('open') ? 'hidden' : '';
    });

    $$('.nav-links a').forEach(link => {
      link.addEventListener('click', () => {
        navToggle.classList.remove('active');
        navLinks.classList.remove('open');
        document.body.style.overflow = '';
      });
    });
  }

  // ── Scroll Reveal (pure Intersection Observer — no GSAP dependency) ──
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' });

  $$('.reveal').forEach(el => revealObserver.observe(el));

  // Stagger children inside grids
  const staggerObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const children = [...entry.target.children];
        children.forEach((child, i) => {
          child.style.transitionDelay = `${i * 0.08}s`;
          child.classList.add('revealed');
        });
        staggerObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.05, rootMargin: '0px 0px -30px 0px' });

  $$('.product-grid, .repair-grid, .category-grid, .why-us-grid, .testimonial-grid, .contact-grid, .footer-grid').forEach(grid => {
    [...grid.children].forEach(child => child.classList.add('stagger-item'));
    staggerObserver.observe(grid);
  });

  // ── Product Filtering ──
  const filterChips = $$('.filter-chip');
  const categoryCards = $$('.category-card');
  const productCards = $$('.product-card');
  const searchInput = $('#product-search');

  let activeFilter = 'all';
  let searchQuery = '';

  function filterProducts() {
    let visibleCount = 0;
    productCards.forEach(card => {
      const category = card.dataset.category || '';
      const name = (card.querySelector('.product-name')?.textContent || '').toLowerCase();
      const brand = (card.querySelector('.product-brand')?.textContent || '').toLowerCase();

      const matchesFilter = activeFilter === 'all' || category === activeFilter;
      const matchesSearch = !searchQuery ||
        name.includes(searchQuery) ||
        brand.includes(searchQuery) ||
        category.includes(searchQuery);

      const shouldShow = matchesFilter && matchesSearch;
      card.style.display = shouldShow ? '' : 'none';
      if (shouldShow) visibleCount++;
    });

    const noResults = $('.no-results');
    if (noResults) noResults.style.display = visibleCount === 0 ? '' : 'none';
  }

  filterChips.forEach(chip => {
    chip.addEventListener('click', () => {
      filterChips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      activeFilter = chip.dataset.filter || 'all';
      categoryCards.forEach(cat => {
        cat.classList.toggle('active', (cat.dataset.filter || 'all') === activeFilter);
      });
      filterProducts();
    });
  });

  categoryCards.forEach(card => {
    card.addEventListener('click', () => {
      const filter = card.dataset.filter || 'all';
      categoryCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      activeFilter = filter;
      filterChips.forEach(chip => {
        chip.classList.toggle('active', (chip.dataset.filter || 'all') === filter);
      });
      filterProducts();
      const productsSection = $('#products');
      if (productsSection) {
        const offset = navbar.offsetHeight || 80;
        window.scrollTo({ top: productsSection.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      searchQuery = e.target.value.toLowerCase().trim();
      filterProducts();
    });
  }

  // ── WhatsApp Logic ──
  const getWhatsAppLink = (product) => {
    let message;
    if (product.toLowerCase().includes('repair') || product.toLowerCase().includes('inquiry')) {
      message = `Hi ${STORE_NAME}! I would like to inquire about a *REPAIR SERVICE* for my device. Specifically: ${product}. Can you help?`;
    } else {
      message = `Hi ${STORE_NAME}! I'm interested in buying: *${product}*. Is it currently in stock at Utako?`;
    }
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
  };

  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.order-btn');
    if (btn) {
      e.preventDefault();
      const product = btn.dataset.product || 'General inquiry';
      window.open(getWhatsAppLink(product), '_blank');
    }

    const waFloat = e.target.closest('.whatsapp-float');
    if (waFloat) {
      e.preventDefault();
      const message = `Hi ${STORE_NAME}! I'm at your Utako store online and have a question.`;
      window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`, '_blank');
    }
  });

  // ── Smooth Scroll ──
  $$('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', (e) => {
      const targetId = anchor.getAttribute('href');
      if (targetId === '#') return;
      e.preventDefault();
      const target = $(targetId);
      if (target) {
        const offset = navbar.offsetHeight || 80;
        window.scrollTo({ top: target.offsetTop - offset, behavior: 'smooth' });
      }
    });
  });

  // ── Initialize ──
  filterProducts();
  updateActiveNav();

  console.log(`%c${STORE_NAME} ⚡ Tech & Repairs`, 'color: #d4a843; font-weight: bold; font-size: 14px;');
})();
