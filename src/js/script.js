const CARDS_API = "https://api.magicthegathering.io/v1/cards";
const SETS_API = "https://api.magicthegathering.io/v1/sets";
const TYPES_API = "https://api.magicthegathering.io/v1/types";

let cardsContainer = document.getElementById("cards-container");
let setsChooser = document.getElementById("sets-chooser");
let typeChooser = document.getElementById("type-chooser");

let indexedDB = window.indexedDB || window.mozIndexedDB || window.webkitIndexedDB || window.msIndexedDB;
let db;

openDB();

fetch(SETS_API)
  .then(response => response.json())
  .then(data => {
    let sets = data.sets;
    for (let i = 0; i < sets.length; i++) {
      let set = sets[i];
      let option = document.createElement("label");
      option.className = "form-check";
      option.setAttribute("value", set.code);
      option.innerHTML = `
        <input class="form-check-input" type="radio" name="sets">
        <span class="form-check-label">${set.name}</span>  
      `;

      option.addEventListener("click", () => {
        fetch(CARDS_API + "/?set=" + set.code)
          .then(response => response.json())
          .then(data => {
            let cards = data.cards;
            cardsContainer.innerHTML = "";
            createCards(cards);
          })
      });
      setsChooser.appendChild(option);
    }
  });

fetch(TYPES_API)
  .then(response => response.json())
  .then(data => {
    let types = data.types;
    for (let i = 0; i < types.length; i++) {
      let type = types[i];
      let option = document.createElement("label");
      option.className = "form-check";
      option.setAttribute("value", type);
      option.innerHTML = `
        <input class="form-check-input" type="radio" name="types">
        <span class="form-check-label">${type}</span>  
      `;

      option.addEventListener("click", () => {
        fetch(CARDS_API + "/?type=" + type)
          .then(response => response.json())
          .then(data => {
            let cards = data.cards;
            cardsContainer.innerHTML = "";
            createCards(cards);
          })
      })
      typeChooser.appendChild(option);
    }
  });

function createCards(cards) {
  for (let i = 0; i < cards.length; i++) {
    let card = cards[i];
    if(!card.imageUrl){
      continue;
    }
    let cardElement = document.createElement("div");
    cardElement.className = "col-4 d-flex justify-content-center align-items-center flex-column";
    cardElement.innerHTML = `
      <h5>${card.name}</h5>
      <img src="${card.imageUrl}" class="img card-img-top" alt="${card.name}">
      <button class="btn btn-secondary m-2">Save card</button>
    `;

    cardElement.querySelector("button").addEventListener("click", () => {
      addData(card);
    })
    cardsContainer.appendChild(cardElement);
  }
}

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

function addData(card) {
  if (!db) {

      throw new Error("La base de datos no está abierta.");
  }

  return new Promise((resolve, reject) => {

      let transaction = db.transaction(["deck"], "readwrite");
      let objectStore = transaction.objectStore("deck");
      let request = objectStore.add(card);

      request.onsuccess = (event) => {

          resolve();
      };

      request.onerror = (event) => {
          transaction = db.transaction(["deck"], "readwrite");
          objectStore = transaction.objectStore("deck");
          request = objectStore.delete(card.id);
      };
  });
};