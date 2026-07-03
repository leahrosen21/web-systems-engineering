/* availability.js */

document.addEventListener('DOMContentLoaded', function () {
  requireLogin();

  const session = getCurrentUser();
  const userId  = session.user_id;

  const form        = document.getElementById('avail-form');
  const dayField    = document.getElementById('avail-day');
  const startField  = document.getElementById('avail-start');
  const endField    = document.getElementById('avail-end');
  const typeField   = document.getElementById('avail-type');
  const list        = document.getElementById('slots-list');
  const noSlots     = document.getElementById('no-slots');
  const saveSuccess = document.getElementById('save-success');
  const saveError   = document.getElementById('save-error');
  const submitBtn   = document.getElementById('avail-submit-btn');
  const cancelBtn   = document.getElementById('avail-cancel-edit');
  const formTitle   = document.getElementById('avail-form-title');

  let editingSlotId = null;

  // ---- populate type dropdown from DB ----
  fetch('/interaction_types', { headers: { 'X-User-Id': String(userId) } })
  .then(function (res) { return res.json(); })
  .then(function (types) {
    typeField.innerHTML = '<option value="">Select type (optional)</option>';
    types.filter(function (t) { return t.name.toLowerCase() !== 'both'; }).forEach(function (t) {
      var opt = document.createElement('option');
      opt.value = t.id;
      opt.textContent = t.name;
      typeField.appendChild(opt);
    });
  });

  // ---- load slots from DB ----
  function loadSlots() {
    fetch('/availability-slots', { headers: { 'X-User-Id': String(userId) } })
    .then(function (res) { return res.json(); })
    .then(function (slots) {
      renderSlots(slots);
    })
    .catch(function () {
      saveError.textContent = 'Failed to load slots. Please refresh.';
      saveError.hidden = false;
    });
  }

  loadSlots();

  // ---- edit mode helpers ----

  function enterEditMode(slot) {
    editingSlotId    = slot.id;
    dayField.value   = slot.day;
    startField.value = slot.start_time ? slot.start_time.slice(0, 5) : '';
    endField.value   = slot.end_time   ? slot.end_time.slice(0, 5)   : '';
    typeField.value  = slot.type_id != null ? String(slot.type_id) : '';
    formTitle.textContent  = 'Edit Time Slot';
    submitBtn.textContent  = 'Update Slot';
    cancelBtn.hidden       = false;
    form.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function exitEditMode() {
    editingSlotId         = null;
    formTitle.textContent = 'Add Time Slot';
    submitBtn.textContent = 'Add Slot';
    cancelBtn.hidden      = true;
    form.reset();
    saveSuccess.hidden = true;
    saveError.hidden   = true;
  }

  cancelBtn.addEventListener('click', exitEditMode);

  // ---- add / edit slot ----
  form.addEventListener('submit', function (e) {
    e.preventDefault();

    saveSuccess.hidden = true;
    saveError.hidden   = true;

    var valid = validateForm([
      { field: dayField,   validator: function (v) { return validateSelect(v, 'day'); } },
      { field: startField, validator: function (v) { return validateRequired(v, 'Start time'); } },
      { field: endField,   validator: function (v) { return validateRequired(v, 'End time'); } }
    ]);

    if (!valid) return;

    if (startField.value >= endField.value) {
      showFieldError(endField, 'End time must be after start time.');
      return;
    }

    var body = JSON.stringify({
      day:        dayField.value,
      start_time: startField.value,
      end_time:   endField.value,
      type_id:    typeField.value || null
    });

    if (editingSlotId) {
      fetch('/availability-slots/' + editingSlotId, {
        method:  'PATCH',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(userId) },
        body:    body
      })
      .then(function (res) { if (!res.ok) { throw new Error(); } return res.json(); })
      .then(function () {
        exitEditMode();
        saveSuccess.textContent = 'Slot updated!';
        saveSuccess.hidden = false;
        loadSlots();
      })
      .catch(function () {
        saveError.textContent = 'Failed to update. Please try again.';
        saveError.hidden = false;
      });
    } else {
      fetch('/availability-slots', {
        method:  'POST',
        headers: { 'Content-Type': 'application/json', 'X-User-Id': String(userId) },
        body:    body
      })
      .then(function (res) { if (!res.ok) { throw new Error(); } return res.json(); })
      .then(function () {
        form.reset();
        saveSuccess.textContent = 'Availability saved!';
        saveSuccess.hidden = false;
        loadSlots();
      })
      .catch(function () {
        saveError.textContent = 'Failed to save. Please try again.';
        saveError.hidden = false;
      });
    }
  });

  // ---- render ----
  function renderSlots(slots) {
    list.innerHTML = '';

    if (slots.length === 0) {
      noSlots.hidden = false;
      return;
    }

    noSlots.hidden = true;

    slots.forEach(function (slot) {
      var item = document.createElement('div');
      item.className = 'slot-card';

      var start = slot.start_time ? slot.start_time.slice(0, 5) : '';
      var end   = slot.end_time   ? slot.end_time.slice(0, 5)   : '';
      var type  = slot.type || 'Any';

      item.innerHTML =
        '<div>' +
          '<strong>' + slot.day + '</strong>' +
          '<p>' + start + ' - ' + end + ' · ' + type + '</p>' +
        '</div>' +
        '<div style="display:flex; gap:var(--space-sm);">' +
          '<button type="button" class="edit-slot-btn btn btn-outline btn-sm" data-id="' + slot.id + '">Edit</button>' +
          '<button type="button" class="remove-slot-btn btn btn-sm" style="background:#b00020;color:#fff;border:none;" data-id="' + slot.id + '">Remove</button>' +
        '</div>';

      item.querySelector('.edit-slot-btn').addEventListener('click', function () {
        enterEditMode(slot);
      });

      item.querySelector('.remove-slot-btn').addEventListener('click', function () {
        if (!confirm('Are you sure you want to remove this time slot?')) return;
        fetch('/availability-slots/' + slot.id, {
          method:  'DELETE',
          headers: { 'X-User-Id': String(userId) }
        })
        .then(function (res) {
          if (!res.ok) { throw new Error(); }
          if (editingSlotId === slot.id) exitEditMode();
          loadSlots();
        })
        .catch(function () {
          saveError.textContent = 'Could not remove slot. Please try again.';
          saveError.hidden = false;
        });
      });

      list.appendChild(item);
    });
  }
});
