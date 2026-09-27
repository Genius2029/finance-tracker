document.getElementById("registerForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;
    const fullname = document.getElementById("fullNameInput").value;
    const password = document.getElementById("passwordInput").value;

    try {
        const response = await fetch("/register", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                email: email,
                full_name: fullname, 
                password: password
            })
        });

        if (response.ok) {
            window.location.href = "/login";
        } else {
            alert("Error register");
        }
    } catch (error) {
        console.error("Network or server error:", error);
        alert("Could not connect to the server");
    }
});