const transactionForm = document.getElementById("transactionForm");
const transactionList = document.getElementById("transactionList");
const transactionCount = document.getElementById("transactionCount");
const totalIncomeEl = document.getElementById("totalIncome");
const totalExpenseEl = document.getElementById("totalExpense");
const totalBalanceEl = document.getElementById("totalBalance");
const balanceCard = document.getElementById("balanceCard");
const monthFilter = document.getElementById("monthFilter");
const formMessage = document.getElementById("formMessage");

const descriptionInput = document.getElementById("description");
const typeInput = document.getElementById("type");
const valueInput = document.getElementById("value");
const categoryInput = document.getElementById("category");
const dateInput = document.getElementById("date");

let transactions = JSON.parse(localStorage.getItem("meuBolsoTransactions")) || [];

function setDefaultMonth() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  monthFilter.value = `${year}-${month}`;

  const dateValue = today.toISOString().split("T")[0];
  dateInput.value = dateValue;
}

function saveTransactions() {
  localStorage.setItem("meuBolsoTransactions", JSON.stringify(transactions));
}

function formatCurrency(value) {
  return value.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL"
  });
}

function getFilteredTransactions() {
  return transactions.filter((transaction) => transaction.date.startsWith(monthFilter.value));
}

function renderSummary() {
  const filtered = getFilteredTransactions();

  const income = filtered
    .filter((t) => t.type === "receita")
    .reduce((sum, t) => sum + t.value, 0);

  const expense = filtered
    .filter((t) => t.type === "despesa")
    .reduce((sum, t) => sum + t.value, 0);

  const balance = income - expense;

  totalIncomeEl.textContent = formatCurrency(income);
  totalExpenseEl.textContent = formatCurrency(expense);
  totalBalanceEl.textContent = formatCurrency(balance);

  balanceCard.classList.toggle("negative", balance < 0);
}

function renderTransactions() {
  const filtered = getFilteredTransactions().sort((a, b) => b.date.localeCompare(a.date));

  transactionList.innerHTML = "";

  transactionCount.textContent = `${filtered.length} registro${filtered.length !== 1 ? "s" : ""}`;

  if (filtered.length === 0) {
    transactionList.innerHTML = `<p class="empty-state">Nenhuma movimentação neste mês. Adicione a primeira!</p>`;
    renderSummary();
    return;
  }

  filtered.forEach((transaction) => {
    const item = document.createElement("div");
    item.className = "transaction-item";

    item.innerHTML = `
      <div class="transaction-info">
        <h3>${transaction.description}</h3>
        <p><strong>Categoria:</strong> ${transaction.category}</p>
        <p><strong>Tipo:</strong> ${transaction.type === "receita" ? "Receita" : "Despesa"}</p>
        <p><strong>Data:</strong> ${formatDate(transaction.date)}</p>
      </div>

      <div class="transaction-value">
        <strong class="${transaction.type}">${transaction.type === "receita" ? "+" : "-"} ${formatCurrency(transaction.value)}</strong>
        <button class="delete-btn" onclick="deleteTransaction('${transaction.id}')">Excluir</button>
      </div>
    `;

    transactionList.appendChild(item);
  });

  renderSummary();
}

function formatDate(dateString) {
  const [year, month, day] = dateString.split("-");
  return `${day}/${month}/${year}`;
}

function showMessage(text, type = "success") {
  formMessage.textContent = text;
  formMessage.className = `message ${type}`;

  setTimeout(() => {
    formMessage.textContent = "";
    formMessage.className = "message";
  }, 3000);
}

transactionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  const description = descriptionInput.value.trim();
  const type = typeInput.value;
  const value = parseFloat(valueInput.value);
  const category = categoryInput.value;
  const date = dateInput.value;

  if (!description || !type || !value || !category || !date) {
    showMessage("Preencha todos os campos corretamente.", "error");
    return;
  }

  if (value <= 0) {
    showMessage("O valor deve ser maior que zero.", "error");
    return;
  }

  const transaction = {
    id: Date.now().toString(),
    description,
    type,
    value: Number(value.toFixed(2)),
    category,
    date
  };

  transactions.push(transaction);
  saveTransactions();
  renderTransactions();
  transactionForm.reset();
  dateInput.value = new Date().toISOString().split("T")[0];
  showMessage("Movimentação cadastrada com sucesso!");
});

monthFilter.addEventListener("change", renderTransactions);

function deleteTransaction(id) {
  const confirmDelete = confirm("Tem certeza que deseja excluir esta movimentação?");
  if (!confirmDelete) return;

  transactions = transactions.filter((transaction) => transaction.id !== id);
  saveTransactions();
  renderTransactions();
  showMessage("Movimentação excluída com sucesso!");
}

setDefaultMonth();
renderTransactions();