"use strict";

// Navbar: fundo ao rolar
const navbar = document.getElementById('navbar');
window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 50);
  updateActiveLink();
});

// Toggle mobile nav
const navToggle = document.getElementById('nav-toggle');
const navLinksList = document.getElementById('nav-links');
navToggle.addEventListener('click', () => {
  navLinksList.classList.toggle('open');
  navToggle.classList.toggle('open');
});
document.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinksList.classList.remove('open');
    navToggle.classList.remove('open');
  });
});

// Link ativo conforme scroll
function updateActiveLink() {
  const sections = document.querySelectorAll('section[id]');
  const offset = window.scrollY + 80;
  sections.forEach(sec => {
    const top = sec.offsetTop;
    const id = sec.getAttribute('id');
    const link = document.querySelector(`.nav-link[href="#${id}"]`);
    if (!link) return;
    if (offset >= top && offset < top + sec.offsetHeight) {
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    }
  });
}

// Efeito de digitação
const typedEl = document.querySelector('.typed-text');
if (typedEl) {
  const phrases = [
    'Desenvolvedor de Software',
    'Desenvolvedor Backend',
    'Desenvolvedor Full Stack',
    'Apaixonado por Tecnologia'
  ];
  let pi = 0, ci = 0, deleting = false;

  function type() {
    const phrase = phrases[pi];
    typedEl.textContent = deleting
      ? phrase.substring(0, ci - 1)
      : phrase.substring(0, ci + 1);
    deleting ? ci-- : ci++;

    let delay = deleting ? 45 : 95;
    if (!deleting && ci === phrase.length) { delay = 2200; deleting = true; }
    else if (deleting && ci === 0) { deleting = false; pi = (pi + 1) % phrases.length; delay = 400; }

    setTimeout(type, delay);
  }
  setTimeout(type, 600);
}

// Reveal on scroll via IntersectionObserver
const params = new URLSearchParams(location.search);
if (params.has('visible')) {
  // Test/print mode: show all at once
  document.querySelectorAll('.reveal').forEach(el => el.classList.add('visible'));
} else {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.12 });
  document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
}
