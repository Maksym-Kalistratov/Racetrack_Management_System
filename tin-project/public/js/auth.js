import {validateUser} from '/common/validation.js';
import {loadTemplate, displayError, currentUser, setCurrentUser} from './core.js';
import {renderResults} from './results.js';

export async function checkAuth() {
    try {
        const res = await fetch('/api/auth/me');
        const data = await res.json();
        if (data.authenticated) {
            setCurrentUser(data.user);
        } else {
            setCurrentUser(null);
        }
    } catch (e) {
        console.error("Auth check failed", e);
        setCurrentUser(null);
    }
    updateNavUI();
}

export function updateNavUI() {
    const container = document.getElementById('nav-auth-container');
    container.innerHTML = '';

    if (currentUser) {
        const template = document.getElementById('tmpl-nav-user');
        const clone = template.content.cloneNode(true);

        const userDisplay = clone.getElementById('user-display');
        userDisplay.textContent = `Hello, ${currentUser.username}`;

        const btnLogout = clone.getElementById('btn-logout');
        btnLogout.addEventListener('click', handleLogout);

        container.appendChild(clone);
    } else {
        const template = document.getElementById('tmpl-nav-guest');
        const clone = template.content.cloneNode(true);

        const btnLogin = clone.getElementById('btn-login');
        const btnRegister = clone.getElementById('btn-register');

        btnLogin.addEventListener('click', () => renderAuthForm('login'));
        btnRegister.addEventListener('click', () => renderAuthForm('register'));

        container.appendChild(clone);
    }
}

export async function handleLogout() {
    try {
        await fetch('/api/auth/logout', {method: 'POST'});
        setCurrentUser(null);
        updateNavUI();
        alert('You have logged out.');
        await renderResults();
    } catch (e) {
        console.error(e);
    }
}

export async function renderAuthForm(mode) {
    displayError('');
    loadTemplate('tmpl-auth');

    const title = document.getElementById('auth-title');
    const btn = document.getElementById('btn-auth-submit');
    const form = document.getElementById('form-auth');

    if (mode === 'login') {
        title.textContent = 'Login';
        btn.textContent = 'Sign In';
    } else {
        title.textContent = 'Register New User';
        btn.textContent = 'Create Account';
    }

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (mode === 'login') {
            await handleLoginSubmit();
        } else {
            await handleRegisterSubmit();
        }
    });
}

async function handleLoginSubmit() {
    const username = document.getElementById('input-auth-user').value;
    const password = document.getElementById('input-auth-pass').value;

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();

        if (res.ok) {
            setCurrentUser(data.user);
            updateNavUI();
            document.getElementById('btn-results').click();
        } else {
            displayError(data.error);
        }
    } catch (e) {
        displayError("Login network error");
    }
}

async function handleRegisterSubmit() {
    const username = document.getElementById('input-auth-user').value;
    const password = document.getElementById('input-auth-pass').value;

    const errors = validateUser(username, password);
    if (errors.length > 0) {
        displayError(errors.join('<br>'));
        return;
    }

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({username, password})
        });
        const data = await res.json();

        if (res.ok) {
            alert('Registration successful! Please login.');
            await renderAuthForm('login');
        } else {
            displayError(data.error);
        }
    } catch (e) {
        displayError("Registration network error");
    }
}