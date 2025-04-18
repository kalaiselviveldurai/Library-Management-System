document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("changepasswordForm").addEventListener("submit", async function (event) {
        event.preventDefault();

        let old_password = document.getElementById("old_password").value.trim();
        let new_password = document.getElementById("new_password").value.trim();
        let messageElement = document.getElementById("message");
        let csrftoken = getCSRFToken();
        let accessToken = localStorage.getItem("access_token");

        if (!messageElement) return;

        if (!old_password || !new_password) {
            messageElement.innerText = "❌ Both fields are required.";
            messageElement.style.color = "red";
            return;
        }

        try {
            let response = await fetch("/project/changepassword/", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "X-CSRFToken": csrftoken,
                    "Authorization": `Bearer ${accessToken}`
                },
                body: JSON.stringify({
                    old_password: old_password,
                    new_password: new_password
                })
            });

            let data = await response.json();

            if (response.ok) {
                messageElement.innerText = "✅ Password updated successfully. Redirecting to login...";
                messageElement.style.color = "green";

                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");

                setTimeout(() => {
                    window.location.href = "/project/login-page/";
                }, 2000);
            } else {
                messageElement.innerText = "❌ " + (data.error || "Failed to change password.");
                messageElement.style.color = "red";
            }
        } catch (error) {
            messageElement.innerText = "❌ Error: Unable to reach server.";
            messageElement.style.color = "red";
        }
    });
});

function getCSRFToken() {
    let csrfToken = document.querySelector("[name=csrfmiddlewaretoken]")?.value;
    if (!csrfToken) {
        let cookies = document.cookie.split(";");
        for (let cookie of cookies) {
            cookie = cookie.trim();
            if (cookie.startsWith("csrftoken=")) {
                return cookie.substring("csrftoken=".length);
            }
        }
    }
    return csrfToken;
}
