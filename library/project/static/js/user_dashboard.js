document.addEventListener("DOMContentLoaded", function () {
    const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");

    if (!token) {
        alert("User not authenticated! Redirecting to login...");
        window.location.href = "/project/login-page/";
        return;
    }

    console.log("🔍 Stored Token:", token);

    fetchDashboardData();
});

async function fetchDashboardData() {
    const token = sessionStorage.getItem("access_token") || localStorage.getItem("access_token");

    if (!token) {
        alert("❌ Access Denied! Please log in again.");
        window.location.href = "/project/login-page/";
        return;
    }

    console.log("📡 Token Sent:", token);

    try {
        const response = await fetch("/project/user-dashboard-data/", {
            method: "GET",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            }
        });

        console.log("📡 Response Status:", response.status);

        if (response.status === 403) {
            alert("⚠️ Forbidden! You don't have permission to access this data.");
            return;
        }

        if (response.status === 401) {
            alert("⚠️ Unauthorized! Please log in again.");
            window.location.href = "/project/login-page/";
            return;
        }

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("📊 Dashboard Data:", data);

        document.getElementById("total-books").innerText = data.total_books;
        document.getElementById("borrowed-books").innerText = data.borrowed_books;
        document.getElementById("returned-books").innerText = data.returned_books;

    } catch (error) {
        console.error("⚠️ Error fetching dashboard data:", error);
    }
}


function logoutUser() {
    console.log("🚪 Logging out...");
    sessionStorage.removeItem("access_token");
    localStorage.removeItem("access_token");
    window.location.href = "/project/login-page/";
}

function showSection(sectionId) {
    console.log(`📢 Trying to show section: ${sectionId}`);


    const sections = document.querySelectorAll("main > div");
    sections.forEach(section => section.classList.add("hidden"));


    const selectedSection = document.getElementById(sectionId);

    if (!selectedSection) {
        console.error(`⛔ ERROR: Section with ID "${sectionId}" not found!`);
        return;
    }

    selectedSection.classList.remove("hidden");
    console.log(`✅ Section "${sectionId}" is now visible.`);


    if (sectionId === "user-books") {
        fetchBooks();
    }
    if (sectionId === "user-books") {
        fetchBooks();
    } else if (sectionId === "user-borrow") {
        fetchAvailableBooksForBorrow();
    }
}


