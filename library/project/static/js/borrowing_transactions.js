document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("borrowerDetailsForm").addEventListener("submit", fetchBorrowerDetails);
});

async function fetchAllBorrowingHistory() {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        alert("You are not logged in! Redirecting to login...");
        window.location.href = "/project/adminlogin-page/";
        return;
    }

    try {
        const response = await fetch("/project/allhistory/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const data = await response.json();
        console.log("📌 Borrowing History Response:", data);

        if (!Array.isArray(data)) {
            console.error("⚠️ Unexpected API Response:", data);
            alert("Error: Unexpected response format.");
            return;
        }

        displayAllBorrowingHistory(data);
    } catch (error) {
        console.error("❌ Error fetching all borrowing history:", error);
    }
}


function displayAllBorrowingHistory(history) {
    const tableElement = document.getElementById("borrowing-history-table");

    if (!tableElement) {
        console.error("⚠️ Error: Table element not found in the document.");
        return;
    }

    const historyTable = tableElement.getElementsByTagName("tbody")[0];
    historyTable.innerHTML = ""; // Clear previous data

    if (history.length === 0) {
        alert("No transactions found.");
        return;
    }

    history.forEach(transaction => {
        const row = historyTable.insertRow();
        row.insertCell().textContent = transaction.id;
        row.insertCell().textContent = transaction.book || "Unknown Book";
        row.insertCell().textContent = transaction.borrower || "Unknown Borrower";
        row.insertCell().textContent = new Date(transaction.borrowed_at).toLocaleString();
        row.insertCell().textContent = transaction.due_date ? new Date(transaction.due_date).toLocaleString() : "No Due Date";
        row.insertCell().textContent = transaction.returned_at ? new Date(transaction.returned_at).toLocaleString() : "Not Returned";
    });

    document.getElementById("borrowing-history").classList.remove("hidden");
}


function showBorrowerModal() {
    document.getElementById("borrower-modal").classList.remove("hidden");
}


function closeBorrowerModal() {
    document.getElementById("borrower-modal").classList.add("hidden");
}

async function fetchBorrowerDetails(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");

    const formData = new FormData(event.target);
    const borrowerId = formData.get("id");

    if (!borrowerId) {
        alert("⚠️ Borrower ID is required.");
        return;
    }

    try {
        const response = await fetch(`/project/borrowers/${borrowerId}/`, {
            headers: {
                "Authorization": `Bearer ${token}`,
                "Accept": "application/json"
            }
        });

        if (!response.ok) {
            throw new Error(`❌ API Error: ${response.status} - ${response.statusText}`);
        }

        const borrower = await response.json();
        console.log("📌 Borrower Data:", borrower);
        displayBorrowerDetails(borrower);
    } catch (error) {
        console.error("❌ Error fetching borrower details:", error);
        alert(`Error: ${error.message}`);
    }
}


function displayBorrowerDetails(borrower) {
    const resultDiv = document.getElementById("borrower-details-result");
    resultDiv.innerHTML = `
        <p><strong>Name:</strong> ${borrower.name}</p>
        <p><strong>Email:</strong> ${borrower.email}</p>
    `;
}

async function returnBook(bookId) {
    const token = sessionStorage.getItem("access_token");

    if (!confirm("Are you sure you want to return this book?")) {
        return;
    }

    try {
        const response = await fetch(`/project/return/${bookId}/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (response.ok) {
            alert("Book returned successfully!");
            fetchBorrowingHistory();
        } else {
            alert("Error returning book.");
        }
    } catch (error) {
        console.error("Error returning book:", error);
    }
}
