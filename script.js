
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

// Set the minimum membership start date to today
const today = new Date();
const year = today.getFullYear();
const month = String(today.getMonth() + 1).padStart(2, "0");
const day = String(today.getDate()).padStart(2, "0");

startDate.min = `${year}-${month}-${day}`;

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

closeMessage.addEventListener("click", hideMessage);

// Clear message when the user changes the form
form.addEventListener("input", hideMessage);
form.addEventListener("change", hideMessage);

// Submit registration to Node.js backend
form.addEventListener("submit", async function (event) {
    event.preventDefault();

    hideMessage();

    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const mobile = phoneInput.value.trim();

    if (!/^\d{10}$/.test(mobile)) {
        showMessage(
            "Mobile number must contain exactly 10 digits.",
            "error"
        );
        phoneInput.focus();
        return;
    }

    const formData = new FormData(form);
    const registrationData = Object.fromEntries(formData.entries());

    registerButton.disabled = true;
    registerButton.textContent = "Submitting...";

    try {
        const response = await fetch("https://fitlife-gym-y0qg.onrender.com/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();

        if (!response.ok) {
            const errorText = Array.isArray(result.errors)
                ? result.errors.join(" ")
                : result.message || "Please check your details and try again.";

            showMessage(errorText, "error");
            return;
        }

        showMessage(
            result.message || "Registration completed successfully!",
            "success"
        );

        form.reset();

        // Restore today's minimum date after resetting the form
        startDate.min = `${year}-${month}-${day}`;

    } catch (error) {
        showMessage(
            "Unable to connect to the server. Please try again.",
            "error"
        );

        console.error("Registration error:", error);

    } finally {
        registerButton.disabled = false;
        registerButton.innerHTML =
            'Complete Registration <span>→</span>';
    }
});
