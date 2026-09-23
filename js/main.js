/**
 * BARBERSHOP "ОСТРЯК" — MAIN JAVASCRIPT LOGIC
 * UI/UX Pro Max Interactive Components
 */

document.addEventListener('DOMContentLoaded', () => {
  // 1. Header scroll state
  const header = document.querySelector('.header');
  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      header.classList.add('scrolled');
    } else {
      header.classList.remove('scrolled');
    }
  });

  // 2. Mobile Burger Menu & Drawer
  const burgerBtn = document.getElementById('burgerBtn');
  const navLinks = document.getElementById('navLinks');
  const navBackdrop = document.getElementById('navBackdrop');
  const navCloseBtn = document.getElementById('navCloseBtn');

  const openMobileMenu = () => {
    if (navLinks) navLinks.classList.add('active');
    if (navBackdrop) navBackdrop.classList.add('active');
    document.body.style.overflow = 'hidden';
  };

  const closeMobileMenu = () => {
    if (navLinks) navLinks.classList.remove('active');
    if (navBackdrop) navBackdrop.classList.remove('active');
    document.body.style.overflow = '';
  };

  if (burgerBtn) burgerBtn.addEventListener('click', openMobileMenu);
  if (navCloseBtn) navCloseBtn.addEventListener('click', closeMobileMenu);
  if (navBackdrop) navBackdrop.addEventListener('click', closeMobileMenu);

  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', closeMobileMenu);
  });

  // 3. Services Tabs Filter
  const serviceTabs = document.querySelectorAll('.tab-btn');
  const serviceItems = document.querySelectorAll('.service-item');

  serviceTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      serviceTabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');

      const category = tab.getAttribute('data-category');
      serviceItems.forEach(item => {
        if (category === 'all' || item.getAttribute('data-category') === category) {
          item.style.display = 'flex';
        } else {
          item.style.display = 'none';
        }
      });
    });
  });

  // 4. Portfolio Filter
  const filterBtns = document.querySelectorAll('.filter-btn');
  const portfolioCards = document.querySelectorAll('.portfolio-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      const filter = btn.getAttribute('data-filter');
      portfolioCards.forEach(card => {
        if (filter === 'all' || card.getAttribute('data-style') === filter) {
          card.style.display = 'block';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });

  // 5. Before / After Interactive Slider
  const baSliderBox = document.getElementById('baSliderBox');
  const baAfterBox = document.getElementById('baAfterBox');
  const baHandle = document.getElementById('baHandle');

  if (baSliderBox && baAfterBox && baHandle) {
    let isDragging = false;

    const syncBoxWidth = () => {
      const rect = baSliderBox.getBoundingClientRect();
      baSliderBox.style.setProperty('--slider-box-width', `${rect.width}px`);
    };

    syncBoxWidth();
    window.addEventListener('resize', syncBoxWidth);

    const updateSlider = (clientX) => {
      const rect = baSliderBox.getBoundingClientRect();
      baSliderBox.style.setProperty('--slider-box-width', `${rect.width}px`);
      let offsetX = clientX - rect.left;
      if (offsetX < 0) offsetX = 0;
      if (offsetX > rect.width) offsetX = rect.width;

      const percentage = (offsetX / rect.width) * 100;
      baAfterBox.style.width = `${percentage}%`;
      baHandle.style.left = `${percentage}%`;
    };

    baSliderBox.addEventListener('mousedown', (e) => {
      isDragging = true;
      updateSlider(e.clientX);
    });

    window.addEventListener('mousemove', (e) => {
      if (!isDragging) return;
      updateSlider(e.clientX);
    });

    window.addEventListener('mouseup', () => {
      isDragging = false;
    });

    // Touch support
    baSliderBox.addEventListener('touchstart', (e) => {
      isDragging = true;
      if (e.touches && e.touches[0]) {
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      if (e.touches && e.touches[0]) {
        updateSlider(e.touches[0].clientX);
      }
    }, { passive: true });

    window.addEventListener('touchend', () => {
      isDragging = false;
    });
  }

  // 6. FAQ Accordion
  const faqItems = document.querySelectorAll('.faq-item');
  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');
      faqItems.forEach(i => i.classList.remove('active'));
      if (!isActive) {
        item.classList.add('active');
      }
    });
  });

  // 7. Promo Code Copy
  window.copyPromo = function(code) {
    navigator.clipboard.writeText(code).then(() => {
      showToast(`Промокод "${code}" скопирован!`);
      // Auto open booking modal with promo applied
      openBookingModal(null, code);
    });
  };

  // 8. Toast Notifications
  window.showToast = function(message) {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.innerHTML = `
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#d4af37" stroke-width="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01"></polyline>
      </svg>
      <span>${message}</span>
    `;
    container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  };

  // ==========================================================================
  // ONLINE BOOKING WIZARD & MODAL
  // ==========================================================================
  const modal = document.getElementById('bookingModal');
  const openModalBtns = document.querySelectorAll('.open-booking-btn');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const prevStepBtn = document.getElementById('prevStepBtn');
  const nextStepBtn = document.getElementById('nextStepBtn');

  let currentStep = 1;
  const totalSteps = 4;

  const bookingState = {
    services: [], // { name: '', price: 0 }
    master: 'Любой свободный мастер',
    date: 'Сегодня',
    time: '12:00',
    name: '',
    phone: '',
    promoCode: '',
    discount: 0,
    totalPrice: 0
  };

  // Open Modal
  window.openBookingModal = function(preferredMaster = null, initialPromo = null) {
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';

    if (preferredMaster) {
      selectMasterByName(preferredMaster);
    }

    if (initialPromo) {
      bookingState.promoCode = initialPromo;
      applyPromoDiscount();
    }

    setWizardStep(1);
  };

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      const master = btn.getAttribute('data-master');
      const serviceName = btn.getAttribute('data-service');
      const servicePrice = btn.getAttribute('data-price');

      if (serviceName && servicePrice) {
        toggleServiceSelection(serviceName, parseInt(servicePrice, 10));
      }

      openBookingModal(master);
    });
  });

  if (closeModalBtn) {
    closeModalBtn.addEventListener('click', () => {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  });

  // Step Navigation
  function setWizardStep(step) {
    currentStep = step;

    // Panes
    document.querySelectorAll('.wizard-step-pane').forEach((pane, idx) => {
      if (idx + 1 === step) {
        pane.classList.add('active');
      } else {
        pane.classList.remove('active');
      }
    });

    // Step indicators
    document.querySelectorAll('.step-indicator').forEach((ind, idx) => {
      const num = idx + 1;
      ind.classList.remove('active', 'completed');
      if (num === step) {
        ind.classList.add('active');
      } else if (num < step) {
        ind.classList.add('completed');
      }
    });

    // Buttons
    if (step === 1) {
      prevStepBtn.style.visibility = 'hidden';
      nextStepBtn.textContent = 'Выбрать мастера →';
    } else if (step === 2) {
      prevStepBtn.style.visibility = 'visible';
      nextStepBtn.textContent = 'Выбрать время →';
    } else if (step === 3) {
      prevStepBtn.style.visibility = 'visible';
      nextStepBtn.textContent = 'Контакты →';
    } else if (step === 4) {
      prevStepBtn.style.visibility = 'visible';
      nextStepBtn.textContent = 'Подтвердить запись ✓';
    }

    updateSummaryUI();
  }

  nextStepBtn.addEventListener('click', () => {
    if (currentStep === 1) {
      if (bookingState.services.length === 0) {
        showToast('Пожалуйста, выберите хотя бы одну услугу');
        return;
      }
      setWizardStep(2);
    } else if (currentStep === 2) {
      setWizardStep(3);
    } else if (currentStep === 3) {
      setWizardStep(4);
    } else if (currentStep === 4) {
      // Submit Booking
      const nameInput = document.getElementById('clientName');
      const phoneInput = document.getElementById('clientPhone');

      if (!nameInput.value.trim()) {
        showToast('Введите ваше имя');
        nameInput.focus();
        return;
      }
      if (!phoneInput.value.trim() || phoneInput.value.trim().length < 10) {
        showToast('Введите корректный номер телефона');
        phoneInput.focus();
        return;
      }

      bookingState.name = nameInput.value.trim();
      bookingState.phone = phoneInput.value.trim();

      // Successful Booking Action
      modal.classList.remove('active');
      document.body.style.overflow = '';
      showToast(`🎉 ${bookingState.name}, вы успешно записаны на ${bookingState.date} в ${bookingState.time}!`);
    }
  });

  prevStepBtn.addEventListener('click', () => {
    if (currentStep > 1) {
      setWizardStep(currentStep - 1);
    }
  });

  // Service Selection Logic
  function toggleServiceSelection(name, price) {
    const existingIndex = bookingState.services.findIndex(s => s.name === name);
    if (existingIndex > -1) {
      bookingState.services.splice(existingIndex, 1);
    } else {
      bookingState.services.push({ name, price });
    }
    updateServicesListUI();
    applyPromoDiscount();
  }

  const bookingServiceCards = document.querySelectorAll('.booking-service-card');
  bookingServiceCards.forEach(card => {
    card.addEventListener('click', () => {
      const name = card.getAttribute('data-name');
      const price = parseInt(card.getAttribute('data-price'), 10);
      toggleServiceSelection(name, price);
    });
  });

  function updateServicesListUI() {
    bookingServiceCards.forEach(card => {
      const name = card.getAttribute('data-name');
      const isSelected = bookingState.services.some(s => s.name === name);
      if (isSelected) {
        card.classList.add('selected');
        card.querySelector('.booking-checkbox').innerHTML = '✓';
      } else {
        card.classList.remove('selected');
        card.querySelector('.booking-checkbox').innerHTML = '';
      }
    });
  }

  // Master Selection Logic
  const masterItems = document.querySelectorAll('.booking-master-item');
  masterItems.forEach(item => {
    item.addEventListener('click', () => {
      masterItems.forEach(m => m.classList.remove('selected'));
      item.classList.add('selected');
      bookingState.master = item.getAttribute('data-master-name');
      updateSummaryUI();
    });
  });

  function selectMasterByName(name) {
    masterItems.forEach(item => {
      if (item.getAttribute('data-master-name') === name) {
        masterItems.forEach(m => m.classList.remove('selected'));
        item.classList.add('selected');
        bookingState.master = name;
      }
    });
    updateSummaryUI();
  }

  // Date & Time Picker Logic
  const datePills = document.querySelectorAll('.date-pill');
  datePills.forEach(pill => {
    pill.addEventListener('click', () => {
      datePills.forEach(d => d.classList.remove('selected'));
      pill.classList.add('selected');
      bookingState.date = pill.getAttribute('data-date');
      updateSummaryUI();
    });
  });

  const timeSlots = document.querySelectorAll('.time-slot');
  timeSlots.forEach(slot => {
    slot.addEventListener('click', () => {
      timeSlots.forEach(t => t.classList.remove('selected'));
      slot.classList.add('selected');
      bookingState.time = slot.textContent.trim();
      updateSummaryUI();
    });
  });

  // Promo Code Validation
  const promoInput = document.getElementById('bookingPromoInput');
  const applyPromoBtn = document.getElementById('applyPromoBtn');
  if (applyPromoBtn && promoInput) {
    applyPromoBtn.addEventListener('click', () => {
      const code = promoInput.value.trim().toUpperCase();
      if (code === 'FIRST20' || code === 'ОСТРЯК2026') {
        bookingState.promoCode = code;
        applyPromoDiscount();
        showToast('Промокод -20% успешно применен!');
      } else if (code) {
        showToast('Неверный промокод');
      }
    });
  }

  function applyPromoDiscount() {
    let subtotal = bookingState.services.reduce((acc, curr) => acc + curr.price, 0);
    if (bookingState.promoCode === 'FIRST20' || bookingState.promoCode === 'ОСТРЯК2026') {
      bookingState.discount = Math.round(subtotal * 0.20);
    } else {
      bookingState.discount = 0;
    }
    bookingState.totalPrice = Math.max(0, subtotal - bookingState.discount);
    updateSummaryUI();
  }

  function updateSummaryUI() {
    const summaryService = document.getElementById('summaryService');
    const summaryMaster = document.getElementById('summaryMaster');
    const summaryDateTime = document.getElementById('summaryDateTime');
    const summaryDiscount = document.getElementById('summaryDiscount');
    const summaryTotal = document.getElementById('summaryTotal');

    if (summaryService) {
      summaryService.textContent = bookingState.services.length > 0 
        ? bookingState.services.map(s => s.name).join(', ') 
        : 'Не выбрано';
    }
    if (summaryMaster) summaryMaster.textContent = bookingState.master;
    if (summaryDateTime) summaryDateTime.textContent = `${bookingState.date}, ${bookingState.time}`;
    if (summaryDiscount) {
      summaryDiscount.textContent = bookingState.discount > 0 ? `-${bookingState.discount} ₽ (${bookingState.promoCode})` : '0 ₽';
    }
    if (summaryTotal) summaryTotal.textContent = `${bookingState.totalPrice} ₽`;
  }

  // Pre-select Default Service
  toggleServiceSelection('Мужская стрижка', 1400);
});
