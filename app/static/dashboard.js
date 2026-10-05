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
        const dateObj = new Date(t.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: '2-digit', 
            month: 'numeric', 
            day: 'numeric',
            timeZone: 'Asia/Seoul' 
        });

        const formattedTime = dateObj.toLocaleTimeString('en-US', { 
            hour: 'numeric', 
            minute: '2-digit', 
            hour12: true,
            timeZone: 'Asia/Seoul' 
        });

        item.textContent = `${formattedDate} ${formattedTime} — ${t.type} — ${t.amount} — ${t.description}`;

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
            loadSummary();
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
        loadSummary();
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

async function loadSummary() {
    const token = localStorage.getItem("token");

    const response = await fetch("/transactions/summary", {
        method: "GET",
        headers: {
            "Authorization": `Bearer ${token}`
        }
    });

    const summary = await response.json();

    const categoriesResponse = await fetch("/categories");
    const categories = await categoriesResponse.json();

    const summaryDiv = document.getElementById("summaryList");
    summaryDiv.innerHTML = "";

    summary.forEach(function(row) {
        const category = categories.find(function(c) {
            return c.id === row.category_id;
        });
        const categoryName = category ? category.name : "Unknown";

        const item = document.createElement("p");
        item.textContent = `${categoryName} (${row.type}): ${row.total}`;
        summaryDiv.appendChild(item);
    });
}

loadCategories();
loadTransactions();
loadSummary();