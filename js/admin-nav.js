export function setupMobileNav() {
    const toggleButton = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileNavMenu');

    if (toggleButton && mobileMenu) {
        // Dynamically create the background blur overlay
        const overlay = document.createElement('div');
        overlay.className = 'mobile-nav-overlay';
        document.body.appendChild(overlay);

        // Dynamically create the X close button inside the menu
        const closeBtn = document.createElement('button');
        closeBtn.innerHTML = '&times;';
        closeBtn.className = 'mobile-nav-close-btn';
        mobileMenu.insertBefore(closeBtn, mobileMenu.firstChild);

        // Function to toggle everything
        const toggleMenu = () => {
            toggleButton.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            overlay.classList.toggle('active');
            // Prevent body scrolling when menu is open
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        };

        // Wire up all click events
        toggleButton.addEventListener('click', toggleMenu);
        overlay.addEventListener('click', toggleMenu);
        closeBtn.addEventListener('click', toggleMenu);
    }
}
