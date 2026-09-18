'use strict';

const state = {
  theme: 'light',
  menuOpen: false,
  projects: [],
  projectStatus: 'idle',
  activeFilter: 'All'
};

const elements = {
  root: document.documentElement,
  header: document.querySelector('#site-header'),
  themeToggle: document.querySelector('.theme-toggle'),
  themeIcon: document.querySelector('.theme-icon'),
  menuToggle: document.querySelector('.menu-toggle'),
  navPanel: document.querySelector('#nav-panel'),
  navLinks: document.querySelectorAll('.nav-links a'),
  scrollTop: document.querySelector('.scroll-top'),
  projectGrid: document.querySelector('#project-grid'),
  projectStatus: document.querySelector('#project-status'),
  filters: document.querySelector('#project-filters'),
  form: document.querySelector('#contact-form'),
  formResult: document.querySelector('#form-result')
};

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('portfolio-theme');
  if (savedTheme) return savedTheme;
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
};

const renderTheme = () => {
  const isDark = state.theme === 'dark';
  elements.root.dataset.theme = state.theme;
  elements.themeIcon.textContent = isDark ? '☀' : '☾';
  elements.themeToggle.setAttribute('aria-label', `${isDark ? '라이트' : '다크'} 모드로 전환`);
};

const toggleTheme = () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('portfolio-theme', state.theme);
  renderTheme();
};

const renderMenu = () => {
  elements.menuToggle.classList.toggle('active', state.menuOpen);
  elements.navPanel.classList.toggle('active', state.menuOpen);
  elements.menuToggle.setAttribute('aria-expanded', String(state.menuOpen));
  elements.menuToggle.setAttribute('aria-label', state.menuOpen ? '메뉴 닫기' : '메뉴 열기');
};

const toggleMenu = () => {
  state.menuOpen = !state.menuOpen;
  renderMenu();
};

const closeMenu = () => {
  state.menuOpen = false;
  renderMenu();
};

const initTyping = () => {
  const target = document.querySelector('.typing-text');
  if (!target || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const text = target.dataset.text;
  target.textContent = '';
  let index = 0;
  const typeNext = () => {
    target.textContent = text.slice(0, index);
    index += 1;
    if (index <= text.length) window.setTimeout(typeNext, 105);
  };
  window.setTimeout(typeNext, 450);
};

const githubUsername = (() => {
  const hostPart = window.location.hostname.split('.')[0];
  return window.location.hostname.endsWith('github.io') && hostPart ? hostPart : 'octocat';
})();

const escapeHtml = (value = '') => String(value).replace(/[&<>'"]/g, (character) => ({
  '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
}[character]));

const renderProjectState = () => {
  elements.projectStatus.innerHTML = '';
  elements.projectGrid.innerHTML = '';

  if (state.projectStatus === 'loading') {
    elements.projectGrid.innerHTML = `${'<div class="skeleton" aria-hidden="true"></div>'.repeat(3)}<div class="state-box"><div><div class="spinner"></div><p>GitHub에서 프로젝트를 불러오는 중...</p></div></div>`;
    return;
  }
  if (state.projectStatus === 'error') {
    elements.projectGrid.innerHTML = '<div class="state-box"><div><strong>프로젝트를 불러올 수 없습니다.</strong><p>잠시 후 다시 시도해 주세요.</p><button class="button button-secondary retry-button" type="button">다시 시도</button></div></div>';
    document.querySelector('.retry-button').addEventListener('click', fetchProjects);
    return;
  }

  const filteredProjects = state.activeFilter === 'All'
    ? state.projects
    : state.projects.filter(({ language }) => language === state.activeFilter);

  if (filteredProjects.length === 0) {
    elements.projectGrid.innerHTML = '<div class="state-box"><p>표시할 프로젝트가 없습니다.</p></div>';
    return;
  }

  elements.projectGrid.innerHTML = filteredProjects.map(({ name, description, html_url: url, language, stargazers_count: stars, forks_count: forks }) => `
    <article class="project-card">
      <div class="project-top"><span class="folder-icon" aria-hidden="true">⌑</span><a class="project-link" href="${escapeHtml(url)}" target="_blank" rel="noreferrer" aria-label="${escapeHtml(name)} GitHub 저장소 열기">↗</a></div>
      <h3 class="truncate-text">${escapeHtml(name)}</h3>
      <p>${escapeHtml(description || '설명이 등록되지 않은 프로젝트입니다.')}</p>
      <div class="project-meta"><span class="language">${escapeHtml(language || 'Other')}</span><span>★ ${stars}</span><span>⑂ ${forks}</span></div>
    </article>`).join('');
};

const renderFilters = () => {
  const languages = ['All', ...new Set(state.projects.map(({ language }) => language).filter(Boolean))];
  elements.filters.innerHTML = languages.map((language) => `<button class="filter-button${language === state.activeFilter ? ' active' : ''}" type="button" data-language="${escapeHtml(language)}">${escapeHtml(language)}</button>`).join('');
  elements.filters.querySelectorAll('.filter-button').forEach((button) => {
    button.addEventListener('click', () => {
      state.activeFilter = button.dataset.language;
      renderFilters();
      renderProjectState();
    });
  });
};

async function fetchProjects() {
  state.projectStatus = 'loading';
  renderProjectState();
  try {
    const response = await fetch(`https://api.github.com/users/${githubUsername}/repos?sort=updated&per_page=9`);
    if (!response.ok) throw new Error(`GitHub API error: ${response.status}`);
    const repositories = await response.json();
    state.projects = repositories.filter(({ fork }) => !fork);
    state.projectStatus = 'success';
    state.activeFilter = 'All';
    renderFilters();
  } catch (error) {
    console.error(error);
    state.projectStatus = 'error';
  }
  renderProjectState();
}

const validationRules = {
  name: (value) => value.trim().length >= 2 ? '' : '이름을 두 글자 이상 입력해 주세요.',
  email: (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : '올바른 이메일 주소를 입력해 주세요.',
  message: (value) => value.trim().length >= 10 ? '' : '메시지를 열 글자 이상 입력해 주세요.'
};

const validateField = (field) => {
  const message = validationRules[field.name](field.value);
  field.classList.toggle('invalid', Boolean(message));
  field.setAttribute('aria-invalid', String(Boolean(message)));
  document.querySelector(`#${field.name}-error`).textContent = message;
  return !message;
};

/* [start] contact form handling -  */

const EMAIL_CONFIG = {
  publicKey: 'ThNVnIep_8FohEif6', 
  serviceId: 'service_w5sxktq',
  templateId: 'template_ddn9fkl'
};

let isSubmitting = false;

const handleSubmit = async (event) => {
  event.preventDefault();

  // 버튼 클릭과 Enter 입력으로 인한 중복 제출 방지
  if (isSubmitting) return;

  const form = event.currentTarget;
  const fields = [...form.querySelectorAll('input, textarea')];
  const button = form.querySelector('[type="submit"]');
  const result = elements.formResult;

  result.classList.remove('success');
  result.textContent = '';

  // map으로 모든 필드를 검사한 다음 결과를 판단
  const isValid = fields.map(validateField).every(Boolean);

  if (!isValid) {
    result.textContent = '입력 내용을 다시 확인해 주세요.';
    fields.find((field) => field.classList.contains('invalid'))?.focus();
    return;
  }

  // SDK 로딩 실패가 다른 페이지 기능까지 멈추게 하지 않음
  if (!window.emailjs) {
    result.textContent =
      '메일 전송 기능을 불러오지 못했습니다. 새로고침 후 다시 시도해 주세요.';
    return;
  }

  const originalButtonHTML = button.innerHTML;

  isSubmitting = true;
  button.disabled = true;
  button.textContent = '전송 중…';

  // 전송 중 작성한 내용이 성공 후 reset으로 지워지는 상황 방지
  fields.forEach((field) => {
    field.readOnly = true;
  });

  result.textContent = '메시지를 전송하고 있습니다.';

  try {
    await window.emailjs.sendForm(
      EMAIL_CONFIG.serviceId,
      EMAIL_CONFIG.templateId,
      form,
      {
        publicKey: EMAIL_CONFIG.publicKey,
        limitRate: { throttle: 10000 }
      }
    );

    result.classList.add('success');
    result.textContent = '메시지가 전송되었습니다. 감사합니다!';

    // 성공 응답을 받은 경우에만 입력값 삭제
    form.reset();

    fields.forEach((field) => {
      field.classList.remove('invalid');
      field.removeAttribute('aria-invalid');
    });
  } catch (error) {
    console.error('EmailJS 전송 실패:', error);

    result.textContent = error?.status === 429
      ? '요청이 너무 빠르거나 전송 한도에 도달했습니다. 잠시 후 다시 시도해 주세요.'
      : '전송하지 못했습니다. 입력 내용은 유지되니 잠시 후 다시 시도해 주세요.';
  } finally {
    isSubmitting = false;
    button.disabled = false;
    button.innerHTML = originalButtonHTML;

    fields.forEach((field) => {
      field.readOnly = false;
    });
  }
};

/* [end] contact form handling -  */



const handleScroll = () => {
  const scrollY = window.scrollY;
  elements.header.classList.toggle('scrolled', scrollY >= 60);
  elements.scrollTop.classList.toggle('visible', scrollY >= 300);

  const sections = [...document.querySelectorAll('main section[id]')];
  const current = sections.filter((section) => scrollY >= section.offsetTop - 150).at(-1);
  elements.navLinks.forEach((link) => link.classList.toggle('active', current && link.hash === `#${current.id}`));
};

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('visible');
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.2 });

state.theme = getInitialTheme();
renderTheme();
document.querySelectorAll('.reveal:not(.visible)').forEach((element) => observer.observe(element));
elements.themeToggle.addEventListener('click', toggleTheme);
elements.menuToggle.addEventListener('click', toggleMenu);
elements.navLinks.forEach((link) => link.addEventListener('click', closeMenu));
elements.scrollTop.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
elements.form.addEventListener('submit', handleSubmit);
elements.form.querySelectorAll('input, textarea').forEach((field) => field.addEventListener('input', () => validateField(field)));
window.addEventListener('scroll', handleScroll, { passive: true });
document.querySelector('#year').textContent = new Date().getFullYear();

handleScroll();
initTyping();
fetchProjects();
