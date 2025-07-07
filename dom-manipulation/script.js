// Fetch all quotes from the server
async function fetchQuotesFromServer() {
  try {
    const res = await fetch("http://localhost:3000/quotes");
    if (!res.ok) throw new Error("Server returned an error");
    const serverQuotes = await res.json();
    return serverQuotes;
  } catch (error) {
    console.error("Error fetching quotes from server:", error);
    notify("Error syncing: " + error.message);
    return [];
  }
}

// Sync with server & resolve conflicts
async function syncWithServer() {
  try {
    const serverQuotes = await fetchQuotesFromServer(); // ✅ now called here

    const localMap = new Map(quotes.map(q => [q.text + q.category, q]));
    let changed = false;

    serverQuotes.forEach(serverQ => {
      const key = serverQ.text + serverQ.category;
      const localQ = localMap.get(key);

      if (!localQ || serverQ.lastModified > localQ.lastModified) {
        localMap.set(key, serverQ);
        changed = true;
        if (localQ && serverQ.lastModified > localQ.lastModified) {
          showConflictUI(localQ, serverQ);
        }
      }
    });

    if (changed) {
      quotes = Array.from(localMap.values());
      saveQuotes();
      populateCategories();
      notify("Synced with server. Conflicts resolved.");
    }
  } catch (e) {
    console.error("Sync failed:", e);
    notify("Failed to sync with server.");
  }
}
