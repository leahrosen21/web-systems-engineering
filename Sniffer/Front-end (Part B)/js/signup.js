document.addEventListener('DOMContentLoaded', function () {

  if (getCurrentUser()) {
    window.location.href = 'home.html';
    return;
  }

  // selectId   — the id of the <select> element in the HTML
  // url        — the API endpoint to fetch options from (e.g. "/locations")
  // labelField — the field from the DB response to show the user (e.g. "city", "name")
  // placeholder— the greyed-out first option shown before user picks (e.g. "Select a breed")
  // anyOption  — if true, adds "Any" as the first selectable option (used for preferences)
  // valueField — the field to use as the option's value sent to server (e.g. "id")
  //              if not provided, falls back to labelField (sends the name instead of id)
  function populateSelect(selectId, url, labelField, placeholder, anyOption, valueField) {
    const select = document.getElementById(selectId);
    select.disabled = true;

    fetch(url)
      .then(function (res) { return res.json(); })
      .then(function (items) {
        select.innerHTML = '';

        if (anyOption) {
          const def = document.createElement('option');
          def.value = 'Any';
          def.textContent = 'Any';
          select.appendChild(def);
        } else if (placeholder) {
          const ph = document.createElement('option');
          ph.value = '';
          ph.disabled = true;
          ph.selected = true;
          ph.textContent = placeholder;
          select.appendChild(ph);
        }

        items.forEach(function (item) {
          const opt = document.createElement('option');
          opt.value = item[valueField || labelField]; // sends id if valueField given, else name
          opt.textContent = item[labelField];          // always shows the name to the user
          select.appendChild(opt);
        });

        select.disabled = false;
      })
      .catch(function () {
        select.innerHTML = '<option value="" disabled selected>Failed to load</option>';
        select.disabled = false;
      });
  }

  //                  selectId              url                     labelField  placeholder              anyOption  valueField
  populateSelect("gender",            "/genders",             "name", "Prefer not to say",    false,     "id");
  populateSelect("location",          "/locations",           "city", "Select your city",      false,     "id");
  populateSelect("dog-breed",         "/breeds",              "name", "Select a breed",         false,     "id");
  populateSelect("dog-size",          "/sizes",               "name", "Select size",            false,     "id");
  populateSelect("dog-energy",        "/energy_levels",       "name", "Select energy level",    false,     "id");
  populateSelect("dog-personality",   "/personalities",       "name", "Select personality",     false,     "id");
  populateSelect("dog-play",          "/play_styles",         "name", "Select play style",      false,     "id");
  populateSelect("dog-compat",        "/compatibility_types", "name", "Select compatibility",   false,     "id");
  populateSelect("dog-gender",        "/genders",             "name", "Select gender",          false,     "id");
  populateSelect("pref-size",         "/sizes",               "name", null,                     true,      "id");
  populateSelect("pref-personality",  "/personalities",       "name", null,                     false,     "id");
  populateSelect("pref-interaction",  "/interaction_types",   "name", null,                     false,     "id");
  populateSelect("pref-location",     "/locations",           "city", null,                     false,     "id");

  /* ---- Field references ---- */
  const form          = document.getElementById('signup-form');
  const errorBanner   = document.getElementById('signup-error');
  const successBanner = document.getElementById('signup-success');

  const usernameField = document.getElementById('username');
  const emailField    = document.getElementById('email');
  const passField     = document.getElementById('password');
  const confirmField  = document.getElementById('confirm-password');
  const nameField     = document.getElementById('name');
  const ageField      = document.getElementById('age');
  const locationField = document.getElementById('location');
  const phoneField    = document.getElementById('phone');
  const dogNameField  = document.getElementById('dog-name');
  const dogAgeField   = document.getElementById('dog-age');

  /* ---- Password show/hide ---- */
  const toggleBtn = document.getElementById('toggle-password');
  toggleBtn.addEventListener('click', function () {
    const isHidden = passField.type === 'password';
    passField.type    = isHidden ? 'text' : 'password';
    confirmField.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
  });

  /* ---- Real-time validators ---- */
  attachValidator(usernameField, function (v) { return validateRequired(v, 'Username') || validateEnglishOnly(v); });
  attachValidator(emailField,    function (v) { return validateEmail(v) || validateEnglishOnly(v); });
  attachValidator(passField,     validatePassword);
  attachValidator(confirmField,  function (v) { return validatePasswordMatch(passField.value, v); });
  attachValidator(phoneField,    validatePhone);
  attachValidator(dogNameField,  function (v) { return validateRequired(v, "Dog's name"); });
  attachValidator(nameField, function (v) { return validateRequired(v, 'Full name'); });
  attachValidator(ageField,  function (v) { return validateRequired(v, 'Age') || validateAge(v, false); });
  attachValidator(dogAgeField, function (v) {
    return validateRequired(v, "Dog's age") || validateAge(v, true);
  });
  attachValidator(locationField, function (v) { return validateRequired(v, 'Location'); });

  /* ---- File drag & drop ---- */
  const dropZone    = document.getElementById('drop-zone');
  const fileInput   = document.getElementById('dog-photos');
  const filePreview = document.getElementById('file-preview');

  if (dropZone) {
    dropZone.addEventListener('dragover', function (e) {
      e.preventDefault();
      dropZone.classList.add('drag-over');
    });
    dropZone.addEventListener('dragleave', function () {
      dropZone.classList.remove('drag-over');
    });
    dropZone.addEventListener('drop', function (e) {
      e.preventDefault();
      dropZone.classList.remove('drag-over');
      showFilePreviews(e.dataTransfer.files);
    });
  }

  if (fileInput) {
    fileInput.addEventListener('change', function () {
      showFilePreviews(fileInput.files);
    });
  }

  function showFilePreviews(files) {
    filePreview.innerHTML = '';
    Array.from(files).forEach(function (file) {
      const item = document.createElement('span');
      item.className = 'tag';
      item.textContent = file.name;
      item.style.marginRight = '6px';
      item.style.marginBottom = '4px';
      item.style.display = 'inline-flex';
      filePreview.appendChild(item);
    });
  }

  /* ---- Multi-step logic ---- */
  const steps      = document.querySelectorAll('.form-step');
  const dots       = document.querySelectorAll('.step-dot');
  const btnBack    = document.getElementById('btn-back');
  const btnNext    = document.getElementById('btn-next');
  const btnSubmit  = document.getElementById('signup-submit');
  const btnSkip    = document.getElementById('btn-skip');
  const totalSteps = steps.length;
  let currentStep  = 1;

  function showStep(n) {
    steps.forEach(function (s) { s.hidden = true; });
    dots.forEach(function (d) {
      const sn = parseInt(d.dataset.step);
      d.classList.remove('active', 'done');
      if (sn < n)   d.classList.add('done');
      if (sn === n) d.classList.add('active');
    });
    steps[n - 1].hidden = false;

    btnBack.hidden   = n === 1;
    btnNext.hidden   = n === totalSteps;
    btnSubmit.hidden = n !== totalSteps;

    errorBanner.hidden = true;
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  btnSkip.addEventListener('click', function (e) {
    e.preventDefault();
    form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  });

  function validateStep(n) {
    if (n === 1) {
      return validateForm([
        { field: usernameField, validator: function (v) { return validateRequired(v, 'Username'); } },
        { field: emailField,    validator: validateEmail },
        { field: passField,     validator: validatePassword },
        { field: confirmField,  validator: function (v) { return validatePasswordMatch(passField.value, v); } },
      ]);
    }
    if (n === 2) {
      return validateForm([
        { field: nameField,     validator: function (v) { return validateRequired(v, 'Full name'); } },
        { field: ageField,      validator: function (v) { return validateRequired(v, 'Age') || validateAge(v, false); } },
        { field: locationField, validator: function (v) { return validateRequired(v, 'Location'); } },
        { field: phoneField,    validator: validatePhone },
      ]);
    }
    if (n === 3) {
      return validateForm([
        { field: dogNameField, validator: function (v) { return validateRequired(v, "Dog's name"); } },
        { field: dogAgeField,  validator: function (v) { return validateRequired(v, "Dog's age") || validateAge(v, true); } },
      ]);
    }
    return true; // step 4 has no required fields
  }

  btnNext.addEventListener('click', function () {
    if (!validateStep(currentStep)) {
      errorBanner.textContent = 'Please fix the errors above before continuing.';
      errorBanner.hidden = false;
      return;
    }

    if (currentStep === 1) {
      var email    = emailField.value.trim();
      var username = usernameField.value.trim();
      fetch('/check-availability?email=' + encodeURIComponent(email) + '&username=' + encodeURIComponent(username))
        .then(function (res) { return res.json(); })
        .then(function (data) {
          if (data.usernameTaken) {
            showFieldError(usernameField, 'That username is already taken.');
            errorBanner.textContent = 'Please fix the errors above before continuing.';
            errorBanner.hidden = false;
            return;
          }
          if (data.emailTaken) {
            showFieldError(emailField, 'An account with that email already exists.');
            errorBanner.textContent = 'Please fix the errors above before continuing.';
            errorBanner.hidden = false;
            return;
          }
          currentStep++;
          showStep(currentStep);
        })
        .catch(function () {
          // if the check fails, allow proceeding — server will catch it at submit
          currentStep++;
          showStep(currentStep);
        });
      return;
    }

    currentStep++;
    showStep(currentStep);
  });

  btnBack.addEventListener('click', function () {
    currentStep--;
    showStep(currentStep);
  });

  /* ---- Form submit ---- */
  // only block submission if client-side validation fails
  // if valid, form submits naturally to action="/signup"
  form.addEventListener('submit', function (e) {
    errorBanner.hidden = true;

    const valid = validateForm([
      { field: usernameField, validator: function (v) { return validateRequired(v, 'Username'); } },
      { field: emailField,    validator: validateEmail },
      { field: passField,     validator: validatePassword },
      { field: confirmField,  validator: function (v) { return validatePasswordMatch(passField.value, v); } },
      { field: nameField,     validator: function (v) { return validateRequired(v, 'Full name'); } },
      { field: ageField,      validator: function (v) { return validateRequired(v, 'Age') || validateAge(v, false); } },
      { field: locationField, validator: function (v) { return validateRequired(v, 'Location'); } },
      { field: phoneField,    validator: validatePhone },
      { field: dogNameField,  validator: function (v) { return validateRequired(v, "Dog's name"); } },
      { field: dogAgeField,   validator: function (v) { return validateRequired(v, "Dog's age") || validateAge(v, true); } },
    ]);

    if (!valid) {
      e.preventDefault();
      errorBanner.textContent = 'Please fix the errors above before continuing.';
      errorBanner.hidden = false;
      return;
    }
    // valid — let the form submit naturally
  });

  // showStep must run first because it resets errorBanner.hidden = true
  showStep(1);

  // show server-side error AFTER showStep so it isn't wiped out
  var params = new URLSearchParams(window.location.search);
  var serverError = params.get('error');
  if (serverError === 'email') {
    errorBanner.textContent = 'An account with that email already exists.';
    errorBanner.hidden = false;
  } else if (serverError === 'username') {
    errorBanner.textContent = 'That username is already taken.';
    errorBanner.hidden = false;
  } else if (serverError === 'server') {
    errorBanner.textContent = 'Something went wrong. Please try again.';
    errorBanner.hidden = false;
  }
});
