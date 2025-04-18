document.addEventListener("DOMContentLoaded", function () {
    fetchBooks();
});

// ✅ Fetch Books from Backend
async function fetchBooks() {
    console.log("📢 Fetching books...");

    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Session expired! Please log in again.");
        window.location.href = "/project/login-page/";
        return;
    }

    try {
        const response = await fetch("/project/books/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch books. Status: ${response.status}`);
            return;
        }

        const books = await response.json();
        console.log("📚 Books Received:", books);

        if (books.length === 0) {
            alert("⚠️ No books found!");
            return;
        }

        displayBooks(books);
        updateBookStats(books);
    } catch (error) {
        console.error("⚠️ Error fetching books:", error);
    }
}

// ✅ Display Books in Table
function displayBooks(books) {
    const bookTableBody = document.getElementById("book-table-body");
    bookTableBody.innerHTML = "";

    books.forEach(book => {
        const row = bookTableBody.insertRow();
        row.insertCell().textContent = book.id;
        row.insertCell().textContent = book.title;
        row.insertCell().textContent = book.author;
        row.insertCell().textContent = book.isbn;
        row.insertCell().textContent = book.status === "available" ? "✅ Available" : "❌ Checked Out";
    });

    document.getElementById("user-books").classList.remove("hidden");
}

// ✅ Update Stats Cards (Total, Available, Checked Out)
function updateBookStats(books) {
    const totalBooks = books.length;
    const availableBooks = books.filter(book => book.status === "available").length;
    const checkedOutBooks = books.filter(book => book.status === "checked_out").length;

    document.getElementById("total-books").innerText = totalBooks;
    document.getElementById("available-books").innerText = availableBooks;
    document.getElementById("checked-out-books").innerText = checkedOutBooks;
}
