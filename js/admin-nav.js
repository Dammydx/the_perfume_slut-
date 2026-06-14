export function setupMobileNav() {
    const toggleButton = document.getElementById('mobileNavToggle');
    const mobileMenu = document.getElementById('mobileNavMenu');

    if (toggleButton && mobileMenu) {
        toggleButton.addEventListener('click', () => {
            toggleButton.classList.toggle('active');
            mobileMenu.classList.toggle('active');
            // Prevent body scrolling when menu is open
            document.body.style.overflow = mobileMenu.classList.contains('active') ? 'hidden' : '';
        });
    }
}
