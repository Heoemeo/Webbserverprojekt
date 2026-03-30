// Bas-URL till backend API
const API_BASE = "http://localhost:3000/api"

// Här sparar vi metadata från backend
// frequencies = t.ex. Dagligen, Veckovis
// categories = t.ex. Health, Study
let habitMeta = {
    frequencies: [],
    categories: []
}




// Hanterar login + logout knappar
function setupAuthButtons() {
    const loginBtn = document.getElementById("login-btn")
    const logoutBtn = document.getElementById("logout-btn")

    if (loginBtn) {
        loginBtn.onclick = () => {
            window.location.href = "/profile.html"
        }
    }

    if (logoutBtn) {
        logoutBtn.onclick = () => {
            localStorage.removeItem("token")
            window.location.href = "/profile.html"
        }
    }
}


// LOAD HABIT META

// Hämtar categories och frequencies från backend
async function loadHabitMeta() {
    try {
        // Request till /api/habits/meta
        const response = await fetch(`${API_BASE}/habits/meta`)

        // Om något gick fel
        if (!response.ok) {
            throw new Error("Could not fetch metadata")
        }

        // Sparar svaret
        habitMeta = await response.json()

        // Fyller frequency-dropdown
        renderFrequencyOptions()

        // Fyller category-checkboxar
        renderCategoryOptions()
    } catch (error) {
        console.error("Could not load habit metadata:", error)
    }
}


// RENDER FREQUENCY OPTIONS

// Renderar alternativ i select-menyn för frequency
function renderFrequencyOptions() {
    const frequencySelect = document.getElementById("frequency")

    // Säkerhetskontroll
    if (!frequencySelect) {
        return
    }

    // Startvärde
    frequencySelect.innerHTML = `
        <option value="">Choose frequency</option>
    `

    // Lägg till ett option-element per frequency
    habitMeta.frequencies.forEach((frequency) => {
        const option = document.createElement("option")
        option.value = frequency.id
        option.textContent = frequency.name
        frequencySelect.appendChild(option)
    })
}


// RENDER CATEGORY OPTIONS

// Renderar checkboxar för kategorier
function renderCategoryOptions() {
    const categoriesContainer = document.getElementById("categories-container")

    // Säkerhetskontroll
    if (!categoriesContainer) {
        return
    }

    // Töm containern först
    categoriesContainer.innerHTML = ""

    // Skapa checkbox för varje kategori
    habitMeta.categories.forEach((category) => {
        const wrapper = document.createElement("div")
        wrapper.className = "form-check"

        wrapper.innerHTML = `
            <input
                class="form-check-input"
                type="checkbox"
                value="${category.id}"
                id="category-${category.id}"
            />
            <label class="form-check-label" for="category-${category.id}">
                ${category.name}
            </label>
        `

        categoriesContainer.appendChild(wrapper)
    })
}


// LOAD HABITS

// Hämtar habits och visar bara de som inte startats ännu
async function loadHabits() {
    try {
        // Hämta alla habits
        const habitsResponse = await fetch(`${API_BASE}/habits`)

        if (!habitsResponse.ok) {
            throw new Error("Could not fetch habits")
        }

        const habits = await habitsResponse.json()

        // Hämta token för att kunna läsa loggar
        const token = localStorage.getItem("token")

        // Om ingen token finns kan vi inte filtrera på startade habits
        let logs = []

        if (token) {
            const logsResponse = await fetch(`${API_BASE}/logs`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            // Om log-hämtningen funkar tar vi emot loggarna
            if (logsResponse.ok) {
                logs = await logsResponse.json()
            }
        }

        // Samla alla habit_id som redan har loggar
        const startedHabitIds = new Set(logs.map((log) => log.habit_id))

        // Hämtar containern i HTML
        const habitList = document.getElementById("habit-list")

        if (!habitList) {
            return
        }

        // Töm listan
        habitList.innerHTML = ""

        // Filtrera bort habits som redan startats
        const unstartedHabits = habits.filter(
            (habit) => !startedHabitIds.has(habit.id)
        )

        // Om inga aktiva habits finns kvar
        if (unstartedHabits.length === 0) {
            habitList.innerHTML = "<p>No active habits to start.</p>"
            return
        }

        // Rendera varje aktiv habit som ett kort
        unstartedHabits.forEach((habit) => {
            const card = document.createElement("div")
            card.className = "card text-center mb-3"

            card.innerHTML = `
                <div class="card-header">Habit</div>
                <div class="card-body">
                    <h5 class="card-title">${habit.title}</h5>
                    <p class="card-text mb-2">${habit.description ?? "No description"}</p>
                    <p class="card-text mb-1">
                        <strong>Categories:</strong>
                        ${habit.categories ?? "No categories"}
                    </p>
                    <p class="card-text mb-3">
                        <strong>Frequency:</strong>
                        ${habit.frequency ?? "No frequency"}
                    </p>

                    <div class="d-flex justify-content-center gap-2">
                        <button class="btn btn-primary" onclick="startHabit(${habit.id})">
                            Start Habit
                        </button>

                        <button class="btn btn-danger" onclick="deleteHabit(${habit.id})">
                            Delete Habit
                        </button>
                    </div>
                </div>
            `

            habitList.appendChild(card)
        })
    } catch (error) {
        console.error("Could not load habits:", error)
        alert("Server error while loading habits")
    }
}


// START HABIT

// Startar habiten utan att logga direkt
async function startHabit(habitId) {
    try {
        const token = localStorage.getItem("token")

        if (!token) {
            alert("You must be logged in to start a habit")
            return
        }

        // 🔥 Ingen POST till /logs här längre!

        alert("Habit started!")

        // Ladda om UI så den flyttas till progress
        await loadHabits()
        await loadLogs()

    } catch (error) {
        console.error("Could not start habit:", error)
        alert("Server error while starting habit")
    }
}

// LOG HABIT AGAIN

// Lägger till en ny logg på en redan startad habit
async function logHabitAgain(habitId) {
    try {
        const token = localStorage.getItem("token")

        if (!token) {
            alert("You must be logged in to log a habit")
            return
        }

        // POST till /api/logs igen
        const response = await fetch(`${API_BASE}/logs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                habit_id: habitId,
                date: new Date(),
                completed: true
            })
        })

        const data = await response.json()

        if (response.ok) {
            alert(data.message || "Habit logged!")

            // Ladda om hela UI:t
            await loadHabits()
            await loadLogs()
        } else {
            alert(data.message || "Could not log habit")
        }
    } catch (error) {
        console.error("Could not log habit again:", error)
        alert("Server error while logging habit")
    }
}

// DELETE HABIT

// Tar bort en habit och alla tillhörande loggar
async function deleteHabit(habitId) {
    try {
        const token = localStorage.getItem("token")

        // Ta först bort loggar i MongoDB
        if (token) {
            await fetch(`${API_BASE}/logs/habit/${habitId}`, {
                method: "DELETE",
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })
        }

        // Ta sedan bort habiten i MySQL
        const response = await fetch(`${API_BASE}/habits/${habitId}`, {
            method: "DELETE"
        })

        const data = await response.json()

        if (response.ok) {
            alert(data.message || "Habit deleted")

            // Ladda om båda sektionerna
            await loadHabits()
            await loadLogs()
        } else {
            alert(data.message || "Could not delete habit")
        }
    } catch (error) {
        console.error("Could not delete habit:", error)
        alert("Server error while deleting habit")
    }
}

// AUTH BUTTONS (LOGIN / LOGOUT)
// Den här funktionen kopplar funktionalitet till knapparna
function setupAuthButtons() {

    // Hämtar knapparna från HTML
    const loginBtn = document.getElementById("login-btn")
    const logoutBtn = document.getElementById("logout-btn")

    // Hämtar token från localStorage
    // Om den finns → användaren är inloggad
    const token = localStorage.getItem("token")


    // LOGIN-KNAPP
    if (loginBtn) {
        loginBtn.onclick = () => {
            // Skickar användaren till login-sidan
            window.location.href = "profile.html"
        }
    }

    // LOGOUT-KNAPP
    if (logoutBtn) {
        logoutBtn.onclick = () => {
            // Tar bort token (loggar ut användaren)
            localStorage.removeItem("token")

            // Skickar användaren till login-sidan
            window.location.href = "profile.html"
        }
    }

    // VISUAL LOGIK (VALFRI MEN BRA)
    // Här kan vi styra vad som ska synas

    if (token) {
        // Om användaren är inloggad:
        // Visa logout, göm login
        if (loginBtn) loginBtn.style.display = "none"
        if (logoutBtn) logoutBtn.style.display = "inline-block"
    } else {
        // Om användaren INTE är inloggad:
        // Visa login, göm logout
        if (loginBtn) loginBtn.style.display = "inline-block"
        if (logoutBtn) logoutBtn.style.display = "none"
    }
}


// DELETE HABIT FROM PROGRESS
// Delete-knappen i progress-kortet använder denna funktion
async function deleteHabitProgress(habitId) {
    // Återanvänder deleteHabit
    await deleteHabit(habitId)

    // Laddar om sidan igen
    await loadHabits()
    await loadLogs()
}

// END HABIT

// När målet är nått kan användaren avsluta habiten
async function endHabit(habitId) {
    // Fråga om användaren är säker
    const confirmed = confirm("Are you sure you want to end this habit?")

    if (!confirmed) {
        return
    }

    // Just nu avslutar vi habiten genom att ta bort den
    await deleteHabit(habitId)
    await loadHabits()
    await loadLogs()
}

// LOAD LOGS / PROGRESS

// Hämtar loggar och bygger progress-kort
async function loadLogs() {
    try {
        const token = localStorage.getItem("token")
        const logList = document.getElementById("log-list")

        // Säkerhetskontroller
        if (!logList) {
            console.error("log-list not found")
            return
        }

        if (!token) {
            logList.innerHTML = "<p>You are not logged in.</p>"
            return
        }

        // Hämta alla habits så vi kan visa titel, frequency och target_count
        const habitsResponse = await fetch(`${API_BASE}/habits`)

        if (!habitsResponse.ok) {
            throw new Error("Could not fetch habits")
        }

        const habits = await habitsResponse.json()

        // Skapar en lookup-tabell: habitId -> habit
        const habitsById = {}
        habits.forEach((habit) => {
            habitsById[habit.id] = habit
        })

        // Hämta loggar för inloggad användare
        const logsResponse = await fetch(`${API_BASE}/logs`, {
            headers: {
                Authorization: `Bearer ${token}`
            }
        })

        if (!logsResponse.ok) {
            throw new Error("Could not fetch logs")
        }

        const logs = await logsResponse.json()

        // Töm listan
        logList.innerHTML = ""

        // Om inga loggar finns, visa ändå habits som 0 progress
if (logs.length === 0) {
    // Visa alla habits som progress med 0 logs
    Object.values(habitsById).forEach((habit) => {
        const div = document.createElement("div")
        div.className = "card mb-3"

        div.innerHTML = `
            <div class="card-body">
                <h5 class="card-title">${habit.title}</h5>

                <p><strong>Progress:</strong> 0/${habit.target_count ?? 1}</p>

                <div class="progress mb-3">
                    <div class="progress-bar" style="width: 0%">
                        0/${habit.target_count ?? 1}
                    </div>
                </div>

                <button class="btn btn-primary btn-sm" onclick="logHabitAgain(${habit.id})">
                    Log
                </button>
            </div>
        `

        logList.appendChild(div)
    })

    return
}

        // Gruppera loggar per habit_id
        const groupedLogs = {}

        logs.forEach((log) => {
            if (!groupedLogs[log.habit_id]) {
                groupedLogs[log.habit_id] = []
            }

            groupedLogs[log.habit_id].push(log)
        })

        // Skapa ett progress-kort per habit
        Object.keys(groupedLogs).forEach((habitId) => {
            const habitLogs = groupedLogs[habitId]
            const habit = habitsById[habitId]

            // Om habiten inte hittas använder vi fallback-text
            const habitTitle = habit ? habit.title : `Habit #${habitId}`

            // Målet hämtas från target_count
            const targetCount = habit?.target_count ?? 1

            // Totalt antal loggar för denna habit
            const totalLogs = habitLogs.length

            // Hur många procent av målet som är uppnått
            const progressPercent = Math.min((totalLogs / targetCount) * 100, 100)

            // Målet nått?
            const goalReached = totalLogs >= targetCount

            const div = document.createElement("div")
            div.className = "card mb-3"

            div.innerHTML = `
                <div class="card-body">
                    <h5 class="card-title">${habitTitle}</h5>

                    <p class="mb-1"><strong>Frequency:</strong> ${habit?.frequency ?? "Unknown"}</p>
                    <p class="mb-2"><strong>Progress:</strong> ${totalLogs}/${targetCount}</p>

                    <div class="progress mb-3"
                         role="progressbar"
                         aria-valuemin="0"
                         aria-valuemax="${targetCount}"
                         aria-valuenow="${Math.min(totalLogs, targetCount)}">
                        <div class="progress-bar" style="width: ${progressPercent}%">
                            ${Math.min(totalLogs, targetCount)}/${targetCount}
                        </div>
                    </div>

                    <div class="d-flex gap-2 flex-wrap">
                        <button
                            class="btn btn-primary btn-sm"
                            onclick="logHabitAgain(${habitId})"
                            ${goalReached ? "disabled" : ""}
                        >
                            Log
                        </button>

                        ${
                            goalReached
                                ? `<button class="btn btn-success btn-sm" onclick="endHabit(${habitId})">
                                    End Habit
                                   </button>`
                                : ""
                        }

                        <button
                            class="btn btn-danger btn-sm"
                            onclick="deleteHabitProgress(${habitId})"
                        >
                            Delete
                        </button>
                    </div>
                </div>
            `

            logList.appendChild(div)
        })
    } catch (error) {
        console.error("Could not load progress:", error)

        const logList = document.getElementById("log-list")
        if (logList) {
            logList.innerHTML = "<p>Server error while loading progress.</p>"
        }
    }
}


// CREATE HABIT

// Hanterar formuläret för att skapa en ny habit
async function createHabit(event) {
    event.preventDefault()

    try {
        // Hämta inputfält
        const titleInput = document.getElementById("title")
        const descriptionInput = document.getElementById("description")
        const frequencySelect = document.getElementById("frequency")

        // Hämta markerade kategorier
        const selectedCategoryIds = Array.from(
            document.querySelectorAll('#categories-container input[type="checkbox"]:checked')
        ).map((checkbox) => Number(checkbox.value))

        // Bygg request-body
        const payload = {
            title: titleInput.value,
            description: descriptionInput.value,
            frequency_id: Number(frequencySelect.value),
            category_ids: selectedCategoryIds
        }

        // Skicka POST till /api/habits
        const response = await fetch(`${API_BASE}/habits`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(payload)
        })

        const data = await response.json()

        if (response.ok) {
            alert(data.message || "Habit created successfully")

            // Återställ formuläret
            document.getElementById("habit-form").reset()

            // Ladda om habits och progress
            await loadHabits()
            await loadLogs()
        } else {
            alert(data.message || "Could not create habit")
        }
    } catch (error) {
        console.error("Could not create habit:", error)
        alert("Server error while creating habit")
    }
}

// INIT

// Startar allt när sidan laddas
async function initHabitsPage() {
//hämta knappar för inlogg/utlogg
       setupAuthButtons()

    // Hämta categories och frequencies
    await loadHabitMeta()

    // Hämta habits
    await loadHabits()

    // Hämta progress
    await loadLogs()

    // Koppla formuläret
    const habitForm = document.getElementById("habit-form")
    if (habitForm) {
        habitForm.addEventListener("submit", createHabit)
    }
}

// Kör sidan
initHabitsPage()

/* Footer toggle functionality */
function toggleFooter(btn) {
    const links = btn.nextElementSibling
    const arrow = btn.querySelector('span')
    const isOpen = links.style.display === 'flex'
    links.style.display = isOpen ? 'none' : 'flex'
    arrow.textContent = isOpen ? '▼' : '▲'
}
