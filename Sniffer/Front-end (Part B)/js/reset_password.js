document.addEventListener('DOMContentLoaded', function () {

  const form         = document.getElementById('reset-form');
  const emailField   = document.getElementById('email');
  const passField    = document.getElementById('password');
  const confirmField = document.getElementById('confirm-password');
  const errorBanner  = document.getElementById('reset-error');
  const toggleBtn    = document.getElementById('toggle-password');

  // show server error if redirected back with ?error=
  const params = new URLSearchParams(window.location.search);
  const err = params.get('error');
  if (err === 'notfound') {
    errorBanner.textContent = 'No account found with that email address.';
    errorBanner.hidden = false;
  } else if (err === 'server' || err === 'missing') {
    errorBanner.textContent = 'Something went wrong. Please try again.';
    errorBanner.hidden = false;
  }

  attachValidator(emailField, validateEmail);
  attachValidator(passField, validatePassword);
  attachValidator(confirmField, function (v) { return validatePasswordMatch(passField.value, v); });

  toggleBtn.addEventListener('click', function () {
    var isHidden = passField.type === 'password';
    passField.type    = isHidden ? 'text' : 'password';
    confirmField.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? 'Hide' : 'Show';
  });

  // only block if validation fails — otherwise form submits naturally to action="/reset-password"
  form.addEventListener('submit', function (e) {
    const valid = validateForm([
      { field: emailField,   validator: validateEmail },
      { field: passField,    validator: validatePassword },
      { field: confirmField, validator: function (v) { return validatePasswordMatch(passField.value, v); } },
    ]);
    if (!valid) {
      e.preventDefault();
      errorBanner.textContent = 'Please fix the errors above.';
      errorBanner.hidden = false;
    }
  });

});
