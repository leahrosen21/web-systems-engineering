/* availability.js */

document.addEventListener('DOMContentLoaded', function () {
  requireLogin();

  const form = document.getElementById('avail-form');
  const dayField = document.getElementById('avail-day');
  const startField = document.getElementById('avail-start');
  const endField = document.getElementById('avail-end');
  const typeField = document.getElementById('avail-type');
  const list = document.getElementById('slots-list');
  const noSlots = document.getElementById('no-slots');
  const saveSuccess = document.getElementById('save-success');
  const saveError = document.getElementById('save-error');

  let slots = getAvailability();

  const logoutLink = document.getElementById('nav-logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
      window.location.href = 'login.html';
    });
  }

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    saveSuccess.hidden = true;
    saveError.hidden = true;

    const valid = validateForm([
      { field: dayField, validator: function (v) { return validateSelect(v, 'day'); } },
      { field: startField, validator: function (v) { return validateRequired(v, 'Start time'); } },
      { field: endField, validator: function (v) { return validateRequired(v, 'End time'); } }
    ]);

    if (!valid) return;

    if (startField.value >= endField.value) {
      showFieldError(endField, 'End time must be after start time.');
      return;
    }

    const slot = {
      id: Date.now(),
      day: dayField.value,
      start: startField.value,
      end: endField.value,
      type: typeField.value
    };

    slots.push(slot);
    saveAvailability(slots);
    form.reset();
    renderSlots();

    saveSuccess.textContent = 'Availability saved!';
    saveSuccess.hidden = false;
  });

  function renderSlots() {
    list.innerHTML = '';

    if (slots.length === 0) {
      noSlots.hidden = false;
      return;
    }

    noSlots.hidden = true;

    slots.forEach(function (slot) {
      const item = document.createElement('div');
      item.className = 'slot-card';

      item.innerHTML =
        '<div>' +
          '<strong>' + slot.day + '</strong>' +
          '<p>' + slot.start + ' - ' + slot.end + ' · ' + slot.type + '</p>' +
        '</div>' +
        '<button type="button" class="remove-slot-btn" data-id="' + slot.id + '">Remove</button>';

      list.appendChild(item);
    });

    const removeButtons = document.querySelectorAll('.remove-slot-btn');

    removeButtons.forEach(function (btn) {
      btn.addEventListener('click', function () {
        const id = Number(btn.getAttribute('data-id'));
        slots = slots.filter(function (slot) {
          return slot.id !== id;
        });

        saveAvailability(slots);
        renderSlots();
      });
    });
  }

  renderSlots();
});