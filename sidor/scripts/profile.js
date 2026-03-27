const API = 'http://localhost:3000/api/auth'
let isLogin = true

const submitBtn = document.getElementById('submit-btn')
const switchBtn = document.getElementById('switch-btn')
const formTitle = document.getElementById('form-title')
const formSubtitle = document.getElementById('form-subtitle')
const usernameGroup = document.getElementById('username-group')
const switchText = document.getElementById('switch-text')
const errorMsg = document.getElementById('error-msg')
const successMsg = document.getElementById('success-msg')

// Toggla mellan login och registrerrar
switchBtn.addEventListener('click', (e) => {
    e.preventDefault()
    isLogin = !isLogin
    errorMsg.textContent = ''
    successMsg.textContent = ''

    if (isLogin) {
        formTitle.textContent = 'Welcome back'
        formSubtitle.textContent = 'Log in to track your habits and progress.'
        submitBtn.textContent = 'Log In'
        switchText.textContent = "Don't have an account?"
        switchBtn.textContent = 'Register'
        usernameGroup.style.display = 'none'
    } else {
        formTitle.textContent = 'Create account'
        formSubtitle.textContent = 'Start tracking your habits today.'
        submitBtn.textContent = 'Register'
        switchText.textContent = 'Already have an account?'
        switchBtn.textContent = 'Log In'
        usernameGroup.style.display = 'block'
    }
})

/* lyssnar på submit-knappen */
submitBtn.addEventListener('click', async () => {
    errorMsg.textContent = ''
    successMsg.textContent = ''

    const email = document.getElementById('email').value
    const password = document.getElementById('password').value
    const username = document.getElementById('username').value

    const url = isLogin ? `${API}/login` : `${API}/register`
    const body = isLogin ? { email, password } : { username, email, password }

    try {
        const res = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body)
        })

        const data = await res.json()

        if (!res.ok) {
            errorMsg.textContent = data.message || 'Something went wrong.'
            return
        }

        if (isLogin) {
            localStorage.setItem('token', data.token)
            successMsg.textContent = 'Logged in successfully!'
        } else {
            successMsg.textContent = 'Account created! You can now log in.'
            switchBtn.click()
        }
    } catch (err) {
        errorMsg.textContent = 'Could not connect to server.'
    }
})
