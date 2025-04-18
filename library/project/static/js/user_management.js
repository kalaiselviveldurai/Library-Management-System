document.addEventListener("DOMContentLoaded", function () {
    document.getElementById("registerUserForm").addEventListener("submit", registerUser);
    document.getElementById("updateUserForm").addEventListener("submit", updateUser);
    closeRegisterModal();
    closeUpdateModal();
});

function showRegisterModal() {
    document.getElementById("register-user-modal").classList.remove("hidden");
}

function closeRegisterModal() {
    document.getElementById("register-user-modal").classList.add("hidden");
}

function showUpdateModal(userId, username, email, firstName, lastName) {
    document.getElementById("update-user-id").value = userId;
    document.getElementById("update-username").value = username;
    document.getElementById("update-email").value = email;
    document.getElementById("update-firstname").value = firstName;  // ✅ Fix
    document.getElementById("update-lastname").value = lastName;  // ✅ Fix
    document.getElementById("update-user-modal").classList.remove("hidden");
}

function closeUpdateModal() {
    document.getElementById("update-user-modal").classList.add("hidden");
}


async function registerUser(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        alert("Access Denied: You must log in first.");
        window.location.href = "/project/adminlogin-page/";
        return;
    }

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());

    try {
        const response = await fetch("/project/register/", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();
        if (response.ok) {
            alert("✅ User registered successfully!");
            closeRegisterModal();
            fetchUsers();
        } else {
            alert(`❌ Error: ${result.detail || JSON.stringify(result)}`);
        }
    } catch (error) {
        console.error("Error:", error);
        alert(`Error: ${error.message}`);
    }
}


async function fetchUsers(query = "") {
    const token = sessionStorage.getItem("access_token");

    if (!token) {
        alert("You are not logged in! Redirecting to login...");
        window.location.href = "/project/adminlogin-page/";
        return;
    }

    let url = "/project/users/";
    if (query) {
        url += `?search=${encodeURIComponent(query)}`;  // ✅ Encode search term
    }

    try {
        const response = await fetch(url, {
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (!response.ok) {
            if (response.status === 403) {
                alert("⚠️ Access denied! Please login again.");
                window.location.href = "/project/adminlogin-page/";
                return;
            }
            throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        displayUsers(data);
    } catch (error) {
        console.error("⚠️ Error fetching users:", error);
        alert("❌ Error fetching users!");
    }
}


function searchUsers() {
    const query = document.getElementById("search-user").value.trim();
    fetchUsers(query);
}


function displayUsers(users) {
    const userTableBody = document.getElementById("user-table-body");
    userTableBody.innerHTML = "";

    users.forEach(user => {
        const row = userTableBody.insertRow();
        row.insertCell().textContent = user.id;
        row.insertCell().textContent = user.username;
        row.insertCell().textContent = user.email;
        row.insertCell().textContent = user.first_name;
        row.insertCell().textContent = user.last_name;

        const actionsCell = row.insertCell();
        actionsCell.innerHTML = `
            <span class="material-icons-outlined edit-icon"
                onclick="showUpdateModal(${user.id}, '${user.username}', '${user.email}', '${user.first_name}', '${user.last_name}')">
                edit
            </span>
            <span class="material-icons-outlined delete-icon" onclick="deleteUser(${user.id})">
                delete
            </span>
        `;
    });

    document.getElementById("user-list").classList.remove("hidden");
}


async function updateUser(event) {
    event.preventDefault();
    const token = sessionStorage.getItem("access_token");

    const formData = new FormData(event.target);
    const data = Object.fromEntries(formData.entries());
    const userId = data.id;

    try {
        const response = await fetch(`/project/updateuser/${userId}/`, {
            method: "PUT",
            headers: {
                "Authorization": `Bearer ${token}`,
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            alert("✅ User updated successfully!");
            closeUpdateModal();
            fetchUsers();
        } else {
            alert("❌ Error updating user.");
        }
    } catch (error) {
        console.error("Error updating user:", error);
    }
}


async function deleteUser(userId) {
    const token = sessionStorage.getItem("access_token");

    if (!confirm("Are you sure you want to delete this user?")) {
        return;
    }

    try {
        const response = await fetch(`/project/deleteuser/${userId}/`, {
            method: "DELETE",
            headers: { "Authorization": `Bearer ${token}` }
        });

        if (response.ok) {
            alert("✅ User deleted successfully!");
            fetchUsers();
        } else {
            alert("❌ Error deleting user.");
        }
    } catch (error) {
        console.error("Error deleting user:", error);
    }
}
