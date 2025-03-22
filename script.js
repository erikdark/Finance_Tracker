
function loadData() {
    const savedData = localStorage.getItem('financeData');
    let data;
    try {
        data = savedData ? JSON.parse(savedData) : {
            balances: { wallet: 0, savings: 0, emergency: 0, crypto: 0 },
            transactions: []
        };
        if (!data.balances || !data.transactions) {
            throw new Error("Invalid data structure");
        }
    } catch (e) {
        data = {
            balances: { wallet: 0, savings: 0, emergency: 0, crypto: 0 },
            transactions: []
        };
        localStorage.setItem('financeData', JSON.stringify(data));
    }
    return data;
}


function saveData(data) {
    localStorage.setItem('financeData', JSON.stringify(data));
    updateDisplay(data);
}


function updateDisplay(data) {
    const balances = data.balances || { wallet: 0, savings: 0, emergency: 0, crypto: 0 };
    document.getElementById('wallet').textContent = balances.wallet;
    document.getElementById('savings').textContent = balances.savings;
    document.getElementById('emergency').textContent = balances.emergency;
    document.getElementById('crypto').textContent = balances.crypto;
}


function updateBalance(action) {
    const data = loadData();
    const amount = parseFloat(document.getElementById('amount').value);
    const error = document.getElementById('error');
    const timestamp = new Date().toISOString();

    if (isNaN(amount) || amount <= 0) {
        error.textContent = "Введите корректную сумму!";
        return;
    }

    error.textContent = "";
    let transaction = { action, amount, timestamp };

    if (action === "received") {
        data.balances.wallet += amount;
    } else if (action === "spent") {
        if (data.balances.wallet >= amount) {
            data.balances.wallet -= amount;
        } else {
            error.textContent = "Недостаточно средств в кошельке!";
            return;
        }
    } else if (action === "to_savings") {
        if (data.balances.wallet >= amount) {
            data.balances.wallet -= amount;
            data.balances.savings += amount;
        } else {
            error.textContent = "Недостаточно средств в кошельке!";
            return;
        }
    } else if (action === "to_emergency") {
        if (data.balances.wallet >= amount) {
            data.balances.wallet -= amount;
            data.balances.emergency += amount;
        } else {
            error.textContent = "Недостаточно средств в кошельке!";
            return;
        }
    } else if (action === "from_savings") {
        if (data.balances.savings >= amount) {
            data.balances.savings -= amount;
            data.balances.wallet += amount;
        } else {
            error.textContent = "Недостаточно средств на сберегательном счете!";
            return;
        }
    } else if (action === "from_emergency") {
        if (data.balances.emergency >= amount) {
            data.balances.emergency -= amount;
            data.balances.wallet += amount;
        } else {
            error.textContent = "Недостаточно средств на экстренном счете!";
            return;
        }
    } else if (action === "crypto_received") {
        data.balances.crypto += amount;
    } else if (action === "crypto_withdrawn") {
        if (data.balances.crypto >= amount) {
            data.balances.crypto -= amount;
        } else {
            error.textContent = "Недостаточно средств в крипте!";
            return;
        }
    }

    data.transactions.push(transaction);
    saveData(data);
    document.getElementById('amount').value = "";
}


function saveToJson() {
    const data = loadData();
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'finance_data.json';
    a.click();
    URL.revokeObjectURL(url);
}


function loadFromJson() {
    const fileInput = document.getElementById('loadFile');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.balances || !data.transactions) {
                    throw new Error("Invalid JSON structure");
                }
                saveData(data);
                document.getElementById('error').textContent = "Данные успешно загружены!";
            } catch (err) {
                document.getElementById('error').textContent = "Ошибка загрузки файла: неверный формат!";
            }
        };
        reader.readAsText(file);
    }
}


function generateReport() {
    const fileInput = document.getElementById('reportFile');
    const file = fileInput.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const data = JSON.parse(e.target.result);
                if (!data.transactions || !data.balances) {
                    throw new Error("Invalid JSON structure");
                }
                let totalReceived = 0;
                let totalCryptoReceived = 0;
                let totalCryptoWithdrawn = 0;
                let totalSpent = 0;

                data.transactions.forEach(t => {
                    if (t.action === "received") totalReceived += t.amount;
                    if (t.action === "crypto_received") totalCryptoReceived += t.amount;
                    if (t.action === "crypto_withdrawn") totalCryptoWithdrawn += t.amount;
                    if (t.action === "spent") totalSpent += t.amount;
                });

                document.getElementById('totalReceived').textContent = totalReceived;
                document.getElementById('totalCryptoReceived').textContent = totalCryptoReceived;
                document.getElementById('totalCryptoWithdrawn').textContent = totalCryptoWithdrawn;
                document.getElementById('totalSavings').textContent = data.balances.savings;
                document.getElementById('totalEmergency').textContent = data.balances.emergency;
                document.getElementById('totalSpent').textContent = totalSpent;
                document.getElementById('netResult').textContent = totalReceived - totalSpent;

                document.getElementById('report').style.display = 'block';
                document.getElementById('error').textContent = "Отчет успешно загружен!";
            } catch (err) {
                document.getElementById('error').textContent = "Ошибка загрузки файла для отчета: неверный формат!";
            }
        };
        reader.readAsText(file);
    }
}

// Инициализация при загрузке страницы
window.onload = function() {
    const data = loadData();
    updateDisplay(data);
};