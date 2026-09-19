/**
 * WhatsApp Click Tracking – Universal Script
 * Include on any LP:
 *   <script src="https://arihant-advika.co.in/testing/Whatsapp-tracker/wa-tracking.js" defer></script>
 */

(function () {
  // Prevent double initialization
  if (window.WAT && window.WAT.__initialized) return;

  ///////////////////////
  // CONFIG
  ///////////////////////

  var TRACKING_URL = 'https://arihant-advika.co.in/testing/Whatsapp-tracker/wa-click.php';

  /**
   * Get project name from multiple sources (fallback chain)
   * Priority: whatsapp-config.js > page title > meta description > fallback
   */
  function getProjectName() {
    // 1. Try from whatsapp-config.js (primary source)
    const whatsappConfig = window.whatsappConfig || {};
    if (whatsappConfig.projectName && whatsappConfig.projectName.trim()) {
      return whatsappConfig.projectName.trim();
    }
    
    // 2. Try to extract from page title
    try {
      const titleEl = document.querySelector('title');
      if (titleEl && titleEl.textContent) {
        const title = titleEl.textContent.trim();
        // Extract project name pattern (usually before "–" or "at")
        const match = title.match(/^([^–—at\-]+?)(?:\s*[–—at\-]|\s+at\s)/i);
        if (match && match[1]) {
          return match[1].trim();
        }
        // If no pattern match, return first 50 chars of title
        if (title.length > 0) {
          return title.substring(0, 100).trim();
        }
      }
    } catch (e) {}
    
    // 3. Try from meta description
    try {
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc && metaDesc.content) {
        const desc = metaDesc.content.trim();
        // Extract first meaningful part (usually project name comes first)
        const match = desc.match(/^([^–—\.]+?)(?:\s*[–—\.]|\.|\s+offers)/i);
        if (match && match[1]) {
          return match[1].trim();
        }
      }
    } catch (e) {}
    
    // 4. Try from h1 tag (often contains project name)
    try {
      const h1El = document.querySelector('h1');
      if (h1El && h1El.textContent) {
        const h1Text = h1El.textContent.trim();
        if (h1Text.length > 0 && h1Text.length < 100) {
          return h1Text;
        }
      }
    } catch (e) {}
    
    // 5. Fallback: use domain or empty
    try {
      const hostname = window.location.hostname || '';
      if (hostname) {
        return hostname.replace('www.', '').split('.')[0] || '';
      }
    } catch (e) {}
    
    // 6. Final fallback
    return '';
  }

  // Get project name with fallbacks
  const projectName = getProjectName();

  // Common selectors used by your WA CTAs
  var WA_SELECTORS = [
    '.discovery',
    '.discovery_mobile',
    'a[href*="wa.me"]',
    'a[href*="api.whatsapp.com"]',
    'a[href*="web.whatsapp.com"]'
  ];

  // Capture initial URL immediately with all query parameters
  var INITIAL_HREF = (function() {
    try {
      return window.location.href || window.location.toString() || '';
    } catch (e) {
      try {
        return document.location.href || '';
      } catch (e2) {
        return '';
      }
    }
  })();

  ///////////////////////
  // HELPERS
  ///////////////////////

  function getParam(name) {
    if (!name) return '';
    
    var value = '';
    
    // Method 1: Use window.location.search with URLSearchParams (most reliable)
    try {
      var search = window.location.search || '';
      if (search) {
        var params = new URLSearchParams(search);
        value = params.get(name);
        if (value !== null && value !== '') {
          return decodeURIComponent(value);
        }
      }
    } catch (e) {}
    
    // Method 2: Parse from window.location.href using URL constructor
    try {
      var url = new URL(window.location.html);
      value = url.searchParams.get(name);
      if (value !== null && value !== '') {
        return decodeURIComponent(value);
      }
    } catch (e) {}
    
    // Method 3: Parse from INITIAL_HREF using URL constructor (backup in case window.location changed)
    try {
      if (INITIAL_HREF) {
        var url = new URL(INITIAL_HREF.html);
        value = url.searchParams.get(name);
        if (value !== null && value !== '') {
          return decodeURIComponent(value);
        }
      }
    } catch (e) {}
    
    // Method 4: Manual parsing from window.location.search (ultimate fallback)
    try {
      var search = window.location.search || '';
      if (search && search.indexOf('?') === 0) {
        search = search.substring(1);
        var pairs = search.split('&');
        for (var i = 0; i < pairs.length; i++) {
          var pair = pairs[i].split('=');
          var key = decodeURIComponent(pair[0] || '').trim();
          if (key === name) {
            value = pair[1] || '';
            if (value) {
              return decodeURIComponent(value);
            }
            return '';
          }
        }
      }
    } catch (e) {}
    
    // Method 5: Manual parsing from INITIAL_HREF (last resort)
    try {
      if (INITIAL_HREF) {
        var hashIndex = INITIAL_HREF.indexOf('#');
        var hrefToParse = hashIndex !== -1 ? INITIAL_HREF.substring(0, hashIndex) : INITIAL_HREF;
        var queryIndex = hrefToParse.indexOf('?');
        if (queryIndex !== -1) {
          var search = hrefToParse.substring(queryIndex + 1);
          var pairs = search.split('&');
          for (var i = 0; i < pairs.length; i++) {
            var pair = pairs[i].split('=');
            var key = decodeURIComponent(pair[0] || '').trim();
            if (key === name) {
              value = pair[1] || '';
              if (value) {
                return decodeURIComponent(value);
              }
              return '';
            }
          }
        }
      }
    } catch (e) {}
    
    return '';
  }

  function detectDeviceCategory() {
    // Check screen width first (more reliable for mobile detection)
    var isMobile = window.innerWidth <= 768 || (window.screen && window.screen.width <= 768);
    var isTablet = !isMobile && (window.innerWidth <= 1024 || (window.screen && window.screen.width <= 1024));
    
    // Fallback to user agent if available
    var userAgent = navigator.userAgent || navigator.vendor || window.opera || '';
    userAgent = userAgent.toLowerCase();
    
    // Mobile device patterns
    var mobilePatterns = /android|webos|iphone|ipod|blackberry|iemobile|opera mini|mobile|mobile safari|fennec|minimo|avantgo|bada|blazer|elaine|hiptop|iris|maemo|midp|mmp|netfront|obigo|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|symbian|smartphone|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i;
    
    // Tablet patterns
    var tabletPatterns = /ipad|android(?!.*mobile)|tablet|playbook|silk/i;
    
    // Detect based on patterns
    if (tabletPatterns.test(userAgent) || (isTablet && !mobilePatterns.test(userAgent))) {
      return 'Tablet';
    }
    if (mobilePatterns.test(userAgent) || isMobile) {
      return 'Mobile';
    }
    
    // Default to Desktop
    return 'Desktop';
  }

  function buildPayload(trigger) {
    trigger = trigger || 'whatsapp_click';

    // Get project name dynamically (in case config loads late)
    var currentProjectName = getProjectName() || projectName || '';

    return {
      // Only project_name, no project_id
      project_name: currentProjectName,
      page_url: INITIAL_HREF,

      // Normalised UTM-style fields
      utm_source:  getParam('utm_source')  || getParam('mainsource') || '',
      utm_medium:  getParam('utm_medium')  || getParam('medium') || '',
      utm_campaign: getParam('utm_campaign') || getParam('campaign_name') || '',
      utm_term:    getParam('utm_term')    || getParam('keyword') || '',
      utm_content: getParam('utm_content') || getParam('ads_extension_id') || '',

      // Raw ad / Bing / PPC params
      mainsource:         getParam('mainsource'),
      keyword:            getParam('keyword'),
      model_of_device:    getParam('modelofthedevice'),
      ads_id:             getParam('ads_id'),
      adgroup_id:         getParam('adgroupid'),
      ads_extension_id:   getParam('ads_extension_id'),
      ads_set_name:       getParam('ads_set_name'),
      campaign_id:        getParam('campaignid'),
      campaign_name:      getParam('campaign_name'),
      keyword_match_type: getParam('keywordmatchtype'),
      geo_location:       getParam('geographiclocation'),
      ad_strategy:        getParam('ad_strategy'),
      target_id:          getParam('targetid'),
      target_raw:         getParam('target'),
      device_type:        getParam('devicetype'),
      msclkid:            getParam('msclkid'),

      // Device category detection (Desktop/Mobile/Tablet)
      device_category:    detectDeviceCategory(),

      trigger: trigger,
      ts: Date.now()
    };
  }

  function sendTracking(trigger) {
    if (!TRACKING_URL) return;

    var payload = buildPayload(trigger);
    var body = JSON.stringify(payload);

    try {
      fetch(TRACKING_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: body,
        keepalive: true,
        credentials: 'omit'
      }).catch(function () {});
    } catch (e) {}
  }

  function elementMatchesWhatsApp(el) {
    if (!el || el.nodeType !== 1) return false;
    for (var i = 0; i < WA_SELECTORS.length; i++) {
      var sel = WA_SELECTORS[i];
      try {
        if (el.matches(sel)) return true;
      } catch (e) {}
    }
    return false;
  }

  function findWAAncestor(start) {
    var el = start;
    var depth = 0;
    while (el && depth < 5) {
      if (elementMatchesWhatsApp(el)) return el;
      el = el.parentElement;
      depth++;
    }
    return null;
  }

  ///////////////////////
  // HELPERS FOR TRIGGER DETECTION
  ///////////////////////

  function isInsideModal(element) {
    if (!element) return false;
    var el = element;
    var depth = 0;
    while (el && depth < 10) {
      if (el.classList && (
        el.classList.contains('modal') ||
        el.classList.contains('modal-body') ||
        el.classList.contains('modal-content') ||
        el.id === 'enquire-modal' ||
        el.id === 'autoPopup'
      )) {
        return true;
      }
      el = el.parentElement;
      depth++;
    }
    return false;
  }

  function isDesktopDevice() {
    var deviceCategory = detectDeviceCategory();
    return deviceCategory === 'Desktop';
  }

  function isMobileDevice() {
    var deviceCategory = detectDeviceCategory();
    return deviceCategory === 'Mobile' || deviceCategory === 'Tablet';
  }

  function getTriggerName(element) {
    var isMobile = isMobileDevice();
    var isDesktop = isDesktopDevice();
    var inModal = isInsideModal(element);
    var isSlideBtn = element.classList && element.classList.contains('whatsapp-slide-btn');
    
    // Check if parent has slide button class
    if (!isSlideBtn) {
      var parent = element.parentElement;
      var depth = 0;
      while (parent && depth < 3) {
        if (parent.classList && parent.classList.contains('whatsapp-slide-btn')) {
          isSlideBtn = true;
          break;
        }
        parent = parent.parentElement;
        depth++;
      }
    }
    
    // Build trigger name based on conditions
    if (isSlideBtn) {
      return isMobile ? 'whatsapp_mobile_slide_btn' : 'whatsapp_desktop_slide_btn';
    }
    
    if (inModal) {
      return isMobile ? 'whatsapp_mobile_popup_btn' : 'whatsapp_desktop_popup_btn';
    }
    
    // Regular button (not in modal, not slide)
    return isMobile ? 'whatsapp_mobile_btn' : 'whatsapp_desktop_btn';
  }

  ///////////////////////
  // GLOBAL CLICK LISTENER
  ///////////////////////

  document.addEventListener(
    'click',
    function (e) {
      var target = e.target || e.srcElement;
      
      // Skip slide buttons - they have their own MutationObserver tracking
      var isSlideBtn = target.classList && target.classList.contains('whatsapp-slide-btn');
      if (!isSlideBtn) {
        var parent = target.parentElement;
        var depth = 0;
        while (parent && depth < 3) {
          if (parent.classList && parent.classList.contains('whatsapp-slide-btn')) {
            isSlideBtn = true;
            break;
          }
          parent = parent.parentElement;
          depth++;
        }
      }
      
      if (isSlideBtn) return; // Skip slide buttons in click listener
      
      var waEl = findWAAncestor(target);
      if (waEl) {
        // Double-check: don't track if it's a slide button
        var checkSlide = waEl.classList && waEl.classList.contains('whatsapp-slide-btn');
        if (!checkSlide) {
          var triggerName = getTriggerName(waEl);
          sendTracking(triggerName);
        }
      }
    },
    true
  );

  ///////////////////////
  // SLIDE BUTTON TRACKING (dynamic)
  ///////////////////////

  function initSlideTrackingFor(btn) {
    if (!btn || btn.__watSlideInit) return;
    btn.__watSlideInit = true;

    var parent = btn.parentElement;
    if (!parent || typeof MutationObserver === 'undefined') return;

    // Use button property to prevent race conditions across multiple calls
    if (btn.__watSlideTracked) return;
    
    var hasTracked = false;
    var observer = null;
    var checkTimeout = null;

    function checkAndTrack() {
      // Prevent multiple simultaneous checks - check both flags
      if (hasTracked || btn.__watSlideTracked) {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        return;
      }
      
      try {
        var rect = btn.getBoundingClientRect();
        var parentRect = parent.getBoundingClientRect();
        var moved = rect.left - parentRect.left;

        if (moved > 40) {
          // Set flags synchronously BEFORE any async operations
          hasTracked = true;
          btn.__watSlideTracked = true;
          
          // Disconnect observer immediately to prevent further callbacks
          if (observer) {
            observer.disconnect();
            observer = null;
          }
          
          // Clear any pending timeout
          if (checkTimeout) {
            clearTimeout(checkTimeout);
            checkTimeout = null;
          }
          
          var triggerName = isMobileDevice() ? 'whatsapp_mobile_slide_btn' : 'whatsapp_desktop_slide_btn';
          sendTracking(triggerName);
        }
      } catch (e) {
        // Ignore errors
      }
    }

    // Debounced check function
    function debouncedCheck() {
      if (checkTimeout) {
        clearTimeout(checkTimeout);
      }
      checkTimeout = setTimeout(checkAndTrack, 50);
    }

    observer = new MutationObserver(function () {
      if (hasTracked) {
        if (observer) {
          observer.disconnect();
          observer = null;
        }
        return;
      }
      debouncedCheck();
    });

    observer.observe(btn, {
      attributes: true,
      attributeFilter: ['style', 'class']
    });
  }

  function attachSlideTrackingExisting() {
    var slideBtns = document.querySelectorAll('.whatsapp-slide-btn');
    if (!slideBtns.length) return;
    slideBtns.forEach(initSlideTrackingFor);
  }

  function watchForNewSlideButtons() {
    if (typeof MutationObserver === 'undefined') return;
    var root = document.body || document.documentElement;
    if (!root) return;

    var domObserver = new MutationObserver(function (mutations) {
      mutations.forEach(function (m) {
        m.addedNodes.forEach(function (node) {
          if (!node || node.nodeType !== 1) return;

          if (node.matches && node.matches('.whatsapp-slide-btn')) {
            initSlideTrackingFor(node);
          }

          var inner = node.querySelectorAll ? node.querySelectorAll('.whatsapp-slide-btn') : [];
          if (inner && inner.length) {
            inner.forEach(initSlideTrackingFor);
          }
        });
      });
    });

    domObserver.observe(root, {
      childList: true,
      subtree: true
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () {
      attachSlideTrackingExisting();
      watchForNewSlideButtons();
    });
  } else {
    attachSlideTrackingExisting();
    watchForNewSlideButtons();
  }

  ///////////////////////
  // OPTIONAL PUBLIC API
  ///////////////////////

  window.WAT = window.WAT || {};
  window.WAT.__initialized = true;
  window.WAT.trackClick = function (triggerName) {
    sendTracking(triggerName || 'manual');
  };

})();
