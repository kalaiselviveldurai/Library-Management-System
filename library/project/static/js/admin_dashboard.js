async function loadDashboardData() {
    try {
        const response = await fetch("/project/dashboard-data/");
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Dashboard Data:", data);

        const totalUsersEl = document.getElementById("total-users");
        const totalBooksEl = document.getElementById("total-books");
        const totalBorrowersEl = document.getElementById("total-borrowers");
        const totalTransactionsEl = document.getElementById("total-transactions");

        if (totalUsersEl) totalUsersEl.innerText = data.total_users;
        if (totalBooksEl) totalBooksEl.innerText = data.total_books;
        if (totalBorrowersEl) totalBorrowersEl.innerText = data.total_borrowers;
        if (totalTransactionsEl) totalTransactionsEl.innerText = data.total_transactions;

    } catch (error) {
        console.error("Error loading dashboard data:", error);
    }
}

function checkAdminAuthentication() {
    const token = sessionStorage.getItem("access_token");
    if (!token) {
        alert("Admin not authenticated! Redirecting to login...");
        window.location.href = "/project/adminlogin-page/";
    }
}

document.addEventListener("DOMContentLoaded", function () {
    checkAdminAuthentication();
    setTimeout(loadDashboardData, 1000);
});

function showSection(sectionId) {
    console.log(`showSection called with sectionId: ${sectionId}`);

    const sections = document.querySelectorAll('main > div');
    sections.forEach(section => section.classList.add('hidden'));

    const selectedSection = document.getElementById(sectionId);
    if (selectedSection) selectedSection.classList.remove('hidden');
}

function logoutAdmin() {
    sessionStorage.removeItem("access_token");
    window.location.href = "/project/adminlogin-page/";
}
