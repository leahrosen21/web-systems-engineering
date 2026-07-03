/* ================================================
   home.js — Discover / swipe page
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  requireLogin();

  const session  = getCurrentUser();
  const userId   = session.user_id;

  const deck         = document.getElementById('card-deck');
  const noMoreEl     = document.getElementById('no-more-cards');
  const swipeActions = document.getElementById('swipe-actions');
  const btnSniff     = document.getElementById('btn-sniff');
  const btnSkip      = document.getElementById('btn-skip');
  const matchModal   = document.getElementById('match-modal');
  const modalClose   = document.getElementById('modal-close');
  const matchText    = document.getElementById('match-text');
  const matchContact = document.getElementById('match-contact');

  const dogEmojis = ['🐕', '🐩', '🦮', '🐕‍🦺', '🐶'];

  let profiles = [];

  // ---- load profiles from backend ----
  fetch('/profiles', { headers: { 'X-User-Id': String(userId) } })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    profiles = data;
    renderCards();
  })
  .catch(function () {
    deck.innerHTML = '<p style="text-align:center;padding:2rem;">Failed to load profiles. Please refresh.</p>';
  });

  // ---- card rendering ----

  function renderCards() {
    deck.innerHTML = '';

    if (profiles.length === 0) {
      showNoMore();
      return;
    }

    noMoreEl.hidden = true;
    deck.hidden = false;
    swipeActions.style.display = '';

    const visibleCount = Math.min(3, profiles.length);
    for (var i = visibleCount - 1; i >= 0; i--) {
      deck.appendChild(buildCard(profiles[i], i));
    }

    attachSwipeEvents(deck.querySelector('.dog-card.top-card'));
  }

  function buildCard(profile, stackIndex) {
    const card = document.createElement('div');
    card.className = 'dog-card' + (stackIndex === 0 ? ' top-card' : '');
    card.dataset.userId = profile.id;
    card.style.zIndex = 100 - stackIndex;

    if (stackIndex === 1) card.style.transform = 'scale(0.97) translateY(8px)';
    if (stackIndex === 2) card.style.transform = 'scale(0.94) translateY(16px)';

    const emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

    card.innerHTML =
      '<span class="swipe-hint swipe-hint-sniff" aria-hidden="true">SNIFF</span>' +
      '<span class="swipe-hint swipe-hint-skip"  aria-hidden="true">SKIP</span>' +
      '<div class="dog-card-image" role="img" aria-label="' + esc(profile.dog_name || 'Dog') + ' photo">' +
        (profile.photo
          ? '<img src="' + esc(profile.photo) + '" alt="' + esc(profile.dog_name || 'Dog') + '" style="width:100%;height:100%;object-fit:cover;" />'
          : '<span aria-hidden="true">' + emoji + '</span>') +
      '</div>' +
      '<div class="dog-card-body">' +
        '<div class="dog-card-name">' + esc(profile.dog_name || 'Unknown') + '</div>' +
        '<div class="dog-card-meta">' +
          esc(profile.dog_age || '?') + ' yr' + (profile.dog_age === 1 ? '' : 's') +
          (profile.breed_name ? ' &bull; ' + esc(profile.breed_name) : '') +
          (profile.location_city ? ' &bull; ' + esc(profile.location_city) : '') +
        '</div>' +
        (profile.about_dog ? '<p class="dog-card-desc">' + esc(profile.about_dog) + '</p>' : '') +
        '<div class="dog-card-tags">' +
          (profile.size_name    ? '<span class="tag">' + esc(profile.size_name) + '</span>' : '') +
          (profile.energy_name  ? '<span class="tag tag-secondary">' + esc(profile.energy_name) + ' Energy</span>' : '') +
          (profile.personality_name ? '<span class="tag">' + esc(profile.personality_name) + '</span>' : '') +
        '</div>' +
        '<div class="dog-card-owner">' +
          '<span aria-hidden="true">👤</span> ' +
          esc(profile.username || profile.name || 'Owner') +
          (profile.about_owner ? ' &ndash; ' + esc(profile.about_owner.slice(0, 60)) + (profile.about_owner.length > 60 ? '…' : '') : '') +
        '</div>' +
      '</div>';

    return card;
  }

  // ---- button actions ----

  btnSniff.addEventListener('click', function () { handleAction('like'); });
  btnSkip.addEventListener('click',  function () { handleAction('skip'); });

  function handleAction(action) {
    if (profiles.length === 0) return;
    const topCard = deck.querySelector('.dog-card.top-card');
    if (!topCard) return;

    topCard.classList.add(action === 'like' ? 'swiping-right' : 'swiping-left');
    topCard.addEventListener('animationend', function () {
      processAction(action, parseInt(topCard.dataset.userId));
    }, { once: true });
  }

  function processAction(action, targetUserId) {
    const profile = profiles.find(function (p) { return p.id === targetUserId; });

    fetch('/likes', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json', 'X-User-Id': String(userId) },
      body:    JSON.stringify({ liked_id: targetUserId, action: action })
    })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      if (data.match && profile) {
        showMatchModal(profile);
      }
    });

    profiles = profiles.filter(function (p) { return p.id !== targetUserId; });
    renderCards();
  }

  // ---- match modal ----

  function showMatchModal(profile) {
    matchText.textContent = "It's a match with " + (profile.name || profile.username) + '!';
    matchContact.innerHTML =
      '<div class="match-contact-row">' +
        '<div aria-hidden="true"><img src="../images/contact.png" alt="Phone" style="width:30px;height:30px;object-fit:contain;" /></div>' +
        '<span>Check your matches page for their contact info.</span>' +
      '</div>';
    matchModal.hidden = false;
  }

  modalClose.addEventListener('click', function () { matchModal.hidden = true; });
  matchModal.addEventListener('click', function (e) { if (e.target === matchModal) matchModal.hidden = true; });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') matchModal.hidden = true; });

  // ---- drag / swipe ----

  var dragStartX = 0, dragCurrentX = 0, isDragging = false;
  var SWIPE_THRESHOLD = 80;

  function attachSwipeEvents(card) {
    if (!card) return;
    card.addEventListener('mousedown', onDragStart);
    document.addEventListener('mousemove', onDragMove);
    document.addEventListener('mouseup', onDragEnd);
    card.addEventListener('touchstart', onDragStart, { passive: true });
    document.addEventListener('touchmove', onDragMove, { passive: true });
    document.addEventListener('touchend', onDragEnd);
  }

  function getClientX(e) { return e.touches ? e.touches[0].clientX : e.clientX; }

  function onDragStart(e) { isDragging = true; dragStartX = dragCurrentX = getClientX(e); }

  function onDragMove(e) {
    if (!isDragging) return;
    dragCurrentX = getClientX(e);
    var card = deck.querySelector('.dog-card.top-card');
    if (!card) return;
    var delta = dragCurrentX - dragStartX;
    card.style.transform = 'translateX(' + delta + 'px) rotate(' + (delta * 0.08) + 'deg)';
    card.style.transition = 'none';
    var ratio = Math.min(Math.abs(delta) / SWIPE_THRESHOLD, 1);
    var sniffHint = card.querySelector('.swipe-hint-sniff');
    var skipHint  = card.querySelector('.swipe-hint-skip');
    if (sniffHint && skipHint) {
      sniffHint.style.opacity = delta > 0 ? ratio : 0;
      skipHint.style.opacity  = delta < 0 ? ratio : 0;
    }
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;
    var card = deck.querySelector('.dog-card.top-card');
    if (!card) return;
    var delta = dragCurrentX - dragStartX;
    card.style.transition = '';
    if      (delta >  SWIPE_THRESHOLD) { handleAction('like'); }
    else if (delta < -SWIPE_THRESHOLD) { handleAction('skip'); }
    else {
      card.style.transform = '';
      var sniffHint = card.querySelector('.swipe-hint-sniff');
      var skipHint  = card.querySelector('.swipe-hint-skip');
      if (sniffHint) sniffHint.style.opacity = 0;
      if (skipHint)  skipHint.style.opacity  = 0;
    }
  }

  // ---- no more cards ----

  function showNoMore() {
    deck.hidden = true;
    noMoreEl.hidden = false;
    swipeActions.style.display = 'none';
  }

  // ---- utility ----

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

});
