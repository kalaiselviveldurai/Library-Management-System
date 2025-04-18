document.addEventListener("DOMContentLoaded", function () {
    window.searchBooks = searchBooks;  // ✅ Ensure function is available globally
    window.fetchBooks = fetchBooks;
    window.showAddBookModal = showAddBookModal;
    window.showUpdateBookModal = showUpdateBookModal;
    window.closeAddBookModal = closeAddBookModal;
    window.closeUpdateBookModal = closeUpdateBookModal;
    window.addBook = addBook;
    window.updateBook = updateBook;
    window.deleteBook = deleteBook;
    window.deleteSelectedBooks = deleteSelectedBooks;
    window.toggleSelectAll = toggleSelectAll;
    window.toggleDeleteButton = toggleDeleteButton;

    fetchBooks(); // Load books on page load
});

// 🔹 Show Add Book Modal
function showAddBookModal() {
    document.getElementById("add-book-modal").classList.remove("hidden");
}

// 🔹 Close Add Book Modal
function closeAddBookModal() {
    document.getElementById("add-book-modal").classList.add("hidden");
}

// 🔹 Show Update Book Modal
function showUpdateBookModal(bookId, title, author, isbn, status, published_date) {
    document.getElementById("update-book-id").value = bookId;
    document.getElementById("update-title").value = title;
    document.getElementById("update-author").value = author;
    document.getElementById("update-isbn").value = isbn;
    document.getElementById("update-status").value = status;
    document.getElementById("update-published_date").value = published_date;  // ✅ FIXED ID
    document.getElementById("update-book-modal").classList.remove("hidden");
}

// 🔹 Close Update Book Modal
function closeUpdateBookModal() {
    document.getElementById("update-book-modal").classList.add("hidden");
}

// 🔹 Fetch Books (With Search Filter)
async function fetchBooks(query = "") {
    console.log("📢 Fetching books...");

    const token = sessionStorage.getItem("access_token");
    if (!token) {
        alert("You are not logged in! Redirecting to login...");
        window.location.href = "/project/adminlogin-page/";
        return;
    }

    let url = `/project/books/`;
    if (query) {
        url += `?search=${encodeURIComponent(query)}`;  // ✅ Corrected template string
    }

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            console.error(`❌ Failed to fetch books. Status: ${response.status}`);
            return;
        }

        const books = await response.json();
        displayBooks(books);
    } catch (error) {
        console.error("🚨 Error fetching books:", error);
    }
}

// 🔹 Search Books
function searchBooks() {
    const query = document.getElementById("search-books").value.trim();
    fetchBooks(query);
}

// 🔹 Display Books in Table
function displayBooks(books) {
    const bookTableBody = document.getElementById("book-table-body");
    bookTableBody.innerHTML = "";

    books.forEach(book => {
        const row = bookTableBody.insertRow();
        row.insertCell().textContent = book.id;
        row.insertCell().textContent = book.title;
        row.insertCell().textContent = book.author;
        row.insertCell().textContent = book.isbn;
        row.insertCell().textContent = book.status;
        row.insertCell().textContent = book.published_date;

        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <span class="material-icons-outlined edit-icon"
                onclick="showUpdateBookModal(${book.id}, '${book.title}', '${book.author}', '${book.isbn}', '${book.status}', '${book.published_date}')">
                edit
            </span>
            <span class="material-icons-outlined delete-icon" onclick="deleteBook(${book.id})">delete</span>
        `;
    });

    document.getElementById("book-list").classList.remove("hidden");
}

function toggleDeleteButton() {
    const checkboxes = document.querySelectorAll(".book-checkbox:checked");
    const bulkDeleteBtn = document.getElementById("bulk-delete-btn");

    bulkDeleteBtn.classList.toggle("hidden", checkboxes.length === 0);
}

// 🔹 Toggle "Select All" Functionality
function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll(".book-checkbox");
    checkboxes.forEach(checkbox => checkbox.checked = source.checked);
    toggleDeleteButton();
}

// 🔹 Bulk Delete Selected Books
async function deleteSelectedBooks() {
    const token = sessionStorage.getItem("access_token");

    const selectedBooks = [...document.querySelectorAll(".book-checkbox:checked")].map(cb => cb.value);

    if (selectedBooks.length === 0) {
        alert("No books selected!");
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBooks.length} books?`)) {
        return;
    }

    try {
        const response = await fetch(`/project/books/bulk-delete/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ book_ids: selectedBooks })
        });

        if (response.ok) {
            alert("📕 Selected books deleted successfully!");
            fetchBooks();
            document.getElementById("bulk-delete-btn").classList.add("hidden");
        } else {
            alert("🚨 Error deleting books.");
        }
    } catch (error) {
        console.error("🚨 Error deleting books:", error);
    }
}

// 🔹 Add Book
async function addBook(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        alert("Access Denied: You must log in first.");
        window.location.href = "/project/adminlogin-page/";
        return;
    }

    const formData = new FormData(event.target);
    let data = Object.fromEntries(formData.entries());

    let formattedData = {
        title: data.title.trim(),
        author: data.author.trim(),
        isbn: data.isbn.trim(),
        status: data.status.trim(),
        published_date: data.published_date.trim()
    };

    console.log("📤 Sending Data:", JSON.stringify(formattedData, null, 2));

    try {
        const response = await fetch("/project/books/add/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(formattedData)
        });

        const result = await response.json();

        if (response.ok) {
            alert("📚 Book added successfully!");
            closeAddBookModal();
            fetchBooks();
        } else {
            alert(`🚨 Error: ${JSON.stringify(result)}`);
        }
    } catch (error) {
        console.error("🚨 Error adding book:", error);
    }
}

// 🔹 Update Book
async function updateBook(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const bookId = data.id;

    try {
        const response = await fetch(`/project/books/${bookId}/update/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("📘 Book updated successfully!");
            closeUpdateBookModal();
            fetchBooks();
        } else {
            alert("🚨 Error updating book.");
        }
    } catch (error) {
        console.error("🚨 Error updating book:", error);
    }
}

// 🔹 Delete Book
async function deleteBook(bookId) {
    const token = sessionStorage.getItem("access_token");

    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    try {
        const response = await fetch(`/project/books/${bookId}/delete/`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert(" Book deleted successfully!");
            fetchBooks();
        } else {
            alert("Error deleting book.");
        }
    } catch (error) {
        console.error(" Error deleting book:", error);
    }
}
