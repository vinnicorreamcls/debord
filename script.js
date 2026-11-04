const nameNode = document.querySelector('#featuredName');
const infoNode = document.querySelector('#featuredInfo');
const cards = [...document.querySelectorAll('.cocktail-card')];
const menu = document.querySelector('.nav-links');
const toggle = document.querySelector('.menu-toggle');
const hero = document.querySelector('.hero');
let activeIndex = 0;

function selectDrink(index) {
  activeIndex = (index + cards.length) % cards.length;
  const card = cards[activeIndex];
  cards.forEach((item, i) => item.classList.toggle('selected', i === activeIndex));
  if (nameNode) nameNode.textContent = card.dataset.drink;
  if (infoNode) infoNode.textContent = card.dataset.flavor;
}

cards.forEach((card, index) => card.addEventListener('click', () => selectDrink(index)));
const nextDrink = document.querySelector('#nextDrink');
if (nextDrink) nextDrink.addEventListener('click', () => selectDrink(activeIndex + 1));

hero.addEventListener('pointermove', event => {
  if (event.pointerType === 'touch' || reducedMotion) return;
  const bounds = hero.getBoundingClientRect();
  hero.style.setProperty('--light-x', `${event.clientX - bounds.left}px`);
  hero.style.setProperty('--light-y', `${event.clientY - bounds.top}px`);
});

cards.forEach(card => {
  card.addEventListener('pointermove', event => {
    if (event.pointerType === 'touch' || reducedMotion) return;
    const bounds = card.getBoundingClientRect();
    const rx = ((event.clientY - bounds.top) / bounds.height - .5) * -7;
    const ry = ((event.clientX - bounds.left) / bounds.width - .5) * 8;
    card.style.setProperty('--card-rx', `${rx}deg`);
    card.style.setProperty('--card-ry', `${ry}deg`);
  });
  card.addEventListener('pointerleave', () => {
    card.style.removeProperty('--card-rx');
    card.style.removeProperty('--card-ry');
  });
});

toggle.addEventListener('click', () => {
  const open = menu.classList.toggle('open');
  toggle.setAttribute('aria-expanded', String(open));
  toggle.setAttribute('aria-label', open ? 'Fechar menu' : 'Abrir menu');
});
menu.querySelectorAll('a').forEach(link => link.addEventListener('click', () => {
  menu.classList.remove('open');
  toggle.setAttribute('aria-expanded', 'false');
}));

const canvas = document.querySelector('.embers');
const ctx = canvas.getContext('2d');
let particles = [];
let width = 0;
let height = 0;
const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
  width = window.innerWidth;
  height = window.innerHeight;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  particles = Array.from({ length: Math.min(42, Math.floor(width / 28)) }, () => ({
    x: Math.random() * width,
    y: Math.random() * height,
    r: Math.random() * 1.5 + .35,
    speed: Math.random() * .22 + .06,
    alpha: Math.random() * .35 + .08
  }));
}
function drawEmbers() {
  ctx.clearRect(0, 0, width, height);
  for (const p of particles) {
    p.y -= p.speed;
    p.x += Math.sin(p.y * .012) * .12;
    if (p.y < -4) { p.y = height + 4; p.x = Math.random() * width; }
    ctx.beginPath();
    ctx.fillStyle = `rgba(255, ${Math.round(110 + p.alpha * 90)}, 185, ${p.alpha})`;
    ctx.shadowColor = 'rgba(255, 105, 190, .48)';
    ctx.shadowBlur = p.r * 5;
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.shadowBlur = 0;
  if (!reducedMotion) requestAnimationFrame(drawEmbers);
}
resizeCanvas();
if (!reducedMotion) drawEmbers();
window.addEventListener('resize', resizeCanvas, { passive: true });

let scrollTicking = false;
function updateScrollProgress() {
  if (scrollTicking) return;
  scrollTicking = true;
  requestAnimationFrame(() => {
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const progress = maxScroll > 0 ? window.scrollY / maxScroll : 0;
    document.documentElement.style.setProperty('--scroll-progress', progress.toFixed(4));
    scrollTicking = false;
  });
}
window.addEventListener('scroll', updateScrollProgress, { passive: true });
updateScrollProgress();

const flavorTimeline = document.querySelector('.flavor-timeline');
const flavorSteps = [...document.querySelectorAll('.flavor-step')];
function updateFlavorTimeline() {
  if (!flavorTimeline || !flavorSteps.length) return;
  const anchor = window.innerHeight * .5;
  const firstMarker = flavorSteps[0].getBoundingClientRect().top + 32;
  const lastMarker = flavorSteps[flavorSteps.length - 1].getBoundingClientRect().top + 32;
  const distance = Math.max(1, lastMarker - firstMarker);
  const progress = Math.min(1, Math.max(0, (anchor - firstMarker) / distance));
  flavorTimeline.style.setProperty('--timeline-progress', progress.toFixed(4));
  let activeIndex = -1;
  flavorSteps.forEach((step, index) => {
    const markerCenter = step.getBoundingClientRect().top + 32;
    if (markerCenter <= anchor) activeIndex = index;
    step.classList.toggle('active', index === activeIndex);
    step.classList.toggle('passed', index < activeIndex);
  });
}
window.addEventListener('scroll', updateFlavorTimeline, { passive: true });
window.addEventListener('resize', updateFlavorTimeline, { passive: true });
updateFlavorTimeline();

document.querySelectorAll('[data-carousel]').forEach(carousel => {
  const cards = [...carousel.querySelectorAll('.floral-card')];
  const status = carousel.querySelector('[data-carousel-status]');
  let currentIndex = 0;
  const render = () => {
    cards.forEach((card, index) => {
      const active = index === currentIndex;
      const direction = index < currentIndex ? -1 : 1;
      card.classList.toggle('is-active', active);
      card.style.transform = active
        ? 'translateX(-50%) rotateY(0deg) translateZ(0) scale(1)'
        : `translateX(-50%) rotateY(${direction * 72}deg) translateZ(0) scale(.92)`;
      card.style.opacity = active ? '1' : '0';
      card.style.visibility = active ? 'visible' : 'hidden';
      card.style.pointerEvents = active ? 'auto' : 'none';
      card.style.zIndex = active ? '2' : '0';
    });
    if (status) status.textContent = `${String(currentIndex + 1).padStart(2, '0')} / ${String(cards.length).padStart(2, '0')}`;
  };
  const move = step => {
    currentIndex = (currentIndex + step + cards.length) % cards.length;
    render();
  };
  carousel.querySelector('[data-carousel-prev]')?.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); move(-1); });
  carousel.querySelector('[data-carousel-next]')?.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); move(1); });
  render();
});

const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      revealObserver.unobserve(entry.target);
    }
  });
}, { threshold: .12 });
document.querySelectorAll('.experience-grid,.feature-row article,.menu-heading,.cocktail-card,.manifesto-content,.contact-row').forEach(el => {
  el.classList.add('reveal');
  revealObserver.observe(el);
});
