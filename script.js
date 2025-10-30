// Variables
const pokeDeckContainer = document.getElementById('poke-deck');
const cartList = document.getElementById('cart-list');
const cartCount = document.getElementById('cart-count');
const clearCartButton = document.getElementById('clear-cart');
const searchInput = document.getElementById('search');
const errorMessage = document.getElementById('error-message');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Función para cargar los Pokémon desde la API
async function fetchPokemonByNameOrId(query) {
    // Limpiar mensaje de error al iniciar la búsqueda
    errorMessage.textContent = '';
    
    try {
        const response = await axios.get(`https://pokeapi.co/api/v2/pokemon/${query.toLowerCase()}`);
        const poke = response.data;
        const pokeCard = createPokemonCard(poke);
        pokeDeckContainer.innerHTML = ''; // Limpiar el deck antes de añadir la carta
        pokeDeckContainer.appendChild(pokeCard);
    } catch (error) {
        errorMessage.textContent = 'No se encontró el Pokémon. Intenta con otro nombre o ID.';
    }
}

// Crear tarjeta de Pokémon con más información
function createPokemonCard(pokemon) {
    const card = document.createElement('div');
    card.classList.add('col-md-3', 'poke-card');

    // Generar los tipos
    const types = pokemon.types.map(t => t.type.name).join(', ');
    
    // Generar las estadísticas principales
    const stats = pokemon.stats.map(stat => `${stat.stat.name}: ${stat.base_stat}`).join(', ');

    // Generar las habilidades
    const abilities = pokemon.abilities.map(a => a.ability.name).join(', ');

    card.innerHTML = `
        <div class="card">
            <img src="${pokemon.sprites.front_default}" class="card-img-top" alt="${pokemon.name}">
            <div class="card-body">
                <h5 class="card-title">${pokemon.name}</h5>
                <p class="card-text"><strong>Tipos:</strong> ${types}</p>
                <p class="card-text"><strong>Estadísticas:</strong> ${stats}</p>
                <p class="card-text"><strong>Habilidades:</strong> ${abilities}</p>
                <button class="btn btn-primary" data-id="${pokemon.id}" data-name="${pokemon.name}" data-img="${pokemon.sprites.front_default}" onclick="addToCart(event)">Agregar al carrito</button>
            </div>
        </div>
    `;
    
    return card;
}

// Agregar Pokémon al carrito
function addToCart(event) {
    const button = event.target;
    const id = button.getAttribute('data-id');
    const name = button.getAttribute('data-name');
    const img = button.getAttribute('data-img');
    
    const existingItem = cart.find(item => item.id === id);
    
    if (existingItem) {
        existingItem.quantity += 1; // Incrementar la cantidad
    } else {
        cart.push({ id, name, img, quantity: 1 });
    }
    
    saveCart();
    updateCartUI();
}

// Guardar carrito en localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
}

// Mostrar el carrito en la interfaz
function updateCartUI() {
    cartList.innerHTML = '';
    cart.forEach(item => {
        const li = document.createElement('li');
        li.classList.add('list-group-item');
        li.innerHTML = `
            ${item.name} x${item.quantity} 
            <button class="btn btn-success btn-sm" onclick="increaseQuantity('${item.id}')">+</button>
            <button class="btn btn-warning btn-sm" onclick="decreaseQuantity('${item.id}')">-</button>
            <button class="btn btn-danger btn-sm" onclick="removeFromCart('${item.id}')">Eliminar</button>
        `;
        cartList.appendChild(li);
    });
    cartCount.textContent = `(${cart.length})`;
}

// Aumentar cantidad en el carrito
function increaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item) {
        item.quantity += 1;
        saveCart();
        updateCartUI();
    }
}

// Disminuir cantidad en el carrito
function decreaseQuantity(id) {
    const item = cart.find(item => item.id === id);
    if (item && item.quantity > 1) {
        item.quantity -= 1;
        saveCart();
        updateCartUI();
    }
}

// Eliminar Pokémon del carrito
function removeFromCart(id) {
    cart = cart.filter(item => item.id !== id);
    saveCart();
    updateCartUI();
}

// Limpiar el carrito
clearCartButton.addEventListener('click', () => {
    cart = [];
    saveCart();
    updateCartUI();
});

// Escuchar cambios en el campo de búsqueda
searchInput.addEventListener('input', function () {
    const query = searchInput.value.trim();
    if (query.length >= 1) {
        fetchPokemonByNameOrId(query);
    } else {
        pokeDeckContainer.innerHTML = ''; // Limpiar el Pokedeck si no hay búsqueda
        errorMessage.textContent = '';  // Limpiar mensaje de error
    }
});

// Cargar los datos cuando la página se carga
document.addEventListener('DOMContentLoaded', () => {
    updateCartUI();
});
