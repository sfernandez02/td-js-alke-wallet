// ===============================
// CONFIGURACIÓN Y CONSTANTES
// ===============================

const STORAGE_KEYS = {
  USER: "alke_user",
  BALANCE: "alke_balance",
  CONTACTS: "alke_contacts",
  TRANSACTIONS: "alke_transactions",
};

const DEFAULT_USER = {
  email: "user@alke.com",
  password: "123456",
};

// ===============================
// FUNCIONES DE LOCALSTORAGE
// ===============================

function getBalance() {
  return Number(localStorage.getItem(STORAGE_KEYS.BALANCE) || "0");
}

function setBalance(value) {
  localStorage.setItem(STORAGE_KEYS.BALANCE, String(value));
}

function getContacts() {
  const raw = localStorage.getItem(STORAGE_KEYS.CONTACTS);
  return raw ? JSON.parse(raw) : [];
}

function setContacts(list) {
  localStorage.setItem(STORAGE_KEYS.CONTACTS, JSON.stringify(list));
}

function getTransactions() {
  const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
  return raw ? JSON.parse(raw) : [];
}

function setTransactions(list) {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(list));
}

function addTransaction(type, detail, amount) {
  const txs = getTransactions();
  txs.unshift({
    id: Date.now(),
    date: new Date().toLocaleString(),
    type,
    detail,
    amount,
  });
  setTransactions(txs);
}

// ===============================
// CONTROL DE SESIÓN
// ===============================

function isLoggedIn() {
  return !!localStorage.getItem(STORAGE_KEYS.USER);
}

function requireAuthOnPage() {
  const path = window.location.pathname;
  const isLoginPage = path.endsWith("login.html") || path.endsWith("/") || path === "";

  if (!isLoginPage && !isLoggedIn()) {
    window.location.href = "login.html";
  }
}

// ===============================
// MENÚ PRINCIPAL
// ===============================

function updateMenuSummary() {
  const balance = getBalance();
  $("#balanceText").text(`$${balance.toLocaleString()}`);

  const txs = getTransactions();
  if (txs.length > 0) {
    const last = txs[0];
    $("#lastTransactionText").text(
      `${last.date} - ${last.type} - ${last.detail} - $${last.amount.toLocaleString()}`
    );
  }
}

// ===============================
// CONTACTOS
// ===============================

function renderContactsList() {
  const contacts = getContacts();
  const $list = $("#contactsList");
  if (!$list.length) return;

  $list.empty();
  contacts.forEach((c) => {
    $list.append(
      `<li class="list-group-item d-flex justify-content-between align-items-center">
        <span>${c.name} <small class="text-muted">(${c.alias})</small></span>
      </li>`
    );
  });
}

// ===============================
// AUTOCOMPLETAR CONTACTOS
// ===============================

function setupAutocomplete() {
  const $input = $("#contactSearch");
  const $suggestions = $("#contactSuggestions");

  if (!$input.length) return;

  $input.on("input", function () {
    const term = $(this).val().toLowerCase();
    $suggestions.empty();

    if (!term) {
      $suggestions.hide();
      return;
    }

    const contacts = getContacts();
    const filtered = contacts.filter(
      (c) =>
        c.name.toLowerCase().includes(term) ||
        c.alias.toLowerCase().includes(term)
    );

    if (filtered.length === 0) {
      $suggestions.hide();
      return;
    }

    filtered.forEach((c) => {
      const item = $(
        `<button type="button" class="list-group-item list-group-item-action">${c.name} (${c.alias})</button>`
      );

      item.on("click", () => {
        $input.val(c.name);
        $suggestions.hide();
      });

      $suggestions.append(item);
    });

    $suggestions.show();
  });

  $(document).on("click", function (e) {
    if (!$(e.target).closest("#contactSearch, #contactSuggestions").length) {
      $suggestions.hide();
    }
  });
}

// ===============================
// TABLA DE MOVIMIENTOS
// ===============================

function renderTransactionsTable() {
  const $tbody = $("#transactionsTableBody");
  if (!$tbody.length) return;

  const txs = getTransactions();
  $tbody.empty();

  if (txs.length === 0) {
    $tbody.append(
      `<tr><td colspan="4" class="text-center text-muted py-4">Sin movimientos registrados.</td></tr>`
    );
    return;
  }

  txs.forEach((tx) => {
    const sign = tx.type === "Depósito" ? "+" : "-";
    const color = tx.type === "Depósito" ? "text-success" : "text-danger";

    $tbody.append(
      `<tr>
        <td>${tx.date}</td>
        <td>${tx.type}</td>
        <td>${tx.detail}</td>
        <td class="text-end ${color}">${sign}$${tx.amount.toLocaleString()}</td>
      </tr>`
    );
  });
}

// ===============================
// INICIALIZACIÓN GLOBAL
// ===============================

$(function () {
  requireAuthOnPage();

  // LOGIN
  $("#loginForm").on("submit", function (e) {
    e.preventDefault();

    const email = $("#email").val().trim();
    const password = $("#password").val().trim();

    if (email === DEFAULT_USER.email && password === DEFAULT_USER.password) {
      localStorage.setItem(STORAGE_KEYS.USER, email);

      if (!localStorage.getItem(STORAGE_KEYS.BALANCE)) {
        setBalance(0);
      }

      window.location.href = "menu.html";
    } else {
      $("#loginError").removeClass("d-none");
    }
  });

  // LOGOUT
  $("#logoutBtn").on("click", function () {
    localStorage.removeItem(STORAGE_KEYS.USER);
    window.location.href = "login.html";
  });

  // MENÚ
  if ($("#balanceText").length) {
    updateMenuSummary();
  }

  // DEPÓSITO
  if ($("#depositForm").length) {
    $("#balanceDepositText").text(`$${getBalance().toLocaleString()}`);

    $("#depositForm").on("submit", function (e) {
      e.preventDefault();

      const amount = Number($("#depositAmount").val());
      const $msg = $("#depositMsg");

      if (isNaN(amount) || amount <= 0) {
        $msg.removeClass("d-none text-success")
            .addClass("text-danger")
            .text("Ingrese un monto válido.");
        return;
      }

      const newBalance = getBalance() + amount;
      setBalance(newBalance);

      addTransaction("Depósito", "Depósito en cuenta", amount);

      $("#balanceDepositText").text(`$${newBalance.toLocaleString()}`);
      $("#depositAmount").val("");

      $msg.removeClass("d-none text-danger")
          .addClass("text-success")
          .text("Depósito realizado correctamente.");
    });
  }

  // ENVIAR DINERO
  if ($("#sendForm").length) {
    $("#balanceSendText").text(`$${getBalance().toLocaleString()}`);

    setupAutocomplete();
    renderContactsList();

    // Agregar contacto
    $("#newContactForm").on("submit", function (e) {
      e.preventDefault();

      const name = $("#newContactName").val().trim();
      const alias = $("#newContactAlias").val().trim();
      const $msg = $("#contactMsg");

      if (!name || !alias) {
        $msg.removeClass("d-none text-success")
            .addClass("text-danger")
            .text("Complete nombre y alias.");
        return;
      }

      const contacts = getContacts();
      contacts.push({ name, alias });
      setContacts(contacts);

      $("#newContactName").val("");
      $("#newContactAlias").val("");

      renderContactsList();

      $msg.removeClass("d-none text-danger")
          .addClass("text-success")
          .text("Contacto agregado.");
    });

    // Enviar dinero
    $("#sendForm").on("submit", function (e) {
      e.preventDefault();

      const contact = $("#contactSearch").val().trim();
      const amount = Number($("#sendAmount").val());
      const $msg = $("#sendMsg");

      if (!contact) {
        $msg.removeClass("d-none text-success")
            .addClass("text-danger")
            .text("Seleccione o ingrese un contacto.");
        return;
      }

      if (isNaN(amount) || amount <= 0) {
        $msg.removeClass("d-none text-success")
            .addClass("text-danger")
            .text("Ingrese un monto válido.");
        return;
      }

      const currentBalance = getBalance();

      if (amount > currentBalance) {
        $msg.removeClass("d-none text-success")
            .addClass("text-danger")
            .text("Saldo insuficiente.");
        return;
      }

      const newBalance = currentBalance - amount;
      setBalance(newBalance);

      addTransaction("Transferencia", `Envío a ${contact}`, amount);

      $("#balanceSendText").text(`$${newBalance.toLocaleString()}`);
      $("#sendAmount").val("");

      $msg.removeClass("d-none text-danger")
          .addClass("text-success")
          .text("Transferencia realizada.");
    });
  }

  // MOVIMIENTOS
  if ($("#transactionsTableBody").length) {
    renderTransactionsTable();
  }
});