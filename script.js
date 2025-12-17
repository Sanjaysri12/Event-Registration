// Parallax hero background
const hero = document.querySelector('.hero');
const bg = document.querySelector('.hero-bg');
window.addEventListener('scroll', () => {
  const y = window.scrollY;
  if(!bg) return;
  bg.style.transform = `translateY(${y * -0.06}px)`;
});

// Members carousel controls
const carousel = document.querySelector('.carousel');
const track = document.querySelector('.track');
const prev = document.querySelector('.nav.prev');
const next = document.querySelector('.nav.next');

function scrollByPanel(dir){
  const panelWidth = track.querySelector('.panel').getBoundingClientRect().width + 22;
  const scrollAmount = dir * panelWidth;
  track.scrollBy({left: scrollAmount, behavior:'smooth'});
}

// Enhanced scroll behavior for better mobile experience
function scrollToPanel(index) {
  const panels = track.querySelectorAll('.panel');
  if (panels[index]) {
    panels[index].scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
  }
}
prev?.addEventListener('click', () => scrollByPanel(-1));
next?.addEventListener('click', () => scrollByPanel(1));

// Touch support for carousel
let startX = 0;
let scrollLeft = 0;
let isDown = false;

track?.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX - track.offsetLeft;
  scrollLeft = track.scrollLeft;
  track.style.cursor = 'grabbing';
});

track?.addEventListener('mouseleave', () => {
  isDown = false;
  track.style.cursor = 'grab';
});

track?.addEventListener('mouseup', () => {
  isDown = false;
  track.style.cursor = 'grab';
});

track?.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  const x = e.pageX - track.offsetLeft;
  const walk = (x - startX) * 2;
  track.scrollLeft = scrollLeft - walk;
});

// Enhanced touch events with momentum scrolling
let isScrolling = false;
let scrollTimeout;
let lastTouchTime = 0;
let velocity = 0;
let lastScrollLeft = 0;

track?.addEventListener('touchstart', (e) => {
  const now = Date.now();
  if (now - lastTouchTime < 100) return; // Prevent rapid touch events
  
  startX = e.touches[0].pageX - track.offsetLeft;
  scrollLeft = track.scrollLeft;
  lastScrollLeft = track.scrollLeft;
  isScrolling = true;
  velocity = 0;
  track.style.scrollBehavior = 'auto';
  lastTouchTime = now;
}, {passive: true});

track?.addEventListener('touchmove', (e) => {
  if (!startX || !isScrolling) return;
  
  const x = e.touches[0].pageX - track.offsetLeft;
  const walk = (x - startX) * 1.2; // Reduced multiplier for smoother scrolling
  const newScrollLeft = scrollLeft - walk;
  
  // Calculate velocity for momentum
  velocity = newScrollLeft - lastScrollLeft;
  lastScrollLeft = newScrollLeft;
  
  track.scrollLeft = newScrollLeft;
}, {passive: true});

track?.addEventListener('touchend', () => {
  if (!isScrolling) return;
  
  track.style.scrollBehavior = 'smooth';
  
  // Apply momentum if there's significant velocity
  if (Math.abs(velocity) > 2) {
    const momentum = velocity * 8;
    track.scrollLeft += momentum;
  }
  
  // Snap to nearest panel after a short delay
  setTimeout(() => {
    const panels = track.querySelectorAll('.panel');
    const trackRect = track.getBoundingClientRect();
    const trackCenter = trackRect.left + trackRect.width / 2;
    
    let closestPanel = null;
    let closestDistance = Infinity;
    
    panels.forEach(panel => {
      const panelRect = panel.getBoundingClientRect();
      const panelCenter = panelRect.left + panelRect.width / 2;
      const distance = Math.abs(panelCenter - trackCenter);
      
      if (distance < closestDistance) {
        closestDistance = distance;
        closestPanel = panel;
      }
    });
    
    if (closestPanel) {
      closestPanel.scrollIntoView({behavior: 'smooth', block: 'nearest', inline: 'center'});
    }
  }, 100);
  
  startX = 0;
  isScrolling = false;
  velocity = 0;
}, {passive: true});

// Keyboard nav
carousel?.addEventListener('keydown', (e)=>{
  if(e.key === 'ArrowRight') scrollByPanel(1);
  if(e.key === 'ArrowLeft') scrollByPanel(-1);
});

// Scroll reveal animations
const revealables = Array.from(document.querySelectorAll('[data-reveal], .panel, .card, .section-head'));
const observer = new IntersectionObserver((entries)=>{
  entries.forEach(en => {
    if(en.isIntersecting){
      en.target.classList.add('visible');
      observer.unobserve(en.target);
    }
  })
},{threshold:.15});
revealables.forEach((el, i) => {
  el.style.transitionDelay = `${Math.min(i*40, 200)}ms`;
  observer.observe(el);
});

// Magnetic button hover
document.querySelectorAll('.btn.primary').forEach(btn => {
  btn.addEventListener('pointermove', (e)=>{
    const rect = btn.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    btn.style.setProperty('--mx', `${x}%`);
    btn.style.setProperty('--my', `${y}%`);
  });
});

// Background animation removed - cleaner experience

// Card subtle tilt based on mouse position (desktop only)
if (window.matchMedia('(hover: hover) and (pointer: fine)').matches) {
  document.querySelectorAll('.card, .panel').forEach(card => {
    const damp = 18;
    card.addEventListener('pointermove', (e)=>{
      const r = card.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width - .5;
      const py = (e.clientY - r.top) / r.height - .5;
      card.style.transform = `rotateX(${(-py*damp).toFixed(2)}deg) rotateY(${(px*damp).toFixed(2)}deg) translateY(-6px)`;
    });
    card.addEventListener('pointerleave', ()=>{
      card.style.transform = '';
    });
  });
}

// Flip interaction for team panels
document.querySelectorAll('.panel').forEach(panel => {
  panel.addEventListener('click', ()=>{
    panel.classList.toggle('is-flipped');
    const pressed = panel.getAttribute('aria-pressed') === 'true';
    panel.setAttribute('aria-pressed', (!pressed).toString());
  });
  panel.addEventListener('keydown', (e)=>{
    if(e.key === 'Enter' || e.key === ' '){
      e.preventDefault();
      panel.click();
    }
  });
  // Back face shows only description; click again to flip back
});

// Modal registration form
const modal = document.getElementById('registerModal');
const openers = ['registerTop','registerHero','registerMiddle','registerBottom'].map(id=>document.getElementById(id)).filter(Boolean);
openers.forEach(btn => btn.addEventListener('click', ()=> modal.showModal()));

const form = document.getElementById('registerForm');
const note = document.getElementById('formNote');
form?.addEventListener('submit', (e)=>{
  e.preventDefault();
  const fd = new FormData(form);
  const name = fd.get('name');
  const email = fd.get('email');
  const competition = fd.get('competition');
  if(!name || !email || !competition){
    note.textContent = 'Please fill all required fields.';
    note.style.color = '#f28b82';
    return;
  }
  // Simulate async submission
  note.textContent = 'Submitting…';
  note.style.color = '#c7d7fe';
  setTimeout(()=>{
    note.textContent = 'Registration received! Check your email for confirmation.';
    note.style.color = '#8bd48b';
    setTimeout(()=> modal.close(), 800);
    form.reset();
  }, 900);
});


