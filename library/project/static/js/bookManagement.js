document.addEventListener("DOMContentLoaded", function () {
    // ✅ Check if elements exist before adding event listeners
    const addBookForm = document.getElementById("addBookForm");
    const updateBookForm = document.getElementById("updateBookForm");
    const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
    const searchInput = document.getElementById("search-books");
    const exportExcelBtn = document.getElementById("export-books-btn");
    const exportPdfBtn = document.getElementById("export-books-pdf-btn");
    const selectAllCheckbox = document.getElementById("select-all");

    if (addBookForm) addBookForm.addEventListener("submit", addBook);
    if (updateBookForm) updateBookForm.addEventListener("submit", updateBook);
    if (bulkDeleteBtn) bulkDeleteBtn.addEventListener("click", deleteSelectedBooks);
    if (searchInput) searchInput.addEventListener("input", searchBooks);
    if (exportExcelBtn) exportExcelBtn.addEventListener("click", () => downloadFile('excel'));
    if (exportPdfBtn) exportPdfBtn.addEventListener("click", () => downloadFile('pdf'));
    if (selectAllCheckbox) selectAllCheckbox.addEventListener("change", function () {
        toggleSelectAll(this);
    });

    fetchBooks(); // ✅ Load books on page load
});

// ✅ Fetch Books
async function fetchBooks(query = "") {
    console.log("📢 Fetching books...");
    const token = sessionStorage.getItem("access_token");
    let url = "/project/books/";
    if (query) url += `?search=${encodeURIComponent(query)}`;

    try {
        const response = await fetch(url, { headers: { "Authorization": `Bearer ${token}` } });
        if (!response.ok) throw new Error(`Failed to fetch books. Status: ${response.status}`);

        displayBooks(await response.json());
    } catch (error) {
        console.error("Error fetching books:", error);
    }
}

// ✅ Search Books
function searchBooks() {
    fetchBooks(document.getElementById("search-books").value.trim());
}

// ✅ Display Books in Table
function displayBooks(books) {
    const tableBody = document.getElementById("book-table-body");
    tableBody.innerHTML = "";

    books.forEach(book => {
        const row = tableBody.insertRow();
        row.insertCell().innerHTML = `<input type="checkbox" class="book-checkbox" value="${book.id}" onclick="toggleDeleteButton()">`;
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

// ✅ Show/Hide Bulk Delete Button
function toggleDeleteButton() {
    const checkboxes = document.querySelectorAll(".book-checkbox:checked");
    const bulkDeleteBtn = document.getElementById("bulk-delete-btn");
    if (checkboxes.length > 0) {
        bulkDeleteBtn.classList.remove("hidden");
    } else {
        bulkDeleteBtn.classList.add("hidden");
    }
}

// ✅ Select/Deselect All Books
function toggleSelectAll(source) {
    const checkboxes = document.querySelectorAll(".book-checkbox");
    checkboxes.forEach(checkbox => checkbox.checked = source.checked);
    toggleDeleteButton();
}

// ✅ Delete Selected Books
async function deleteSelectedBooks() {
    const token = sessionStorage.getItem("access_token");
    const selectedBooks = Array.from(document.querySelectorAll(".book-checkbox:checked")).map(cb => cb.value);

    if (selectedBooks.length === 0) {
        alert("No books selected for deletion!");
        return;
    }

    if (!confirm(`Are you sure you want to delete ${selectedBooks.length} book(s)?`)) {
        return;
    }

    try {
        await fetch("/project/books/bulk-delete/", {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ book_ids: selectedBooks })
        });
        alert("Selected books deleted successfully!");
        fetchBooks();
    } catch (error) {
        console.error("🚨 Error deleting books:", error);
    }
}

// ✅ Delete a Single Book
async function deleteBook(bookId) {
    console.log(`🗑️ Deleting book ID: ${bookId}`);

    const token = sessionStorage.getItem("access_token");
    if (!token) {
        alert("Access Denied! Please log in.");
        window.location.href = "/project/adminlogin-page/";
        return;
    }

    if (!confirm("Are you sure you want to delete this book?")) {
        return;
    }

    try {
        const response = await fetch(`/project/books/${bookId}/delete/`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        const result = await response.json();
        if (response.ok) {
            alert(result.message);
            fetchBooks(); // 🔥 Refresh the book list
        } else {
            alert(`🚨 Error: ${result.error}`);
        }
    } catch (error) {
        console.error("🚨 Error deleting book:", error);
    }
}

// ✅ Show Add Book Modal
function showAddBookModal() {
    document.getElementById("add-book-modal").classList.remove("hidden");
}

// ✅ Close Add Book Modal
function closeAddBookModal() {
    document.getElementById("add-book-modal").classList.add("hidden");
}

// ✅ Show Update Book Modal
function showUpdateBookModal(bookId, title, author, isbn, status, published_date) {
    document.getElementById("update-book-id").value = bookId;
    document.getElementById("update-title").value = title;
    document.getElementById("update-author").value = author;
    document.getElementById("update-isbn").value = isbn;
    document.getElementById("update-status").value = status;
    document.getElementById("update-published_date").value = published_date;
    document.getElementById("update-book-modal").classList.remove("hidden");
}

// ✅ Close Update Book Modal
function closeUpdateBookModal() {
    document.getElementById("update-book-modal").classList.add("hidden");
}

// ✅ Add Book
async function addBook(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        await fetch("/project/books/add/", {
            method: "POST",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert("📚 Book added successfully!");
        closeAddBookModal();
        fetchBooks();
    } catch (error) {
        console.error("🚨 Error adding book:", error);
    }
}

// ✅ Update Book
async function updateBook(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");
    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const bookId = data.id;

    try {
        await fetch(`/project/books/${bookId}/update/`, {
            method: "PUT",
            headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json" },
            body: JSON.stringify(data)
        });
        alert("📘 Book updated successfully!");
        closeUpdateBookModal();
        fetchBooks();
    } catch (error) {
        console.error("🚨 Error updating book:", error);
    }
}

// ✅ Download Books
function downloadFile(type) {
    window.location.href = type === "pdf" ? "/project/export-books-pdf/" : "/project/export-books-excel/";
}

// ✅ Show Download Options
function toggleDownloadOptions() {
    document.getElementById("download-options").classList.toggle("hidden");
}
function exportBooks() {
    console.log("📥 Exporting books as Excel...");

    const link = document.createElement("a");
    link.href = "/project/export-books-excel/";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Books Excel exported successfully!");
}

function exportBooksAsPDF() {
    console.log("📥 Exporting books as PDF...");

    const link = document.createElement("a");
    link.href = "/project/export-books-pdf/";
    link.target = "_blank";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    console.log("✅ Books PDF exported successfully!");
}
