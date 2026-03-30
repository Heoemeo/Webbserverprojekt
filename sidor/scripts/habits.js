
// GLOBAL DATA (metadata)
// Här sparas data från backend

let habitMeta = {
    frequencies: [],
    categories: []
}

// HÄMTA METADATA
// Hämtar frequencies och categories från backend
async function loadHabitMeta() {
    try {
        const response = await fetch("/api/habits/meta")

        if (!response.ok) {
            throw new Error("Could not fetch metadata")
        }

        // Sparar data i vårt objekt
        habitMeta = await response.json()

        // Renderar UI efter att metadata hämtats
        renderFrequencyOptions()
        renderCategoryOptions()
    } catch (error) {
        console.error("Could not load habit metadata:", error)
    }
}

// FREQUENCY DROPDOWN
// Fyller frequency-dropdownen
function renderFrequencyOptions() {
    const frequencySelect = document.getElementById("frequency")

    // Rensar gamla options först
    frequencySelect.innerHTML = '<option value="">Choose frequency</option>'

    // Loopar igenom alla frequencies
    habitMeta.frequencies.forEach((frequency) => {
        const option = document.createElement("option")

        // value skickas till backend
        option.value = frequency.id

        // textContent visas för användaren
        option.textContent = frequency.name

        frequencySelect.appendChild(option)
    })
}

// CATEGORY DROPDOWN MED CHECKBOXAR
// Skapar checkboxar inuti dropdown-menyn
function renderCategoryOptions() {
    const container = document.getElementById("categories-container")

    // Rensar innehållet först så vi inte får dubletter
    container.innerHTML = ""

    // Loopar igenom alla categories
    habitMeta.categories.forEach((category) => {
        const div = document.createElement("div")
        div.className = "form-check"

        // Skapar en checkbox för varje category
        div.innerHTML = `
            <input
                class="form-check-input category-checkbox"
                type="checkbox"
                value="${category.id}"
                id="cat-${category.id}"
            >
            <label class="form-check-label" for="cat-${category.id}">
                ${category.name}
            </label>
        `

        container.appendChild(div)
    })

    // Lyssnar på checkboxarna så knappens text uppdateras
    document.querySelectorAll(".category-checkbox").forEach((checkbox) => {
        checkbox.addEventListener("change", updateCategoryDropdownLabel)
    })

    // Sätter rätt text direkt
    updateCategoryDropdownLabel()
}

// UPPDATERA TEXTEN PÅ CATEGORY-DROPDOWNEN
// Visar valda categories i knappen
function updateCategoryDropdownLabel() {
    const button = document.getElementById("categoryDropdownButton")

    const selectedLabels = Array.from(
        document.querySelectorAll(".category-checkbox:checked")
    ).map((checkbox) => {
        const label = document.querySelector(`label[for="${checkbox.id}"]`)
        return label ? label.textContent.trim() : ""
    })

    if (selectedLabels.length === 0) {
        button.textContent = "Choose categories"
    } else {
        button.textContent = selectedLabels.join(", ")
    }
}

// ===============================
// HÄMTA OCH VISA HABITS
// ===============================
async function loadHabits() {
    try {
        const response = await fetch("/api/habits")
        const habits = await response.json()

        const habitList = document.getElementById("habit-list")

        // Rensar listan innan nya kort läggs in
        habitList.innerHTML = ""

        habits.forEach((habit) => {
            const card = document.createElement("div")
            card.className = "card text-center mb-3"

            // Skapar kort med title, description, categories och frequency
            card.innerHTML = `
                <div class="card-header">Habit</div>
                <div class="card-body">
                    <h5 class="card-title">${habit.title}</h5>

                    <p class="card-text mb-2">
                        ${habit.description ?? "No description"}
                    </p>

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

// START HABIT (LOGG)
//Skapar en logg när man klickar på Start Habit

async function startHabit(habitId) {
    try {
        const response = await fetch("/api/logs", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
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
        } else {
            alert(data.message || "Could not log habit")
        }
    } catch (error) {
        console.error("Could not create log:", error)
        alert("Server error while logging habit")
    }
}

// DELETE HABIT
// Tar bort en habit
async function deleteHabit(habitId) {
    try {
        const response = await fetch(`/api/habits/${habitId}`, {
            method: "DELETE"
        })

        const data = await response.json()

        if (response.ok) {
            loadHabits()
        } else {
            alert(data.message || "Could not delete habit")
        }
    } catch (error) {
        console.error("Could not delete habit:", error)
        alert("Server error while deleting habit")
    }
}

// CREATE HABIT (FORM)
// Hämtar formulärvärden och skickar till backend
document.getElementById("habit-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    // Hämtar inputvärden
    const title = document.getElementById("title").value.trim()
    const description = document.getElementById("description").value.trim()
    const frequencyId = document.getElementById("frequency").value

    // Hämtar alla ikryssade categories från dropdown-menyn
    const selectedCategories = Array.from(
        document.querySelectorAll("#categories-container input:checked")
    ).map((checkbox) => Number(checkbox.value))

    // Enkel kontroll så title inte är tom
    if (!title) {
        alert("Title is required")
        return
    }

    try {
        const response = await fetch("/api/habits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                title,
                description,
                frequency_id: frequencyId || undefined,
                category_ids: selectedCategories,
                is_active: true
            })
        })

        const data = await response.json()

        if (response.ok) {
            // Rensar formuläret
            document.getElementById("habit-form").reset()

            // Uppdaterar dropdown-knappens text efter reset
            updateCategoryDropdownLabel()

            // Laddar om habits så nya kortet visas direkt
            loadHabits()
        } else {
            alert(data.message || "Could not create habit")
        }
    } catch (error) {
        console.error("Could not create habit:", error)
        alert("Server error while creating habit")
    }
})

// INIT
// Körs när sidan laddas
async function initHabitsPage() {
    await loadHabitMeta()
    await loadHabits()
}

// Startar sidan
initHabitsPage()

/* Footer toggle functionality */
function toggleFooter(btn) {
    const links = btn.nextElementSibling
    const arrow = btn.querySelector('span')
    const isOpen = links.style.display === 'flex'
    links.style.display = isOpen ? 'none' : 'flex'
    arrow.textContent = isOpen ? '▼' : '▲'
}
