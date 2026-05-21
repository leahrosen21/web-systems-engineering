/* ================================================
   profile.js — My Profile page logic
   Handles view mode rendering and edit mode with
   form save/cancel and dog photo upload.
   ================================================ */

(function () {
  'use strict';

  /* ---- DOM references ---- */
  const viewMode    = document.getElementById('view-mode');
  const editMode    = document.getElementById('edit-mode');
  const btnEdit     = document.getElementById('btn-edit');
  const btnCancel   = document.getElementById('btn-cancel');
  const btnCancel2  = document.getElementById('btn-cancel-2');
  const profileForm = document.getElementById('profile-form');
  const saveSuccess = document.getElementById('save-success');
  const saveError   = document.getElementById('save-error');

  /* Emoji fallback when no photo exists */
  const AVATAR_MAP = { Small: '🐩', Medium: '🐕', Large: '🦮' };

  /* ====================================================
     INIT
  ==================================================== */
  function init() {
    requireLogin();
    renderViewMode();

    btnEdit.addEventListener('click', openEditMode);
    btnCancel.addEventListener('click', closeEditMode);
    btnCancel2.addEventListener('click', closeEditMode);
    profileForm.addEventListener('submit', handleSave);

    /* Photo upload preview */
    document.getElementById('edit-dog-photo')
      .addEventListener('change', handlePhotoUpload);
  }

  /* ====================================================
     VIEW MODE
  ==================================================== */
  function renderViewMode() {
    const user = getCurrentUser();
    if (!user) return;

    const dog   = user.dog          || {};
    const prefs = user.preferences  || {};

    /* Avatar: real photo or emoji fallback */
    const avatarEl = document.getElementById('profile-avatar');
    if (dog.photo) {
      avatarEl.innerHTML =
        '<img src="' + dog.photo + '" alt="' + (dog.name || 'Dog') + '" ' +
        'style="width:100%;height:100%;object-fit:cover;border-radius:50%;" />';
    } else {
      avatarEl.textContent = AVATAR_MAP[dog.size] || '🐕';
    }

    /* Hero text */
    document.getElementById('view-dog-name').textContent   = dog.name || 'Your Dog';
    document.getElementById('view-dog-name-2').textContent = dog.name || 'Your Dog';
    document.getElementById('view-dog-meta').textContent   = buildMeta(dog, user);

    /* Tag pills */
    const tagsContainer = document.getElementById('view-dog-tags');
    tagsContainer.innerHTML = '';
    [dog.energyLevel, dog.personality, dog.playStyle]
      .filter(Boolean)
      .forEach(function (label) {
        const span = document.createElement('span');
        span.className   = 'tag';
        span.textContent = label;
        tagsContainer.appendChild(span);
      });

    /* About text */
    document.getElementById('view-dog-about').textContent = dog.aboutDog || '';

    /* Dog details */
    renderDL('view-dog-details', [
      ['Breed',      dog.breed],
      ['Age',        dog.age        ? dog.age  + ' yrs' : null],
      ['Size',       dog.size],
      ['Gender',     dog.gender],
      ['Energy',     dog.energyLevel],
      ['Play Style', dog.playStyle],
      ['Vaccinated', dog.vaccinated],
      ['Good with',  dog.compatibility],
    ]);

    /* Owner details */
    renderDL('view-owner-details', [
      ['Name',     user.name],
      ['Age',      user.age ? user.age + ' yrs' : null],
      ['Location', user.location],
      ['Phone',    user.phone],
    ]);
    document.getElementById('view-owner-about').textContent = user.aboutOwner || '';

    /* Preferences */
    renderDL('view-pref-details', [
      ['Preferred Size',        prefs.size],
      ['Preferred Personality', prefs.personality],
      ['Looking for',           prefs.interaction],
    ]);
  }

  function buildMeta(dog, user) {
    const parts = [];
    if (dog.age)   parts.push(dog.age + ' yr old');
    if (dog.size)  parts.push(dog.size);
    if (dog.breed) parts.push(dog.breed);
    return [parts.join(' '), user.location || ''].filter(Boolean).join(' · ');
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
     EDIT MODE
  ==================================================== */
  function openEditMode() {
    const user = getCurrentUser();
    if (!user) return;

    const dog = user.dog || {};

    /* Pre-fill dog fields */
    setVal('edit-dog-name',        dog.name);
    setVal('edit-dog-age',         dog.age);
    setVal('edit-dog-breed',       dog.breed);
    setVal('edit-dog-size',        dog.size);
    setVal('edit-dog-energy',      dog.energyLevel);
    setVal('edit-dog-personality', dog.personality);
    setVal('edit-dog-vaccinated',  dog.vaccinated);
    setVal('edit-dog-play',        dog.playStyle);
    setVal('edit-dog-about',       dog.aboutDog);

    /* Pre-fill owner fields */
    setVal('edit-location',    user.location);
    setVal('edit-age',         user.age);
    setVal('edit-about-owner', user.aboutOwner);

    /* Show current photo as preview (if one exists) */
    const preview = document.getElementById('photo-preview');
    if (dog.photo) {
      preview.innerHTML =
        '<img src="' + dog.photo + '" alt="Current photo" ' +
        'style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin-top:6px;" />';
    } else {
      preview.innerHTML = '';
    }

    /* Clear any pending photo from a previous edit session */
    delete profileForm.dataset.pendingPhoto;

    viewMode.hidden = true;
    editMode.hidden = false;
    editMode.scrollIntoView({ behavior: 'smooth', block: 'start' });
    hideBanners();
  }

  function closeEditMode() {
    editMode.hidden = true;
    viewMode.hidden = false;
    delete profileForm.dataset.pendingPhoto;
    hideBanners();
  }

  /* ====================================================
     PHOTO UPLOAD
  ==================================================== */
  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = function (event) {
      const base64 = event.target.result;

      /* Live preview in edit form */
      document.getElementById('photo-preview').innerHTML =
        '<img src="' + base64 + '" alt="Preview" ' +
        'style="width:80px;height:80px;object-fit:cover;border-radius:50%;margin-top:6px;" />';

      /* Stash until Save is clicked */
      profileForm.dataset.pendingPhoto = base64;
    };
    reader.readAsDataURL(file);
  }

  /* ====================================================
     SAVE
  ==================================================== */
  function handleSave(e) {
    e.preventDefault();
    if (!validateForm()) return;

    const user = getCurrentUser() || {};

    /* Use newly uploaded photo, or keep existing, or empty string */
    const photo = profileForm.dataset.pendingPhoto
      || (user.dog && user.dog.photo)
      || '';

    updateCurrentUser({
      location:   getVal('edit-location'),
      age:        getVal('edit-age'),
      aboutOwner: getVal('edit-about-owner'),
      dog: Object.assign({}, user.dog || {}, {
        name:        getVal('edit-dog-name'),
        age:         getVal('edit-dog-age'),
        breed:       getVal('edit-dog-breed'),
        size:        getVal('edit-dog-size'),
        energyLevel: getVal('edit-dog-energy'),
        personality: getVal('edit-dog-personality'),
        vaccinated:  getVal('edit-dog-vaccinated'),
        playStyle:   getVal('edit-dog-play'),
        aboutDog:    getVal('edit-dog-about'),
        photo:       photo,
      }),
    });

    closeEditMode();
    renderViewMode();
    showSuccess();
  }

  /* ====================================================
     VALIDATION
  ==================================================== */
  function validateForm() {
    clearErrors();
    let valid = true;

    const dogName  = getVal('edit-dog-name').trim();
    const dogAge   = getVal('edit-dog-age').trim();
    const location = getVal('edit-location').trim();

    if (!dogName) {
      showFieldError('edit-dog-name', "Dog's name is required.");
      valid = false;
    }
    if (!dogAge || isNaN(dogAge) || +dogAge < 0 || +dogAge > 30) {
      showFieldError('edit-dog-age', 'Please enter a valid age (0–30).');
      valid = false;
    }
    if (!location) {
      showFieldError('edit-location', 'Location is required.');
      valid = false;
    }
    if (!valid) showSaveError('Please fix the errors below before saving.');
    return valid;
  }

  function showFieldError(inputId, message) {
    const input = document.getElementById(inputId);
    if (!input) return;
    input.classList.add('input-error');
    const errSpan = input.parentElement.querySelector('.error-message');
    if (errSpan) errSpan.textContent = message;
  }

  function clearErrors() {
    profileForm.querySelectorAll('.input-error')
      .forEach(function (el) { el.classList.remove('input-error'); });
    profileForm.querySelectorAll('.error-message')
      .forEach(function (el) { el.textContent = ''; });
    hideBanners();
  }

  /* ====================================================
     BANNERS
  ==================================================== */
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

  /* ====================================================
     HELPERS
  ==================================================== */
  function setVal(id, value) {
    const el = document.getElementById(id);
    if (el) el.value = (value != null) ? value : '';
  }
  function getVal(id) {
    const el = document.getElementById(id);
    return el ? el.value : '';
  }

  /* ====================================================
     KICK OFF
  ==================================================== */
  document.addEventListener('DOMContentLoaded', init);

}());
