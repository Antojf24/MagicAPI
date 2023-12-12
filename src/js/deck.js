let cardsContainer = document.getElementById("cards-container");

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
let db;

function openDB() {

    return new Promise((resolve, reject) => {

        let request = indexedDB.open("MagicAPI", 1);
        request.onsuccess = (event) => {

            db = event.target.result;
            resolve();
        };
        request.onerror = (event) => {

            reject(event.target.error);
        };
        request.onupgradeneeded = (event) => {

            db = event.target.result;
            if (!db.objectStoreNames.contains("deck")) {

                let objectStore = db.createObjectStore("deck", { keyPath: 'id', autoIncrement: true });
            }
        };
    });
}

function showDeck() {

    if (!db) {

        throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {
        let transaction = db.transaction("deck", "readwrite");
        let objectStore = transaction.objectStore("deck");
        let request = objectStore.getAll();
        request.onsuccess = (event) => {

            cardsContainer.innerHTML = "";
            showCards(event.target.result);
            resolve();
        };

        request.onerror = (event) => {
            reject(event.target.error);
        };
    });
}

openDB().then(() => {

    showDeck();
})

function showCards(cards) {
    
    for (let i = 0; i < cards.length; i++) {
        let card = cards[i];
        let cardElement = document.createElement("div");
        cardElement.className = "col-4 d-flex justify-content-center align-items-center flex-column";
        cardElement.innerHTML = `
        <h5>${card.name}</h5>
        <img src="${card.imageUrl}" class="img card-img-top" alt="${card.name}">
        <button class="btn btn-secondary m-2">Delete card</button>
      `;

        cardElement.querySelector("button").addEventListener("click", () => {
            deleteCard(card);
        })
        cardsContainer.appendChild(cardElement);
    }
}

function deleteCard(card) {
    if (!db) {

        throw new Error("La base de datos no está abierta.");
    }

    return new Promise((resolve, reject) => {

        let transaction = db.transaction(["deck"], "readwrite");
        let objectStore = transaction.objectStore("deck");
        let request = objectStore.delete(card.id);

        request.onsuccess = (event) => {

            showDeck();
            resolve();
        };

        request.onerror = (event) => {

            reject(event.target.error);
        };
    });
};