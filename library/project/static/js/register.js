document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("registerForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        let username = document.getElementById("username").value.trim();
        let email = document.getElementById("email").value.trim();
        let first_name = document.getElementById("first_name").value.trim();
        let last_name = document.getElementById("last_name").value.trim();
        let csrftoken = getCSRFToken();
        let accessToken = localStorage.getItem("access_token");

        let headers = {
            "Content-Type": "application/json",
            "X-CSRFToken": csrftoken
        };

        if (accessToken) {
            headers["Authorization"] = `Bearer ${accessToken}`;
        } else {
            document.getElementById("message").innerText = "❌ Unauthorized! Please log in as admin.";
            document.getElementById("message").style.color = "red";
            return;
        }

        try {
            let response = await fetch("/project/register/", {
                method: "POST",
                headers: headers,
                body: JSON.stringify({
                    username: username,
                    email: email,
                    first_name: first_name,
                    last_name: last_name
                })
            });

            let data = await response.json();
            let messageElement = document.getElementById("message");

            if (!messageElement) return;

            if (response.ok) {
                messageElement.innerText = "✅ User registered successfully! Email sent.";
                messageElement.style.color = "green";
            } else {
                messageElement.innerText = "❌ Registration failed: " + (data.email ? data.email[0] : JSON.stringify(data));
                messageElement.style.color = "red";
            }
        } catch (error) {
            document.getElementById("message").innerText = "❌ Error: Server is unreachable.";
            document.getElementById("message").style.color = "red";
        }
    });
});

function getCSRFToken() {
    let cookieValue = null;
    if (document.cookie && document.cookie !== "") {
        let cookies = document.cookie.split(";");
        for (let i = 0; i < cookies.length; i++) {
            let cookie = cookies[i].trim();
            if (cookie.startsWith("csrftoken=")) {
                cookieValue = cookie.substring("csrftoken=".length, cookie.length);
                break;
            }
        }
    }
    return cookieValue;
}
