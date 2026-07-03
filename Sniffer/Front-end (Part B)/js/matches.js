/* ================================================
   matches.js
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  requireLogin();

  const session = getCurrentUser();
  const userId  = session.user_id;

  const list         = document.getElementById('matches-list');
  const noMatch      = document.getElementById('no-matches');
  const modal        = document.getElementById('match-detail-modal');
  const modalContent = document.getElementById('match-detail-content');
  const availModal      = document.getElementById('avail-modal');
  const availModalTitle = document.getElementById('avail-modal-title');
  const availModalSlots = document.getElementById('avail-modal-slots');
  const lightbox        = document.getElementById('img-lightbox');
  const lightboxImg     = document.getElementById('img-lightbox-src');

  lightbox.addEventListener('click', function () { lightbox.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { lightbox.hidden = true; }
  });

  const dogEmojis = ['🐕', '🐩', '🦮', '🐕‍🦺', '🐶'];

  let matches = [];

  // ---- load matches from backend ----
  fetch('/matches/' + userId, { headers: { 'X-User-Id': String(userId) } })
  .then(function (res) { return res.json(); })
  .then(function (data) {
    matches = data;
    render();
  })
  .catch(function () {
    list.innerHTML = '<p style="text-align:center;padding:2rem;">Failed to load matches. Please refresh.</p>';
  });

  // ---- render match cards ----

  function render() {
    list.innerHTML = '';

    if (matches.length === 0) {
      noMatch.hidden = false;
      list.hidden    = true;
      return;
    }

    noMatch.hidden = true;
    list.hidden    = false;

    matches.forEach(function (match) {
      var emoji = dogEmojis[Math.floor(Math.random() * dogEmojis.length)];

      var card = document.createElement('article');
      card.className = 'card match-card';
      card.setAttribute('tabindex', '0');
      card.setAttribute('role', 'button');
      card.setAttribute('aria-label', 'View match: ' + (match.dog_name || 'Dog'));

      card.innerHTML =
        '<div class="match-card-avatar" aria-hidden="true">' +
          (match.photo
            ? '<img src="' + esc(match.photo) + '" alt="' + esc(match.dog_name || 'Dog') + '" style="width:100%;height:100%;object-fit:cover;" />'
            : emoji) +
        '</div>' +
        '<div class="match-card-body">' +
          '<div class="match-card-name">' + esc(match.dog_name || 'Unknown') + '</div>' +
          '<div class="match-card-meta">' +
            esc(match.breed_name || 'Dog') +
            (match.location_city ? ' &bull; ' + esc(match.location_city) : '') +
          '</div>' +
          '<span class="match-badge">Matched</span>' +
          '<button class="btn btn-outline btn-sm avail-btn" data-uid="' + match.user_id + '" data-name="' + esc(match.name || match.username || 'Owner') + '" style="margin-top:var(--space-sm);width:100%;">View Availability</button>' +
        '</div>';

      card.addEventListener('click', function (e) {
        if (e.target.closest('.avail-btn')) return;
        openDetail(match, emoji);
      });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openDetail(match, emoji); }
      });

      card.querySelector('.avail-btn').addEventListener('click', function (e) {
        e.stopPropagation();
        openAvailability(match.user_id, match.name || match.username || 'Owner');
      });

      list.appendChild(card);
    });
  }

  // ---- match detail modal ----

  function openDetail(match, emoji) {
    modalContent.style.display        = 'flex';
    modalContent.style.flexDirection  = 'column';
    modalContent.style.height         = '100%';

    modalContent.innerHTML =
      '<div class="modal-dog-header">' +
        '<div class="modal-avatar" aria-hidden="true">' +
          (match.photo
            ? '<img src="' + esc(match.photo) + '" alt="' + esc(match.dog_name || 'Dog') + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />'
            : emoji) +
        '</div>' +
        '<div class="modal-dog-info">' +
          '<h2 id="match-detail-title">' + esc(match.dog_name || 'Your Match') + '</h2>' +
          '<p style="font-size:1.15rem; color:var(--color-text-muted);">' +
            esc(match.breed_name || 'Dog') +
            (match.dog_age ? ' &bull; ' + esc(match.dog_age) + ' yrs' : '') +
            (match.location_city ? ' &bull; 📍 ' + esc(match.location_city) : '') +
          '</p>' +
          '<div style="display:flex; flex-wrap:wrap; gap:8px; margin-top:12px;">' +
            (match.personality_name ? '<span class="tag" style="font-size:1.05rem; padding:6px 16px;">' + esc(match.personality_name) + '</span>' : '') +
            (match.energy_name      ? '<span class="tag" style="font-size:1.05rem; padding:6px 16px;">' + esc(match.energy_name)      + '</span>' : '') +
            (match.size_name        ? '<span class="tag" style="font-size:1.05rem; padding:6px 16px;">' + esc(match.size_name)        + '</span>' : '') +
            (match.vaccinated == 1 ? '<span class="tag" style="font-size:1.05rem; padding:6px 16px; background:#e6f9ed; color:#2d7a47; border:2px solid #2d7a47;">✔ Vaccinated</span>' : '') +
            (match.vaccinated == 0 && match.vaccinated !== null ? '<span class="tag" style="font-size:1.05rem; padding:6px 16px; background:#fdecea; color:#b00020; border:2px solid #b00020;">✗ Not Vaccinated</span>' : '') +
          '</div>' +
        '</div>' +
      '</div>' +

      '<hr style="border:none; border-top:1.5px solid var(--color-primary-light); margin:var(--space-md) 0;" />' +

      '<div class="modal-section">' +
        '<div class="modal-section-title">Owner</div>' +
        '<div style="display:flex; flex-direction:column; gap:6px;">' +
          '<div style="font-size:1.25rem; font-weight:700; color:var(--color-text);">' + esc(match.name || match.username || 'Owner') + '</div>' +
          (function () {
            var details = [];
            if (match.age)         details.push(match.age + ' years old');
            if (match.gender_name) details.push(match.gender_name);
            return details.length
              ? '<div style="font-size:1.05rem; color:var(--color-text-muted);">' + details.join(' &bull; ') + '</div>'
              : '';
          })() +
          (match.about_owner
            ? '<div style="font-size:1.05rem; color:var(--color-text); margin-top:4px;">' + esc(match.about_owner) + '</div>'
            : '') +
        '</div>' +
      '</div>' +

      '<hr style="border:none; border-top:1.5px solid var(--color-primary-light); margin:var(--space-lg) 0 var(--space-xl);" />' +

      '<div class="modal-section">' +
        '<div class="modal-section-title">Contact</div>' +
        '<div class="modal-contact-box">' +
          '<img src="../images/contact.png" alt="Phone" style="width:40px;height:40px;object-fit:contain;margin-right:var(--space-lg);" aria-hidden="true" />' +
          '<div>' +
            (match.phone
              ? '<div style="font-size:1.2rem; font-weight:700;">' + esc(match.phone) + '</div>'
              : '<div style="color:var(--color-text-muted); font-size:1.05rem;">No phone number added yet.</div>') +
            '<div style="font-size:0.95rem; color:var(--color-text-muted); margin-top:5px;">Reach out and arrange a playdate!</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      '<div style="display:flex; gap:var(--space-sm); margin-top:auto; padding-top:var(--space-md);">' +
        '<button class="btn btn-outline" id="btn-unmatch" style="flex:1; margin:0;">Unmatch</button>' +
        '<button class="btn btn-outline" id="close-detail-modal" style="flex:1; margin:0;">Close</button>' +
      '</div>';

    modal.hidden = false;
    setTimeout(function () { modalContent.scrollTop = 0; }, 0);
    document.getElementById('close-detail-modal').focus();

    var avatar = modalContent.querySelector('.modal-avatar');

    if (match.photo) {
      avatar.addEventListener('click', function () {
        lightboxImg.src = match.photo;
        lightbox.hidden = false;
      });
    }

    avatar.addEventListener('mouseenter', function () {
      var count = 14;
      for (var i = 0; i < count; i++) {
        (function (index) {
          setTimeout(function () {
            var angle  = (index / count) * 2 * Math.PI;
            var startX = 50 + Math.cos(angle) * 50;
            var startY = 50 + Math.sin(angle) * 50;
            var extra  = 70 + Math.random() * 50;
            var tx     = Math.round(Math.cos(angle) * extra) + 'px';
            var ty     = Math.round(Math.sin(angle) * extra) + 'px';

            var img = document.createElement('img');
            img.src = '../images/heart-paw-yellow.png';
            img.className = 'paw-particle';
            img.style.left = startX + '%';
            img.style.top  = startY + '%';
            img.style.setProperty('--tx', tx);
            img.style.setProperty('--ty', ty);
            img.style.filter = index % 2 === 0
              ? 'brightness(1.05) saturate(1.8) drop-shadow(0 0 3px rgba(230, 185, 0, 0.7))'
              : 'hue-rotate(220deg) saturate(5) brightness(0.65)';

            avatar.appendChild(img);
            setTimeout(function () { img.remove(); }, 1500);
          }, index * 40);
        })(i);
      }
    });

    document.getElementById('close-detail-modal').addEventListener('click', function () {
      modal.hidden = true;
    });

    document.getElementById('btn-unmatch').addEventListener('click', function () {
      if (!confirm('Are you sure you want to unmatch with ' + (match.dog_name || 'this dog') + '? This cannot be undone.')) return;
      fetch('/matches/' + match.match_id, {
        method:  'DELETE',
        headers: { 'X-User-Id': String(userId) }
      })
      .then(function (res) {
        if (!res.ok) { throw new Error(); }
        matches = matches.filter(function (m) { return m.match_id !== match.match_id; });
        modal.hidden = true;
        render();
      })
      .catch(function () {
        alert('Could not unmatch. Please try again.');
      });
    });
  }

  modal.addEventListener('click', function (e) { if (e.target === modal) modal.hidden = true; });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { modal.hidden = true; availModal.hidden = true; lightbox.hidden = true; }
  });

  // ---- availability popup ----

  function openAvailability(targetUserId, ownerName) {
    availModalTitle.textContent = ownerName + "'s Availability";
    availModalSlots.innerHTML   = '<p style="color:var(--color-text-muted);">Loading…</p>';
    availModal.hidden = false;

    fetch('/availability-slots/user/' + targetUserId, { headers: { 'X-User-Id': String(userId) } })
    .then(function (res) { if (!res.ok) { throw new Error(); } return res.json(); })
    .then(function (slots) {
      if (slots.length === 0) {
        availModalSlots.innerHTML = '<p style="color:var(--color-text-muted);text-align:center;">No availability added yet.</p>';
        return;
      }
      availModalSlots.innerHTML = slots.map(function (s) {
        var start = s.start_time ? s.start_time.slice(0, 5) : '';
        var end   = s.end_time   ? s.end_time.slice(0, 5)   : '';
        var type  = s.type || 'Any';
        return '<div class="availability-mini-item" style="text-align:center; padding: 14px 20px;">' +
          '<div style="font-size:1.05rem; font-weight:800; color:var(--color-accent); margin-bottom:6px;">' + esc(s.day) + '</div>' +
          '<div style="font-size:1rem; color:var(--color-text); margin-bottom:8px;">' + esc(start) + ' – ' + esc(end) + '</div>' +
          '<span class="tag" style="font-size:0.85rem;">' + esc(type) + '</span>' +
        '</div>';
      }).join('');
    })
    .catch(function () {
      availModalSlots.innerHTML = '<p style="color:var(--color-error);">Could not load availability.</p>';
    });
  }

  document.getElementById('close-avail-modal').addEventListener('click', function () { availModal.hidden = true; });
  availModal.addEventListener('click', function (e) { if (e.target === availModal) availModal.hidden = true; });

  // ---- utility ----

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

});
