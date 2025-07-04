let quotes = [];

function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  quotes = storedQuotes ? JSON.parse(storedQuotes) : getDefaultQuotes();
  saveQuotes();
}

function getDefaultQuotes() {
  return [
    { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
    { text: "Life is what happens when you're busy making other plans.", category: "Life" },
    { text: "Stay hungry, stay foolish.", category: "Inspiration" }
  ];
}

function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

function showRandomQuote() {
  const selectedCategory = document.getElementById("categoryFilter").value;
  const filtered = selectedCategory === "all"
    ? quotes
    : quotes.filter(q => q.category.toLowerCase() === selectedCategory.toLowerCase());

  if (filtered.length === 0) {
    displayQuote("No quotes available for this category.");
    return;
  }

  const random = Math.floor(Math.random() * filtered.length);
  const quote = filtered[random];
  const html = `"${quote.text}" — <em>${quote.category}</em>`;
  displayQuote(html);
  sessionStorage.setItem("lastViewedQuote", html);
}

function displayQuote(html) {
  document.getElementById("quoteDisplay").innerHTML = html;
}

function addQuote() {
  const text = document.getElementById("newQuoteText").value.trim();
  const category = document.getElementById("newQuoteCategory").value.trim();

  if (!text || !category) return alert("Please fill in both fields.");

  quotes.push({ text, category });
  saveQuotes();
  populateCategories(); // refresh dropdown
  document.getElementById("newQuoteText").value = '';
  document.getElementById("newQuoteCategory").value = '';
  alert("Quote added!");
}

function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const textInput = document.createElement("input");
  textInput.id = "newQuoteText";
  textInput.type = "text";
  textInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.append(textInput, categoryInput, addButton);
}

function getUniqueCategories() {
  const allCategories = quotes.map(q => q.category.trim().toLowerCase());
  return [...new Set(allCategories)];
}

function populateCategories() {
  const select = document.getElementById("categoryFilter");
  const savedFilter = localStorage.getItem("selectedCategory") || "all";
  const currentValue = select.value;

  // Remove old options
  select.innerHTML = `<option value="all">All Categories</option>`;

  // Add unique categories
  getUniqueCategories().forEach(cat => {
    const option = document.createElement("option");
    option.value = cat;
    option.textContent = capitalize(cat);
    if (cat === savedFilter) option.selected = true;
    select.appendChild(option);
  });

  // Keep user's current selection if not saved
  if (!savedFilter && currentValue !== "all") {
    select.value = currentValue;
  }
}

function capitalize(str) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function filterQuotes() {
  const selected = document.getElementById("categoryFilter").value;
  localStorage.setItem("selectedCategory", selected);
  showRandomQuote();
}

function exportToJson() {
  const blob = new Blob([JSON.stringify(quotes, null, 2)], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "quotes.json";
  a.click();
  URL.revokeObjectURL(url);
}

function importFromJsonFile(event) {
  const reader = new FileReader();
  reader.onload = function (e) {
    try {
      const imported = JSON.parse(e.target.result);
      if (Array.isArray(imported)) {
        quotes.push(...imported);
        saveQuotes();
        populateCategories();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid JSON format.");
      }
    } catch {
      alert("Failed to import JSON.");
    }
  };
  reader.readAsText(event.target.files[0]);
}

function restoreLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) displayQuote(last);
}

document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  populateCategories();
  restoreLastViewedQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);

  // Restore selected filter if any
  const savedFilter = localStorage.getItem("selectedCategory");
  if (savedFilter) {
    document.getElementById("categoryFilter").value = savedFilter;
    filterQuotes();
  }
});