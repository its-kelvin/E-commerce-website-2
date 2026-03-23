/* ============================================
   CRUCIAL ONLINE SALES - MAIN JAVASCRIPT
===============================================*/

// Wait for DOM to be fully loaded
document.addEventListener("DOMContentLoaded", function () {
    console.log("Script loaded successfully!");

    // Initialize all functionality
    initCart();
    initAddToCartButtons();
    initCartModal();
    initSearch();
    initMobileMenu();
    initNavSearch();
    initProductCardClicks();
});

/* ============================================
   CART FUNCTIONS
===============================================*/
function initCart() {
    // Initialize cart count on page load
    updateCartCount();
}

function updateCartCount() {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const cartBadge = document.getElementById("cartBadge");
    if (cartBadge) {
        cartBadge.innerText = totalItems;
        cartBadge.classList.remove("bump");
        void cartBadge.offsetWidth;
        cartBadge.classList.add("bump");
    }
}

function addToCart(product) {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const existingIndex = cart.findIndex(item => item.name === product.name);

    if (existingIndex > -1) {
        cart[existingIndex].quantity++;
    } else {
        cart.push({ ...product, quantity: 1 });
    }

    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    updateCartCount();
}

/* ============================================
   ADD TO CART BUTTONS
===============================================*/
function initAddToCartButtons() {
    const buttons = document.querySelectorAll(".add-to-cart-btn");

    buttons.forEach(btn => {
        btn.addEventListener("click", function (e) {
            e.preventDefault();
            e.stopPropagation();

            const card = this.closest(".card") || this.closest(".product-card");
            if (!card) return;

            const name = card.dataset.name;
            const price = parseInt(card.dataset.price);
            const image = card.dataset.image;

            if (!name || !price) {
                console.error("Missing product data");
                return;
            }

            // Loading state
            const originalText = this.innerText;
            this.innerText = "Adding...";
            this.disabled = true;

            setTimeout(() => {
                addToCart({ name, price, image });
                showToast(name + " added to cart!");

                this.innerText = originalText;
                this.disabled = false;
            }, 300);
        });
    });
}

/* ============================================
   CART MODAL
===============================================*/
function initCartModal() {
    const cartIcon = document.getElementById("cartIconContainer");
    const modal = document.getElementById("cartModalOverlay");
    const closeBtn = document.getElementById("closeCartModal");

    if (cartIcon && modal) {
        cartIcon.addEventListener("click", function (e) {
            e.preventDefault();
            renderCartModal();
            modal.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    if (closeBtn && modal) {
        closeBtn.addEventListener("click", function () {
            modal.style.display = "none";
            document.body.style.overflow = "auto";
        });

        modal.addEventListener("click", function (e) {
            if (e.target === modal) {
                modal.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }
}

function renderCartModal() {
    const content = document.getElementById("cartModalContent");
    const totalEl = document.getElementById("cartModalTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    if (!content) return;

    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    if (cart.length === 0) {
        content.innerHTML = `
            <div style="text-align: center; padding: 40px;">
                <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1">
                    <circle cx="9" cy="21" r="1"></circle>
                    <circle cx="20" cy="21" r="1"></circle>
                    <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                </svg>
                <p style="margin-top: 15px; color: #666;">Your cart is empty</p>
                <a href="products.html" style="display: inline-block; margin-top: 15px; background: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Start Shopping</a>
            </div>
        `;
        if (totalEl) totalEl.innerText = "KSH 0";
        if (checkoutBtn) checkoutBtn.style.display = "none";
        return;
    }

    let html = '<div style="padding: 15px;">';
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <div style="display: flex; align-items: center; padding: 15px; border-bottom: 1px solid #eee; gap: 15px;">
                <img src="${item.image}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;">
                <div style="flex: 1;">
                    <h4 style="margin: 0 0 5px 0; font-size: 0.95em;">${item.name}</h4>
                    <p style="color: #1a237e; font-weight: bold; margin: 0;">KSH ${item.price.toLocaleString()}</p>
                    <div style="display: flex; align-items: center; gap: 10px; margin-top: 8px;">
                        <button onclick="updateCartItem(${index}, -1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">−</button>
                        <span>${item.quantity}</span>
                        <button onclick="updateCartItem(${index}, 1)" style="width: 28px; height: 28px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">+</button>
                    </div>
                </div>
                <div style="text-align: right;">
                    <p style="font-weight: bold; color: #1a237e;">KSH ${itemTotal.toLocaleString()}</p>
                    <button onclick="removeCartItem(${index})" style="background: none; border: none; color: #ff5722; cursor: pointer; font-size: 0.85em;">Remove</button>
                </div>
            </div>
        `;
    });

    html += '</div>';
    content.innerHTML = html;
    if (totalEl) totalEl.innerText = "KSH " + total.toLocaleString();
    if (checkoutBtn) checkoutBtn.style.display = "block";
}

function updateCartItem(index, change) {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        updateCartCount();
        renderCartModal();
    }
}

function removeCartItem(index) {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    updateCartCount();
    renderCartModal();
}

/* ============================================
   SEARCH FUNCTIONALITY
===============================================*/
function initSearch() {
    const searchInput = document.getElementById("searchInput");
    const searchBtn = document.getElementById("searchBtn");

    if (!searchInput) return;

    if (searchBtn) {
        searchBtn.addEventListener("click", performSearch);
    }

    searchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            performSearch();
        }
    });

    searchInput.addEventListener("input", function () {
        const query = this.value.toLowerCase().trim();
        filterProducts(query);
    });
}

function performSearch() {
    const searchInput = document.getElementById("searchInput");
    if (!searchInput) return;

    const query = searchInput.value.toLowerCase().trim();
    filterProducts(query);

    if (query) {
        const firstVisible = document.querySelector('.card:not([style*="display: none"])');
        if (firstVisible) {
            firstVisible.scrollIntoView({ behavior: "smooth", block: "center" });
        }
    }
}

function filterProducts(query) {
    const cards = document.querySelectorAll('.card');
    let hasResults = false;

    cards.forEach(card => {
        const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
        if (name.includes(query)) {
            card.style.display = '';
            hasResults = true;
        } else {
            card.style.display = 'none';
        }
    });

    // Handle no results message
    let noResults = document.getElementById('noResultsMsg');
    if (!hasResults && query) {
        if (!noResults) {
            noResults = document.createElement('div');
            noResults.id = 'noResultsMsg';
            noResults.innerHTML = `
                <div style="text-align: center; padding: 40px;">
                    <p>No products found matching "${query}"</p>
                    <a href="products.html" style="display: inline-block; margin-top: 15px; background: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">View All Products</a>
                </div>
            `;
            const grid = document.querySelector('.section .grid');
            if (grid) grid.appendChild(noResults);
        }
    } else if (noResults) {
        noResults.remove();
    }
}

/* ============================================
   MOBILE MENU
===============================================*/
function initMobileMenu() {
    const hamburger = document.getElementById("hamburger");
    const navLinks = document.getElementById("navLinks");
    const overlay = document.getElementById("menuOverlay");

    if (!hamburger || !navLinks) return;

    hamburger.addEventListener("click", function () {
        navLinks.classList.toggle("active");
        if (overlay) overlay.classList.toggle("active");
        document.body.style.overflow = navLinks.classList.contains("active") ? "hidden" : "auto";
    });

    if (overlay) {
        overlay.addEventListener("click", function () {
            navLinks.classList.remove("active");
            overlay.classList.remove("active");
            document.body.style.overflow = "auto";
        });
    }

    navLinks.querySelectorAll("a").forEach(link => {
        link.addEventListener("click", function () {
            navLinks.classList.remove("active");
            if (overlay) overlay.classList.remove("active");
            document.body.style.overflow = "auto";
        });
    });
}

/* ============================================
   NAV SEARCH ICON
===============================================*/
function initNavSearch() {
    const navSearch = document.getElementById("navSearchIcon");
    if (!navSearch) return;

    navSearch.addEventListener("click", function () {
        const searchSection = document.querySelector(".search-container");
        if (searchSection) {
            searchSection.scrollIntoView({ behavior: "smooth", block: "center" });
            const input = document.getElementById("searchInput");
            if (input) setTimeout(() => input.focus(), 500);
        } else {
            window.location.href = "index.html#search";
        }
    });
}

/* ============================================
   PRODUCT CARD CLICKS - GO TO SPECIFIC PRODUCT
===============================================*/
function initProductCardClicks() {
    const cards = document.querySelectorAll(".card");

    cards.forEach(card => {
        // Make the whole card clickable except the Add to Cart button
        card.addEventListener("click", function (e) {
            // Don't navigate if clicking the Add to Cart button
            if (e.target.classList.contains("add-to-cart-btn")) {
                return;
            }

            const productName = this.dataset.name;
            if (productName) {
                // Store the product name to scroll to it on products page
                sessionStorage.setItem("scrollToProduct", productName);
                window.location.href = "products.html";
            }
        });

        // Add pointer cursor to indicate clickable
        card.style.cursor = "pointer";
    });

    // Check if we need to scroll to a specific product on products page
    if (window.location.pathname.includes("products.html")) {
        const targetProduct = sessionStorage.getItem("scrollToProduct");
        if (targetProduct) {
            setTimeout(() => {
                const products = document.querySelectorAll(".product-card");
                products.forEach(prod => {
                    if (prod.dataset.name === targetProduct) {
                        prod.scrollIntoView({ behavior: "smooth", block: "center" });
                        prod.style.boxShadow = "0 0 20px #ffc107";
                        setTimeout(() => {
                            prod.style.boxShadow = "";
                        }, 2000);
                    }
                });
                sessionStorage.removeItem("scrollToProduct");
            }, 500);
        }
    }
}

/* ============================================
   TOAST NOTIFICATION
===============================================*/
function showToast(message) {
    // Remove existing toast
    const existing = document.querySelector(".toast");
    if (existing) existing.remove();

    const toast = document.createElement("div");
    toast.className = "toast";
    toast.innerText = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: #4caf50;
        color: white;
        padding: 15px 25px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.3);
        z-index: 3000;
        font-weight: bold;
    `;

    document.body.appendChild(toast);

    // Animate in
    setTimeout(() => {
        toast.style.transition = "all 0.3s ease";
        toast.style.bottom = "50px";
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
        toast.style.opacity = "0";
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}


/* ============================================
   CHECKOUT PAGE CART RENDERING
===============================================*/
function initCheckoutCart() {
    // Only run on checkout page
    if (!window.location.pathname.includes("checkout.html")) return;

    const cartTableBody = document.getElementById("cartTableBody");
    const grandTotalDisplay = document.getElementById("grandTotalDisplay");
    const totalAmountInput = document.getElementById("totalAmount");

    if (!cartTableBody) return;

    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];

    if (cart.length === 0) {
        cartTableBody.innerHTML = `
            <tr>
                <td colspan="6" style="text-align: center; padding: 40px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" style="margin-bottom: 15px;">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Your cart is empty</p>
                    <a href="products.html" style="display: inline-block; margin-top: 15px; background: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">Continue Shopping</a>
                </td>
            </tr>
        `;
        if (grandTotalDisplay) grandTotalDisplay.innerText = "KSH 0";
        if (totalAmountInput) totalAmountInput.value = 0;
        return;
    }

    let html = "";
    let total = 0;

    cart.forEach((item, index) => {
        const itemTotal = item.price * item.quantity;
        total += itemTotal;
        html += `
            <tr>
                <td><img src="${item.image}" alt="${item.name}" style="width: 60px; height: 60px; object-fit: cover; border-radius: 8px;"></td>
                <td><strong>${item.name}</strong></td>
                <td>KSH ${item.price.toLocaleString()}</td>
                <td>
                    <div style="display: flex; align-items: center; gap: 10px; justify-content: center;">
                        <button onclick="updateCheckoutItem(${index}, -1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-weight: bold;">−</button>
                        <span style="min-width: 30px; text-align: center;">${item.quantity}</span>
                        <button onclick="updateCheckoutItem(${index}, 1)" style="width: 30px; height: 30px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer; font-weight: bold;">+</button>
                    </div>
                </td>
                <td><strong>KSH ${itemTotal.toLocaleString()}</strong></td>
                <td>
                    <button onclick="removeCheckoutItem(${index})" style="background: #ff5722; color: white; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer;">Remove</button>
                </td>
            </tr>
        `;
    });

    cartTableBody.innerHTML = html;
    if (grandTotalDisplay) grandTotalDisplay.innerText = "KSH " + total.toLocaleString();
    if (totalAmountInput) totalAmountInput.value = total;
}

// Global functions for checkout page quantity updates
function updateCheckoutItem(index, change) {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    if (cart[index]) {
        cart[index].quantity += change;
        if (cart[index].quantity <= 0) {
            cart.splice(index, 1);
        }
        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        updateCartCount();
        initCheckoutCart();
    }
}

function removeCheckoutItem(index) {
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    cart.splice(index, 1);
    localStorage.setItem("shoppingCart", JSON.stringify(cart));
    updateCartCount();
    initCheckoutCart();
}

// Initialize checkout cart when DOM is ready
document.addEventListener("DOMContentLoaded", function () {
    initCheckoutCart();
});


/* ============================================
   NAV SEARCH FUNCTIONALITY
===============================================*/
function initNavSearch() {
    const navSearchInput = document.getElementById("navSearchInput");
    const navSearchBtn = document.getElementById("navSearchBtn");

    if (!navSearchInput) return;

    // Search on button click
    if (navSearchBtn) {
        navSearchBtn.addEventListener("click", function () {
            performNavSearch(navSearchInput.value);
        });
    }

    // Search on Enter key
    navSearchInput.addEventListener("keypress", function (e) {
        if (e.key === "Enter") {
            performNavSearch(this.value);
        }
    });
}

function performNavSearch(query) {
    query = query.toLowerCase().trim();

    // Check if we're on index page
    if (window.location.pathname.includes("index.html") || window.location.pathname.endsWith("/")) {
        // Filter products on homepage
        const cards = document.querySelectorAll('.card');
        let hasResults = false;

        cards.forEach(card => {
            const name = card.dataset.name ? card.dataset.name.toLowerCase() : '';
            if (name.includes(query)) {
                card.style.display = '';
                hasResults = true;
            } else {
                card.style.display = 'none';
            }
        });

        // Scroll to products section
        const productsSection = document.querySelector('.section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: "smooth" });
        }

        // Show/hide no results message
        let noResultsMsg = document.getElementById('noResultsMsg');
        if (!hasResults && query) {
            if (!noResultsMsg) {
                noResultsMsg = document.createElement('div');
                noResultsMsg.id = 'noResultsMsg';
                noResultsMsg.innerHTML = `
                    <div style="text-align: center; padding: 40px;">
                        <p>No products found matching "${query}"</p>
                        <a href="products.html" style="display: inline-block; margin-top: 15px; background: #1a237e; color: white; padding: 10px 20px; text-decoration: none; border-radius: 8px;">View All Products</a>
                    </div>
                `;
                const grid = document.querySelector('.section .grid');
                if (grid) grid.appendChild(noResultsMsg);
            }
        } else if (noResultsMsg) {
            noResultsMsg.remove();
        }
    } else {
        // Redirect to index with search query
        sessionStorage.setItem("navSearchQuery", query);
        window.location.href = "index.html";
    }
}

// Handle search query from other pages
document.addEventListener("DOMContentLoaded", function () {
    const savedQuery = sessionStorage.getItem("navSearchQuery");
    if (savedQuery && window.location.pathname.includes("index.html")) {
        const navSearchInput = document.getElementById("navSearchInput");
        if (navSearchInput) {
            navSearchInput.value = savedQuery;
            performNavSearch(savedQuery);
        }
        sessionStorage.removeItem("navSearchQuery");
    }
});
