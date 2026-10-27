gsap.registerPlugin(ScrollTrigger, SplitText);

// Те же кривые, что в CSS меню: cubic-bezier(0.16, 1, 0.3, 1) ≈ expo.out
const EASE_TEXT = 'expo.out';
const EASE_IMAGE = 'power4.inOut';
const EASE_FADE = 'power3.out';

const CLIP_HIDDEN = 'inset(100% 0% 0% 0%)';
const CLIP_SHOWN = 'inset(0% 0% 0% 0%)';

// Маска строки с запасом под выносные элементы (line-height в заголовках < 1)
function splitLines(target, options = {}) {
    return SplitText.create(target, {
        type: 'lines',
        mask: 'lines',
        ...options,
        onSplit(self) {
            self.masks.forEach((mask) => {
                mask.style.padding = '0.15em 0';
                mask.style.margin = '-0.15em 0';
            });
            return options.onSplit ? options.onSplit(self) : undefined;
        },
    });
}

const mm = gsap.matchMedia();

mm.add('(prefers-reduced-motion: no-preference)', (ctx) => {
    // Плавная прокрутка, синхронизированная с ScrollTrigger
    const lenis = new Lenis({ lerp: 0.09 });
    const raf = (time) => lenis.raf(time * 1000);

    window.lenis = lenis;
    lenis.on('scroll', ScrollTrigger.update);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    document.fonts.ready.then(() => ctx.add(() => {
        // Первый экран
        const isDesktop = window.matchMedia('(min-width: 1280px)').matches;
        const title = splitLines(isDesktop ? '.title--line' : '.title');
        const intro = gsap.timeline({
            onComplete: () => title.revert(),
        });

        intro
            .from('.header .container > *', {
                autoAlpha: 0,
                y: -8,
                duration: 0.9,
                ease: EASE_FADE,
                stagger: 0.06,
                clearProps: 'transform',
            })
            .set('.title', { visibility: 'visible' }, 0)
            .from(title.lines, {
                yPercent: 120,
                duration: 1.3,
                ease: EASE_TEXT,
                stagger: 0.1,
            }, 0.1)
            .fromTo('.hero--img', {
                autoAlpha: 1,
                clipPath: CLIP_HIDDEN,
            }, {
                clipPath: CLIP_SHOWN,
                duration: 1.6,
                ease: EASE_IMAGE,
            }, 0.35)
            .from('.hero--text--container > *', {
                autoAlpha: 0,
                y: 24,
                duration: 1.2,
                ease: EASE_FADE,
                stagger: 0.12,
                clearProps: 'transform',
            }, 0.9);

        document.documentElement.classList.remove('anim');

        // Заголовки секций — построчно из-под маски
        gsap.utils.toArray('.h2, .studio--title').forEach((heading) => {
            splitLines(heading, {
                autoSplit: true,
                onSplit: (self) => gsap.from(self.lines, {
                    yPercent: 120,
                    duration: 1.2,
                    ease: EASE_TEXT,
                    stagger: 0.08,
                    scrollTrigger: {
                        trigger: heading,
                        start: 'top 85%',
                        once: true,
                    },
                }),
            });
        });

        // Картинки — шторка снизу вверх
        gsap.utils.toArray('.selected--card--img, .studio--img').forEach((img) => {
            gsap.fromTo(img, { clipPath: CLIP_HIDDEN }, {
                clipPath: CLIP_SHOWN,
                duration: 1.4,
                ease: EASE_IMAGE,
                scrollTrigger: {
                    trigger: img,
                    start: 'top 90%',
                    once: true,
                },
            });
        });

        // Тексты и кнопки — мягкий подъём
        gsap.utils.toArray(
            '.selected--descr, .selected--link, .selected--card--info, .selected--btn, .studio--text, .studio--btn'
        ).forEach((el) => {
            gsap.from(el, {
                autoAlpha: 0,
                y: 24,
                duration: 1,
                ease: EASE_FADE,
                delay: el.classList.contains('selected--card--info') ? 0.3 : 0,
                clearProps: 'transform',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 92%',
                    once: true,
                },
            });
        });
    }));

    return () => {
        gsap.ticker.remove(raf);
        lenis.destroy();
        window.lenis = null;
    };
});
