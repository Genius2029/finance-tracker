document.getElementById("loginForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const email = document.getElementById("emailInput").value;
    const password = document.getElementById("passwordInput").value;

    const response = await fetch(`/login?email=${email}&password=${password}`, {
        method: "POST"
    });

    if (response.ok) {
        const data = await response.json();
        localStorage.setItem("token", data.access_token);
        window.location.href = "/dashboard";
    } else {
        alert("Invalid email or password")
    }
});
