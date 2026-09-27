async function loadTransactions() {
    const token = localStorage.getItem("token");

    const response = await fetch("/transactions", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    if (!response.ok) {
        window.location.href = "/login"
        return;
    }

    const transactions = await response.json();

    const listDiv = document.getElementById("transactionsList");
    listDiv.innerHTML = "";

    transactions.forEach(function(t) {
        const item = document.createElement("p");
        item.textContent = `${t.date} — ${t.type} — ${t.amount}`;
        listDiv.appendChild(item);
    });
}

loadTransactions();
