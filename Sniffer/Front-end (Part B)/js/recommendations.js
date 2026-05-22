/* recommendations.js */

document.addEventListener('DOMContentLoaded', function () {
  requireLogin();

  const form = document.getElementById('recommendation-form');
  const titleField = document.getElementById('rec-title');
  const categoryField = document.getElementById('rec-category');
  const descriptionField = document.getElementById('rec-description');
  const imageField = document.getElementById('rec-image');
  const imagePreview = document.getElementById('rec-image-preview');
  const list = document.getElementById('recommendations-list');
  const emptyState = document.getElementById('no-recommendations');
  const filter = document.getElementById('category-filter');
  const successMsg = document.getElementById('rec-success');
  const charCount = document.getElementById('rec-char-count');

  const modal = document.getElementById('rec-modal');
  const openBtn = document.getElementById('open-rec-form');
  const closeBtn = document.getElementById('close-rec-form');

  let selectedImage = '';

  const logoutLink = document.getElementById('nav-logout-link');
  if (logoutLink) {
    logoutLink.addEventListener('click', function (e) {
      e.preventDefault();
      logout();
      window.location.href = 'login.html';
    });
  }

  openBtn.addEventListener('click', function () {
    modal.hidden = false;
  });

  closeBtn.addEventListener('click', function () {
    closeModal();
  });

  modal.addEventListener('click', function (e) {
    if (e.target === modal) {
      closeModal();
    }
  });

  descriptionField.addEventListener('input', function () {
    charCount.textContent = descriptionField.value.length + '/250';
  });

  imageField.addEventListener('change', function () {
    const file = imageField.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = function (event) {
      selectedImage = event.target.result;
      imagePreview.innerHTML =
        '<img src="' + selectedImage + '" alt="Recommendation image preview">';
    };

    reader.readAsDataURL(file);
  });

  filter.addEventListener('change', function () {
    renderRecommendations();
  });

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    const valid = validateForm([
      { field: titleField, validator: function (v) { return validateRequired(v, 'Title'); } },
      { field: categoryField, validator: function (v) { return validateSelect(v, 'category'); } },
      { field: descriptionField, validator: function (v) { return validateRequired(v, 'Description'); } }
    ]);

    if (!valid) return;

    const newRecommendation = {
      title: titleField.value.trim(),
      category: categoryField.value,
      description: descriptionField.value.trim(),
      image: selectedImage
    };

    addRecommendation(newRecommendation);

    form.reset();
    selectedImage = '';
    imagePreview.innerHTML = '';
    charCount.textContent = '0/250';

    successMsg.hidden = false;

    setTimeout(function () {
      successMsg.hidden = true;
      closeModal();
    }, 900);

    renderRecommendations();
  });

  function renderRecommendations() {
    const selectedCategory = filter.value;
    let recommendations = getRecommendations();

    if (selectedCategory !== 'all') {
      recommendations = recommendations.filter(function (rec) {
        return rec.category === selectedCategory;
      });
    }

    list.innerHTML = '';

    if (recommendations.length === 0) {
      emptyState.hidden = false;
      return;
    }

    emptyState.hidden = true;

    recommendations.forEach(function (rec) {
      const card = document.createElement('div');
      card.className = 'recommendation-card';

      card.innerHTML =
        '<div class="recommendation-image">' +
          getImageContent(rec) +
        '</div>' +
        '<div class="recommendation-body">' +
          '<span class="tag">' + getCategoryLabel(rec.category) + '</span>' +
          '<h3 class="recommendation-title">' + escapeHTML(rec.title) + '</h3>' +
          '<p class="recommendation-description">' + escapeHTML(rec.description) + '</p>' +
          '<div class="recommendation-meta">' +
            '<span>By ' + escapeHTML(rec.author || 'Anonymous') + '</span>' +
            '<span>' + escapeHTML(rec.date || '') + '</span>' +
          '</div>' +
        '</div>';

      list.appendChild(card);
    });
  }

  function getImageContent(rec) {
    if (rec.image) {
      return '<img src="' + rec.image + '" alt="' + escapeHTML(rec.title) + '">';
    }

    if (rec.category === 'park') {
      return '<img src="../images/park.jpg" alt="Dog park">';
    }

    if (rec.category === 'service') {
      return '<img src="../images/service.jpg" alt="Dog service">';
    }

    if (rec.category === 'product') {
      return '<img src="../images/product.jpg" alt="Dog product">';
    }

    return '<img src="../images/heart-paw-yellow.png" alt="Sniffer">';
  }

  function getCategoryLabel(category) {
    if (category === 'park') return 'Dog Park';
    if (category === 'service') return 'Service';
    if (category === 'product') return 'Product';
    return 'Recommendation';
  }

  function closeModal() {
    modal.hidden = true;
    successMsg.hidden = true;
  }

  function escapeHTML(str) {
    if (!str) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  renderRecommendations();
});