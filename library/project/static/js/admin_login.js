document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("adminLoginForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        let username = document.getElementById("username").value.trim();
        let password = document.getElementById("password").value.trim();

        try {
            let response = await fetch("/project/adminlogin/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ username, password })
            });

            let data = await response.json();
            let messageElement = document.getElementById("message");

            if (response.ok) {
                messageElement.innerText = "✅ Login successful. Redirecting...";
                messageElement.style.color = "green";


                sessionStorage.setItem("access_token", data.access);
                sessionStorage.setItem("refresh_token", data.refresh);

                setTimeout(() => {
                    window.location.href = "/project/admin_dashboard/";
                }, 2000);
            } else {
                messageElement.innerText = "❌ " + (data.detail || "Invalid credentials");
                messageElement.style.color = "red";
            }
        } catch (error) {
            document.getElementById("message").innerText = "❌ Server error! Try again.";
            document.getElementById("message").style.color = "red";
        }
    });
});
