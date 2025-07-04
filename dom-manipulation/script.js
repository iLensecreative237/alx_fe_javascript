// Initial array of quotes
let quotes = [
  { text: "The best way to get started is to quit talking and begin doing.", category: "Motivation" },
  { text: "Life is what happens when you're busy making other plans.", category: "Life" },
  { text: "Stay hungry, stay foolish.", category: "Inspiration" }
];

// Show a random quote
function showRandomQuote() {
  if (quotes.length === 0) {
    displayQuote("No quotes available.");
    return;
  }

  const randomIndex = Math.floor(Math.random() * quotes.length);
  const quote = quotes[randomIndex];
  displayQuote(`"${quote.text}" — <em>${quote.category}</em>`);
}

// Update quote display in the DOM
function displayQuote(htmlContent) {
  const displayDiv = document.getElementById("quoteDisplay");
  displayDiv.innerHTML = htmlContent;
}

// Add a new quote to the array and update UI
function addQuote() {
  const textInput = document.getElementById("newQuoteText");
  const categoryInput = document.getElementById("newQuoteCategory");

  const newText = textInput.value.trim();
  const newCategory = categoryInput.value.trim();

  if (newText && newCategory) {
    quotes.push({ text: newText, category: newCategory });
    textInput.value = '';
    categoryInput.value = '';
    alert("New quote added!");
  } else {
    alert("Please fill in both the quote and category.");
  }
}

// Event listener for the Show Quote button
document.getElementById("newQuote").addEventListener("click", showRandomQuote);