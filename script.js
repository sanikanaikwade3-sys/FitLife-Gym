
const API_BASE_URL = "https://fitlife-gym-y0qg.onrender.com";

const form = document.getElementById("registration-form");
const modal = document.getElementById("registration-modal");

const openButton = document.getElementById("open-form");
const closeButton = document.getElementById("close-form");
const overlay = document.getElementById("modal-overlay");

const message = document.getElementById("message");
const messageText = document.getElementById("message-text");
const closeMessage = document.getElementById("close-message");

const registerButton = document.getElementById("register-button");
const startDate = document.getElementById("startDate");
const phoneInput = document.getElementById("phone");

// Set today's date as the minimum membership start date
function setMinimumDate() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    startDate.min = `${year}-${month}-${day}`;

    return `${year}-${month}-${day}`;
}

let minimumDate = setMinimumDate();

// Allow only digits and a maximum of 10 digits
phoneInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

// Open registration form
function openForm() {
    modal.hidden = false;
    document.body.classList.add("modal-open");

    hideMessage();

    document.getElementById("name").focus();
}

// Close registration form
function closeForm() {
    modal.hidden = true;
    document.body.classList.remove("modal-open");

    openButton.focus();
}

openButton.addEventListener("click", openForm);
closeButton.addEventListener("click", closeForm);
overlay.addEventListener("click", closeForm);

// Close form using Escape key
document.addEventListener("keydown", function (event) {
    if (event.key === "Escape" && !modal.hidden) {
        closeForm();
    }
});

// Display success or error messages
function showMessage(text, type) {
    messageText.textContent = text;
    message.className = "message " + type;
    message.hidden = false;
}

function hideMessage() {
    message.hidden = true;
    messageText.textContent = "";
    message.className = "message";
}

// Close message
closeMessage.addEventListener("click", hideMessage);

// Clear message when the user changes the form
form.addEventListener("input", hideMessage);
form.addEventListener("change", hideMessage);

// Submit registration to the Render backend
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    hideMessage();

    // Check browser-side form validation
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    // Validate mobile number
    const mobile = phoneInput.value.trim();

    if (!/^\d{10}$/.test(mobile)) {
        showMessage(
            "Mobile number must contain exactly 10 digits.",
            "error"
        );

        phoneInput.focus();
        return;
    }

    // Collect form data
    const formData = new FormData(form);
    const registrationData = Object.fromEntries(formData.entries());

    // Disable the button while submitting
    registerButton.disabled = true;
    registerButton.textContent = "Submitting...";

    try {
        // Check that the Render URL has been added
        if (
            API_BASE_URL.includes("YOUR-RENDER-BACKEND-URL") ||
            !API_BASE_URL.startsWith("https://")
        ) {
            throw new Error(
                "Please add your actual Render backend URL in script.js."
            );
        }

        // Send the request to the Render backend
        const response = await fetch(
            `${API_BASE_URL.replace(/\/+$/, "")}/register`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(registrationData)
            }
        );

        // Read the response as text first to avoid JSON parsing errors
        const responseText = await response.text();

        console.log("Backend response status:", response.status);
        console.log("Backend response:", responseText);

        let result;

        try {
            result = JSON.parse(responseText);
        } catch {
            throw new Error(
                `The backend returned an invalid response (HTTP ${response.status}). Check the Render URL, /register route, and Render logs.`
            );
        }

        // Handle unsuccessful responses
        if (!response.ok) {
            const errorText = Array.isArray(result.errors)
                ? result.errors.join(" ")
                : result.message ||
                  "Registration failed. Please check your details.";

            showMessage(errorText, "error");
            return;
        }

        // Display successful registration message
        showMessage(
            result.message ||
                "Registration completed successfully!",
            "success"
        );

        // Reset the form after successful registration
        form.reset();

        minimumDate = setMinimumDate();
        startDate.min = minimumDate;

    } catch (error) {
        console.error("Registration error:", error);

        if (
            error.message.includes("Please add your actual Render")
        ) {
            showMessage(error.message, "error");
        } else if (
            error.message.includes("invalid response")
        ) {
            showMessage(error.message, "error");
        } else {
            showMessage(
                "Unable to connect to the backend. Check your Render URL, backend status, and CORS settings.",
                "error"
            );
        }

    } finally {
        // Enable the button again
        registerButton.disabled = false;
        registerButton.innerHTML =
            'Complete Registration <span>→</span>';
    }
});
