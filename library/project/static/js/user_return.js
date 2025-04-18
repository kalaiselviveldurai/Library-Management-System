document.addEventListener("DOMContentLoaded", function () {
    fetchBorrowedBooks();
});

// ✅ Fetch Borrowed Books for Return
async function fetchBorrowedBooks() {
    console.log("📢 Fetching borrowed books...");

    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Session expired! Please log in again.");
        window.location.href = "/project/login-page/";
        return;
    }

    try {
        const response = await fetch("/project/borrowed-books/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch borrowed books. Status: ${response.status}`);
            alert("Failed to load borrowed books!");
            return;
        }

        const data = await response.json();
        console.log("📚 Borrowed Books:", data);

        if (data.length === 0) {
            alert("⚠️ No borrowed books found!");
            return;
        }

        displayBorrowedBooks(data);
    } catch (error) {
        console.error("⚠️ Error fetching borrowed books:", error);
    }
}

// ✅ Display Borrowed Books in Table
function displayBorrowedBooks(books) {
    const returnTableBody = document.getElementById("return-table-body");
    returnTableBody.innerHTML = "";

    books.forEach(book => {
        const row = returnTableBody.insertRow();
        row.insertCell().textContent = book.borrowed_id;
        row.insertCell().textContent = book.book_id;
        row.insertCell().textContent = book.book;
        row.insertCell().textContent = book.author;
        row.insertCell().textContent = book.isbn;
        row.insertCell().textContent = new Date(book.borrowed_at).toLocaleString();
        row.insertCell().textContent = new Date(book.due_date).toLocaleString();
        row.insertCell().textContent = book.status;

        // ✅ Return Button
        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `<button onclick="returnBook(${book.book_id})">Return</button>`;
    });

    document.getElementById("user-return").classList.remove("hidden");
}

// ✅ Search Function (Filters Books by Title)
function filterReturnBooks() {
    const searchInput = document.getElementById("search-return").value.toLowerCase();
    const rows = document.querySelectorAll("#return-table-body tr");

    rows.forEach(row => {
        const title = row.cells[2].textContent.toLowerCase(); // Title is in the 3rd column
        if (title.includes(searchInput)) {
            row.style.display = "";
        } else {
            row.style.display = "none";
        }
    });
}

// ✅ Return Book Function
async function returnBook(bookId) {
    console.log("📢 Returning book:", bookId);

    const token = localStorage.getItem("access_token");
    if (!token) {
        alert("Session expired! Please log in again.");
        window.location.href = "/project/login-page/";
        return;
    }

    try {
        const response = await fetch(`/project/return/${bookId}/`, {  // ✅ book_id in URL
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        if (!response.ok) {
            console.error(`❌ Return request failed. Status: ${response.status}`);
            alert("Error returning book!");
            return;
        }

        const result = await response.json();
        console.log("✅ Book returned successfully!", result.message);
        alert(result.message);
        fetchBorrowedBooks(); // Refresh book list after returning
    } catch (error) {
        console.error("⚠️ Error returning book:", error);
    }
}
