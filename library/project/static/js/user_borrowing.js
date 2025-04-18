async function fetchBorrowingHistory() {
    console.log("📢 Fetching borrowing history...");

    const token = localStorage.getItem("access_token");
    if (!token) {
        console.error("⛔ No access token found! User must log in.");
        alert("Session expired! Please log in again.");
        window.location.href = "/project/login-page/";
        return;
    }

    try {
        const response = await fetch("/project/borrowing-history/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch history. Status: ${response.status}`);
            return;
        }

        const data = await response.json();
        console.log("📚 Borrowing History Received:", data);

        if (data.length === 0) {
            alert("⚠️ No borrowing history found!");
            return;
        }

        displayBorrowingHistory(data);
    } catch (error) {
        console.error("⚠️ Error fetching borrowing history:", error);
    }
}


function displayBorrowingHistory(history) {
    const historyTableBody = document.getElementById("borrowing-history-table-body");

    if (!historyTableBody) {
        console.error("⛔ ERROR: Borrowing history table not found in the DOM!");
        return;
    }

    historyTableBody.innerHTML = "";

    history.forEach(record => {
        const row = historyTableBody.insertRow();
        row.insertCell().textContent = record.id;
        row.insertCell().textContent = record.book.title;
        row.insertCell().textContent = new Date(record.borrowed_at).toLocaleString();
        row.insertCell().textContent = new Date(record.due_date).toLocaleString();
        row.insertCell().textContent = record.returned ? " Yes" : " No";
    });

    document.getElementById("user-borrowing-history").classList.remove("hidden");
}
