async function borrowBook(bookId) {
    console.log(`📢 Borrowing book with ID: ${bookId}`);

    const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");
    if (!token) {
        console.error("⛔ No access token found! User must log in.");
        alert("Session expired! Please log in again.");
        window.location.href = "/project/login-page/";
        return;
    }


    let dueDate = prompt("📅 Enter due date (YYYY-MM-DDTHH):", "2025-03-01T00");


    if (!dueDate || !/^(\d{4})-(\d{2})-(\d{2})T(\d{2})$/.test(dueDate)) {
        alert("⚠️ Invalid date format! Use YYYY-MM-DDTHH.");
        return;
    }

    const requestBody = {
        book: bookId,
        due_date: dueDate
    };

    console.log("📡 Sending Data:", JSON.stringify(requestBody, null, 2));

    try {
        const response = await fetch(`/project/borrow/${bookId}/`, {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.json();
            console.error(`❌ Borrow request failed. Status: ${response.status}`, errorData);
            alert(`⚠️ Failed to borrow book: ${errorData.detail || "Unknown error"}`);
            return;
        }

        alert("✅ Book borrowed successfully!");
        fetchAvailableBooksForBorrow();
    } catch (error) {
        console.error("⚠️ Error borrowing book:", error);
        alert("⚠️ Error processing request.");
    }
}

async function fetchAvailableBooksForBorrow() {
    console.log("📢 Fetching available books for borrowing...");

    const token = localStorage.getItem("access_token");
    if (!token) {
        console.error("⛔ No access token found! User must log in.");
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

        let books = await response.json();
        console.log("📚 All Books:", books);


        let availableBooks = books.filter(book => book.status.toLowerCase() === "available");

        if (availableBooks.length === 0) {
            alert("⚠️ No available books for borrowing!");
            return;
        }

        displayBorrowBooks(availableBooks);
    } catch (error) {
        console.error("⚠️ Error fetching available books for borrowing:", error);
    }
}


function displayBorrowBooks(books) {
    const bookTableBody = document.getElementById("borrow-book-table-body");
    const borrowList = document.getElementById("user-borrow");

    if (!bookTableBody || !borrowList) {
        console.error("⛔ ERROR: Borrow books table or section not found in the DOM!");
        return;
    }

    bookTableBody.innerHTML = ""; // Clear previous data

    books.forEach(book => {
        const row = bookTableBody.insertRow();
        row.insertCell().textContent = book.id;
        row.insertCell().textContent = book.title;
        row.insertCell().textContent = book.author;
        row.insertCell().textContent = book.isbn;
        row.insertCell().textContent = book.status;

        const borrowCell = row.insertCell();
        borrowCell.innerHTML = `<button onclick="borrowBook(${book.id})">Borrow</button>`;
    });

    borrowList.classList.remove("hidden");
}
