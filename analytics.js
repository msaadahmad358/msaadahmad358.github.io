/* analytics.js - Google Analytics 4 + click tracking for the portfolio
 * 1) Put your GA4 Measurement ID below (GA4 > Admin > Data streams > Web).
 * 2) Until you do, nothing is sent to Google. Events are only printed in the
 *    browser console, so you can test safely.
 * 3) Add ?ga_debug=1 to the page address to also see events in the console
 *    once the real ID is set.
 */
(function () {
  'use strict';

  /* ===================== SETTINGS ===================== */
  var GA_ID = 'G-5FWNXDWWX1';   // <- replace with your Measurement ID
  var REQUIRE_CONSENT = false;  // true = show a cookie banner and wait for "Accept"
                                // (turn on if you get EU/UK visitors or add AdSense)
  /* ==================================================== */

  var LIVE = /^G-[A-Z0-9]{6,}$/.test(GA_ID) && GA_ID !== 'G-XXXXXXXXXX';
  var DEBUG = !LIVE || /[?&]ga_debug=1/.test(location.search);
  var CONSENT_KEY = 'cookie_consent';

  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = gtag;

  function getConsent() { try { return localStorage.getItem(CONSENT_KEY); } catch (e) { return null; } }
  function setConsent(v) { try { localStorage.setItem(CONSENT_KEY, v); } catch (e) {} }

  /* ---------- Consent Mode v2 (only when enabled) ---------- */
  if (REQUIRE_CONSENT) {
    var granted = getConsent() === 'granted';
    gtag('consent', 'default', {
      analytics_storage: granted ? 'granted' : 'denied',
      ad_storage: 'denied', ad_user_data: 'denied', ad_personalization: 'denied'
    });
  }

  /* ---------- Load GA4 ---------- */
  if (LIVE) {
    var s = document.createElement('script');
    s.async = true;
    s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
    document.head.appendChild(s);
    gtag('js', new Date());
    gtag('config', GA_ID);
  }

  function track(name, params) {
    params = params || {};
    if (LIVE) gtag('event', name, params);
    if (DEBUG && window.console) console.log('[analytics]', name, params);
  }
  window.track = track;

  /* ---------- Cookie banner (only when enabled) ---------- */
  function showBanner() {
    var bar = document.createElement('div');
    bar.setAttribute('role', 'dialog');
    bar.setAttribute('aria-label', 'Cookie consent');
    bar.style.cssText = 'position:fixed;left:12px;right:12px;bottom:max(12px,env(safe-area-inset-bottom));' +
      'z-index:20;max-width:560px;margin:0 auto;padding:14px 16px;background:#fff;color:#1d232b;' +
      'border:1px solid #b9b6ae;border-radius:2px;font:14px/1.45 system-ui,"Segoe UI",sans-serif;' +
      'display:flex;gap:12px;align-items:center;flex-wrap:wrap;text-align:left';
    var msg = document.createElement('span');
    msg.style.flex = '1 1 240px';
    msg.textContent = 'I use cookies for anonymous visitor statistics to improve this site. Allow?';
    function btn(label, primary, value) {
      var b = document.createElement('button');
      b.type = 'button'; b.textContent = label;
      b.style.cssText = 'font:inherit;font-weight:600;padding:7px 16px;border-radius:2px;cursor:pointer;' +
        'border:1px solid #1f3a5f;' + (primary ? 'background:#1f3a5f;color:#fff' : 'background:transparent;color:#1f3a5f');
      b.addEventListener('click', function () {
        setConsent(value);
        if (value === 'granted') gtag('consent', 'update', { analytics_storage: 'granted' });
        bar.remove();
      });
      return b;
    }
    bar.append(msg, btn('Decline', false, 'denied'), btn('Accept', true, 'granted'));
    document.body.appendChild(bar);
  }
  if (REQUIRE_CONSENT) {
    document.addEventListener('DOMContentLoaded', function () { if (getConsent() === null) showBanner(); });
  }

  /* ---------- Click tracking ---------- */
  var lastType = '';   // remembers which tab the open modal came from

  var slug = function (t) { return (t || 'portfolio').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40); };

  function context(node) {
    var panel = node.closest('.panel');
    var type = panel ? panel.id : (node.closest('.modal') ? lastType : '');
    var name = '';
    if (node.closest('.modal')) {
      var m = document.getElementById('m-title'); name = m ? m.textContent : '';
    } else {
      var info = node.closest('.info, .svc'), h = info && info.querySelector('h3');
      name = h ? h.textContent : '';
    }
    return { name: name.trim(), type: type };
  }

  function handleLink(a) {
    var href = a.getAttribute('href') || '';
    if (/^(blob:|#|javascript:|mailto:|tel:)/i.test(href)) return;
    if (a.parentElement === document.body && !a.className) return;   // hidden links created by the page's own download code
    var url; try { url = new URL(a.href, location.href); } catch (e) { return; }

    var ctx = context(a);
    var where = a.closest('.modal') ? 'modal' : a.closest('.float-wa') ? 'floating' : a.closest('.final-cta') ? 'final_cta' :
                a.closest('.cta') ? 'hero_cta' : a.closest('.svc') ? 'service' : a.closest('.links') ? 'header' : 'card';
    var host = url.hostname.replace(/^www\./, '');
    var p = { link_text: (a.textContent || '').trim().slice(0, 60), location: where };
    if (ctx.name) p.project_name = ctx.name;
    if (ctx.type) p.project_type = ctx.type;

    if (a.hasAttribute('download')) {
      track('download_resource', { resource_name: ctx.name, file_name: a.getAttribute('download'), project_type: ctx.type });
      return;
    }

    var ev = null;
    if (host === 'wa.me' || /(^|\.)whatsapp\.com$/.test(host)) ev = 'click_whatsapp';
    else if (/(^|\.)linkedin\.com$/.test(host)) ev = 'click_linkedin';
    else if (host === 'github.com') ev = 'click_github';
    else if (/(^|\.)fiverr\.com$/.test(host)) ev = 'click_fiverr';
    else if (host === 'play.google.com') {
      ev = 'click_playstore';
      // Lets Play Console show how many installs came from this portfolio
      if (!url.searchParams.has('referrer')) {
        url.searchParams.set('referrer', 'utm_source=portfolio&utm_medium=referral&utm_campaign=' + slug(ctx.name));
        a.href = url.href;
      }
    }
    else if (host === 'apps.apple.com') ev = 'click_appstore';
    else if (url.origin !== location.origin) ev = 'outbound_click';
    else if (url.origin === location.origin && ctx.type === 'resources') ev = 'open_resource';
    if (!ev) return;

    p.link_url = url.href;
    track(ev, p);
  }

  function handleButton(b) {
    var text = (b.textContent || '').trim();
    var ctx = context(b);
    if (b.classList.contains('alt') && /zip/i.test(text)) {
      track('download_resource', { resource_name: ctx.name, file_name: 'zip', project_type: ctx.type });
    } else if (/view pages/i.test(text)) {
      track('view_resource', { resource_name: ctx.name });
    } else if (ctx.type === 'apps' || ctx.type === 'websites') {
      lastType = ctx.type;
      track('view_project', { project_name: ctx.name, project_type: ctx.type, button: text });
    }
  }

  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var tab = t.closest('.tab');
    if (tab) { track('select_tab', { tab_name: tab.getAttribute('data-target') }); return; }
    var a = t.closest('a[href]');
    if (a) { handleLink(a); return; }
    var b = t.closest('.view-btn');
    if (b) handleButton(b);
  }, true);   // capture phase: runs before the page's own handlers
})();