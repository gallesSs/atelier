const menu = document.querySelector('.menu');
const header = document.querySelector('.header');
const menuBtn = header.querySelector('.burger--wrapper');

function setMenu(isOpen) {
    menu.classList.toggle('is-open', isOpen);
    header.classList.toggle('is-menu-open', isOpen);
    document.documentElement.classList.toggle('menu-open', isOpen);
    menuBtn.setAttribute('aria-expanded', String(isOpen));
    menuBtn.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');

    // Lenis (anim.js) не учитывает overflow: hidden — останавливаем прокрутку вручную
    if (window.lenis) isOpen ? window.lenis.stop() : window.lenis.start();
}

menuBtn.addEventListener('click', () => setMenu(!menu.classList.contains('is-open')));

menu.addEventListener('click', (e) => {
    if (e.target.closest('a')) setMenu(false);
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) {
        setMenu(false);
        menuBtn.focus({ preventScroll: true });
    }
});
