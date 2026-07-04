/* ================================================
   login.js — validation only
   Form submits naturally via action="/login".
   Server sets localStorage and redirects on success,
   or redirects with ?error= on failure.
   ================================================ */

document.addEventListener('DOMContentLoaded', function () {

  const form          = document.getElementById('login-form');
  const emailField    = document.getElementById('email');
  const passField     = document.getElementById('password');
  const errorBanner   = document.getElementById('login-error');
  const successBanner = document.getElementById('login-success');
  const toggleBtn     = document.getElementById('toggle-password');

  const params = new URLSearchParams(window.location.search);
  if (params.get('error') === 'credentials') {
    errorBanner.hidden = false;
  }
  if (params.get('success') === 'reset') {
    successBanner.hidden = false;
  }

  function validateEmailOrUsername(v) {
    if (!v || !v.trim()) return 'Please enter your email or username.';
    if (v.includes('@')) return validateEmail(v);
    return null;
  }
  attachValidator(emailField, validateEmailOrUsername);
  attachValidator(passField, function (v) { return validateRequired(v, 'Password'); });

  toggleBtn.addEventListener('click', function () {
    if (passField.type === 'password') {
      passField.type = 'text';
      toggleBtn.textContent = 'Hide';
    } else {
      passField.type = 'password';
      toggleBtn.textContent = 'Show';
    }
  });

  // only block the form if client-side validation fails
  // if valid, the form submits naturally to action="/login"
  form.addEventListener('submit', function (e) {
    const valid = validateForm([
      { field: emailField, validator: validateEmailOrUsername },
      { field: passField,  validator: function (v) { return validateRequired(v, 'Password'); } },
    ]);
    if (!valid) {
      e.preventDefault();
      errorBanner.hidden = false;
    }
  });

});
