const token = localStorage.getItem("token");
if (!token) {window.location.href = "/ login";}

async function loadTransactions(startDate, endDate) {

    const token = localStorage.getItem("token");

    let url = "/transactions";
    if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    const response = await fetch(url, {
        method: "GET",
        headers: {"Authorization": `Bearer ${token}`}
    });

    if (!response.ok) {
        window.location.href = "/login"
        return;
    }

    const transactions = await response.json();
    const listDiv = document.getElementById("transactionsList");
    listDiv.innerHTML = "";

    transactions.forEach(function(t) {
        const dateObj = new Date(t.date);
        const formattedDate = dateObj.toLocaleDateString('en-US', { 
            year: '2-digit', 
            month: 'numeric', 
            day: 'numeric',
            timeZone: 'Asia/Seoul' 
        });

        const item = document.createElement("p");
            item.textContent = `${formattedDate} — ${t.type} — ${t.amount} — ${t.description} `;
            
            const editButton = document.createElement("button");
            editButton.textContent = "Edit";
            editButton.addEventListener("click", function() {
                openEditForm(t);
            });

        const deleteButton = document.createElement("button");
        deleteButton.textContent = "Delete";
        deleteButton.addEventListener("click", async function() {
            await fetch(`/transactions/${t.id}`, {
                method: "DELETE",
                headers: { "Authorization": `Bearer ${token}` }
            });
            loadTransactions();
            loadSummary();
            loadChart();
        });

        item.appendChild(editButton);
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

async function openEditForm(t) {
    const newAmount = prompt("New amount:", t.amount);
    if (newAmount === null) return;

    const token = localStorage.getItem("token");

    await fetch(`/transactions/${t.id}?category_id=${t.category_id}`, {
        method: "PATCH",
        headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            amount: parseFloat(newAmount),
            type: t.type,
            date: t.date,
            description: t.description
        })
    });

    loadTransactions();
    loadSummary();
    loadChart();
}

let chartInstance = null;

async function loadChart(startDate, endDate) {
    const token = localStorage.getItem("token");

    let url = "/transactions/chart-data";
    if (startDate && endDate) {
        url += `?start_date=${startDate}&end_date=${endDate}`;
    }

    const response = await fetch(url, {
        headers: { "Authorization": `Bearer ${token}` }
    });
    const data = await response.json();

    const dates = [...new Set(data.map(row => row.date))];
    const expenseData = dates.map(d => {
        const row = data.find(r => r.date === d && r.type === "expense");
        return row ? row.total : 0;
    });

    const ctx = document.getElementById("spendingChart");

    if (chartInstance) chartInstance.destroy();

    chartInstance = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: dates,
            datasets: [{
                label: 'Expenses',
                data: expenseData,
                backgroundColor: '#e5e5e5'
            }]
        },
        options: {
            scales: {
                y: { ticks: { color: '#9ca3af' } },
                x: { ticks: { color: '#9ca3af' } }
            },
            plugins: { legend: { labels: { color: '#f5f5f5' } } }
        }
    });
}

document.getElementById("filterForm").addEventListener("submit", function(event) {
    event.preventDefault();
    const start = document.getElementById("filterStartDate").value;
    const end = document.getElementById("filterEndDate").value;
    if (start && end) {
        loadTransactions(start, end);
        loadChart(start, end);
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
loadChart();