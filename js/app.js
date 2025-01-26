const foodSearchForm = document.getElementById('foodSearchForm');
const foodSearchInput = document.getElementById('foodSearchInput');
const foodResultsContainer = document.getElementById('foodResults');

foodSearchForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const query = foodSearchInput.value.trim();
  if (query) {
    const foods = await fetchFoods(query);
    displayFoods(foods);
  }
});

async function fetchFoods(query) {
    try {
        const response = await fetch(
            `https://world.openfoodfacts.org/cgi/search.pl?action=process&json=true&search_terms=${query}`
        );
        const data = await response.json();
        return data.products;
    } catch (error) {
        console.error("Eroare la preluarea datelor:", error);
        return null;
    }
}

function displayFoods(foods) {  
    foodResultsContainer.innerHTML = '';
    if (!foods || foods.length === 0) {
        foodResultsContainer.innerHTML = '<p>Niciun raspuns gasit</p>';
        return;
    }

    foods.forEach((food) => {
        const foodCard = document.createElement('div');
        foodCard.className = 'foodCard';

        foodCard.innerHTML = `
        <h3>${food.product_name || 'Fără nume'}</h3>
        <p>${food.nutrition_grade_fr ? `Scor nutrițional: ${food.nutrition_grade_fr.toUpperCase()}` : ''}</p>
        <button class="addToJournalButton">Adaugă în jurnal</button>
      `;
        // Găsim butonul din acest card
        const addToJournalButton = foodCard.querySelector('.addToJournalButton');

        // Adăugăm un eveniment de click pe buton
        addToJournalButton.addEventListener('click', () => {
            addToJournal(food);
        });
        foodResultsContainer.appendChild(foodCard);
    });
}

const foodJournal = {}; // Obiect pentru a stoca alimentele adăugate în jurnal

// Funcție pentru adăugarea unui aliment în jurnal
function addToJournal(food) {
    const foodKey = food.product_name || 'Fără nume'; // Folosim numele produsului ca identificator

    if (foodJournal[foodKey]) {
        foodJournal[foodKey].count += 1; // Dacă alimentul există deja în jurnal, incrementăm numărul de bucăți
    } else {
        foodJournal[foodKey] = { details: food, count: 1 }; // Altfel, adăugăm alimentul în jurnal cu numărul de bucăți 1
    }

    saveJournalToLocalStorage(); // Salvăm jurnalul în localStorage
    alert(`Alimentul "${foodKey}" a fost adăugat de ${foodJournal[foodKey].count} ori!`); // Afișăm un mesaj de succes
    updateJournalDisplay(); // Actualizăm afișarea jurnalului
}

///////////////////////////////////////////////////////////////////////////////////////////////////////////

function updateJournalDisplay() {
    const foodJournalList = document.getElementById('foodJournalList');
    foodJournalList.innerHTML = ''; // Golim lista curentă

    const journalEntries = Object.entries(foodJournal); // Obținem alimentele din jurnal sub formă de perechi cheie-valoare
  
    if (journalEntries.length === 0) {
        foodJournalList.innerHTML = '<p>Niciun aliment adăugat în jurnal</p>';
        return;
    }

    journalEntries.forEach(([key, { count }]) => {
        const listItem = document.createElement('div');
        listItem.className = 'journalEntry';
        
        // Creăm structura pentru fiecare aliment
        listItem.innerHTML = `
            <p>${key} - Adăugat de <span class="count">${count}</span> ori </p>
            <div class="controls">
                <button class="increment">+</button>
                <button class="decrement">-</button>
            </div>
        `;

        // Selectăm butoanele de increment și decrement
        const incrementButton = listItem.querySelector('.increment');
        const decrementButton = listItem.querySelector('.decrement');

        // Adăugăm eveniment pentru incrementare
        incrementButton.addEventListener('click', () => {
            foodJournal[key].count += 1; // Creștem numărul de bucăți
            saveJournalToLocalStorage(); // Salvăm modificările
            updateJournalDisplay(); // Reafișăm jurnalul
        });

        // Adăugăm eveniment pentru decrementare
        decrementButton.addEventListener('click', () => {
            if (foodJournal[key].count > 1) {
                foodJournal[key].count -= 1; // Scădem numărul de bucăți
            } else {
                delete foodJournal[key]; // Eliminăm produsul dacă numărul scade sub 1
            }
            saveJournalToLocalStorage(); // Salvăm modificările
            updateJournalDisplay(); // Reafișăm jurnalul
        });

        foodJournalList.appendChild(listItem); // Adăugăm elementul în listă
    });
}


function saveJournalToLocalStorage() {
    localStorage.setItem('foodJournal', JSON.stringify(foodJournal)); // Salvăm jurnalul în localStorage
}

function loadJournalFromLocalStorage() {
    const storeJournal = localStorage.getItem('foodJournal'); // Încărcăm jurnalul din localStorage
    if (storeJournal) {
       Object.assign(foodJournal, JSON.parse(storeJournal)); // Adăugăm alimentele în jurnal
        updateJournalDisplay();
    }
}   

// Încarcă jurnalul din localStorage la încărcarea paginii
document.addEventListener('DOMContentLoaded', () => {
    loadJournalFromLocalStorage();
});

