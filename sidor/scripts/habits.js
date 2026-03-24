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
                    <p class="card-text">${habit.description ?? ""}</p>
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

        if (response.ok) {
            alert("Habit logged!")
        } else {
            alert("Could not log habit")
        }
    } catch (error) {
        console.error("Could not create log:", error)
    }
}

async function deleteHabit(habitId) {
    try {
        const response = await fetch(`/api/habits/${habitId}`, {
            method: "DELETE"
        })

        if (response.ok) {
            loadHabits()
        } else {
            alert("Could not delete habit")
        }
    } catch (error) {
        console.error("Could not delete habit:", error)
    }
}

document.getElementById("habit-form").addEventListener("submit", async (e) => {
    e.preventDefault()

    const title = document.getElementById("title").value
    const description = document.getElementById("description").value

    try {
        const response = await fetch("/api/habits", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                user_id: 1,
                frequency_id: 1,
                title,
                description,
                is_active: true
            })
        })

        if (response.ok) {
            document.getElementById("habit-form").reset()
            loadHabits()
        } else {
            alert("Could not create habit")
        }
    } catch (error) {
        console.error("Could not create habit:", error)
    }
})

loadHabits()
