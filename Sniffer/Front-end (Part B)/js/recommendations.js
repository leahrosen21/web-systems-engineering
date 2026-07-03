/* ================================================
   recommendations.js
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  requireLogin();

  const session = getCurrentUser();
  const userId  = session.user_id;

  const form          = document.getElementById('recommendation-form');
  const titleField    = document.getElementById('rec-title');
  const categoryField = document.getElementById('rec-category');
  const descField     = document.getElementById('rec-description');
  const charCount     = document.getElementById('rec-char-count');
  const list          = document.getElementById('recommendations-list');
  const emptyState    = document.getElementById('no-recommendations');
  const filter         = document.getElementById('category-filter');
  const locationFilter = document.getElementById('location-filter');
  const successMsg     = document.getElementById('rec-success');
  const modal         = document.getElementById('rec-modal');
  const modalBox      = modal.querySelector('.rec-modal-box');
  const openBtn       = document.getElementById('open-rec-form');
  const closeBtn      = document.getElementById('close-rec-form');
  const imageInput       = document.getElementById('rec-image');
  const imagePreview     = document.getElementById('rec-image-preview');
  const locationField    = document.getElementById('rec-location');
  const locationGroup    = document.getElementById('rec-location-group');

  let allRecs = [];
  let editingRecId = null;

  // ---- populate category dropdowns from DB ----
  fetch('/recommendation_categories', { headers: { 'X-User-Id': String(userId) } })
  .then(function (res) { return res.json(); })
  .then(function (cats) {
    categoryField.innerHTML = '<option value="">Select category</option>';
    cats.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      categoryField.appendChild(opt);
    });

    filter.innerHTML = '<option value="all">All</option>';
    cats.forEach(function (cat) {
      var opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      filter.appendChild(opt);
    });
  });

  // ---- populate location dropdowns from DB ----
  fetch('/locations', { headers: { 'X-User-Id': String(userId) } })
  .then(function (res) { return res.json(); })
  .then(function (locs) {
    locationField.innerHTML = '<option value="">Select city</option>';
    locs.forEach(function (loc) {
      var opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.city;
      locationField.appendChild(opt);
    });

    locationFilter.innerHTML = '<option value="all">All</option>';
    locs.forEach(function (loc) {
      var opt = document.createElement('option');
      opt.value = loc.id;
      opt.textContent = loc.city;
      locationFilter.appendChild(opt);
    });
  });

  // ---- load recommendations from backend ----
  function loadRecs() {
    fetch('/recommendations-data', { headers: { 'X-User-Id': String(userId) } })
    .then(function (res) { return res.json(); })
    .then(function (data) {
      allRecs = data;
      renderList();
    })
    .catch(function () {
      list.innerHTML = '<p style="text-align:center;padding:2rem;">Failed to load recommendations.</p>';
    });
  }

  loadRecs();

  // ---- show/hide location field based on category ----
  categoryField.addEventListener('change', function () {
    fetch('/recommendation_categories', { headers: { 'X-User-Id': String(userId) } })
    .then(function (res) { return res.json(); })
    .then(function (cats) {
      var selected = cats.find(function (c) { return String(c.id) === String(categoryField.value); });
      var name = selected ? selected.name.toLowerCase() : '';
      var isProduct = name.includes('product');
      locationGroup.hidden = isProduct;
      if (isProduct) locationField.value = '';
    });
  });

  // ---- filter + render ----

  filter.addEventListener('change', renderList);
  locationFilter.addEventListener('change', renderList);

  function renderList() {
    var selectedCat = filter.value;
    var selectedLoc = locationFilter.value;
    var recs = allRecs;

    if (selectedCat !== 'all') {
      recs = recs.filter(function (r) {
        return String(r.category_id) === String(selectedCat);
      });
    }

    if (selectedLoc !== 'all') {
      recs = recs.filter(function (r) {
        return String(r.location_id) === String(selectedLoc);
      });
    }

    list.innerHTML = '';

    if (recs.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    recs.forEach(function (rec) {
      var card = document.createElement('div');
      card.className = 'recommendation-card';

      var isOwn = rec.user_id === userId;
      var dateStr = rec.created_at ? new Date(rec.created_at).toLocaleDateString() : '';

      card.innerHTML =
        '<div class="recommendation-image">' +
          (rec.photo
            ? '<img src="' + esc(rec.photo) + '" alt="' + esc(rec.title) + '">'
            : defaultImage(rec.category_name)) +
        '</div>' +
        '<div class="recommendation-body">' +
          '<span class="tag">' + esc(rec.category_name || 'Recommendation') + '</span>' +
          '<h3 class="recommendation-title">' + esc(rec.title) + '</h3>' +
          '<p class="recommendation-description">' + esc(rec.description) + '</p>' +
          '<div class="recommendation-meta">' +
            (function () {
              var parts = ['By ' + esc(rec.owner_name || rec.username || 'Anonymous')];
              if (rec.location_city) parts.push('📍 ' + esc(rec.location_city));
              if (dateStr) parts.push(esc(dateStr));
              return parts.join('<span class="rec-meta-dot"> · </span>');
            })() +
          '</div>' +
          (isOwn
            ? '<div style="display:flex;gap:var(--space-sm);margin-top:0.5rem;">' +
                '<button class="btn btn-outline btn-sm edit-rec-btn" data-id="' + rec.id + '" style="flex:1;">Edit</button>' +
                '<button class="btn btn-sm delete-rec-btn" data-id="' + rec.id + '" style="flex:1;background:#b00020;color:#fff;border:none;">Delete</button>' +
              '</div>'
            : '') +
        '</div>';

      if (isOwn) {
        card.querySelector('.edit-rec-btn').addEventListener('click', function () {
          openEditRec(rec);
        });
        card.querySelector('.delete-rec-btn').addEventListener('click', function () {
          if (!confirm('Are you sure you want to delete this recommendation?')) return;
          deleteRec(rec.id, card);
        });
      }

      list.appendChild(card);
    });
  }

  function deleteRec(id, cardEl) {
    fetch('/recommendations-data/' + id, {
      method:  'DELETE',
      headers: { 'X-User-Id': String(userId) }
    })
    .then(function (res) {
      if (!res.ok) { throw new Error(); }
      allRecs = allRecs.filter(function (r) { return r.id !== id; });
      renderList();
    })
    .catch(function () {
      alert('Could not delete. Please try again.');
    });
  }

  // ---- modal open/close ----

  openBtn.addEventListener('click',  function () {
    modal.hidden = false;
    setTimeout(function () { modalBox.scrollTop = 0; }, 0);
  });
  closeBtn.addEventListener('click', function () { closeModal(); });
  modal.addEventListener('click',    function (e) { if (e.target === modal) closeModal(); });

  function closeModal() {
    modal.hidden = true;
    successMsg.hidden = true;
    imagePreview.innerHTML = '';
    if (editingRecId) {
      editingRecId = null;
      form.reset();
      charCount.textContent = '0/250';
      document.getElementById('rec-modal-title').textContent = 'Add Recommendation';
      document.getElementById('rec-submit-btn').textContent  = 'Add Recommendation';
      locationGroup.hidden = true;
    }
  }

  function openEditRec(rec) {
    editingRecId = rec.id;
    titleField.value    = rec.title    || '';
    descField.value     = rec.description || '';
    charCount.textContent = descField.value.length + '/250';
    categoryField.value = rec.category_id ? String(rec.category_id) : '';
    locationField.value = rec.location_id ? String(rec.location_id) : '';
    locationGroup.hidden = !rec.location_id;
    imagePreview.innerHTML = rec.photo
      ? '<img src="' + esc(rec.photo) + '" style="max-width:100%;max-height:150px;margin-top:8px;border-radius:8px;object-fit:cover;" />'
      : '';
    document.getElementById('rec-modal-title').textContent = 'Edit Recommendation';
    document.getElementById('rec-submit-btn').textContent  = 'Save Changes';
    successMsg.hidden = true;
    modal.hidden = false;
    setTimeout(function () { modalBox.scrollTop = 0; }, 0);
  }

  // ---- image preview ----

  imageInput.addEventListener('change', function () {
    var file = imageInput.files[0];
    if (!file) { imagePreview.innerHTML = ''; return; }
    var reader = new FileReader();
    reader.onload = function (e) {
      imagePreview.innerHTML =
        '<img src="' + e.target.result + '" style="max-width:100%;max-height:150px;margin-top:8px;border-radius:8px;object-fit:cover;" />';
    };
    reader.readAsDataURL(file);
  });

  // ---- char count ----

  descField.addEventListener('input', function () {
    charCount.textContent = descField.value.length + '/250';
  });

  // ---- form submit ----

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    var valid = validateForm([
      { field: titleField,    validator: function (v) { return validateRequired(v, 'Title'); } },
      { field: categoryField, validator: function (v) { return validateSelect(v, 'category'); } },
      { field: descField,     validator: function (v) {
          return validateRequired(v, 'Description') || validateMaxLength(v, 250, 'Description');
        }
      }
    ]);
    if (!valid) return;

    var formData = new FormData();
    formData.append('title',       titleField.value.trim());
    formData.append('category_id', categoryField.value);
    formData.append('description', descField.value.trim());
    if (locationField.value) formData.append('location_id', locationField.value);
    if (imageInput.files[0]) formData.append('rec-image', imageInput.files[0]);

    var isEditing = !!editingRecId;
    var url    = isEditing ? '/recommendations-data/' + editingRecId : '/recommendations-data';
    var method = isEditing ? 'PATCH' : 'POST';

    fetch(url, {
      method:  method,
      headers: { 'X-User-Id': String(userId) },
      body:    formData
    })
    .then(function (res) {
      if (!res.ok) { throw new Error(); }
      return res.json();
    })
    .then(function () {
      successMsg.hidden = false;
      successMsg.textContent = isEditing ? 'Recommendation updated!' : 'Recommendation added!';
      loadRecs();
      setTimeout(function () { closeModal(); }, 1000);
    })
    .catch(function () {
      alert((isEditing ? 'Failed to update' : 'Failed to add') + ' recommendation. Please try again.');
    });
  });

  // ---- helpers ----

  function defaultImage(categoryName) {
    if (!categoryName) return '<img src="../images/heart-paw-yellow.png" alt="Sniffer">';
    var lower = categoryName.toLowerCase();
    if (lower.includes('park'))    return '<img src="../images/park.jpg"    alt="Dog park">';
    if (lower.includes('service')) return '<img src="../images/service.jpg" alt="Dog service">';
    if (lower.includes('product')) return '<img src="../images/product.jpg" alt="Dog product">';
    return '<img src="../images/heart-paw-yellow.png" alt="Sniffer">';
  }

  function esc(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;')
      .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

});
