import { AdminAuth } from './supabase.js';

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const password = document.getElementById('password').value;
    const errorMessage = document.getElementById('errorMessage');
    const submitButton = e.target.querySelector('button[type="submit"]');

    submitButton.disabled = true;
    submitButton.textContent = 'Logging in...';
    errorMessage.style.display = 'none';
    
    try {
        const result = await AdminAuth.login(password);
        
        if (result.success) {
            window.location.href = 'admin-dashboard.html';
        } else {
            errorMessage.textContent = result.error;
            errorMessage.style.display = 'block';
        }
    } catch (error) {
        errorMessage.textContent = 'Login failed. Please try again.';
        errorMessage.style.display = 'block';
    } finally {
        submitButton.disabled = false;
        submitButton.textContent = 'Login';
    }
});
