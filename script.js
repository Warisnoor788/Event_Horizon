// Predefined sample events
const SAMPLE_EVENTS = [
  { id: 1, name: 'Summer Music Fest', date: '2026-07-20', description: 'Outdoor music festival with local bands.' },
  { id: 2, name: 'Tech Meetup', date: '2026-06-25', description: 'Monthly meetup for web developers.' },
  { id: 3, name: 'Spring Gala', date: '2025-04-10', description: 'Charity dinner and auction.' }
];

// DOM references
const eventsList = document.getElementById('eventsList');
const eventForm = document.getElementById('eventForm');
const nameInput = document.getElementById('name');
const dateInput = document.getElementById('date');
const descInput = document.getElementById('description');
const formWarning = document.getElementById('formWarning');
const searchInput = document.getElementById('searchInput');
const clearStorage = document.getElementById('clearStorage');

let events = loadEvents();
renderEvents(events);

// Load from localStorage or fallback to SAMPLE_EVENTS
function loadEvents(){
  try{
    const raw = localStorage.getItem('events_v1');
    if(raw){
      return JSON.parse(raw);
    }
  }catch(e){console.warn('Could not parse stored events', e)}
  // Clone sample events and ensure ids unique
  return SAMPLE_EVENTS.map(e=>({ ...e }));
}

function saveEvents(){
  localStorage.setItem('events_v1', JSON.stringify(events));
}

function renderEvents(list){
  // sort ascending by date
  list.sort((a,b)=>new Date(a.date) - new Date(b.date));
  eventsList.innerHTML = '';

  if(list.length === 0){
    eventsList.innerHTML = '<p class="muted">No events found.</p>';
    return;
  }

  const today = new Date();

  list.forEach(evt=>{
    const card = document.createElement('article');
    card.className = 'event-card';

    const isPast = new Date(evt.date) < new Date(today.toDateString());
    if(isPast) card.classList.add('past'); else card.classList.add('upcoming');

    card.innerHTML = `
      <div class="event-meta">
        <div class="event-name">${escapeHtml(evt.name)}</div>
        <div class="event-date">${evt.date}</div>
      </div>
      <div class="event-desc">${escapeHtml(evt.description)}</div>
      <div class="event-actions">
        <button class="btn ghost" data-id="${evt.id}" onclick="viewEvent(${evt.id})">View</button>
        <button class="btn delete" data-id="${evt.id}" onclick="deleteEvent(${evt.id})">Delete</button>
      </div>
    `;

    eventsList.appendChild(card);
  });
}

function escapeHtml(str){
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#039;');
}

// Form submit handler
eventForm.addEventListener('submit', e=>{
  e.preventDefault();
  formWarning.textContent = '';
  const name = nameInput.value.trim();
  const date = dateInput.value;
  const description = descInput.value.trim();

  if(!name || !date || !description){
    formWarning.textContent = 'Please complete all fields.';
    return;
  }

  const newEvent = { id: Date.now(), name, date, description };
  events.push(newEvent);
  // sort and save
  events.sort((a,b)=>new Date(a.date)-new Date(b.date));
  saveEvents();
  renderEvents(filterByQuery(events, searchInput.value));
  eventForm.reset();
});

// Delete event
window.deleteEvent = function(id){
  events = events.filter(e=>e.id !== id);
  saveEvents();
  renderEvents(filterByQuery(events, searchInput.value));
}

window.viewEvent = function(id){
  const e = events.find(x=>x.id===id);
  if(!e) return;
  alert(`${e.name}\n\nDate: ${e.date}\n\n${e.description}`);
}

// Search/filter
searchInput.addEventListener('input', ()=>{
  const q = searchInput.value.trim();
  const filtered = filterByQuery(events, q);
  renderEvents(filtered);
});

function filterByQuery(list, q){
  if(!q) return [...list];
  const term = q.toLowerCase();
  return list.filter(e=> e.name.toLowerCase().includes(term) || e.date.includes(term) );
}

// Clear saved events (for demo/testing)
clearStorage.addEventListener('click', e=>{
  e.preventDefault();
  if(confirm('Clear saved events and reload samples?')){
    localStorage.removeItem('events_v1');
    events = loadEvents();
    renderEvents(events);
  }
});

// Expose for debugging
window._events = events;
