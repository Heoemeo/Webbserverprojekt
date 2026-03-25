async function loadHabits() {
    try {
        const response = await fetch("/api/habits")
        const habits = await response.json()

        const habitList = document.getElementById("habit-list")
        habitList.innerHTML = ""

        habits.forEach((habit) => {
            const card = document.createElement("div")
            card.className = "card text-center"

            card.innerHTML = `
             <div class="card-header">Habit</div>
             <div class="card-body">
                 <h5 class="card-title">${habit.title}</h5>
                 <p class="card-text">${habit.description ?? "No description"}</p>
                 <div class="d-flex justify-content-center gap-2 mt-auto">
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

document.getElementById("habit-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const title = document.getElementById("title").value.trim()
    const description = document.getElementById("description").value.trim()

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
                is_active: true
            })
        })

        const data = await response.json()

        if (response.ok) {
            document.getElementById("habit-form").reset()
            loadHabits()
        } else {
            alert(data.message || "Could not create habit")
        }
    } catch (error) {
        console.error("Could not create habit:", error)
        alert("Server error while creating habit")
    }
})

loadHabits()
