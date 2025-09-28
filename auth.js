// auth.js - Handles login/signup UI and AJAX

document.addEventListener('DOMContentLoaded', function() {
  const loginForm = document.getElementById('loginForm');
  const signupForm = document.getElementById('signupForm');
  const switchToSignup = document.getElementById('switchToSignup');
  const switchToLogin = document.getElementById('switchToLogin');
  const authTitle = document.getElementById('authTitle');
  const loginError = document.getElementById('loginError');
  const signupError = document.getElementById('signupError');

  switchToSignup.onclick = function() {
    loginForm.style.display = 'none';
    signupForm.style.display = 'block';
    switchToSignup.style.display = 'none';
    switchToLogin.style.display = 'block';
    authTitle.textContent = 'Sign Up for GreenShift';
    loginError.textContent = '';
    signupError.textContent = '';
  };
  switchToLogin.onclick = function() {
    loginForm.style.display = 'block';
    signupForm.style.display = 'none';
    switchToSignup.style.display = 'block';
    switchToLogin.style.display = 'none';
    authTitle.textContent = 'Login to GreenShift';
    loginError.textContent = '';
    signupError.textContent = '';
  };

  loginForm.onsubmit = function(e) {
    e.preventDefault();
    loginError.textContent = '';
    fetch('auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'login',
        email: loginForm.loginEmail.value,
        password: loginForm.loginPassword.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('greenshift_user', JSON.stringify(data.user));
        window.location.href = 'tool.html';
      } else {
        loginError.textContent = data.error || 'Login failed';
      }
    })
    .catch(() => { loginError.textContent = 'Server error'; });
  };

  signupForm.onsubmit = function(e) {
    e.preventDefault();
    signupError.textContent = '';
    fetch('auth.php', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        action: 'signup',
        name: signupForm.signupName.value,
        email: signupForm.signupEmail.value,
        password: signupForm.signupPassword.value
      })
    })
    .then(res => res.json())
    .then(data => {
      if (data.success) {
        localStorage.setItem('greenshift_user', JSON.stringify(data.user));
        window.location.href = 'tool.html';
      } else {
        signupError.textContent = data.error || 'Signup failed';
      }
    })
    .catch(() => { signupError.textContent = 'Server error'; });
  };
});
