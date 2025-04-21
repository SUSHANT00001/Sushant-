document.addEventListener("DOMContentLoaded", () => {
    const loginForm = document.getElementById("loginForm");
    const signupForm = document.getElementById("signupForm");
    const loginBox = document.getElementById("loginBox");
    const signupBox = document.getElementById("signupBox");
    const showSignupLink = document.getElementById("showSignup");
    const showLoginLink = document.getElementById("showLogin");

    // Function to clear all form fields
    function clearFormFields() {
        // Clear login form
        document.getElementById("loginEmail").value = "";
        document.getElementById("loginPassword").value = "";
        
        // Clear signup form
        document.getElementById("signupName").value = "";
        document.getElementById("signupEmail").value = "";
        document.getElementById("signupPassword").value = "";
        document.getElementById("signupConfirmPassword").value = "";
        document.getElementById("storeName").value = "";
    }

    // Clear form fields when page loads
    clearFormFields();

    // Show loading indicator
    const loadingIndicator = document.createElement("div");
    loadingIndicator.className = "loading";
    document.body.appendChild(loadingIndicator);

    // Function to show loading
    function showLoading() {
        loadingIndicator.style.display = "block";
    }

    // Function to hide loading
    function hideLoading() {
        loadingIndicator.style.display = "none";
    }

    // Function to show toast notification
    function showToast(message, isError = false) {
        const toast = document.createElement("div");
        toast.className = "toast";
        toast.textContent = message;
        toast.style.background = isError ? "#dc3545" : "#28a745";
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Function to hash password (simple implementation)
    function hashPassword(password) {
        return btoa(password); // In production, use a proper hashing algorithm
    }

    // Function to validate email
    function validateEmail(email) {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    }

    // Function to validate password
    function validatePassword(password) {
        return password.length >= 6;
    }

    // Switch between login and signup forms
    showSignupLink.addEventListener("click", (e) => {
        e.preventDefault();
        loginBox.style.display = "none";
        signupBox.style.display = "block";
        clearFormFields(); // Clear fields when switching forms
    });

    showLoginLink.addEventListener("click", (e) => {
        e.preventDefault();
        signupBox.style.display = "none";
        loginBox.style.display = "block";
        clearFormFields(); // Clear fields when switching forms
    });

    // Handle signup
    signupForm.addEventListener("submit", (e) => {
        e.preventDefault();
        showLoading();

        const name = document.getElementById("signupName").value.trim();
        const email = document.getElementById("signupEmail").value.trim();
        const password = document.getElementById("signupPassword").value;
        const confirmPassword = document.getElementById("signupConfirmPassword").value;
        const storeName = document.getElementById("storeName").value.trim();

        // Validate inputs
        if (!name || !email || !password || !confirmPassword || !storeName) {
            hideLoading();
            showToast("Please fill in all fields", true);
            return;
        }

        if (!validateEmail(email)) {
            hideLoading();
            showToast("Please enter a valid email address", true);
            return;
        }

        if (!validatePassword(password)) {
            hideLoading();
            showToast("Password must be at least 6 characters long", true);
            return;
        }

        if (password !== confirmPassword) {
            hideLoading();
            showToast("Passwords do not match", true);
            return;
        }

        // Check if user already exists
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        if (users.some(user => user.email === email)) {
            hideLoading();
            showToast("Email already registered", true);
            return;
        }

        // Create new user
        const newUser = {
            id: Date.now().toString(),
            name,
            email,
            password: hashPassword(password),
            storeName,
            inventory: []
        };

        // Save user
        users.push(newUser);
        localStorage.setItem("users", JSON.stringify(users));
        localStorage.setItem("currentUser", JSON.stringify(newUser));

        hideLoading();
        showToast("Account created successfully!");
        
        // Redirect to inventory page after 1 second
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    });

    // Handle login
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        showLoading();

        const email = document.getElementById("loginEmail").value.trim();
        const password = document.getElementById("loginPassword").value;

        // Validate inputs
        if (!email || !password) {
            hideLoading();
            showToast("Please fill in all fields", true);
            return;
        }

        // Check credentials
        const users = JSON.parse(localStorage.getItem("users") || "[]");
        const user = users.find(u => u.email === email && u.password === hashPassword(password));

        if (!user) {
            hideLoading();
            showToast("Invalid email or password", true);
            return;
        }

        // Save current user
        localStorage.setItem("currentUser", JSON.stringify(user));

        hideLoading();
        showToast("Login successful!");
        
        // Redirect to inventory page after 1 second
        setTimeout(() => {
            window.location.href = "index.html";
        }, 1000);
    });

    // Check if user is already logged in
    const currentUser = JSON.parse(localStorage.getItem("currentUser") || "null");
    if (currentUser) {
        window.location.href = "index.html";
    }
}); 