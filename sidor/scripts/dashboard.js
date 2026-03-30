const API_BASE = "http://localhost:3000/api"

async function loadProtectedPage() {
    const token = localStorage.getItem("token")

    if (!token) {
        window.location.href = "/profile.html"
        return
    }

    try {
        const response = await fetch(`${API_BASE}/auth/me`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!response.ok) {
            localStorage.removeItem("token")
            window.location.href = "/profile.html"
            return
        }

        const user = await response.json()

        document.getElementById("user-id").textContent = user.id
        document.getElementById("user-name").textContent = user.username
        document.getElementById("user-email").textContent = user.email
    } catch (error) {
        console.error("Could not load protected page:", error)
        window.location.href = "/profile.html"
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById("logout-btn")

    if (!logoutBtn) return

    logoutBtn.addEventListener("click", () => {
        localStorage.removeItem("token")
        window.location.href = "/profile.html"
    })
}

loadProtectedPage()
setupLogout()
