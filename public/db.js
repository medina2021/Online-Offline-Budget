let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = ({ target }) => {
    let db = target.result;
    db.createObjectStore ("budgets", {autoIncrement: true})
};

// if successful
request.onsuccess = ({ target}) =>{
    console.log("Succesful!");
    db=target.result;
    if (navigator.onLine) {
        checkDatabase();
    }
};

// for errors
request.onerror = ({target}) =>{
    console.log(`Error, ${target.errorCode}`);
};

function saveRecord(record) {
    const transaction = db.transaction(["budgets"], "readWrite");
    const store = transaction.objectStore("budgets");

    Store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["budgets"], "readWrite");
    const store = transaction.objectStore("budgets");
    const getAll = store.getAll();

    getAll.onsuccess = function () {
        if (getAll.results.length > 0) {
            fetch("/api/transaction/bulk",{
                method: "POST",
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept:"application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
                })
                .then(response => {
                    return response.json();
                })
                .then(() => {
                    const transaction = db.transaction(["budgets"], "readWrite");
                    const store = transaction.objectStore("budgets");
                    store.clear();
                });
            }
        };
    }
window.addEventListener("online", checkDatabase);