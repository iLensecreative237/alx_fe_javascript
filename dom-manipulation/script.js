// Quotes array (loaded from localStorage or default)
let quotes = [];

// Load from localStorage or use default quotes
function loadQuotes() {
  const storedQuotes = localStorage.getItem("quotes");
  if (storedQuotes) {
    quotes = JSON.parse(storedQuotes);
  } else {
    quotes = [
      { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
      { text: "Life is what happens when you're busy making other plans.", category: "Life" },
      { text: "Stay hungry, stay foolish.", category: "Inspiration" }
    ];
    saveQuotes();
  }
}

// Save quotes to localStorage
function saveQuotes() {
  localStorage.setItem("quotes", JSON.stringify(quotes));
}

// Show a random quote and save to sessionStorage
function showRandomQuote() {
  if (quotes.length === 0) {
    displayQuote("No quotes available.");
    return;
  }
  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  const html = `"${quote.text}" — <em>${quote.category}</em>`;
  displayQuote(html);

  // Store last viewed quote in sessionStorage
  sessionStorage.setItem("lastViewedQuote", html);
}

// Display a quote in the quoteDisplay div
function displayQuote(htmlContent) {
  document.getElementById("quoteDisplay").innerHTML = htmlContent;
}

// Add a quote from form input
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    saveQuotes();
    textInput.value = '';
    categoryInput.value = '';
    alert("New quote added!");
  } else {
    alert("Please fill in both fields.");
  }
}

// Dynamically create the quote addition form
function createAddQuoteForm() {
  const formContainer = document.getElementById("formContainer");

  const quoteInput = document.createElement("input");
  quoteInput.id = "newQuoteText";
  quoteInput.type = "text";
  quoteInput.placeholder = "Enter a new quote";

  const categoryInput = document.createElement("input");
  categoryInput.id = "newQuoteCategory";
  categoryInput.type = "text";
  categoryInput.placeholder = "Enter quote category";

  const addButton = document.createElement("button");
  addButton.textContent = "Add Quote";
  addButton.onclick = addQuote;

  formContainer.appendChild(quoteInput);
  formContainer.appendChild(categoryInput);
  formContainer.appendChild(addButton);
}

// Export quotes to a downloadable JSON file
function exportToJson() {
  const dataStr = JSON.stringify(quotes, null, 2);
  const blob = new Blob([dataStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = "quotes.json";
  link.click();

  URL.revokeObjectURL(url);
}

// Import quotes from uploaded JSON file
function importFromJsonFile(event) {
  const fileReader = new FileReader();
  fileReader.onload = function (e) {
    try {
      const importedQuotes = JSON.parse(e.target.result);
      if (Array.isArray(importedQuotes)) {
        quotes.push(...importedQuotes);
        saveQuotes();
        alert("Quotes imported successfully!");
      } else {
        alert("Invalid format: expected an array of quotes.");
      }
    } catch (err) {
      alert("Failed to parse JSON file.");
    }
  };
  fileReader.readAsText(event.target.files[0]);
}

// Restore last viewed quote from sessionStorage (optional)
function restoreLastViewedQuote() {
  const last = sessionStorage.getItem("lastViewedQuote");
  if (last) {
    displayQuote(last);
  }
}

// Initialize everything on DOM load
document.addEventListener("DOMContentLoaded", () => {
  loadQuotes();
  createAddQuoteForm();
  restoreLastViewedQuote();

  document.getElementById("newQuote").addEventListener("click", showRandomQuote);
});