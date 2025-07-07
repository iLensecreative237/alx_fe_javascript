let quotes = [];

// Helper: Show notification
function notify(msg) {
  const nm = document.getElementById("notification");
  nm.textContent = msg;
  nm.style.display = "block";
  setTimeout(() => nm.style.display = "none", 5000);
}

// LocalStorage management
function loadQuotes() {
  const stored = localStorage.getItem("quotes");
  quotes = stored ? JSON.parse(stored) : [];
}
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Display quotes
function display(html) {
  document.getElementById("quoteDisplay").innerHTML = html;
}

// Category filter logic
function filterQuotes() {
  localStorage.setItem("selectedCategory", document.getElementById("categoryFilter").value);
  showRandomQuote();
}
function getUniqueCats() {
  return [...new Set(quotes.map(q => q.category.toLowerCase()))];
}
function populateCategories() {
  const sel = document.getElementById("categoryFilter");
  const saved = localStorage.getItem("selectedCategory") || "all";
  sel.innerHTML = `<option value="all">All Categories</option>`;
  getUniqueCats().forEach(cat => {
    const o = document.createElement("option");
    o.value = cat; o.textContent = cat.charAt(0).toUpperCase() + cat.slice(1);
    if (cat === saved) o.selected = true;
    sel.appendChild(o);
  });
}

// Show random, filter aware
function showRandomQuote() {
  const cat = document.getElementById("categoryFilter").value;
  const arr = cat === "all" ? quotes : quotes.filter(q => q.category.toLowerCase() === cat);
  if (arr.length === 0) return display("No quotes in this category.");
  const {text, category} = arr[Math.floor(Math.random()*arr.length)];
  display(`"${text}" — <em>${category}</em>`);
}

// Client-side add
function addQuote() {
  const t = document.getElementById("newQuoteText").value.trim();
  const c = document.getElementById("newQuoteCategory").value.trim();
  if (!t||!c) return alert("Fill both.");
  const now = Date.now();
  const q = {text: t, category: c, lastModified: now};
  quotes.push(q);
  saveQuotes(); populateCategories();
  postQuoteToServer(q);
  alert("Quote added & syncing!");
}

// Create form
function createForm() {
  const c = document.getElementById("formContainer");
  c.innerHTML = `
    <input id="newQuoteText" placeholder="Enter quote"><br>
    <input id="newQuoteCategory" placeholder="Enter category"><br>
    <button onclick="addQuote()">Add Quote</button>
  `;
}

// Sync with server & handle conflicts
async function syncWithServer() {
  try {
    const res = await fetch("http://localhost:3000/quotes");
    const server = await res.json();
    const localMap = new Map(quotes.map(q => [q.text + q.category, q]));
    let changed = false;

    server.forEach(sq => {
      const key = sq.text + sq.category;
      const lq = localMap.get(key);
      if (!lq || sq.lastModified > lq.lastModified) {
        localMap.set(key, sq);
        changed = true;
        if (lq && sq.lastModified > lq.lastModified) {
          showConflictUI(lq, sq);
        }
      }
    });

    if (changed) {
      quotes = Array.from(localMap.values());
      saveQuotes(); populateCategories();
      notify("Synced and conflicts resolved.");
    }
  } catch (e) { console.error(e); notify("Failed to sync."); }
}

// Post new quote to server
async function postQuoteToServer(q) {
  try {
    const res = await fetch("http://localhost:3000/quotes", {
      method: "POST",
      headers: {'Content-Type':'application/json'},
      body: JSON.stringify(q)
    });
    const saved = await res.json();
    q.id = saved.id;
    saveQuotes();
  } catch(e) { console.error("Push failed", e); }
}

// Manual override UI
function showConflictUI(localQ, srvQ) {
  const div = document.createElement("div");
  div.className = "conflict";
  div.innerHTML = `
    <strong>Conflict Detected:</strong><br>
    <em>Local:</em> "${localQ.text}" — ${localQ.category}<br>
    <em>Server:</em> "${srvQ.text}" — ${srvQ.category}<br>
    <button onclick="resolveConflict(true)">Keep Server</button>
    <button onclick="resolveConflict(false)">Keep Local</button>
  `;
  document.body.prepend(div);
}

// Resolve conflict
function resolveConflict(useServer) {
  document.querySelectorAll(".conflict").forEach(div => div.remove());
  if (!useServer) {
    quotes.push(quotes.shift()); // no-op but saves local
    saveQuotes();
    notify("Kept local version.");
  } else {
    saveQuotes();
    notify("Kept server version.");
  }
}

// Manual sync
function manualSync() {
  syncWithServer();
}

// Init
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes(); createForm(); populateCategories();
  const savedCat = localStorage.getItem("selectedCategory");
  if(savedCat) document.getElementById("categoryFilter").value = savedCat;
  manualSync();
  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
  setInterval(syncWithServer, 10000);
});
