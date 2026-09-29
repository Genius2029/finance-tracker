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

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async function() {
            await fetch(`/transactions/${t.id}`, {
                method: "DELETE",
                headers: {
                    "Authorization": `Bearer ${token}`
                }
            });
            loadTransactions();
        });
        item.appendChild(deleteButton);
        listDiv.appendChild(item);
    });
}

async function loadCategories() {
    const response = await fetch("/categories");
    const categories = await response.json();

    const select = document.getElementById("categoryInput");
    categories.forEach(function(c) {
        const option = document.createElement("option");
        option.value = c.id;
        option.textContent = c.name;
        select.appendChild(option);
    });
}

document.getElementById("addTransactionForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const token = localStorage.getItem("token");
    const categoryId = document.getElementById("categoryInput").value;

    const response = await fetch(`/transactions?category_id=${categoryId}`, {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            amount: parseFloat(document.getElementById("amountInput").value),
            type: document.getElementById("typeInput").value,
            date: document.getElementById("dateInput").value,
            description: document.getElementById("descriptionInput").value
        })
    });

    if (response.ok) {
        document.getElementById("addTransactionForm").reset();
        loadTransactions();
    } else {
        alert("Error adding transaction");
    }
});

document.getElementById("addCategoryForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const name = document.getElementById("categoryNameInput").value;

    const response = await fetch("/categories", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ name: name })
    });

    if (response.ok) {
        document.getElementById("addCategoryForm").reset();
        document.getElementById("categoryInput").innerHTML = "";
        loadCategories();
    } else {
        alert("Error adding category");
    }
});

loadCategories();
loadTransactions();
