(function () {
  'use strict';

  const viewMode    = document.getElementById('view-mode');
  const editMode    = document.getElementById('edit-mode');
  const btnEdit     = document.getElementById('btn-edit');
  const btnCancel   = document.getElementById('btn-cancel');
  const btnCancel2  = document.getElementById('btn-cancel-2');
  const profileForm = document.getElementById('profile-form');
  const saveSuccess = document.getElementById('save-success');
  const saveError   = document.getElementById('save-error');

  let profileData = null; // holds the last fetched user data

  /* ====================================================
     DROPDOWN POPULATION (same pattern as signup.js)
  ==================================================== */
  function populateSelect(selectId, url, labelField, placeholder, valueField, anyOption) {
    const select = document.getElementById(selectId);
    if (!select) return;
    select.disabled = true;
    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (items) {
        select.innerHTML = '';
        if (anyOption) {
          const any = document.createElement('option');
          any.value = 'Any';
          any.textContent = 'Any';
          select.appendChild(any);
        } else if (placeholder) {
          const ph = document.createElement('option');
          ph.value = ''; ph.disabled = true; ph.selected = true;
          ph.textContent = placeholder;
          select.appendChild(ph);
        }
        items.forEach(function (item) {
          const opt = document.createElement('option');
          opt.value       = item[valueField || labelField];
          opt.textContent = item[labelField];
          select.appendChild(opt);
        });
        select.disabled = false;
      })
      .catch(function () {
        select.innerHTML = '<option value="" disabled selected>Failed to load</option>';
        select.disabled = false;
      });
  }

  /* ====================================================
     INIT
  ==================================================== */
  function init() {
    requireLogin();
    const session = getCurrentUser();
    const userId  = session.user_id;

    // populate all DB-driven dropdowns in the edit form on page load
    // so they are ready when the user opens edit mode
    populateSelect('edit-location',         '/locations',           'city', 'Select city',          'id');
    populateSelect('edit-gender',           '/genders',             'name', 'Select gender',         'id');
    populateSelect('edit-dog-breed',        '/breeds',              'name', 'Select breed',          'id');
    populateSelect('edit-dog-size',         '/sizes',               'name', 'Select size',           'id');
    populateSelect('edit-dog-gender',       '/genders',             'name', 'Select gender',         'id');
    populateSelect('edit-dog-energy',       '/energy_levels',       'name', 'Select energy level',   'id');
    populateSelect('edit-dog-personality',  '/personalities',       'name', 'Select personality',    'id');
    populateSelect('edit-dog-play',         '/play_styles',         'name', 'Select play style',     'id');
    populateSelect('edit-dog-compat',       '/compatibility_types', 'name', 'Select compatibility',  'id');
    populateSelect('edit-pref-size',        '/sizes',               'name', null, 'id', true);
    populateSelect('edit-pref-personality', '/personalities',       'name', null, 'id', true);
    populateSelect('edit-pref-interaction', '/interaction_types',   'name', null, 'id', true);
    populateSelect('edit-pref-location',    '/locations',           'city', null, 'id', true);

    // fetch real data from backend
    fetch('/users/' + userId, { headers: { 'X-User-Id': String(userId) } })
      .then(function (res) { return res.json(); })
      .then(function (data) {
        profileData = data;
        renderViewMode(data);
        updatePauseUI(data.is_active !== 0);
      })
      .catch(function () {
        showSaveError('Failed to load profile. Please refresh the page.');
      });

    btnEdit.addEventListener('click', openEditMode);
    btnCancel.addEventListener('click', closeEditMode);
    btnCancel2.addEventListener('click', closeEditMode);
    profileForm.addEventListener('submit', handleSave);
    document.getElementById('edit-dog-photo').addEventListener('change', handlePhotoPreview);

    const authHeaders = { 'X-User-Id': String(userId) };

    // ---- pause account ----
    document.getElementById('btn-pause-account').addEventListener('click', function () {
      const isPaused = this.textContent.includes('Resume');
      const msg = isPaused
        ? 'Resume your account? You will appear in Discover again.'
        : 'Pause your account? You will be hidden from Discover until you resume.';
      if (!confirm(msg)) return;
      fetch('/users/' + userId + '/pause', { method: 'PATCH', headers: authHeaders })
      .then(function (res) { return res.json(); })
      .then(function (d) {
        updatePauseUI(d.is_active);
      })
      .catch(function () { alert('Could not update account status. Please try again.'); });
    });

    // ---- delete account ----
    document.getElementById('btn-delete-account').addEventListener('click', function () {
      if (!confirm('Are you sure you want to permanently delete your account? This will remove ALL your data including your dog profile, matches, and availability. This cannot be undone.')) return;
      if (!confirm('Last chance — delete everything permanently?')) return;
      fetch('/users/' + userId + '/account', { method: 'DELETE', headers: authHeaders })
      .then(function (res) {
        if (!res.ok) { throw new Error(); }
        logout();
        window.location.href = '/';
      })
      .catch(function () { alert('Could not delete account. Please try again.'); });
    });
  }

  /* ====================================================
     VIEW MODE — displays data from the backend response
  ==================================================== */
  function renderViewMode(data) {
    // Avatar: real photo or emoji
    const avatarEl    = document.getElementById('profile-avatar');
    const lightbox    = document.getElementById('profile-lightbox');
    const lightboxImg = document.getElementById('profile-lightbox-img');

    if (data.photo) {
      avatarEl.innerHTML =
        '<img src="' + data.photo + '" alt="' + (data.dog_name || 'Dog') + '" ' +
        'style="width:100%;height:100%;object-fit:cover;border-radius:50%;cursor:pointer;" />';
      avatarEl.title = 'Click to view photo';
      avatarEl.addEventListener('click', function () {
        lightboxImg.src = data.photo;
        lightbox.style.display = 'flex';
      });
    } else {
      avatarEl.textContent = '🐕';
    }

    lightbox.addEventListener('click', function () { lightbox.style.display = 'none'; });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') lightbox.style.display = 'none';
    });

    document.getElementById('view-dog-name').textContent   = data.dog_name || 'Your Dog';
    document.getElementById('view-dog-name-2').textContent = data.dog_name || 'Your Dog';
    document.getElementById('view-dog-meta').innerHTML      = buildMeta(data);

    // Tag pills
    const tagsEl = document.getElementById('view-dog-tags');
    tagsEl.innerHTML = '';
    [data.energy_name, data.personality_name, data.play_name]
      .filter(Boolean)
      .forEach(function (label) {
        const span = document.createElement('span');
        span.className   = 'tag';
        span.textContent = label;
        tagsEl.appendChild(span);
      });

    document.getElementById('view-dog-about').textContent = data.about_dog || '';

    renderDL('view-dog-details', [
      ['Breed',      data.breed_name],
      ['Age',        data.dog_age   ? data.dog_age + ' yrs'  : null],
      ['Size',       data.size_name],
      ['Gender',     data.dog_gender_name],
      ['Energy',     data.energy_name],
      ['Indoor/Outdoor', data.play_name],
      ['Vaccinated', data.vaccinated === 1 ? 'Yes' : data.vaccinated === 0 ? 'No' : null],
      ['Good with',  data.compat_name],
    ]);

    renderDL('view-owner-details', [
      ['Name',     data.name],
      ['Age',      data.age      ? data.age + ' yrs' : null],
      ['Gender',   data.gender_name],
      ['Location', data.location_city],
      ['Phone',    data.phone],
    ]);
    document.getElementById('view-owner-about').textContent = data.about_owner || '';

    renderDL('view-pref-details', [
      ['Preferred Size',        data.pref_size_name],
      ['Preferred Personality', data.pref_personality_name],
      ['Preferred Activity',           data.interaction_name],
      ['Preferred Location',    data.pref_location_city],
    ]);
  }

  function updatePauseUI(isActive) {
    const btn = document.getElementById('btn-pause-account');
    const msg = document.getElementById('pause-status-msg');
    if (isActive) {
      btn.textContent = '⏸ Pause Account';
      msg.textContent = 'Your account is active and visible to other users.';
    } else {
      btn.textContent = '▶ Resume Account';
      msg.textContent = 'Your account is paused. You are hidden from Discover.';
    }
  }

  function buildMeta(data) {
    const parts = [];
    if (data.dog_age)       parts.push(data.dog_age + ' yr old');
    if (data.size_name)     parts.push(data.size_name);
    if (data.breed_name)    parts.push(data.breed_name);
    if (data.location_city) parts.push(data.location_city);
    return parts.join('<span style="margin: 0 10px; color: var(--color-text); font-weight: 700;">·</span>');
  }

  function renderDL(elementId, pairs) {
    const dl = document.getElementById(elementId);
    if (!dl) return;
    dl.innerHTML = '';
    pairs.forEach(function (pair) {
      if (!pair[1]) return;
      const dt = document.createElement('dt'); dt.textContent = pair[0];
      const dd = document.createElement('dd'); dd.textContent = pair[1];
      dl.appendChild(dt);
      dl.appendChild(dd);
    });
  }

  /* ====================================================
     EDIT MODE — pre-fills form fields from profileData
  ==================================================== */
  function openEditMode() {
    if (!profileData) return;

    // owner fields
    setVal('edit-name',         profileData.name);
    setVal('edit-age',          profileData.age);
    setVal('edit-phone',        profileData.phone);
    setVal('edit-about-owner',  profileData.about_owner);
    setVal('edit-location',     profileData.location_id);
    setVal('edit-gender',       profileData.gender_id);

    // dog fields (use IDs to pre-select the right dropdown option)
    setVal('edit-dog-name',        profileData.dog_name);
    setVal('edit-dog-age',         profileData.dog_age);
    setVal('edit-dog-breed',       profileData.breed_id);
    setVal('edit-dog-size',        profileData.size_id);
    setVal('edit-dog-gender',      profileData.dog_gender_id);
    setVal('edit-dog-energy',      profileData.energy_level_id);
    setVal('edit-dog-personality', profileData.personality_id);
    setVal('edit-dog-play',        profileData.play_style_id);
    setVal('edit-dog-compat',      profileData.compatibility_id);
    setVal('edit-dog-vaccinated',  profileData.vaccinated === 1 ? 'Yes' : 'No');
    setVal('edit-dog-about',       profileData.about_dog);

    // preferences
    setVal('edit-pref-size',        profileData.pref_size_id);
    setVal('edit-pref-personality', profileData.pref_personality_id);
    setVal('edit-pref-interaction', profileData.interaction_type_id);
    setVal('edit-pref-location',    profileData.pref_location_id);

    // current photo preview
    const preview = document.getElementById('photo-preview');
    if (profileData.photo) {
      preview.innerHTML =
        '<div class="profile-avatar" style="width:80px;height:80px;margin-top:6px;font-size:2rem;cursor:pointer;" title="Click to view photo">' +
          '<img src="' + profileData.photo + '" alt="Current photo" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />' +
        '</div>';
      preview.querySelector('.profile-avatar').addEventListener('click', function () {
        const lightbox    = document.getElementById('profile-lightbox');
        const lightboxImg = document.getElementById('profile-lightbox-img');
        lightboxImg.src = profileData.photo;
        lightbox.style.display = 'flex';
      });
    } else {
      preview.innerHTML = '';
    }

    viewMode.hidden = true;
    editMode.hidden = false;
    editMode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    hideBanners();
  }

  function closeEditMode() {
    editMode.hidden = true;
    viewMode.hidden = false;
    hideBanners();
  }

  /* ====================================================
     PHOTO PREVIEW
  ==================================================== */
  function handlePhotoPreview(e) {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = function (event) {
      document.getElementById('photo-preview').innerHTML =
        '<div class="profile-avatar" style="width:80px;height:80px;margin-top:6px;font-size:2rem;">' +
          '<img src="' + event.target.result + '" alt="Preview" style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />' +
        '</div>';
    };
    reader.readAsDataURL(file);
  }

  /* ====================================================
     SAVE — sends three PATCH requests to the backend
  ==================================================== */
  function handleSave(e) {
    e.preventDefault();
    hideBanners();

    const userId = getCurrentUser().user_id;

    // user fields (JSON)
    const userData = {};
    if (getVal('edit-name'))         userData['name']        = getVal('edit-name');
    if (getVal('edit-age'))          userData['age']         = getVal('edit-age');
    if (getVal('edit-phone'))        userData['phone']       = getVal('edit-phone');
    if (getVal('edit-about-owner'))  userData['about-owner'] = getVal('edit-about-owner');
    if (getVal('edit-location'))     userData['location']    = getVal('edit-location');
    if (getVal('edit-gender'))       userData['gender']      = getVal('edit-gender');

    // dog fields (FormData — needed for optional photo file upload)
    const dogData = new FormData();
    if (getVal('edit-dog-name'))         dogData.append('dog-name',        getVal('edit-dog-name'));
    if (getVal('edit-dog-age'))          dogData.append('dog-age',         getVal('edit-dog-age'));
    if (getVal('edit-dog-breed'))        dogData.append('dog-breed',       getVal('edit-dog-breed'));
    if (getVal('edit-dog-size'))         dogData.append('dog-size',        getVal('edit-dog-size'));
    if (getVal('edit-dog-gender'))       dogData.append('dog-gender',      getVal('edit-dog-gender'));
    if (getVal('edit-dog-energy'))       dogData.append('dog-energy',      getVal('edit-dog-energy'));
    if (getVal('edit-dog-personality'))  dogData.append('dog-personality', getVal('edit-dog-personality'));
    if (getVal('edit-dog-play'))         dogData.append('dog-play',        getVal('edit-dog-play'));
    if (getVal('edit-dog-compat'))       dogData.append('dog-compat',      getVal('edit-dog-compat'));
    if (getVal('edit-dog-vaccinated'))   dogData.append('dog-vaccinated',  getVal('edit-dog-vaccinated'));
    if (getVal('edit-dog-about'))        dogData.append('dog-about',       getVal('edit-dog-about'));
    const photoFile = document.getElementById('edit-dog-photo').files[0];
    if (photoFile) dogData.append('dog-photos', photoFile);

    // preferences fields (JSON)
    const prefData = {};
    if (getVal('edit-pref-size'))        prefData['pref-size']        = getVal('edit-pref-size');
    if (getVal('edit-pref-personality')) prefData['pref-personality'] = getVal('edit-pref-personality');
    if (getVal('edit-pref-interaction')) prefData['pref-interaction'] = getVal('edit-pref-interaction');
    if (getVal('edit-pref-location'))    prefData['pref-location']    = getVal('edit-pref-location');

    Promise.all([
      fetch('/users/' + userId, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(userId) },
        body: JSON.stringify(userData)
      }),
      fetch('/users/' + userId + '/dog', {
        method: 'PATCH',
        headers: { 'X-User-Id': String(userId) },
        body: dogData
      }),
      fetch('/users/' + userId + '/preferences', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(userId) },
        body: JSON.stringify(prefData)
      })
    ])
    .then(function (responses) {
      const failed = responses.find(function (r) { return !r.ok; });
      if (failed) {
        return failed.text().then(function (msg) { throw new Error(msg); });
      }
      return fetch('/users/' + userId, {
        headers: { 'X-User-Id': String(userId) }
      }).then(function (r) { return r.json(); });
    })
    .then(function (data) {
      profileData = data;
      closeEditMode();
      renderViewMode(data);
      showSuccess();
    })
    .catch(function (err) {
      showSaveError(err.message || 'Failed to save changes. Please try again.');
    });
  }

  /* ====================================================
     HELPERS
  ==================================================== */
  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el && value != null) el.value = value;
  }

  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  function showSuccess() {
    saveSuccess.hidden = false;
    saveError.hidden   = true;
    setTimeout(function () { saveSuccess.hidden = true; }, 3000);
  }

  function showSaveError(msg) {
    saveError.textContent = msg;
    saveError.hidden      = false;
    saveSuccess.hidden    = true;
  }

  function hideBanners() {
    saveSuccess.hidden = true;
    saveError.hidden   = true;
  }

  document.addEventListener('DOMContentLoaded', init);
}());
