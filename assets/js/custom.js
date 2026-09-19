/* =========================================================
   CONFIG
   ========================================================= */
const LEAD_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbz4clQgvopdjBXp1k2UnU-lmMM0S0jkbOzHKyLTedL3KKxUkgE3k_qklhjUEKjWkUc57A/exec";
const LEAD_TIMEOUT_MS = 15000;

/* =========================================================
   INITIAL URL / UTM CAPTURE
   ========================================================= */
const __initialURL = window.__initialURL || window.location.href;
const __initialSearchString = window.__initialSearchString !== undefined
  ? window.__initialSearchString
  : window.location.search;
window.__initialSearchString = __initialSearchString;

const __initialHashRaw = window.__initialHashRaw !== undefined
  ? window.__initialHashRaw
  : window.location.hash || '';
window.__initialHashRaw = __initialHashRaw;

let __initialHashBase = __initialHashRaw;
const __initialQuerySegments = [];

if (__initialSearchString && __initialSearchString.length > 1) {
  __initialQuerySegments.push(__initialSearchString.substring(1));
}

if (__initialHashRaw.includes('?')) {
  const hashSplitIdx = __initialHashRaw.indexOf('?');
  __initialHashBase = __initialHashRaw.substring(0, hashSplitIdx);
  const hashQuery = __initialHashRaw.substring(hashSplitIdx + 1);
  if (hashQuery) {
    __initialQuerySegments.push(hashQuery);
  }
}

const __initialUTMQueryString = __initialQuerySegments.length
  ? `?${__initialQuerySegments.join('&')}`
  : '';
const __initialUTMParams = new URLSearchParams(__initialQuerySegments.join('&'));

window.__initialURL = __initialURL;
window.__initialUTMQueryString = __initialUTMQueryString;
window.__initialUTMParams = __initialUTMParams;
window.__initialHashBase = __initialHashBase;

/* Last clicked button ka data-id (sheet me form_name ke liye) */
window.__lastFormId = '';

/* =========================================================
   MAIN DOCUMENT READY
   ========================================================= */
$(document).ready(function () {

    $('[data-toggle="tooltip"]').tooltip();

    $("body").removeClass('is-loading');

    // Anchor scroll offset
    $('#navbarNav a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        let target = $($(this).attr('href'));
        let offset = 50;
        if (target.length) {
            $('html, body').animate({ scrollTop: target.offset().top - offset }, 500);
        }
    });

    ////// whatsapp code ////////
    const originalUrlString = window.__initialURL || window.location.href;
    const url = new URL(originalUrlString);

    $(".website_url").val(url.href);

    const getInitialParam = (key) => {
        if (__initialUTMParams && __initialUTMParams.has(key)) {
            const values = __initialUTMParams.getAll(key);
            return values.length ? values[values.length - 1] : __initialUTMParams.get(key);
        }
        return url.searchParams.get(key);
    };

    let utm_source = getInitialParam('utm_source');
    let mainsource = getInitialParam('mainsource');

    if ((!utm_source && !mainsource) && url.hash) {
        const hashContent = url.hash.substring(1);
        let queryString = hashContent.includes('?') ? hashContent.split('?')[1] : hashContent;
        const hashParams = new URLSearchParams(queryString);
        if (!utm_source) utm_source = hashParams.get('utm_source');
        if (!mainsource) mainsource = hashParams.get('mainsource');
    }

    const whatsappConfig = window.whatsappConfig || {};
    const projectName = whatsappConfig.projectName || "Krisala x Hiranandani At North Hinjewadi, Pune";
    const visibilityConfig = whatsappConfig.visibility || {};
    const nonReraVisibility = visibilityConfig.nonRera || {};
    const nriNonReraVisibility = visibilityConfig.nriNonRera || {};
    const contactNumberRaw = (whatsappConfig.contactNumber || '').replace(/\D/g, '');
    const contactTelHref = contactNumberRaw ? `tel:+${contactNumberRaw}` : '';
    const formatDisplayContactNumber = (rawNumber, separator = '-') => {
        if (!rawNumber) return '';
        const clean = rawNumber.replace(/\D/g, '');
        if (clean.length <= 10) {
            return `+${clean}`;
        }
        const localLength = Math.min(10, clean.length);
        const localPart = clean.slice(-localLength);
        const countryPart = clean.slice(0, clean.length - localLength);
        return `+${countryPart}${separator}${localPart}`;
    };
    const contactNumberDisplay = contactNumberRaw ? formatDisplayContactNumber(contactNumberRaw) : '';

    const body = document.body;
    const bodyId = body ? body.getAttribute('id') || '' : '';
    const allowedSiteModes = ['on-rera', 'non-rera', 'nri-rera', 'nri-non-rera'];
    const determineSiteMode = () => {
        if (allowedSiteModes.includes(bodyId)) {
            return bodyId;
        }
        if (!body) {
            return '';
        }
        const dataMode = body.getAttribute('data-site-mode');
        if (allowedSiteModes.includes(dataMode)) {
            return dataMode;
        }
        for (const cls of Array.from(body.classList || [])) {
            if (allowedSiteModes.includes(cls)) {
                return cls;
            }
        }
        return '';
    };
    const siteMode = determineSiteMode();
    const parseBoolAttr = (value) => {
        if (value === undefined || value === null) {
            return false;
        }
        const normalized = String(value).trim().toLowerCase();
        return normalized === '1' || normalized === 'true' || normalized === 'yes';
    };
    const bodyDataset = body ? body.dataset || {} : {};
    const nriUsEmailFlag = parseBoolAttr(bodyDataset.nriUsEmail ?? (body ? body.getAttribute('data-nri-us-email') : null));
    const isNriMode = siteMode === 'nri-rera' || siteMode === 'nri-non-rera';
    const shouldShowEmail = isNriMode && nriUsEmailFlag;
    const shouldRequireEmail = shouldShowEmail;
    window.__siteMode = siteMode;
    window.__isNriMode = isNriMode;
    window.__requireEmail = shouldRequireEmail;
    window.__showEmail = shouldShowEmail;

    ensureEmailFieldsExist();

    const toggleBodyClass = (target, className, shouldAdd) => {
        if (!target) return;
        if (shouldAdd) target.classList.add(className);
        else target.classList.remove(className);
    };

    const scheduleTitleEl = document.querySelector('#contact .section-title');
    if (scheduleTitleEl) {
        scheduleTitleEl.textContent = window.__isNriMode ? 'Schedule a Video Call' : 'Schedule a Site Visit';
    }

    const updateOptionalEmailPlaceholders = () => {
        const optionalEmailSelectors = [
            'form[name="modal-form"] input[name="email"]',
            'form[name="modal-form1"] input[name="email"]',
            'form[name="Pre-Register"] input[name="email"]'
        ];
        const optionalEmailInputs = document.querySelectorAll(optionalEmailSelectors.join(', '));
        optionalEmailInputs.forEach((input) => {
            if (!input) return;
            if (!input.dataset.optionalPlaceholderOriginal) {
                input.dataset.optionalPlaceholderOriginal = input.getAttribute('placeholder') || 'Email (Optional)';
            }
            if (window.__showEmail) {
                input.placeholder = 'Email*';
            } else {
                input.placeholder = input.dataset.optionalPlaceholderOriginal;
            }
        });
    };

    updateOptionalEmailPlaceholders();

    (function applyEmailRequirement() {
        const emailInputs = document.querySelectorAll('form[name="schedule-site"] input[name="email"], form[name="Pre-Register-sidemodal"] input[name="email"], form[name="Pre-Register"] input[name="email"]');
        const shouldShow = !!window.__showEmail;
        const isRequired = !!window.__requireEmail;
        emailInputs.forEach((input) => {
            if (!input.dataset.originalPlaceholder) {
                input.dataset.originalPlaceholder = input.getAttribute('placeholder') || '';
            }
            const wrapper = input.closest('.forms-input-fields') || input.closest('.form-group') || input.parentNode;
            if (!shouldShow) {
                input.required = false;
                input.removeAttribute('aria-required');
                input.classList.remove('is-invalid', 'is-valid');
                input.value = '';
                input.disabled = true;
                if (wrapper) {
                    wrapper.classList.add('d-none');
                    wrapper.style.display = 'none';
                }
                const errorSpan = ensureEmailErrorSpan(input);
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                }
                return;
            }
            if (wrapper) {
                wrapper.classList.remove('d-none');
                wrapper.style.display = '';
            }
            input.disabled = false;
            if (isRequired) {
                input.required = true;
                input.setAttribute('aria-required', 'true');
                if (!input.placeholder || /optional/i.test(input.placeholder)) {
                    input.placeholder = 'Email*';
                }
                const errorSpan = ensureEmailErrorSpan(input);
                if (errorSpan) {
                    errorSpan.textContent = 'Email field is required.';
                }
            } else {
                input.required = false;
                input.removeAttribute('aria-required');
                if (Object.prototype.hasOwnProperty.call(input.dataset, 'originalPlaceholder')) {
                    input.placeholder = input.dataset.originalPlaceholder;
                }
                const errorSpan = ensureEmailErrorSpan(input);
                if (errorSpan) {
                    errorSpan.style.display = 'none';
                }
            }
        });
    })();

    (function applyVisibilityControls() {
        if (!body) return;
        if (siteMode === 'non-rera') {
            toggleBodyClass(body, 'nonrera-show-whatsapp', !!nonReraVisibility.whatsapp);
            toggleBodyClass(body, 'nonrera-show-chatbot', !!nonReraVisibility.chatbot);
            toggleBodyClass(body, 'nonrera-show-contact', !!nonReraVisibility.contact);
        } else if (siteMode === 'nri-non-rera') {
            toggleBodyClass(body, 'nrinonrera-show-whatsapp', !!nriNonReraVisibility.whatsapp);
            toggleBodyClass(body, 'nrinonrera-show-chatbot', !!nriNonReraVisibility.chatbot);
            toggleBodyClass(body, 'nrinonrera-show-contact', !!nriNonReraVisibility.contact);
        }
    })();

    if (contactTelHref) {
        const contactDisplayText = contactNumberDisplay || `+${contactNumberRaw}`;
        requestAnimationFrame(() => {
            $('.desktop-summary .btn.on-rera a[href^="tel:"]').attr('href', contactTelHref).text(` ${contactDisplayText}`);
            $('.footer-enquiryBtn .monCall.on-rera[href^="tel:"]').attr('href', contactTelHref);
            $('.monCall.data-id-btn.on-rera[href^="tel:"]').attr('href', contactTelHref);
        });
    }

    const defaultMessageMap = {
        defaultMsg: `Hey There, I would like to explore further details About ${projectName}. Please Share Details.`,
        google: `Hello, I would like to explore further details about ${projectName}.`,
        ppc: `Hi I'm interested in Learning more About ${projectName}. Please Share Details.`,
        bing: `Hi There, I'm interested in Learning more About ${projectName}. Please Share Details.`,
        bingo: `Hello There, I would like to explore further details About ${projectName}. Please Share Details.`,
        wapp: `Hey, I would like to explore further details About ${projectName}. Please Share Details.`,
        wappint: `Hey, I would like to explore further details About ${projectName}. Please Share Details.`,
        weblead: `Kindly share further details About ${projectName}. I would like to know more about this project.`
    };
    const messageMap = Object.assign({}, defaultMessageMap, whatsappConfig.messageMap || {});
    const phoneNumber = (whatsappConfig.phoneNumber || '919967445524').replace(/\D/g, '');

    const sourceKey = (mainsource || utm_source || "").toLowerCase();
    const sourceValue = (mainsource || utm_source || "").toLowerCase();

    console.log("sourceKey" + sourceKey);
    console.log("sourceValue" + sourceValue);

    let messageKey = "defaultMsg";
    if (sourceValue.includes("web") && sourceValue.includes("lead")) messageKey = "weblead";
    else if (sourceValue.includes("google")) messageKey = "google";
    else if (sourceValue.includes("ppc")) messageKey = "ppc";
    else if (sourceValue.includes("bingo")) messageKey = "bingo";
    else if (sourceValue.includes("bing")) messageKey = "bing";
    else if (sourceValue.includes("wappint")) messageKey = "wappint";
    else if (sourceValue.includes("wapp")) messageKey = "wapp";
    else if (sourceValue.includes("ctw")) messageKey = "ctw";

    const selectedMessage = messageMap[messageKey];
    const whatsappMessage = (selectedMessage && selectedMessage.trim()) ? selectedMessage : messageMap.defaultMsg;
    const whatsappLink = `https://api.whatsapp.com/send?phone=${phoneNumber}&text=${encodeURIComponent(whatsappMessage)}`;

    $('.discovery, .discovery_mobile').attr('href', whatsappLink);

    function ensureModalWhatsappCta(shouldShow) {
        if (!body) return;
        const modalIds = ['enquire-modal', 'autoPopup'];
        modalIds.forEach((modalId) => {
            const modalElement = document.getElementById(modalId);
            if (!modalElement) return;
            const modalBody = modalElement.querySelector('.modal-body');
            if (!modalBody) return;

            let ctaWrapper = modalBody.querySelector('.modal-whatsapp-cta');
            if (!ctaWrapper) {
                ctaWrapper = document.createElement('div');
                ctaWrapper.className = 'modal-whatsapp-cta text-center mt-3';
                modalBody.appendChild(ctaWrapper);
            }

            ctaWrapper.innerHTML = `
             <h6 class="mt-3 text-center">Or</h6>
                <div class="enquireNowBtn deskwhtsap d-none d-sm-none d-md-block mx-auto p-0">
                    <a href="${whatsappLink}" target="_blank" rel="noopener" class="d-inline-flex align-items-center justify-content-center discovery">
                        <img src="assets/images/gif_icon/whatsappAnim.gif" alt="WhatsApp" class="whatsapp-img me-2" loading="lazy">
                        Connect On WhatsApp
                    </a>
                </div>
                <div class="slide-submit d-block d-sm-block d-md-none">
                    <span class="slide-submit-text">Slide to WhatsApp</span>
                    <button type="button" class="discovery_mobile whatsapp-slide-btn">
                        <img src="assets/images/gif_icon/swipe-arrow.png" alt="" class="img-responsive">
                    </button>
                </div>
            `;

            const linkEl = ctaWrapper.querySelector('a.discovery');
            if (linkEl) {
                linkEl.href = whatsappLink;
            }

            ctaWrapper.classList.toggle('d-none', !shouldShow);
        });
    }

    const shouldShowModalWhatsapp =
        (siteMode === 'non-rera' && !!nonReraVisibility.whatsapp) ||
        (siteMode === 'nri-non-rera' && !!nriNonReraVisibility.whatsapp);

    if (siteMode === 'non-rera' || siteMode === 'nri-non-rera') {
        ensureModalWhatsappCta(shouldShowModalWhatsapp);
    }

    (function updateDesktopSummaryFeatures() {
        const enqModal = document.querySelector('.desktop-summary .enqModal');
        if (!enqModal) return;
        const defaultRow = enqModal.querySelector('.default-feature-row');
        const nriRow = enqModal.querySelector('.nri-feature-row');
        if (!defaultRow && !nriRow) return;

        const isNriMode = siteMode === 'nri-rera' || siteMode === 'nri-non-rera';
        if (isNriMode) {
            if (defaultRow) {
                defaultRow.style.display = 'none';
            }
            if (nriRow) {
                nriRow.style.removeProperty('display');
                const nriLabels = [
                    { text: 'Global Support Desk', alt: 'Global Support Desk', iconSrc: 'assets/images/gif_icon/Instant Call Back.gif' },
                    { text: '360° Virtual Tour', alt: '360° Virtual Tour', iconSrc: 'assets/images/gif_icon/360-view.gif' },
                    { text: 'High ROI Deals', alt: 'High ROI Deals', iconSrc: 'assets/images/gif_icon/ROI.gif' }
                ];
                nriRow.querySelectorAll('.col-4').forEach((col, index) => {
                    const config = nriLabels[index];
                    if (!config) return;
                    const labelEl = col.querySelector('p');
                    if (labelEl && labelEl.textContent.trim() !== config.text) {
                        labelEl.textContent = config.text;
                    }
                    const iconEl = col.querySelector('img');
                    if (iconEl) {
                        iconEl.alt = config.alt;
                        if (config.iconSrc) {
                            const currentSrc = iconEl.getAttribute('src') || iconEl.src;
                            const currentIconName = decodeURIComponent(currentSrc.split('/').pop());
                            const newIconName = config.iconSrc.split('/').pop();
                            if (currentIconName !== newIconName) {
                                iconEl.src = config.iconSrc;
                            }
                        }
                    }
                });
            }
        } else {
            if (defaultRow) {
                defaultRow.style.removeProperty('display');
            }
            if (nriRow) {
                nriRow.style.display = 'none';
            }
        }
    })();

    (function updateMobileFormFeatures() {
        const mobileForm = document.querySelector('.mob-form');
        if (!mobileForm) return;
        const nriFeatureIcons = mobileForm.querySelector('.nri-feature-icons-mobile');
        if (!nriFeatureIcons) return;

        const isNriMode = siteMode === 'nri-rera' || siteMode === 'nri-non-rera';
        if (isNriMode) {
            nriFeatureIcons.style.removeProperty('display');
        } else {
            nriFeatureIcons.style.display = 'none';
        }
    })();

    // hide google whatsApp
    if (sourceValue.includes("google")) {
        $('.discovery, .discovery_mobile').remove('');
        $("#main-popup > div:nth-child(4) > div > div.text-center > span").addClass('d-none');
        $("#autoPopup > div > div > div > form > div:nth-child(4) > div > span").addClass('d-none');
        $("#main-popup > div:nth-child(4) > div > div.text-center > div.slide-submit").addClass('d-none');
        $("#autoPopup > div > div > div > form > div:nth-child(4) > div > div.slide-submit").addClass('d-none');
    }

    // Slide-to-WhatsApp
    $(".slide-submit").each(function () {
        const container = $(this);
        const button = container.find("button.whatsapp-slide-btn");
        const slideText = container.find(".slide-submit-text");

        button.draggable({
            cancel: false,
            containment: "parent",
            axis: "x",
            stop: function (event, ui) {
                const buttonPosition = ui.position.left;
                const containerWidth = container.width();
                const buttonWidth = button.width();

                if (buttonPosition > (containerWidth - buttonWidth) * 0.7) {
                    slideText.text("Launching WhatsApp...");
                    button.draggable('disable').css('cursor', 'default');
                    setTimeout(function () {
                        window.location.href = whatsappLink;
                    }, 500);
                } else {
                    button.animate({ left: 0 }, 200);
                    slideText.text("Slide to WhatsApp");
                }
            }
        }).on("click", function () {
            return false;
        });
    });
    ////// whatsapp code end ////////

    // Location tabs: stop anchor jump
    $('#exTab1 > a[href^="#"]').on('click', function (e) {
        e.preventDefault();
        let target = $($(this).attr('href'));
        let offset = 50;
        if (target.length) {
            $('html, body').animate({ scrollTop: target.offset().top - offset }, 500);
        }
    });

    // Button ka data-id yaad rakho (form_name ke liye)
    $(".custom-btn, .data-id-btn").click(function () {
        var myBookId = $(this).data('id');
        if (myBookId) {
            window.__lastFormId = String(myBookId);
        }
        $(".form_name").val(myBookId);
    });

    // Read more / less
    $(".moredisclaimerBtn").click(function () {
        if ($(this).html() === 'Read more <i class="fa fa-chevron-down"></i>') {
            $(this).html('Read less <i class="fa fa-chevron-up"></i>');
        } else {
            $(this).html('Read more <i class="fa fa-chevron-down"></i>');
        }
        $(".moredisclaimerText[data-hit=more" + $(this).data('target') + "]").slideToggle(500);
    });

    $(".moreBtn").click(function () {
        var button = $(this);
        var target = button.data('target');
        var isReadMore = button.html().includes('Read more');
        var newHtml = isReadMore ? 'Read less <i class="fa fa-chevron-up"></i>' : 'Read more <i class="fa fa-chevron-down"></i>';
        button.html(newHtml);
        $(".moreText[data-hit=more" + target + "]").slideToggle(500);
    });

    $(".moreBtn").each(function () {
        const button = $(this);
        const target = button.data('target');
        const relatedText = $(`.moreText[data-hit="more${target}"]`);
        if (!relatedText.length) {
            button.addClass('d-none');
            return;
        }
        if (!relatedText.text().trim().length) {
            relatedText.remove();
            button.addClass('d-none');
        }
    });

    // Modal title update
    $('#enquire-modal').on('show.bs.modal', function (event) {
        var button = $(event.relatedTarget);
        var recipient = button.data('bs-whatever');
        var modal = $(this);
        modal.find('.modal-title').text(recipient);
        modal.find('input[name="recipient"]').val(recipient);
    });

});

/* =========================================================
   HELPERS
   ========================================================= */
function getCountryCodeForInput(mobileInput) {
    if (!mobileInput) return '';

    // intl-tel-input ka selected dial code (sabse reliable)
    const form0 = mobileInput.form || mobileInput.closest('form');
    if (form0) {
        const dialEl = form0.querySelector('.iti__selected-dial-code');
        if (dialEl && dialEl.textContent.trim()) {
            return dialEl.textContent.trim();
        }
    }

    const wrapper = mobileInput.closest('.phone-input-wrapper') || mobileInput.closest('form');
    let code = '';
    if (wrapper) {
        const codeEl = wrapper.querySelector('.country-code');
        if (codeEl) code = (codeEl.textContent || '').trim();
    }

    const form = mobileInput.form || mobileInput.closest('form');
    if (form) {
        let hidden = form.querySelector('input[name="country_code"]');
        if (!hidden) {
            hidden = document.createElement('input');
            hidden.type = 'hidden';
            hidden.name = 'country_code';
            form.appendChild(hidden);
        }
        if (code) hidden.value = code;
        else if (hidden.value) code = hidden.value.trim();
    }

    return code;
}

function combineDialCodeAndMobile(code, mobile) {
    const c = (code || '').replace(/\s+/g, '');
    let m = (mobile || '').replace(/\s+/g, '');

    if (!m) return m;
    if (m.startsWith('+')) return m;
    if (!c) return m;

    const dial = c.startsWith('+') ? c : ('+' + c.replace(/^\+/, ''));
    return dial + m;
}

function ensureEmailErrorSpan(input) {
    if (!input) return null;
    const container =
        input.closest('.forms-input-fields') ||
        input.closest('.form-group') ||
        input.parentNode;
    if (!container) return null;
    let span = container.querySelector('.error.email-error');
    if (!span) {
        span = document.createElement('span');
        span.className = 'error email-error';
        span.style.display = 'none';
        container.appendChild(span);
    }
    return span;
}

function ensureEmailFieldsExist() {
    const configs = [
        {
            formName: 'schedule-site',
            wrapperClass: 'col-lg-12 col-sm-12 forms-input-fields p-0 mb-2 auto-email-field',
            inputClass: 'form-control ms-0 me-0',
            afterClosest: '.forms-input-fields',
            iconClass: 'fa-solid fa-envelope'
        },
        {
            formName: 'Pre-Register-sidemodal',
            wrapperClass: 'form-group mb-3 forms-input-fields auto-email-field',
            inputClass: 'form-control',
            afterClosest: '.form-group'
        }
    ];

    configs.forEach((cfg) => {
        const form = document.forms[cfg.formName];
        if (!form) return;
        if (cfg.formName === 'Pre-Register-sidemodal') {
            form.querySelectorAll('.form-group').forEach(group => {
                if (!group.classList.contains('forms-input-fields')) {
                    group.classList.add('forms-input-fields');
                }
            });
        }
        if (form.querySelector('input[name="email"]')) return;
        const mobileInput = form.querySelector('input[name="mobile"]');
        if (!mobileInput) return;

        const wrapper = document.createElement('div');
        wrapper.className = cfg.wrapperClass || 'forms-input-fields auto-email-field';
        if (cfg.iconClass) {
            const icon = document.createElement('i');
            icon.className = cfg.iconClass;
            wrapper.appendChild(icon);
        }
        const input = document.createElement('input');
        input.type = 'email';
        input.name = 'email';
        input.className = cfg.inputClass || 'form-control';
        input.placeholder = 'Email (Optional)';
        const errorSpan = document.createElement('span');
        errorSpan.className = 'error';
        errorSpan.textContent = 'Email field is required';
        wrapper.appendChild(input);
        wrapper.appendChild(errorSpan);

        const referenceWrapper =
            mobileInput.closest(cfg.afterClosest || '.forms-input-fields') || mobileInput.parentNode;
        if (referenceWrapper && referenceWrapper.parentNode) {
            referenceWrapper.parentNode.insertBefore(wrapper, referenceWrapper.nextSibling);
        } else {
            form.appendChild(wrapper);
        }
    });
}

/* =========================================================
   SEND LEAD DIRECTLY TO GOOGLE APPS SCRIPT
   ========================================================= */
async function sendLeadToSheet(payload) {
    if (navigator.onLine === false) {
        return { ok: false, reason: 'offline' };
    }

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), LEAD_TIMEOUT_MS);

    try {
        // text/plain => "simple request", CORS preflight nahi hota
        const res = await fetch(LEAD_SCRIPT_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'text/plain;charset=utf-8' },
            body: JSON.stringify(payload),
            signal: controller.signal
        });

        const text = await res.text();
        let json = null;
        try { json = JSON.parse(text); } catch (e) { }

        console.log('Apps Script response:', res.status, text.substring(0, 300));

        if (json && json.success === false) {
            return { ok: false, reason: 'script_error', detail: json };
        }
        if (!res.ok) {
            return { ok: false, reason: 'http_' + res.status };
        }
        if (!json && /Script function not found|Error|Sorry, unable to open/i.test(text)) {
            return { ok: false, reason: 'script_html_error' };
        }
        return { ok: true };

    } catch (err) {
        if (err && err.name === 'AbortError') {
            return { ok: false, reason: 'timeout' };
        }
        // Yahan aksar CORS response block hota hai, lekin request Google tak pahunch chuki hoti hai.
        // Duplicate row se bachne ke liye dobara nahi bhejte, "sent (unverified)" maante hain.
        console.warn('Response read nahi hua (CORS?), lead bheji ja chuki maani ja rahi hai:', err);
        return { ok: true, unverified: true };
    } finally {
        clearTimeout(timer);
    }
}

/* =========================================================
   FORM SUBMIT
   ========================================================= */
function submitForm(event, formName) {
    event.preventDefault();
    console.log("--- submitForm called for:", formName, "---");

    // Form element: pehle event se, phir name/id se
    let formElement = (event.target && event.target.tagName === 'FORM') ? event.target : null;
    if (!formElement) formElement = document.forms[formName] || document.getElementById(formName);
    if (!formElement) {
        console.error("CRITICAL: Form element not found for name:", formName);
        return;
    }

    // Double submit guard
    if (formElement.dataset.submitting === '1') {
        console.warn('Already submitting...');
        return;
    }

    var price = $(".price-sub-text").text().trim();

    // --- URL Handling ---
    var currentUrl = window.location.href;
    var questionMarkIndex = currentUrl.indexOf('?');
    var secondQuestionMarkIndex = currentUrl.indexOf('?', questionMarkIndex + 1);
    if (secondQuestionMarkIndex !== -1) {
        currentUrl = currentUrl.substring(0, secondQuestionMarkIndex) + '&' + currentUrl.substring(secondQuestionMarkIndex + 1);
    }
    var hashIndex = currentUrl.indexOf('#');
    if (hashIndex !== -1) {
        var fragment = currentUrl.substring(hashIndex + 1);
        currentUrl = currentUrl.substring(0, hashIndex) + '&' + fragment;
    }

    // --- Clear previous errors ---
    const errorMessages = formElement.querySelectorAll('.error');
    errorMessages.forEach(function (error) { error.style.display = 'none'; });
    const inputs = formElement.querySelectorAll('input, textarea');
    inputs.forEach(input => input.classList.remove('is-invalid', 'is-valid'));

    // --- Validation ---
    let isValid = true;
    const formData = new FormData(formElement);

    const nameInput = formElement.querySelector('[name="name"]');
    const mobileInput = formElement.querySelector('[name="mobile"]');
    const emailInput = formElement.querySelector('[name="email"]');
    const countryCode = getCountryCodeForInput(mobileInput);
    const rawMobile = formData.get('mobile') ? formData.get('mobile').trim() : '';
    const fullMobile = combineDialCodeAndMobile(countryCode, rawMobile);

    const consentCheckbox = formElement.querySelector('.form-check-input[type="checkbox"]');

    const findErrorSpan = (input) =>
        input.closest('.forms-input-fields')?.querySelector('.error') ||
        input.closest('.form-group')?.querySelector('.error') ||
        input.parentNode.querySelector('.error');

    const showError = (input, msg) => {
        isValid = false;
        const span = findErrorSpan(input);
        if (span) {
            span.textContent = msg;
            span.style.display = input.closest('.form-group') ? 'block' : 'inline';
        }
        input.classList.add('is-invalid');
    };

    // Name
    if (nameInput) {
        const nameValue = nameInput.value.trim();
        if (nameValue.length < 2) {
            showError(nameInput, 'Name field is required.');
        } else {
            nameInput.classList.add('is-valid');
        }
    }

    // Mobile
    if (mobileInput) {
        const digits = mobileInput.value.replace(/\D/g, '');
        if (digits.length < 7 || digits.length > 15) {
            showError(mobileInput, 'Enter a valid mobile number.');
        } else {
            mobileInput.classList.add('is-valid');
        }
    }

    // Email (NRI modes ya jab value di ho)
    if (emailInput) {
        const showEmail = !!window.__showEmail;
        const emailValue = emailInput.value.trim();
        const emailErrorSpan = ensureEmailErrorSpan(emailInput);
        if (emailErrorSpan) emailErrorSpan.style.display = 'none';
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const isEmailRequired = showEmail && !!window.__requireEmail;

        if (isEmailRequired && !emailValue) {
            isValid = false;
            if (emailErrorSpan) { emailErrorSpan.textContent = 'Email field is required.'; emailErrorSpan.style.display = 'inline'; }
            emailInput.classList.add('is-invalid');
        } else if (emailValue && !emailPattern.test(emailValue)) {
            isValid = false;
            if (emailErrorSpan) { emailErrorSpan.textContent = 'Enter a valid email address.'; emailErrorSpan.style.display = 'inline'; }
            emailInput.classList.add('is-invalid');
        } else if (emailValue) {
            emailInput.classList.add('is-valid');
        }
    }

    // Consent
    if (consentCheckbox && !consentCheckbox.checked) {
        isValid = false;
        alert('Please accept the Privacy Policy & Terms.');
    }

    if (!isValid) {
        const firstInvalid = formElement.querySelector('.is-invalid');
        if (firstInvalid) firstInvalid.focus();
        console.log("STOPPING SUBMISSION due to validation errors.");
        return;
    }

    // --- form_name decide ---
    // Enquiry modal (kisi bhi button se khulta hai) => us button ka data-id use karo
    let formnameValue = formData.get('form_name');
    const isEnquireModalForm = !!formElement.closest('#enquire-modal');
    if (isEnquireModalForm && window.__lastFormId) {
        formnameValue = window.__lastFormId;
    }

    var form_data = {
        name: formData.get('name') ? formData.get('name').trim() : '',
        email: formData.get('email') ? formData.get('email').trim() : '',
        mobile: fullMobile,
        form_name: formnameValue,
        page_url: currentUrl,
        message: formData.get('message') ? formData.get('message').trim() : '',
        website_url: window.location.origin,
        price: price,
        currentUrl: currentUrl,
        submitted_at: new Date().toISOString()
    };

    console.log("Lead data:", form_data);

    // --- Submit button disable ---
    const submitButton = event.submitter || formElement.querySelector('button[type="submit"]:not([style*="display: none"])') || formElement.querySelector('button[type="submit"]');
    let originalButtonText = '';
    if (submitButton) {
        const span = submitButton.querySelector('span');
        if (span) {
            originalButtonText = span.textContent;
            span.textContent = 'Submitting...';
        } else {
            originalButtonText = submitButton.textContent;
            submitButton.textContent = 'Submitting...';
        }
        submitButton.disabled = true;
    }
    formElement.dataset.submitting = '1';

    const restoreButton = () => {
        formElement.dataset.submitting = '0';
        if (submitButton) {
            const span = submitButton.querySelector('span');
            if (span) span.textContent = originalButtonText;
            else submitButton.textContent = originalButtonText;
            submitButton.disabled = false;
        }
    };

    // --- dataLayer info ---
    const dialCodeDiv = formElement.querySelector('.iti__selected-dial-code');
    const dialCode = dialCodeDiv ? dialCodeDiv.textContent : '';
    const nationalNumber = mobileInput ? mobileInput.value.trim() : '';
    const manuallyCombinedNumberLayer = dialCode + nationalNumber;

    // --- Thank-you URL ---
    const normalizedFormName = (formnameValue === 'request-yt-videot') ? 'request-yt-video' : formnameValue;
    const isVideoForm = normalizedFormName === 'request-yt-video' ||
        normalizedFormName === 'sample-flat' ||
        /^carousel-video-\d+$/i.test(normalizedFormName || '') ||
        normalizedFormName === 'project-video-card-mobile' ||
        normalizedFormName === 'project-video-card-desktop';

    const dest = (normalizedFormName === 'request-brochure-about')
        ? 'thankyou.html?formName=request-brochure-about'
        : (isVideoForm)
            ? 'thankyou.html?formName=request-yt-video'
            : (normalizedFormName === 'brochure-nav-desktop')
                ? 'thankyou.html?formName=brochure-nav-desktop'
                : (normalizedFormName === 'mb-brochure-footer')
                    ? 'thankyou.html?formName=mb-brochure-footer'
                    : 'thankyou.html';

    // --- SEND, phir redirect ---
    sendLeadToSheet(form_data).then((result) => {
        console.log('Lead send result:', result);

        if (!result.ok) {
            restoreButton();
            alert('Something went wrong. Please try again.');
            return;
        }

        // SUCCESS
        try {
            const payload = {
                event: 'conversion_lead',
                submission_id: Date.now() + '-' + Math.random().toString(36).slice(2, 8),
                user_data: {
                    email: form_data.email || '',
                    phone_number: manuallyCombinedNumberLayer || '',
                    first_name: form_data.name || ''
                },
                form_name: formnameValue || '',
                source_url: form_data.currentUrl || ''
            };
            const KEY = 'conversion_lead_queue';
            const q = JSON.parse(localStorage.getItem(KEY) || '[]');
            q.push(payload);
            localStorage.setItem(KEY, JSON.stringify(q));
        } catch (e) {
            console.error('Queue save failed:', e);
        }

        formElement.reset();
        inputs.forEach(i => i.classList.remove('is-invalid', 'is-valid'));

        if (isEnquireModalForm) {
            const modalElement = document.getElementById('enquire-modal');
            if (modalElement) {
                try {
                    const inst = bootstrap.Modal.getInstance(modalElement);
                    if (inst) inst.hide();
                } catch (e) { console.error(e); }
            }
        }

        restoreButton();
        window.location.href = dest;
    });
}

/* =========================================================
   SITE LINK (#section) URL UPDATE
   ========================================================= */
(function () {
    const currentUrl = new URL(window.location.href);
    const preservedUTMQuery = window.__initialUTMQueryString || '';

    document.querySelectorAll('#navbarNav a.nav-link[href^="#"]').forEach(link => {
        link.addEventListener('click', function (e) {
            e.preventDefault();
            const anchor = this.getAttribute("href").split("?")[0];
            const newUrl = `${currentUrl.origin}${currentUrl.pathname}${preservedUTMQuery}${anchor}`;
            history.pushState(null, '', newUrl);
            const target = document.querySelector(anchor);
            if (target) target.scrollIntoView({ behavior: "smooth" });
        });
    });
})();

/* =========================================================
   CHATBOT VISIBILITY
   ========================================================= */
$(document).ready(function () {
    try {
        let mainsource = null;
        const urlParams = new URLSearchParams(window.__initialUTMParams ? window.__initialUTMParams.toString() : '');

        if (urlParams.has('mainsource')) {
            mainsource = urlParams.get('mainsource');
        } else {
            $('.chat-pop-msg').css({ "display": "block" });
            $('.chatbot__button').addClass('chatbot--is-visible');
        }

        if (mainsource) {
            $('.chat-pop-msg').css({ "display": "block" });
            $('.chatbot__button').addClass('chatbot--is-visible');
        }
    } catch (e) {
        console.error("An error occurred in the chatbot visibility script:", e);
    }

    $('.chatbot__button, .chatbot__button1').on('click', function () {
        $('.chatbot').css({ "display": "block" });
    });

    $('.chatbot .chatbot__header .fa-close').on('click', function () {
        $('.chatbot').css({ "display": "none" });
        $('.chatbot__button').addClass('chatbot--is-visible');
        startPopupInterval();
    });

    let popupInterval = null;

    function showPopup() {
        $('.chat-pop-msg').css('display', 'block');
    }
    function startPopupInterval() {
        if (!popupInterval) {
            popupInterval = setInterval(showPopup, 3000);
        }
    }
    function stopPopupInterval() {
        if (popupInterval) {
            clearInterval(popupInterval);
            popupInterval = null;
        }
    }

    $('#chatbox-close').on('click', function () {
        $('.chat-pop-msg').css('display', 'none');
        stopPopupInterval();
    });

    $('.chatbot__button1').on('click', function () {
        $('.chat-pop-msg').css('display', 'none');
        stopPopupInterval();
    });
});

/* =========================================================
   BIND ALL LEAD FORMS
   ========================================================= */
document.addEventListener('DOMContentLoaded', function () {
    document.querySelectorAll('form[action="send_lead.php"]').forEach(function (form) {
        form.setAttribute('novalidate', 'novalidate');   // custom validation use hoga
        form.addEventListener('submit', function (e) {
            e.preventDefault();
            const formName = form.getAttribute('name') || form.id;
            submitForm(e, formName);
        });
    });
});