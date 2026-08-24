/**
 * Amir Kassim - Professional Portfolio JavaScript
 * Offline-first, vanilla ES6+, high performance
 */

document.addEventListener('DOMContentLoaded', () => {
  initTheme();
  initOfflineSupport();
  initNavigation();
  initScrollAnimations();
  initProjectsSlider();
  initProjectModal();
  initContactForm();
  initBackToTop();
  initImageAnimations();
  initTypewriterEffect();
});

/* ==========================================================================
   1. Theme Management (Light / Dark mode)
   ========================================================================== */
function initTheme() {
  const themeToggleBtn = document.getElementById('theme-toggle-btn');
  const themeIcon = document.getElementById('theme-toggle-icon');
  let savedTheme = null;
  try {
    savedTheme = localStorage.getItem('amir_kassim_theme');
  } catch (e) {
    // Safe storage access for file://
  }
  const systemPrefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  const currentTheme = savedTheme || (systemPrefersDark ? 'dark' : 'light');
  applyTheme(currentTheme);

  if (themeToggleBtn) {
    themeToggleBtn.addEventListener('click', () => {
      const activeTheme = document.documentElement.getAttribute('data-theme') || 'light';
      const newTheme = activeTheme === 'dark' ? 'light' : 'dark';
      applyTheme(newTheme);
      try {
        localStorage.setItem('amir_kassim_theme', newTheme);
      } catch (e) {
        // Safe storage access
      }
    });
  }

  function applyTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    if (themeIcon) {
      themeIcon.src = theme === 'dark' ? 'icons/sun.svg' : 'icons/moon.svg';
      themeIcon.alt = theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode';
    }
  }
}

/* ==========================================================================
   2. Offline Support & Service Worker Registration
   ========================================================================== */
function initOfflineSupport() {
  const offlineBadge = document.getElementById('offline-badge');
  const offlineStatusText = document.getElementById('offline-status-text');
  const offlineBanner = document.getElementById('offline-banner');

  function updateOnlineStatus() {
    const isOnline = typeof navigator.onLine === 'boolean' ? navigator.onLine : true;
    if (offlineBadge && offlineStatusText) {
      if (isOnline) {
        offlineBadge.classList.remove('is-offline');
        offlineStatusText.textContent = 'Online';
      } else {
        offlineBadge.classList.add('is-offline');
        offlineStatusText.textContent = 'Offline Mode';
      }
    }

    if (offlineBanner) {
      if (!isOnline) {
        offlineBanner.classList.add('active');
        offlineBanner.textContent = '⚡ You are viewing Amir Kassim\'s portfolio in Offline Mode. All content and files are available offline.';
      } else {
        offlineBanner.classList.remove('active');
      }
    }
  }

  window.addEventListener('online', updateOnlineStatus);
  window.addEventListener('offline', updateOnlineStatus);
  updateOnlineStatus();

  // Register Service Worker only on http/https (browsers disallow Service Workers on file://)
  if ('serviceWorker' in navigator && window.location.protocol.startsWith('http')) {
    navigator.serviceWorker.register('sw.js')
      .then((reg) => {
        console.log('[PWA] Service worker registered successfully:', reg.scope);
        reg.update().catch(() => {});
      })
      .catch((err) => {
        console.warn('[PWA] Service worker registration notice:', err);
      });
  }
}

/* ==========================================================================
   3. Navigation, Mobile Menu & Active Spy
   ========================================================================== */
function initNavigation() {
  const mobileMenuBtn = document.getElementById('mobile-menu-btn');
  const navLinks = document.getElementById('nav-links');
  const allNavLinks = document.querySelectorAll('.nav-link');

  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener('click', () => {
      const isOpen = navLinks.classList.toggle('is-open');
      mobileMenuBtn.setAttribute('aria-expanded', isOpen);
    });

    // Close on link click
    allNavLinks.forEach((link) => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('is-open');
        if (mobileMenuBtn) mobileMenuBtn.setAttribute('aria-expanded', 'false');
      });
    });

    // Close on outside click
    document.addEventListener('click', (e) => {
      if (!navLinks.contains(e.target) && !mobileMenuBtn.contains(e.target)) {
        navLinks.classList.remove('is-open');
        mobileMenuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // ScrollSpy for Active Navigation Link
  const sections = document.querySelectorAll('section[id]');
  window.addEventListener('scroll', () => {
    const scrollY = window.pageYOffset;

    sections.forEach((section) => {
      const sectionHeight = section.offsetHeight;
      const sectionTop = section.offsetTop - 100;
      const sectionId = section.getAttribute('id');
      const targetNavLink = document.querySelector(`.nav-link[href*="#${sectionId}"]`);

      if (targetNavLink) {
        if (scrollY > sectionTop && scrollY <= sectionTop + sectionHeight) {
          allNavLinks.forEach((l) => l.classList.remove('active'));
          targetNavLink.classList.add('active');
        }
      }
    });
  });
}

/* ==========================================================================
   4. Scroll Animations (IntersectionObserver)
   ========================================================================== */
function initScrollAnimations() {
  const revealElements = document.querySelectorAll('.reveal');

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, {
      root: null,
      threshold: 0.05,
      rootMargin: '40px 0px 40px 0px'
    });

    revealElements.forEach((el) => revealObserver.observe(el));

    // Fallback: guarantee all elements are visible after a short timeout
    setTimeout(() => {
      revealElements.forEach((el) => el.classList.add('is-visible'));
    }, 500);
  } else {
    // Fallback for older browsers
    revealElements.forEach((el) => el.classList.add('is-visible'));
  }
}

/* ==========================================================================
   5. Projects Sliding Cards Carousel (Infinite Responsive Slider)
   ========================================================================== */
function initProjectsSlider() {
  if (typeof window.initVanillaInfiniteCarousel === 'function') {
    window.initVanillaInfiniteCarousel({
      container: '#projectsSliderContainer',
      viewport: '#projectsSliderViewport',
      track: '#projectsSliderTrack',
      prevBtn: '#projects-side-prev-btn',
      nextBtn: '#projects-side-next-btn',
      topPrevBtn: '#projects-prev-btn',
      topNextBtn: '#projects-next-btn',
      counter: '#projects-slide-counter',
      dotsContainer: '#projectsSliderDots',
      cardSelector: '.project-slide-card',
      autoSlideInterval: 5000
    });
  }
}

/* ==========================================================================
   5b. Project Detail Modal Dialog with Interactive Architecture Gallery
   ========================================================================== */
function initProjectModal() {
  const modal = document.getElementById('projectModal');
  const backdrop = document.getElementById('projectModalBackdrop');
  const closeBtn = document.getElementById('projectModalClose');
  const closeActionBtn = document.getElementById('modalCloseActionBtn');
  const inquireBtn = document.getElementById('modalInquireBtn');

  const modalImg = document.getElementById('modalProjectImage');
  const modalCategory = document.getElementById('modalProjectCategory');
  const modalPeriod = document.getElementById('modalProjectPeriod');
  const modalTitle = document.getElementById('modalProjectTitle');
  const modalOrg = document.getElementById('modalProjectOrg');
  const modalDesc = document.getElementById('modalProjectDesc');
  const modalHighlights = document.getElementById('modalProjectHighlights');
  const modalTech = document.getElementById('modalProjectTech');

  // Gallery DOM Elements
  const gallerySection = document.getElementById('projectModalGallerySection');
  const galleryCounter = document.getElementById('modalGalleryCounter');
  const galleryMainImg = document.getElementById('modalGalleryMainImg');
  const galleryTag = document.getElementById('modalGalleryTag');
  const galleryPrevBtn = document.getElementById('modalGalleryPrevBtn');
  const galleryNextBtn = document.getElementById('modalGalleryNextBtn');
  const galleryCaptionTitle = document.getElementById('modalGalleryCaptionTitle');
  const galleryCaptionNum = document.getElementById('modalGalleryCaptionNum');
  const galleryCaptionDesc = document.getElementById('modalGalleryCaptionDesc');
  const galleryThumbnails = document.getElementById('modalGalleryThumbnails');
  const stripScrollLeft = document.getElementById('modalStripScrollLeft');
  const stripScrollRight = document.getElementById('modalStripScrollRight');
  const galleryStage = document.getElementById('modalGalleryStage') || document.querySelector('.modal-gallery-stage');
  const galleryExpandBtn = document.getElementById('modalGalleryExpandBtn');

  // Fullscreen Diagram Lightbox DOM Elements
  const lightbox = document.getElementById('diagramLightbox');
  const lightboxBackdrop = document.getElementById('lightboxBackdrop');
  const lightboxCloseBtn = document.getElementById('lightboxCloseBtn');
  const lightboxTag = document.getElementById('lightboxTag');
  const lightboxTitle = document.getElementById('lightboxTitle');
  const lightboxCounter = document.getElementById('lightboxCounter');
  const lightboxCaption = document.getElementById('lightboxCaption');
  const lightboxImg = document.getElementById('lightboxImg');
  const lightboxCanvas = document.getElementById('lightboxCanvas');
  const lightboxZoomIn = document.getElementById('lightboxZoomIn');
  const lightboxZoomOut = document.getElementById('lightboxZoomOut');
  const lightboxZoomReset = document.getElementById('lightboxZoomReset');
  const lightboxZoomLevel = document.getElementById('lightboxZoomLevel');
  const lightboxPrevBtn = document.getElementById('lightboxPrevBtn');
  const lightboxNextBtn = document.getElementById('lightboxNextBtn');
  const lightboxThumbnails = document.getElementById('lightboxThumbnails');

  let currentGalleryItems = [];
  let currentGalleryIndex = 0;
  let currentZoom = 1;
  let panX = 0;
  let panY = 0;
  let isDraggingCanvas = false;
  let dragStartX = 0;
  let dragStartY = 0;

  // Complete offline-ready project data dictionary with specialized galleries
  const projectsData = {
    'proj-1': {
      title: 'Tosegn Pharmacy ERP System',
      category: 'Systems & ERP',
      badgeClass: 'badge-systems',
      organization: 'Tosegn Pharmacy & Healthcare',
      period: '2021 – 2024',
      image: 'images/projects/pharmacy_erp.jpg',
      description: 'Architected, implemented, and deployed a comprehensive Pharmacy ERP system tailored for Tosegn Pharmacy. Built end-to-end modules covering drug inventory management, batch number tracking, prescription verification, high-speed barcode POS billing, supplier purchase orders, automated expiry notifications, and audit-compliant financial reporting.',
      highlights: [
        'Automated drug batch expiration alerts preventing expired medicine dispensation and facilitating supplier return batches',
        'High-speed barcode scanner integration with POS terminal receipts, customer credit accounts, and daily cash drawer balancing',
        'Multi-branch real-time stock synchronization with granular role-based security permissions (Pharmacist, Cashier, Inventory Manager)'
      ],
      technologies: ['Tosegn Pharmacy ERP', 'Microsoft SQL Server', 'Barcode POS', 'Batch Expiry Tracking', 'Inventory Synchronization', 'Prescription Management', 'Role-Based Access Control', 'Financial Analytics'],
      gallery: [
        {
          image: 'images/projects/pharmacy_erp.jpg',
          tag: 'Core ERP Architecture',
          title: 'Pharmacy POS & Medication Checkout Workflow',
          caption: 'High-speed barcode scanner interface with real-time stock lookup, unit conversion, prescription validation, and immediate receipt printing.'
        },
        {
          image: 'images/projects/erp.jpg',
          tag: 'Database Schema',
          title: 'Relational Database & Batch Expiry Tracking Engine',
          caption: 'Normalized SQL Server database architecture tracking drug manufacture dates, batch numbers, supplier ledgers, and automated shelf-life warnings.'
        },
        {
          image: 'images/projects/web.jpg',
          tag: 'Multi-Branch Sync',
          title: 'Real-Time Multi-Location Inventory Synchronization',
          caption: 'Encrypted WAN replication architecture ensuring live stock level synchronicity between central warehouse distributions and retail pharmacy branches.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'Network Topology',
          title: 'POS Terminal LAN & Secure Server Topology',
          caption: 'Hardened network architecture isolating POS checkout terminals from public guest Wi-Fi and pharmacy administrative workstations.'
        }
      ]
    },
    'proj-2': {
      title: 'Ethio Installers Listing Web App',
      category: 'Surveillance & Web App',
      badgeClass: 'badge-surveillance',
      organization: 'Ethio Installers Directory',
      period: '2023 – 2024',
      image: 'images/projects/cctv_listing.jpg',
      description: 'Created a specialized directory listing web application designed to connect residential homeowners, business managers, and property developers with verified CCTV security camera and network installers across Ethiopia.',
      highlights: [
        'Search and filter verified Ethiopian CCTV technicians by location, camera specialization (IP, Analog, PTZ, NVR/DVR), and customer ratings',
        'Integrated quotation request builder enabling clients to specify camera counts, building types, and request competitive estimates',
        'Contractor profile verification dashboard featuring installation portfolio showcases, certifications, and client review moderation'
      ],
      technologies: ['Ethio Installers App', 'Web Application', 'Installer Directory', 'Quotation Engine', 'Geo-Filter Search', 'Review & Rating System', 'Responsive UI', 'Lead Management'],
      gallery: [
        {
          image: 'images/projects/cctv_listing.jpg',
          tag: 'Directory Platform',
          title: 'Installer Directory & Geographic Filter Interface',
          caption: 'Intuitive web directory enabling users to filter verified security technicians across Addis Ababa and regional hubs with verified ratings.'
        },
        {
          image: 'images/projects/cctv_zone_map.jpg',
          tag: 'Quotation Engine',
          title: 'CCTV Zone Estimator & Hardware Calculator',
          caption: 'Interactive client quotation engine calculating required IP camera counts, storage retention capacity (TB), and Cat6 cabling runs.'
        },
        {
          image: 'images/projects/cctv.jpg',
          tag: 'Technician Portfolio',
          title: 'Verified Contractor Credentials & Project Showcase',
          caption: 'Comprehensive contractor profiles highlighting Hikvision/Dahua certifications, past deployment galleries, and authentic client reviews.'
        },
        {
          image: 'images/projects/web.jpg',
          tag: 'Cloud Backend',
          title: 'Lead Dispatch & Real-Time Notification Pipeline',
          caption: 'Automated webhook distribution routing customer inquiry requests instantly to nearby certified installers via SMS and email alerts.'
        }
      ]
    },
    'proj-3': {
      title: 'Electro IT Services Website',
      category: 'E-Commerce & Web',
      badgeClass: 'badge-web',
      organization: 'Electro IT Services PLC',
      period: '2023 – 2024',
      image: 'images/projects/electro_ecommerce.jpg',
      description: 'Developed a modern corporate web platform with full e-commerce capabilities for Electro IT Services PLC. Created an extensive online shop for IT hardware, enterprise networking switches, routers, servers, and security cameras alongside a direct service booking portal for on-site IT deployments.',
      highlights: [
        'Dynamic IT product catalog with structured hardware specifications, search filtering, pricing, and live inventory status',
        'Integrated shopping cart, quote request builder, and online service booking for structured cabling and maintenance contracts',
        'Mobile-first responsive architecture with fast page loads, technical SEO, and automated order routing via WhatsApp and email'
      ],
      technologies: ['Electro IT Website', 'E-Commerce Store', 'Product Catalog', 'Shopping Cart', 'Service Booking Portal', 'Responsive Web Design', 'Technical SEO'],
      gallery: [
        {
          image: 'images/projects/electro_ecommerce.jpg',
          tag: 'E-Commerce Storefront',
          title: 'Enterprise Hardware Catalog & Shopping UI',
          caption: 'Online equipment showcase cataloging Cisco Catalyst switches, NVR storage units, fiber optic patch cables, and rack power accessories.'
        },
        {
          image: 'images/projects/web.jpg',
          tag: 'Service Dispatch',
          title: 'On-Demand IT Deployment & Maintenance Portal',
          caption: 'Client service booking platform for scheduling structured cabling site surveys, fiber splicing, and emergency network troubleshooting.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'Solution Blueprints',
          title: 'Managed IT Infrastructure Solution Templates',
          caption: 'Standardized infrastructure deployment blueprints presented to corporate clients during pre-sales engineering consultations.'
        },
        {
          image: 'images/projects/datacenter.jpg',
          tag: 'Hardware Bundles',
          title: 'Pre-Configured Enterprise Server & Switch Packages',
          caption: 'Factory burn-in tested Cisco switches and server hardware bundles ready for turnkey deployment in enterprise server rooms.'
        }
      ]
    },
    'proj-4': {
      title: 'Enterprise IT Infrastructure & Managed Services',
      category: 'Networking & IT Infrastructure',
      badgeClass: 'badge-networking',
      organization: 'Sunland International Hotel',
      period: '2022 – 2024',
      image: 'images/projects/datacenter.jpg',
      description: 'Designed, deployed, and continue to maintain a complete enterprise IT infrastructure for an international hotel. The project included Data Center deployment, Wi-Fi network implementation, IP PBX telephony, CCTV surveillance, IPTV/TV systems, structured LAN cabling, ERP server setup, and ongoing technical support to ensure reliable, secure, and uninterrupted hotel operations.',
      highlights: [
        'End-to-end Data Center and structured Cat6A/fiber LAN cabling installation supporting all hotel guest rooms, offices, and conference facilities',
        'High-density enterprise Wi-Fi 6 network rollout with captive portal guest access, QoS bandwidth allocation, and seamless zero-drop roaming',
        'Turnkey IP PBX telephony, multi-camera IP CCTV surveillance matrix, IPTV streaming network, and CNET ERP SQL Server infrastructure with 24/7 managed SLA'
      ],
      technologies: ['Data Center Deployment', 'Wi-Fi Network', 'IP PBX Telephony', 'CCTV Surveillance', 'IPTV Systems', 'Structured LAN Cabling', 'ERP Server Setup', 'Managed IT Support', 'Cisco Catalyst', 'Windows Server'],
      gallery: [
        {
          image: 'images/projects/datacenter.jpg',
          tag: 'Data Center & Cabling',
          title: 'Central 42U Server Rack & Structured LAN Cabling',
          caption: 'High-density rack deployment with organized Cat6A patch fields, fiber backbone distribution, dual UPS power backup, and Cisco core switching fabric.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'Network & VLAN Topology',
          title: 'Segmented Multi-VLAN Hospitality Architecture',
          caption: 'Hardened network architecture isolating guest Wi-Fi, IP PBX voice traffic, IPTV streams, POS terminals, and CNET ERP database servers.'
        },
        {
          image: 'images/projects/wifi_heatmap.jpg',
          tag: 'Wi-Fi & RF Heatmap',
          title: 'Multi-Floor High-Density Wi-Fi Coverage & Roaming',
          caption: 'Enterprise wireless survey and deployment delivering 100% coverage across guest rooms, executive suites, restaurants, and conference halls.'
        },
        {
          image: 'images/projects/erp.jpg',
          tag: 'ERP, IPTV & Telephony',
          title: 'ERP Server Setup, IP PBX Voice & 24/7 Managed Support',
          caption: 'Windows Server Active Directory domain, nightly automated database backups, Grandstream IP PBX telephony integration, and ongoing SLA maintenance.'
        }
      ]
    },
    'proj-5': {
      title: 'Sunland International Hotel Booking Website',
      category: 'Web & Booking Platform',
      badgeClass: 'badge-web',
      organization: 'Sunland International Hotel',
      period: '2022 – 2024',
      image: 'images/projects/hotel_bot.jpg',
      description: 'Engineered an automated digital booking web platform and reservation system for Sunland International Hotel. Designed intuitive booking workflows allowing prospective guests to check real-time room availability, browse luxury suite galleries, select dates, calculate room rates with seasonal discounts, and receive instant downloadable booking confirmation vouchers.',
      highlights: [
        'Built responsive online booking portal with interactive room galleries, real-time availability checks, and dynamic pricing',
        'Direct webhook and database integration synchronizing online reservations with hotel front-desk management systems',
        'Automated reservation confirmation generation with instant unique voucher codes and automated guest email/SMS alerts'
      ],
      technologies: ['Booking Web Platform', 'Hotel Reservation Engine', 'Interactive UI', 'Webhook Integration', 'Instant Confirmation Vouchers', 'REST APIs', 'Guest Analytics'],
      gallery: [
        {
          image: 'images/projects/hotel_bot.jpg',
          tag: 'Booking Interface',
          title: 'Interactive Room Showcase & Availability Engine',
          caption: 'Dynamic booking interface displaying suite availability, real-time pricing tiers, high-resolution amenity photo galleries, and booking confirmation.'
        },
        {
          image: 'images/projects/web.jpg',
          tag: 'PMS Integration',
          title: 'Bi-Directional PMS Front-Desk Webhook Architecture',
          caption: 'Seamless synchronization pipeline transmitting online web reservations straight into the hotel property management database.'
        },
        {
          image: 'images/projects/wifi.jpg',
          tag: 'Guest Amenities',
          title: 'Digital In-Room Services & Concierge Portal',
          caption: 'Integrated guest portal facilitating in-room dining orders, conference hall reservations, and airport transfer requests.'
        },
        {
          image: 'images/projects/erp.jpg',
          tag: 'Analytics Dashboard',
          title: 'Hotel Revenue & Occupancy Rate Analytics',
          caption: 'Back-office dashboard monitoring seasonal occupancy rates, average booking lead time, and monthly room revenue metrics.'
        }
      ]
    },
    'proj-6': {
      title: 'Enterprise Data Center Infrastructure & Structured Cabling',
      category: 'Networking & Cabling',
      badgeClass: 'badge-networking',
      organization: 'Electro Engineering',
      period: '2019 – 2024',
      image: 'images/projects/datacenter.jpg',
      description: 'Architected, planned, and implemented standardized enterprise data center facilities. Designed high-density server rack layouts, structured Cat6/Cat6A and Fiber-Optic distribution systems, cable raceways, high-capacity uninterruptible power supply (UPS) backup clusters, and high-throughput Cisco core routing and switching hardware.',
      highlights: [
        'Structured Cat6A and Single-Mode/Multi-Mode Fiber Optic backbone deployment with patch field organization',
        'Configured Cisco Catalyst core, distribution, and access layer switches with segmented VLANs and ACL security',
        'Implemented environmental rack monitoring, hot/cold aisle cooling airflow optimization, and UPS failover automation'
      ],
      technologies: ['Cisco Catalyst', 'Fiber Optics', 'Cat6A', 'Patch Panels', 'VLAN Segmentation', 'UPS Power Management', 'Cable Management', 'Network Racks'],
      gallery: [
        {
          image: 'images/projects/datacenter.jpg',
          tag: 'Server Rack Elevation',
          title: '42U Enterprise Server Rack & Patch Panel Organization',
          caption: 'High-density server rack layouts featuring horizontal cable raceways, color-coded Cat6A patch cords, and standardized port labeling.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'Backbone Topology',
          title: 'Fiber Optic MDF to IDF Backbone Infrastructure',
          caption: 'Redundant 10GbE single-mode and multi-mode fiber optic backbone interconnecting main and intermediate distribution frames.'
        },
        {
          image: 'images/projects/telephony.jpg',
          tag: 'Power & Telephony',
          title: 'Dual UPS Power Conditioning & IP-PBX Distribution',
          caption: 'Uninterruptible power supply architecture with automated generator failover and integrated telephony voice gateways.'
        },
        {
          image: 'images/projects/cctv_zone_map.jpg',
          tag: 'Facility Airflow Plan',
          title: 'Hot/Cold Aisle Airflow & Containment Plan',
          caption: 'Engineered cooling airflow layout maximizing energy efficiency and maintaining server intake temperatures between 20-22°C.'
        }
      ]
    },
    'proj-7': {
      title: 'Multi-Floor CCTV IP Surveillance Network & Analytics',
      category: 'CCTV & Surveillance',
      badgeClass: 'badge-surveillance',
      organization: 'Electro Engineering & Hotel Clients',
      period: '2019 – 2024',
      image: 'images/projects/cctv.jpg',
      description: 'Designed, installed, and commissioned high-definition IP surveillance infrastructure spanning multi-story commercial and hospitality buildings. Integrated 80+ Hikvision network cameras with centralized Network Video Recorders (NVRs), PoE switching infrastructure, intelligent motion detection, and secure remote streaming.',
      highlights: [
        'Certified Hikvision HCSA maintenance, lens focal adjustment, angle coverage optimization, and firmware hardening',
        'Dedicated Power-over-Ethernet (PoE) switches configured on isolated surveillance VLANs to prevent LAN bottlenecks',
        'Configured 24/7 continuous high-density NVR RAID storage, motion detection triggers, and encrypted mobile remote monitoring'
      ],
      technologies: ['Hikvision HCSA', 'NVR / DVR Storage', 'PoE Network Switches', 'Video Analytics', 'VLAN Security', 'RTSP Streams', 'Motion Detection'],
      gallery: [
        {
          image: 'images/projects/cctv.jpg',
          tag: 'Surveillance Hub',
          title: 'Hikvision 64-Channel NVR Central Monitoring Matrix',
          caption: '24/7 centralized surveillance command center with multi-monitor live video wall matrix and hardware RAID-5 storage array.'
        },
        {
          image: 'images/projects/cctv_zone_map.jpg',
          tag: 'Coverage Blueprint',
          title: 'Multi-Floor Camera Placement & Blind-Spot Optimization',
          caption: 'Floorplan camera distribution blueprint ensuring zero blind spots across perimeter gates, corridors, elevators, and cash offices.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'PoE Network VLAN',
          title: 'Dedicated PoE Switching Infrastructure on Isolated VLAN',
          caption: 'Power-over-Ethernet 802.3at switch layout isolated from corporate LAN traffic to ensure zero broadcast interference or packet drops.'
        },
        {
          image: 'images/projects/cctv_listing.jpg',
          tag: 'Video Analytics',
          title: 'Line Crossing, Motion Triggers & Mobile Live Streaming',
          caption: 'Configured RTSP encrypted mobile streaming and automated tripwire perimeter alerts delivered directly to security personnel smartphones.'
        }
      ]
    },
    'proj-8': {
      title: 'High-Density Hotel Wi-Fi & Routing Infrastructure',
      category: 'Networking & Cabling',
      badgeClass: 'badge-networking',
      organization: 'Empire Addis & Kenenisa Hotel',
      period: '2017 – 2023',
      image: 'images/projects/wifi.jpg',
      description: 'Engineered high-density, multi-floor enterprise Wi-Fi systems providing uninterrupted, seamless roaming coverage across hundreds of guest suites, dining halls, and executive boardrooms. Implemented captive portal guest authentication and traffic bandwidth prioritization.',
      highlights: [
        'Centralized wireless LAN controller (WLC) management eliminating dead-zones and signal interference',
        'Strict guest vs administrative corporate network segregation protected by hardware firewall policies',
        'QoS bandwidth management ensuring guaranteed throughput for CNET ERP servers and VoIP telephone communications'
      ],
      technologies: ['Enterprise Wi-Fi APs', 'Cisco Routers', 'Captive Portal', 'QoS Bandwidth Rules', 'Firewall Security', 'DHCP/DNS', 'Wireless Controller'],
      gallery: [
        {
          image: 'images/projects/wifi.jpg',
          tag: 'Wi-Fi 6 AP Deployment',
          title: 'Ceiling-Mounted Enterprise Wi-Fi 6 Access Points',
          caption: 'Discreet high-density dual-band access points deployed throughout guest corridors, executive suites, and banquet halls.'
        },
        {
          image: 'images/projects/wifi_heatmap.jpg',
          tag: 'RF Heatmap Survey',
          title: 'Active Spectrum Heatmap & Channel Optimization',
          caption: 'Post-installation RF validation verifying zero channel overlap (1, 6, 11 on 2.4GHz / 80MHz channels on 5GHz) and seamless roaming.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'Captive Portal Network',
          title: 'Guest Authentication Captive Portal & Bandwidth Throttling',
          caption: 'Custom branded captive portal with SMS room-number authentication, tiered bandwidth limits, and strict client isolation.'
        },
        {
          image: 'images/projects/datacenter.jpg',
          tag: 'Wireless Controller',
          title: 'Centralized Wireless LAN Controller & Gateway Fabric',
          caption: 'Hardware WLC managing dynamic power adjustment, rogue AP detection, and load balancing across all access points.'
        }
      ]
    },
    'proj-9': {
      title: 'CNET Hospitality ERP & Server Infrastructure Administration',
      category: 'Systems & ERP',
      badgeClass: 'badge-systems',
      organization: 'Empire Addis, Kenenisa & Sunspot Hotels',
      period: '2017 – 2023',
      image: 'images/projects/erp.jpg',
      description: 'Led full lifecycle server administration and database maintenance for CNET Hospitality ERP. Handled continuous operations for hotel front-desk reservations, multi-terminal point-of-sale (POS) systems, store inventory management, and back-office accounting databases.',
      highlights: [
        'Configured Windows Server Active Directory, group policies, user access rights, and daily automated SQL database backups',
        'Synchronized multi-terminal client POS workstations and kitchen printers with zero transactional discrepancies',
        'Maintained 99.9% server uptime through proactive disk health monitoring, failover routines, and rapid disaster recovery protocols'
      ],
      technologies: ['CNET ERP', 'Windows Server', 'Microsoft SQL Server', 'Active Directory', 'Disaster Recovery', 'POS Systems', 'Automated Backups'],
      gallery: [
        {
          image: 'images/projects/erp.jpg',
          tag: 'ERP Database Server',
          title: 'CNET Hospitality Database Server & POS Workstations',
          caption: 'High-availability Windows Server hosting Microsoft SQL Server for hotel reservations, restaurant POS, and inventory ledgers.'
        },
        {
          image: 'images/projects/network_topology.jpg',
          tag: 'POS Network Topology',
          title: 'Multi-Terminal POS & Kitchen Thermal Printer Network',
          caption: 'Low-latency Ethernet topology synchronizing bar/restaurant POS orders with kitchen thermal printers and billing servers without delay.'
        },
        {
          image: 'images/projects/datacenter.jpg',
          tag: 'Active Directory Security',
          title: 'Windows Server Active Directory & Granular Group Policies',
          caption: 'Secured workstation policies enforcing role-based login credentials for front-desk clerks, cashiers, and night auditors.'
        },
        {
          image: 'images/projects/wifi.jpg',
          tag: 'Disaster Recovery',
          title: 'Automated Nightly SQL Backups & Redundant Storage Mirrors',
          caption: 'Multi-tier backup automation creating encrypted off-site and local RAID-1 database snapshots with sub-15 minute RTO.'
        }
      ]
    }
  };

  // Switch active gallery item
  function setGalleryItem(index, smooth = true) {
    if (!currentGalleryItems || currentGalleryItems.length === 0) return;
    
    // Clamp or wrap index
    if (index < 0) {
      index = currentGalleryItems.length - 1;
    } else if (index >= currentGalleryItems.length) {
      index = 0;
    }
    
    currentGalleryIndex = index;
    const item = currentGalleryItems[index];

    if (galleryMainImg) {
      if (smooth) {
        galleryMainImg.classList.add('fade-out');
        setTimeout(() => {
          galleryMainImg.src = item.image;
          galleryMainImg.alt = item.title;
          galleryMainImg.classList.remove('fade-out');
        }, 120);
      } else {
        galleryMainImg.src = item.image;
        galleryMainImg.alt = item.title;
        galleryMainImg.classList.remove('fade-out');
      }
    }

    if (galleryTag) galleryTag.textContent = item.tag || 'Deployment Architecture';
    if (galleryCaptionTitle) galleryCaptionTitle.textContent = item.title;
    if (galleryCaptionNum) galleryCaptionNum.textContent = `Photo ${index + 1} of ${currentGalleryItems.length}`;
    if (galleryCaptionDesc) galleryCaptionDesc.textContent = item.caption;
    if (galleryCounter) galleryCounter.textContent = `${index + 1} / ${currentGalleryItems.length}`;

    // Highlight active thumbnail
    if (galleryThumbnails) {
      const thumbs = galleryThumbnails.querySelectorAll('.modal-gallery-thumb-btn');
      thumbs.forEach((thumb, idx) => {
        if (idx === index) {
          thumb.classList.add('is-active');
          thumb.setAttribute('aria-selected', 'true');
          // Scroll thumbnail into view smoothly
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('is-active');
          thumb.setAttribute('aria-selected', 'false');
        }
      });
    }
  }

  // Populate thumbnails
  function setupGallery(items) {
    currentGalleryItems = items || [];
    currentGalleryIndex = 0;

    if (!galleryThumbnails || currentGalleryItems.length === 0) {
      if (gallerySection) gallerySection.style.display = 'none';
      return;
    }

    if (gallerySection) gallerySection.style.display = 'block';
    galleryThumbnails.innerHTML = '';

    currentGalleryItems.forEach((item, idx) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = `modal-gallery-thumb-btn ${idx === 0 ? 'is-active' : ''}`;
      thumbBtn.setAttribute('aria-label', `View ${item.title}`);
      thumbBtn.setAttribute('aria-selected', idx === 0 ? 'true' : 'false');

      thumbBtn.innerHTML = `
        <img src="${item.image}" alt="${item.title}" class="modal-gallery-thumb-img" loading="lazy" referrerPolicy="no-referrer">
        <span class="modal-gallery-thumb-label">${item.tag || 'Photo ' + (idx + 1)}</span>
      `;

      thumbBtn.addEventListener('click', (e) => {
        if (hasThumbMoved) {
          e.preventDefault();
          return;
        }
        setGalleryItem(idx, true);
      });

      galleryThumbnails.appendChild(thumbBtn);
    });

    // Set initial item
    setGalleryItem(0, false);
  }

  // Prev / Next button listeners
  if (galleryPrevBtn) {
    galleryPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setGalleryItem(currentGalleryIndex - 1, true);
    });
  }

  if (galleryNextBtn) {
    galleryNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setGalleryItem(currentGalleryIndex + 1, true);
    });
  }

  // Scroll buttons for thumbnail strip
  if (stripScrollLeft && galleryThumbnails) {
    stripScrollLeft.addEventListener('click', () => {
      galleryThumbnails.scrollBy({ left: -140, behavior: 'smooth' });
    });
  }

  if (stripScrollRight && galleryThumbnails) {
    stripScrollRight.addEventListener('click', () => {
      galleryThumbnails.scrollBy({ left: 140, behavior: 'smooth' });
    });
  }

  // Touch Swipe & Drag-to-Navigate support on Modal Gallery Thumbnails Strip
  let hasThumbMoved = false;
  if (galleryThumbnails) {
    let thumbTouchStartX = 0;
    let thumbTouchStartY = 0;
    let isThumbSwiping = false;

    // Mobile Touch Gesture on Thumbnails
    galleryThumbnails.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        thumbTouchStartX = e.touches[0].clientX;
        thumbTouchStartY = e.touches[0].clientY;
        isThumbSwiping = true;
        hasThumbMoved = false;
      }
    }, { passive: true });

    galleryThumbnails.addEventListener('touchmove', (e) => {
      if (!isThumbSwiping || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - thumbTouchStartX;
      if (Math.abs(deltaX) > 8) {
        hasThumbMoved = true;
      }
    }, { passive: true });

    galleryThumbnails.addEventListener('touchend', (e) => {
      if (!isThumbSwiping) return;
      isThumbSwiping = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - thumbTouchStartX;
      const deltaY = endY - thumbTouchStartY;

      // Horizontal swipe threshold on thumbnails: navigate to next/prev diagram
      if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        if (deltaX < 0) {
          setGalleryItem(currentGalleryIndex + 1, true); // Swipe left -> Next diagram
        } else {
          setGalleryItem(currentGalleryIndex - 1, true); // Swipe right -> Previous diagram
        }
      }

      setTimeout(() => {
        hasThumbMoved = false;
      }, 60);
    }, { passive: true });

    // Desktop Mouse Drag on Thumbnails Strip
    let isMouseDraggingThumb = false;
    let mouseThumbStartX = 0;
    let mouseThumbStartScroll = 0;

    galleryThumbnails.addEventListener('mousedown', (e) => {
      isMouseDraggingThumb = true;
      hasThumbMoved = false;
      mouseThumbStartX = e.pageX - galleryThumbnails.offsetLeft;
      mouseThumbStartScroll = galleryThumbnails.scrollLeft;
      galleryThumbnails.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDraggingThumb) return;
      const x = e.pageX - galleryThumbnails.offsetLeft;
      const walk = (x - mouseThumbStartX) * 1.4;
      if (Math.abs(x - mouseThumbStartX) > 6) {
        hasThumbMoved = true;
      }
      galleryThumbnails.scrollLeft = mouseThumbStartScroll - walk;
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDraggingThumb) {
        isMouseDraggingThumb = false;
        galleryThumbnails.classList.remove('is-dragging');
        setTimeout(() => {
          hasThumbMoved = false;
        }, 60);
      }
    });
  }

  // Touch Swipe support on the main gallery stage
  if (galleryStage) {
    let startX = 0;
    let startY = 0;
    let isSwiping = false;

    galleryStage.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        isSwiping = true;
      }
    }, { passive: true });

    galleryStage.addEventListener('touchend', (e) => {
      if (!isSwiping) return;
      isSwiping = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - startX;
      const deltaY = endY - startY;

      // Horizontal swipe threshold
      if (Math.abs(deltaX) > 35 && Math.abs(deltaX) > Math.abs(deltaY)) {
        if (deltaX < 0) {
          setGalleryItem(currentGalleryIndex + 1, true); // Swipe left -> Next
        } else {
          setGalleryItem(currentGalleryIndex - 1, true); // Swipe right -> Prev
        }
      }
    }, { passive: true });
  }

  // ==========================================================================
  // Fullscreen Diagram & Architecture Lightbox Implementation
  // ==========================================================================
  function updateLightboxTransform() {
    if (!lightboxCanvas) return;
    if (currentZoom <= 1) {
      panX = 0;
      panY = 0;
      lightboxCanvas.style.transform = `scale(${currentZoom})`;
      lightboxCanvas.classList.remove('is-zoomed');
      if (lightboxViewport) lightboxViewport.classList.remove('is-zoomed');
    } else {
      lightboxCanvas.style.transform = `scale(${currentZoom}) translate(${panX / currentZoom}px, ${panY / currentZoom}px)`;
      lightboxCanvas.classList.add('is-zoomed');
      if (lightboxViewport) lightboxViewport.classList.add('is-zoomed');
    }
    if (lightboxZoomLevel) {
      lightboxZoomLevel.textContent = `${Math.round(currentZoom * 100)}%`;
    }
  }

  function setLightboxZoom(newZoom) {
    currentZoom = Math.min(Math.max(newZoom, 0.75), 3.5);
    updateLightboxTransform();
  }

  function resetLightboxZoom() {
    currentZoom = 1;
    panX = 0;
    panY = 0;
    updateLightboxTransform();
  }

  function setLightboxItem(index, smooth = true) {
    if (!currentGalleryItems || currentGalleryItems.length === 0) return;

    if (index < 0) {
      index = currentGalleryItems.length - 1;
    } else if (index >= currentGalleryItems.length) {
      index = 0;
    }

    currentGalleryIndex = index;
    const item = currentGalleryItems[index];

    // Synchronize modal gallery as well
    setGalleryItem(index, false);

    // Reset zoom on item switch
    resetLightboxZoom();

    if (lightboxImg) {
      if (smooth) {
        lightboxImg.classList.add('fade-out');
        setTimeout(() => {
          lightboxImg.src = item.image;
          lightboxImg.alt = item.title;
          lightboxImg.classList.remove('fade-out');
        }, 120);
      } else {
        lightboxImg.src = item.image;
        lightboxImg.alt = item.title;
        lightboxImg.classList.remove('fade-out');
      }
    }

    if (lightboxTag) lightboxTag.textContent = item.tag || 'Architecture Schematic';
    if (lightboxTitle) lightboxTitle.textContent = item.title;
    if (lightboxCounter) lightboxCounter.textContent = `${index + 1} / ${currentGalleryItems.length}`;
    if (lightboxCaption) lightboxCaption.textContent = item.caption;

    // Highlight active thumbnail in lightbox strip
    if (lightboxThumbnails) {
      const thumbs = lightboxThumbnails.querySelectorAll('.diagram-lightbox-thumb');
      thumbs.forEach((thumb, idx) => {
        if (idx === index) {
          thumb.classList.add('is-active');
          thumb.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
        } else {
          thumb.classList.remove('is-active');
        }
      });
    }
  }

  let hasLightboxThumbMoved = false;
  function setupLightboxThumbnails() {
    if (!lightboxThumbnails) return;
    lightboxThumbnails.innerHTML = '';

    currentGalleryItems.forEach((item, idx) => {
      const thumbBtn = document.createElement('button');
      thumbBtn.type = 'button';
      thumbBtn.className = `diagram-lightbox-thumb ${idx === currentGalleryIndex ? 'is-active' : ''}`;
      thumbBtn.setAttribute('aria-label', `View schematic ${item.title}`);
      thumbBtn.innerHTML = `<img src="${item.image}" alt="${item.title}" loading="lazy" referrerPolicy="no-referrer">`;

      thumbBtn.addEventListener('click', (e) => {
        if (hasLightboxThumbMoved) {
          e.preventDefault();
          return;
        }
        setLightboxItem(idx, true);
      });

      lightboxThumbnails.appendChild(thumbBtn);
    });
  }

  // Touch Swipe & Drag on Lightbox Thumbnails Strip
  if (lightboxThumbnails) {
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    let isLbThumbSwiping = false;

    lightboxThumbnails.addEventListener('touchstart', (e) => {
      if (e.touches.length === 1) {
        lbTouchStartX = e.touches[0].clientX;
        lbTouchStartY = e.touches[0].clientY;
        isLbThumbSwiping = true;
        hasLightboxThumbMoved = false;
      }
    }, { passive: true });

    lightboxThumbnails.addEventListener('touchmove', (e) => {
      if (!isLbThumbSwiping || e.touches.length !== 1) return;
      const deltaX = e.touches[0].clientX - lbTouchStartX;
      if (Math.abs(deltaX) > 8) {
        hasLightboxThumbMoved = true;
      }
    }, { passive: true });

    lightboxThumbnails.addEventListener('touchend', (e) => {
      if (!isLbThumbSwiping) return;
      isLbThumbSwiping = false;
      const endX = e.changedTouches[0].clientX;
      const endY = e.changedTouches[0].clientY;
      const deltaX = endX - lbTouchStartX;
      const deltaY = endY - lbTouchStartY;

      if (Math.abs(deltaX) > 36 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
        if (deltaX < 0) {
          setLightboxItem(currentGalleryIndex + 1, true); // Swipe left -> Next diagram
        } else {
          setLightboxItem(currentGalleryIndex - 1, true); // Swipe right -> Prev diagram
        }
      }

      setTimeout(() => {
        hasLightboxThumbMoved = false;
      }, 60);
    }, { passive: true });

    // Desktop Mouse Drag on Lightbox Thumbnails
    let isMouseDraggingLbThumb = false;
    let mouseLbStartX = 0;
    let mouseLbStartScroll = 0;

    lightboxThumbnails.addEventListener('mousedown', (e) => {
      isMouseDraggingLbThumb = true;
      hasLightboxThumbMoved = false;
      mouseLbStartX = e.pageX - lightboxThumbnails.offsetLeft;
      mouseLbStartScroll = lightboxThumbnails.scrollLeft;
      lightboxThumbnails.classList.add('is-dragging');
    });

    window.addEventListener('mousemove', (e) => {
      if (!isMouseDraggingLbThumb) return;
      const x = e.pageX - lightboxThumbnails.offsetLeft;
      const walk = (x - mouseLbStartX) * 1.4;
      if (Math.abs(x - mouseLbStartX) > 6) {
        hasLightboxThumbMoved = true;
      }
      lightboxThumbnails.scrollLeft = mouseLbStartScroll - walk;
    });

    window.addEventListener('mouseup', () => {
      if (isMouseDraggingLbThumb) {
        isMouseDraggingLbThumb = false;
        lightboxThumbnails.classList.remove('is-dragging');
        setTimeout(() => {
          hasLightboxThumbMoved = false;
        }, 60);
      }
    });
  }

  function openLightbox(initialIndex = 0) {
    if (!lightbox || !currentGalleryItems || currentGalleryItems.length === 0) return;
    setupLightboxThumbnails();
    setLightboxItem(initialIndex, false);
    lightbox.classList.add('is-open');
    lightbox.setAttribute('aria-hidden', 'false');
  }

  function closeLightbox() {
    if (!lightbox) return;
    lightbox.classList.remove('is-open');
    lightbox.setAttribute('aria-hidden', 'true');
    resetLightboxZoom();
  }

  // Lightbox Zoom & Pan Controls
  if (lightboxZoomIn) {
    lightboxZoomIn.addEventListener('click', () => {
      setLightboxZoom(currentZoom + 0.35);
    });
  }

  if (lightboxZoomOut) {
    lightboxZoomOut.addEventListener('click', () => {
      setLightboxZoom(currentZoom - 0.35);
    });
  }

  if (lightboxZoomReset) {
    lightboxZoomReset.addEventListener('click', () => {
      resetLightboxZoom();
    });
  }

  // Lightbox Prev / Next
  if (lightboxPrevBtn) {
    lightboxPrevBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setLightboxItem(currentGalleryIndex - 1, true);
    });
  }

  if (lightboxNextBtn) {
    lightboxNextBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      setLightboxItem(currentGalleryIndex + 1, true);
    });
  }

  if (lightboxCloseBtn) {
    lightboxCloseBtn.addEventListener('click', closeLightbox);
  }

  if (lightboxBackdrop) {
    lightboxBackdrop.addEventListener('click', closeLightbox);
  }

  // Pan-to-Move Gesture & Touch/Mouse Navigation on lightboxViewport
  if (lightboxViewport) {
    // 1. Mouse Drag / Pan on lightboxViewport
    lightboxViewport.addEventListener('mousedown', (e) => {
      // Ignore clicks on floating navigation buttons
      if (e.target.closest('.diagram-lightbox-nav')) return;

      if (currentZoom > 1) {
        isDraggingCanvas = true;
        dragStartX = e.clientX - panX;
        dragStartY = e.clientY - panY;
        lightboxViewport.classList.add('is-dragging');
        if (lightboxCanvas) lightboxCanvas.classList.add('is-dragging');
        e.preventDefault();
      }
    });

    window.addEventListener('mousemove', (e) => {
      if (isDraggingCanvas && currentZoom > 1) {
        panX = e.clientX - dragStartX;
        panY = e.clientY - dragStartY;
        updateLightboxTransform();
      }
    });

    window.addEventListener('mouseup', () => {
      if (isDraggingCanvas) {
        isDraggingCanvas = false;
        lightboxViewport.classList.remove('is-dragging');
        if (lightboxCanvas) lightboxCanvas.classList.remove('is-dragging');
      }
    });

    // 2. Touch support: Pan when zoom > 1, Pinch-to-Zoom, Swipe when zoom = 1
    let lbTouchStartX = 0;
    let lbTouchStartY = 0;
    let isLbTouchPanning = false;
    let isPinching = false;
    let initialPinchDist = 0;
    let initialZoomOnPinch = 1;
    let lastTapTime = 0;

    lightboxViewport.addEventListener('touchstart', (e) => {
      if (e.target.closest('.diagram-lightbox-nav')) return;

      if (e.touches.length === 1) {
        lbTouchStartX = e.touches[0].clientX;
        lbTouchStartY = e.touches[0].clientY;

        if (currentZoom > 1) {
          dragStartX = e.touches[0].clientX - panX;
          dragStartY = e.touches[0].clientY - panY;
          isLbTouchPanning = true;
          lightboxViewport.classList.add('is-dragging');
          if (lightboxCanvas) lightboxCanvas.classList.add('is-dragging');
        }
      } else if (e.touches.length === 2) {
        // Two-finger pinch to zoom
        isPinching = true;
        isLbTouchPanning = false;
        initialPinchDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        initialZoomOnPinch = currentZoom;
      }
    }, { passive: false });

    lightboxViewport.addEventListener('touchmove', (e) => {
      if (e.touches.length === 1 && currentZoom > 1 && isLbTouchPanning) {
        e.preventDefault();
        panX = e.touches[0].clientX - dragStartX;
        panY = e.touches[0].clientY - dragStartY;
        updateLightboxTransform();
      } else if (e.touches.length === 2 && isPinching) {
        e.preventDefault();
        const currentDist = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        );
        if (initialPinchDist > 0) {
          const pinchScale = currentDist / initialPinchDist;
          setLightboxZoom(initialZoomOnPinch * pinchScale);
        }
      }
    }, { passive: false });

    lightboxViewport.addEventListener('touchend', (e) => {
      if (isLbTouchPanning) {
        isLbTouchPanning = false;
        lightboxViewport.classList.remove('is-dragging');
        if (lightboxCanvas) lightboxCanvas.classList.remove('is-dragging');
      }

      if (isPinching && e.touches.length < 2) {
        isPinching = false;
      }

      // Handle double-tap zoom
      const currentTime = new Date().getTime();
      const tapLength = currentTime - lastTapTime;
      if (tapLength < 300 && tapLength > 50 && e.changedTouches.length === 1) {
        if (currentZoom > 1) {
          resetLightboxZoom();
        } else {
          setLightboxZoom(2.0);
        }
        lastTapTime = 0;
        return;
      }
      lastTapTime = currentTime;

      // When zoom = 1, horizontal touch swipe navigates diagrams
      if (currentZoom <= 1 && e.changedTouches.length === 1) {
        const endX = e.changedTouches[0].clientX;
        const endY = e.changedTouches[0].clientY;
        const deltaX = endX - lbTouchStartX;
        const deltaY = endY - lbTouchStartY;

        if (Math.abs(deltaX) > 40 && Math.abs(deltaX) > Math.abs(deltaY) * 1.15) {
          if (deltaX < 0) {
            setLightboxItem(currentGalleryIndex + 1, true); // Swipe left -> Next
          } else {
            setLightboxItem(currentGalleryIndex - 1, true); // Swipe right -> Prev
          }
        }
      }
    }, { passive: true });

    // 3. Double-Click to Zoom / Reset on Desktop
    lightboxViewport.addEventListener('dblclick', (e) => {
      if (e.target.closest('.diagram-lightbox-nav')) return;
      if (currentZoom > 1) {
        resetLightboxZoom();
      } else {
        setLightboxZoom(2.2);
      }
    });

    // 4. Mouse wheel zoom in Lightbox Viewport
    lightboxViewport.addEventListener('wheel', (e) => {
      if (lightbox && lightbox.classList.contains('is-open')) {
        e.preventDefault();
        const zoomDelta = e.deltaY < 0 ? 0.25 : -0.25;
        setLightboxZoom(currentZoom + zoomDelta);
      }
    }, { passive: false });
  }

  // Open Lightbox from Modal Gallery stage or Expand button
  if (galleryStage) {
    galleryStage.addEventListener('click', (e) => {
      // Don't trigger if clicked navigation arrow
      if (e.target.closest('.modal-gallery-arrow')) return;
      openLightbox(currentGalleryIndex);
    });

    galleryStage.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openLightbox(currentGalleryIndex);
      }
    });
  }

  if (galleryExpandBtn) {
    galleryExpandBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      openLightbox(currentGalleryIndex);
    });
  }

  function openModal(projectId, scrollToGallery = false) {
    const data = projectsData[projectId];
    if (!data || !modal) return;

    if (modalImg) {
      modalImg.src = data.image;
      modalImg.alt = data.title;
    }
    if (modalCategory) {
      modalCategory.textContent = data.category;
      modalCategory.className = `project-category-badge ${data.badgeClass || ''}`;
    }
    if (modalPeriod) modalPeriod.textContent = data.period;
    if (modalTitle) modalTitle.textContent = data.title;
    if (modalOrg) {
      const orgSpan = modalOrg.querySelector('span');
      if (orgSpan) orgSpan.textContent = data.organization;
    }
    if (modalDesc) modalDesc.textContent = data.description;

    // Highlights
    if (modalHighlights) {
      modalHighlights.innerHTML = '';
      data.highlights.forEach((hl) => {
        const li = document.createElement('li');
        li.textContent = hl;
        modalHighlights.appendChild(li);
      });
    }

    // Tech
    if (modalTech) {
      modalTech.innerHTML = '';
      data.technologies.forEach((tech) => {
        const span = document.createElement('span');
        span.className = 'project-tech-pill';
        span.textContent = tech;
        modalTech.appendChild(span);
      });
    }

    // Initialize Project Gallery
    if (data.gallery && data.gallery.length > 0) {
      setupGallery(data.gallery);
    } else {
      setupGallery([
        {
          image: data.image,
          tag: 'Deployment View',
          title: data.title,
          caption: data.description
        }
      ]);
    }

    // Setup Inquiry Button to pre-select appropriate subject in contact form
    if (inquireBtn) {
      inquireBtn.onclick = () => {
        closeModal();
        const formSubject = document.getElementById('form-subject');
        if (formSubject) {
          if (data.category.includes('Networking')) {
            formSubject.value = 'Data Center & Cabling Project';
          } else if (data.category.includes('Surveillance')) {
            formSubject.value = 'CCTV & Surveillance Project';
          } else if (data.category.includes('Systems')) {
            formSubject.value = 'ERP & Server Administration';
          } else {
            formSubject.value = 'General Technical Consultation';
          }
        }
      };
    }

    modal.classList.add('is-open');
    modal.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    window.dispatchEvent(new CustomEvent('projectModalOpened'));

    // If opened by clicking carousel thumbnail image, scroll down to gallery section smoothly
    if (scrollToGallery && gallerySection) {
      setTimeout(() => {
        gallerySection.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 180);
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('is-open');
    modal.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    window.dispatchEvent(new CustomEvent('projectModalClosed'));
    closeLightbox();
  }

  // Attach click listeners with event delegation to support all cards, image wrappers, and action buttons
  document.addEventListener('click', (e) => {
    // 1. "View Technical Details" button click
    const viewBtn = e.target.closest('.project-view-more-btn');
    if (viewBtn) {
      e.preventDefault();
      const projectId = viewBtn.getAttribute('data-project-id');
      if (projectId) {
        openModal(projectId, false);
      }
      return;
    }

    // 2. Carousel Image Wrapper Click (Opens project modal & highlights gallery)
    const imgWrapper = e.target.closest('.project-slide-image-wrapper');
    if (imgWrapper) {
      // If user was dragging the carousel, do not trigger click
      if (window.vanillaCarousel && window.vanillaCarousel.hasMoved) {
        return;
      }
      e.preventDefault();
      const projectId = imgWrapper.getAttribute('data-project-id');
      if (projectId) {
        openModal(projectId, true);
      }
      return;
    }
  });

  // Accessible keyboard support (Enter / Space) on project image wrappers
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const activeEl = document.activeElement;
      if (activeEl && activeEl.classList.contains('project-slide-image-wrapper')) {
        e.preventDefault();
        const projectId = activeEl.getAttribute('data-project-id');
        if (projectId) {
          openModal(projectId, true);
        }
      }
    }
  });

  if (closeBtn) closeBtn.addEventListener('click', closeModal);
  if (closeActionBtn) closeActionBtn.addEventListener('click', closeModal);
  if (backdrop) backdrop.addEventListener('click', closeModal);

  // Keyboard navigation inside modal & lightbox
  window.addEventListener('keydown', (e) => {
    // If Lightbox is open, handle Lightbox keys
    if (lightbox && lightbox.classList.contains('is-open')) {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        setLightboxItem(currentGalleryIndex - 1, true);
      } else if (e.key === 'ArrowRight') {
        setLightboxItem(currentGalleryIndex + 1, true);
      } else if (e.key === '+' || e.key === '=') {
        setLightboxZoom(currentZoom + 0.35);
      } else if (e.key === '-' || e.key === '_') {
        setLightboxZoom(currentZoom - 0.35);
      } else if (e.key === '0') {
        resetLightboxZoom();
      }
      return;
    }

    // Otherwise handle Project Modal keys
    if (modal && modal.classList.contains('is-open')) {
      if (e.key === 'Escape') {
        closeModal();
      } else if (e.key === 'ArrowLeft') {
        setGalleryItem(currentGalleryIndex - 1, true);
      } else if (e.key === 'ArrowRight') {
        setGalleryItem(currentGalleryIndex + 1, true);
      }
    }
  });
}

/* ==========================================================================
   6. Contact Form & Quick Actions
   ========================================================================== */
function initContactForm() {
  const contactForm = document.getElementById('contact-form');
  const formToast = document.getElementById('form-toast');
  const copyEmailBtn = document.getElementById('copy-email-btn');
  const copyPhoneBtn = document.getElementById('copy-phone-btn');

  if (contactForm) {
    contactForm.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('form-name')?.value || '';
      const email = document.getElementById('form-email')?.value || '';
      const subject = document.getElementById('form-subject')?.value || 'Portfolio Contact Inquiry';
      const message = document.getElementById('form-message')?.value || '';

      // Prepare mailto link as direct action
      const mailtoUrl = `mailto:amirkassim00@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(`Hi Amir,\n\nName: ${name}\nEmail: ${email}\n\nMessage:\n${message}`)}`;

      // Show toast
      if (formToast) {
        formToast.textContent = `Thank you, ${name}! Opening your email client to send message to amirkassim00@gmail.com...`;
        formToast.className = 'toast-message toast-success is-active';
        
        setTimeout(() => {
          window.location.href = mailtoUrl;
        }, 800);

        setTimeout(() => {
          formToast.classList.remove('is-active');
          contactForm.reset();
        }, 5000);
      }
    });
  }

  // Copy Email Helper
  if (copyEmailBtn) {
    copyEmailBtn.addEventListener('click', (e) => {
      e.preventDefault();
      copyToClipboard('amirkassim00@gmail.com', copyEmailBtn, 'Email Copied!');
    });
  }

  // Copy Phone Helper
  if (copyPhoneBtn) {
    copyPhoneBtn.addEventListener('click', (e) => {
      e.preventDefault();
      copyToClipboard('+251913869337', copyPhoneBtn, 'Phone Copied!');
    });
  }

  function copyToClipboard(text, element, successMessage) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        showCopyFeedback(element, successMessage);
      });
    } else {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      showCopyFeedback(element, successMessage);
    }
  }

  function showCopyFeedback(element, msg) {
    const originalText = element.getAttribute('data-original-text') || element.innerHTML;
    element.setAttribute('data-original-text', originalText);
    element.innerHTML = `✓ ${msg}`;
    element.style.borderColor = 'var(--accent-secondary)';
    element.style.color = 'var(--accent-secondary)';

    setTimeout(() => {
      element.innerHTML = originalText;
      element.style.borderColor = '';
      element.style.color = '';
    }, 2500);
  }
}

/* ==========================================================================
   7. Back to Top Button
   ========================================================================== */
function initBackToTop() {
  const backToTopBtn = document.getElementById('back-to-top');
  if (backToTopBtn) {
    backToTopBtn.addEventListener('click', () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    });
  }
}

/* ==========================================================================
   8. Rich Image Animations & 3D Interactive Parallax
   ========================================================================== */
function initImageAnimations() {
  const card = document.getElementById('heroProfileCard');
  const wrapper = document.getElementById('profileImageWrapper');
  const glow = document.getElementById('profileAmbientGlow');
  const badgeTop = document.getElementById('profileBadgeTop');
  const badgeBottom = document.getElementById('profileBadgeBottom');
  const glare = document.querySelector('.profile-glass-glare');

  if (!card || !wrapper) return;

  // Check if reduced motion is preferred
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) return;

  let isHovered = false;
  let rafId = null;
  let targetRotateX = 0;
  let targetRotateY = 0;
  let currentRotateX = 0;
  let currentRotateY = 0;

  function updateTilt() {
    if (!isHovered) {
      targetRotateX = 0;
      targetRotateY = 0;
    }

    // Smooth interpolation (lerp)
    currentRotateX += (targetRotateX - currentRotateX) * 0.12;
    currentRotateY += (targetRotateY - currentRotateY) * 0.12;

    const tiltX = currentRotateX.toFixed(2);
    const tiltY = currentRotateY.toFixed(2);

    wrapper.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;

    if (glow) {
      const glowX = (currentRotateY * -2).toFixed(2);
      const glowY = (currentRotateX * 2).toFixed(2);
      glow.style.transform = `translate(${glowX}px, ${glowY}px) scale(1.08)`;
    }

    if (badgeBottom) {
      const badgeOffsetX = (currentRotateY * 1.5).toFixed(2);
      const badgeOffsetY = (currentRotateX * -1.5).toFixed(2);
      badgeBottom.style.transform = `translate3d(${badgeOffsetX}px, ${badgeOffsetY}px, 20px)`;
    }

    if (badgeTop) {
      const badgeOffsetX = (currentRotateY * -1.2).toFixed(2);
      const badgeOffsetY = (currentRotateX * 1.2).toFixed(2);
      badgeTop.style.transform = `translate3d(${badgeOffsetX}px, ${badgeOffsetY}px, 20px)`;
    }

    // Continue loop while animating
    if (isHovered || Math.abs(currentRotateX) > 0.05 || Math.abs(currentRotateY) > 0.05) {
      rafId = requestAnimationFrame(updateTilt);
    } else {
      wrapper.style.transform = '';
      if (glow) glow.style.transform = '';
      if (badgeBottom) badgeBottom.style.transform = '';
      if (badgeTop) badgeTop.style.transform = '';
      rafId = null;
    }
  }

  card.addEventListener('mouseenter', () => {
    isHovered = true;
    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  card.addEventListener('mousemove', (e) => {
    const rect = card.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    const mouseX = e.clientX - centerX;
    const mouseY = e.clientY - centerY;

    // Maximum tilt angles in degrees
    const maxTilt = 12;
    targetRotateX = (-mouseY / (rect.height / 2)) * maxTilt;
    targetRotateY = (mouseX / (rect.width / 2)) * maxTilt;

    if (!rafId) rafId = requestAnimationFrame(updateTilt);
  });

  card.addEventListener('mouseleave', () => {
    isHovered = false;
    targetRotateX = 0;
    targetRotateY = 0;
  });

  // Tactile Click Effect
  wrapper.addEventListener('click', () => {
    wrapper.style.transition = 'transform 0.15s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
    wrapper.style.transform = 'perspective(1000px) scale3d(0.96, 0.96, 0.96)';

    if (glare) {
      glare.style.animation = 'none';
      void glare.offsetWidth; // Trigger reflow
      glare.style.animation = 'glareSweep 1s cubic-bezier(0.16, 1, 0.3, 1) forwards';
    }

    setTimeout(() => {
      wrapper.style.transition = 'transform 0.2s cubic-bezier(0.25, 0.46, 0.45, 0.94), box-shadow 0.3s ease';
      if (isHovered) {
        if (!rafId) rafId = requestAnimationFrame(updateTilt);
      } else {
        wrapper.style.transform = '';
      }
    }, 180);
  });
}

/* ==========================================================================
   9. Typewriter Text Animation Effect
   ========================================================================== */
function initTypewriterEffect() {
  const typingElement = document.getElementById('heroTypingText');
  if (!typingElement) return;

  const roles = [
    'Network Administrator',
    'Systems Engineer',
    'IT Specialist',
    'Hikvision CCTV & Surveillance Pro',
    'Windows Server Administrator',
    'Enterprise Infrastructure Engineer'
  ];

  // If user prefers reduced motion, set static text and return
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    typingElement.textContent = 'Network Administrator • Systems Engineer • IT Specialist';
    return;
  }

  let roleIndex = 0;
  let charIndex = 0;
  let isDeleting = false;
  let typingTimeout = null;

  function typeStep() {
    const currentRole = roles[roleIndex];
    
    if (isDeleting) {
      // Deleting letters
      charIndex--;
      typingElement.textContent = currentRole.substring(0, charIndex);
    } else {
      // Typing letters
      charIndex++;
      typingElement.textContent = currentRole.substring(0, charIndex);
    }

    let delay = 75;

    if (!isDeleting && charIndex === currentRole.length) {
      // Finished typing current role: pause before deleting
      delay = 2200;
      isDeleting = true;
    } else if (isDeleting && charIndex === 0) {
      // Finished deleting: move to next role
      isDeleting = false;
      roleIndex = (roleIndex + 1) % roles.length;
      delay = 450;
    } else if (isDeleting) {
      // Fast backspace speed
      delay = 38;
    } else {
      // Natural human typing jitter
      delay = 60 + Math.random() * 40;
    }

    typingTimeout = setTimeout(typeStep, delay);
  }

  // Start typewriter effect after brief initial page entrance delay
  setTimeout(() => {
    charIndex = typingElement.textContent.length;
    isDeleting = true;
    typeStep();
  }, 1800);
}

