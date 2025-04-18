async function loadUserDashboardData() {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        alert("User not authenticated! Redirecting to login...");
        window.location.href = "/project/login-page/";
        return;
    }

    try {
        const response = await fetch("/project/user-dashboard-data/", {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("User Dashboard Data:", data);

        document.getElementById("total-books").innerText = data.total_books;
        document.getElementById("borrowed-books").innerText = data.borrowed_books;
        document.getElementById("returned-books").innerText = data.returned_books;

    } catch (error) {
        console.error("Error loading user dashboard data:", error);
    }
}

document.addEventListener("DOMContentLoaded", function () {
    setTimeout(loadUserDashboardData, 1000);
});
