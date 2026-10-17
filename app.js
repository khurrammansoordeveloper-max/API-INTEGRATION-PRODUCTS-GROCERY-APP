const productContainer = document.getElementById("card");
const searchInput = document.getElementById("searchInput");
const loading = document.getElementById("loading");
const error = document.getElementById("error");
const pagination = document.getElementById("pagination");
const checkoutModal = document.getElementById('checkout-modal');

// Cart Elements
const cartBox = document.querySelector(".cart-items");
const counter = document.querySelector("#counter");
const priceCount = document.querySelector("#priceCount");
const emptyCart = document.querySelector(".empty-cart");

let count = 0;
let total = 0;
let currentPage = 1;
let totalProduct = 0;
let product_per_page = 4;
let currentCategory = "";

const Api_URl = "https://dummyjson.com/products";
let products = [];

// Fetch products based on pagination and category
const getProducts = async (page = 1, category = "") => {
    loading.style.display = "block";
    error.innerText = "";
    
    try {
        const skip = (page - 1) * product_per_page;
        let url = `${Api_URl}?limit=${product_per_page}&skip=${skip}`;

        if (category) {
            url = `${Api_URl}/category/${category}?limit=${product_per_page}&skip=${skip}`;
        }

        const response = await fetch(url);
        if (!response.ok) {
            throw new Error("API request failed");
        }
        
        const data = await response.json();
        products = data.products;
        totalProduct = data.total;
        currentPage = page;
        
        displayProducts(products);
        createPagination();
    } catch (err) {
        error.innerText = "Failed to fetch products";
    } finally {
        loading.style.display = "none";
    }
};

// Initial API Load
getProducts();

function createPagination() {
    pagination.innerHTML = "";
    const totalPage = Math.ceil(totalProduct / product_per_page);

    const previousButton = document.createElement("button");
    previousButton.innerText = "<=";
    previousButton.disabled = currentPage === 1;

    previousButton.addEventListener("click", () => {
        getProducts(currentPage - 1, currentCategory);
    });

    pagination.appendChild(previousButton);

    for (let page = 1; page <= totalPage; page++) {
        const button = document.createElement("button");
        button.textContent = page;
        if (page === currentPage) button.style.fontWeight = "bold";

        button.addEventListener("click", () => {
            getProducts(page, currentCategory);
        });

        pagination.appendChild(button);
    }
}

const displayProducts = (data) => {
    productContainer.innerHTML = "";
    if (!data || data.length === 0) {
        productContainer.innerHTML = `<h2>No products found</h2>`;
        return;
    }

    data.forEach((element) => {
        const card = document.createElement("div");
        card.classList.add("product");

        card.innerHTML = `
    <img src="${element.thumbnail}" alt="${element.title}">
    <span class="category">${element.category}</span>
    <h4>${element.title}</h4>
    <div class="price_rating">
        <div class="price">$${element.price}</div>
        <div class="rating">⭐ ${element.rating}</div>
    </div>
    <button class="add-to-cart-btn" onclick="addToCart(this, ${element.price})">
        <i class="ri-shopping-cart-2-line"></i> Add to Cart
    </button>
`;
        productContainer.appendChild(card);
    });
};

// Live Search Input Filter
searchInput.addEventListener("input", function () {
    const searchText = searchInput.value.toLowerCase().trim();

    const filteredItems = products.filter((element) => {
        return (
            element.category.toLowerCase().includes(searchText) ||
            element.title.toLowerCase().includes(searchText)
        );
    });

    displayProducts(filteredItems);
});

// Category Navigation Filter
document.querySelectorAll("#menu .category a").forEach((link) => {
    link.addEventListener("click", (e) => {
        e.preventDefault();
        
        const categoryMap = {
            "cosmetics": "beauty",
            "computers": "laptops",
            "electronics": "smartphones",
            "jewellery": "womens-jewellery",
            "men's clothing": "mens-shirts",
            "sports": "sports-accessories",
            "grocery": "groceries",
            "women's clothing": "womens-dresses"
        };

        const linkText = e.target.innerText.trim().toLowerCase();
        currentCategory = categoryMap[linkText] || "";
        
        getProducts(1, currentCategory);
    });
});

// Shopping Cart Functions
function addToCart(button, price) {
    const cardDetails = button.parentElement;
    const img = cardDetails.querySelector("img").src;
    const title = cardDetails.querySelector("h4").innerText;

    cartBox.innerHTML += `
        <div class="product-in-cart">
            <img src="${img}" alt="${title}" width="50">
            <div class="product-name">${title}</div>
            <div class="product-price">$${price.toFixed(2)}</div>
            <i class="ri-delete-bin-7-fill" onclick="remove(this, ${price});"></i>
        </div>
    `;

    emptyCart.style.display = "none"; 
    count++;
    counter.textContent = count;
    
    total += parseFloat(price);
    priceCount.textContent = "$" + total.toFixed(2);
}

function remove(icon, price) {
    const productInCart = icon.parentElement;
    productInCart.remove();

    count--;
    counter.textContent = count;
    
    total -= parseFloat(price);
    if (total < 0) total = 0;
    
    priceCount.textContent = "$" + total.toFixed(2);

    if (count === 0) {
        emptyCart.style.display = "block";
    }
}
// Sidebar & Modal Navigation
function toggleCart() {
    cartSidebar.classList.toggle('active');
}
function showCheckout() {
    if(cart.length === 0) return alert("Your cart is empty!");
    toggleCart();
    checkoutModal.style.display = 'flex';
}
function closeCheckout() {
    checkoutModal.style.display = 'none';
}

// Form Submission Simulation
document.getElementById('payment-form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('Payment Simulated Successfully! Thank you for your purchase.');
    cart = [];
    updateCartUI();
    closeCheckout();
});

// Initialize on Load
updateCartUI();