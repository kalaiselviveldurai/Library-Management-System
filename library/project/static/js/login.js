document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("loginForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        let username = document.getElementById("username").value;
        let password = document.getElementById("password").value;
        let csrftoken = getCSRFToken();

        try {
            let response = await fetch("/project/login/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken
                },
                body: JSON.stringify({ username, password })
            });

            let data = await response.json();
            let messageElement = document.getElementById("message");

            if (!messageElement) return;

            if (response.ok) {
                messageElement.innerText = "✅ User logged in successfully!";
                messageElement.style.color = "green";


                console.log("📌 Storing Token:", data.tokens);

                if (data.tokens && data.tokens.access_token) {
                    sessionStorage.setItem("access_token", data.tokens.access_token);
                    localStorage.setItem("access_token", data.tokens.access_token); // Optional
                }

                console.log("✅ Stored Session Token:", sessionStorage.getItem("access_token")); // Debug

                if (data.redirect_to) {
                    window.location.href = data.redirect_to;
                } else {
                    setTimeout(() => {
                        window.location.href = "/project/user-dashboard/";
                    }, 2000);
                }
            } else {
                messageElement.innerText = "❌ Login failed: " + (data.error || JSON.stringify(data));
                messageElement.style.color = "red";
            }
        } catch (error) {
            console.error("⚠️ Error:", error);
            document.getElementById("message").innerText = "❌ Error: Server response is not JSON!";
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
