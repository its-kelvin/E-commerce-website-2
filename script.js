/* ============================================
   CHECKOUT — FORM VALIDATION
===============================================*/

function calculateTotal() {
    // Logic handled by cart render now
    return;
}

if (document.getElementById("price")) {
    // specific listeners removed as price inputs are gone
}

function submitForm() {
    let valid = true;

    // Get values
    let name = document.getElementById("name").value.trim();
    let phone = document.getElementById("phone").value.trim();
    let email = document.getElementById("email").value.trim();
    let county = document.getElementById("county").value.trim();
    let town = document.getElementById("town").value.trim();
    let street = document.getElementById("street").value.trim();
    let totalAmount = document.getElementById("totalAmount").value;
    
    // Collect all product names for backend
    const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
    const productNames = cart.map(item => `${item.name} (x${item.quantity})`).join(", ");
    const productName = productNames || "General Order";
    const totalQuantity = cart.reduce((sum, item) => sum + item.quantity, 0);

    // Clear all errors
    document.querySelectorAll(".error").forEach(e => e.textContent = "");

    // Validation rules
    if (name === "") {
        valid = false;
        document.getElementById("nameError").textContent = "Enter your name";
    }

    if (!/^\d{10}$/.test(phone)) {
        valid = false;
        document.getElementById("phoneError").textContent = "Enter a valid 10-digit phone number";
    }

    if (!email.includes("@") || !email.includes(".")) {
        valid = false;
        document.getElementById("emailError").textContent = "Enter a valid email";
    }

    if (county === "") {
        valid = false;
        document.getElementById("countyError").textContent = "Enter your county";
    }

    if (town === "") {
        valid = false;
        document.getElementById("townError").textContent = "Enter your town";
    }

    if (street === "") {
        valid = false;
        document.getElementById("streetError").textContent = "Enter your street address";
    }

    if (!totalAmount || totalAmount <= 0) {
        valid = false;
        alert("Your cart is empty!");
    }

    if (valid) {
        // Prepare real payload
        const transactionData = {
            name: name,
            phone: phone, // Format: 2547...
            email: email,
            product: productName,
            amount: totalAmount,
            quantity: totalQuantity,
            address: `${county}, ${town}, ${street}` // Combine address fields
        };

        // Send to Backend (Node.js)
        fetch('http://localhost:3000/api/process-order', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(transactionData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success && data.authorization_url) {
                generateInvoice(transactionData); // Print invoice before redirect
                // Redirect user to Paystack Checkout Page
                setTimeout(() => {
                    window.location.href = data.authorization_url;
                }, 2000);
            } else {
                alert("Payment initiation failed. Please try again.");
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert("Could not connect to server.");
        });
    }
}

/* ============================================
   INVOICE GENERATION
===============================================*/
function generateInvoice(data) {
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(`
        <html>
        <head>
            <title>Invoice - Crucial Online Sales</title>
            <style>
                body { font-family: Arial, sans-serif; padding: 20px; }
                .invoice-box { max-width: 800px; margin: auto; padding: 30px; border: 1px solid #eee; box-shadow: 0 0 10px rgba(0,0,0,0.15); }
                .invoice-box { width: 100%; box-sizing: border-box; } 
                h1 { color: #1a237e; }
                table { width: 100%; line-height: inherit; text-align: left; border-collapse: collapse; }
                table td { padding: 5px; vertical-align: top; }
                table tr td:nth-child(2) { text-align: right; }
                .heading td { background: #eee; border-bottom: 1px solid #ddd; font-weight: bold; }
                .total td { border-top: 2px solid #eee; font-weight: bold; }
                /* Mobile Responsive */
                @media only screen and (max-width: 600px) { .invoice-box { padding: 15px; } table td { display: block; width: 100%; text-align: left !important; } .invoice-box table tr.heading td { display: none; } .invoice-box table tr td:nth-child(2) { font-weight: bold; text-align: left; } }
            </style>
        </head>
        <body>
            <div class="invoice-box">
                <h1>INVOICE</h1>
                <p><strong>Customer:</strong> ${data.name}</p>
                <p><strong>Phone:</strong> ${data.phone}</p>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Address:</strong> ${data.address}</p>
                <p><strong>Total Items:</strong> ${data.quantity}</p>
                <hr>
                <table>
                    <tr class="heading">
                        <td>Item</td>
                        <td>Price</td>
                    </tr>
                    <tr>
                        <td>${data.product}</td>
                        <td>KSH ${data.amount}</td>
                    </tr>
                    <tr class="total">
                        <td>Total</td>
                        <td>KSH ${data.amount}</td>
                    </tr>
                </table>
                <br>
                <p>Thank you for shopping with Crucial Online Sales!</p>
                <script>window.print();</script>
            </div>
        </body>
        </html>
    `);
    invoiceWindow.document.close();
}

document.addEventListener("DOMContentLoaded", () => {
    updateCartCount(); // Update the nav link on load
    updateHeaderProfileIcon(); // Load saved profile image into header
    
    // Load User Settings if on settings page
    if (window.location.pathname.includes("settings.html")) {
        loadSettings();

        // Profile Icon Upload Logic
        const profileInput = document.getElementById("profileUpload");
        if (profileInput) {
            profileInput.addEventListener("change", function(e) {
                const file = e.target.files[0];
                if (file) {
                    const reader = new FileReader();
                    reader.onload = function(evt) {
                        localStorage.setItem("userProfileImage", evt.target.result);
                        const img = document.getElementById("settingsProfilePic");
                        if(img) img.src = evt.target.result;
                        updateHeaderProfileIcon(); // Update header icon immediately
                        showToast("Profile Photo Updated");
                    };
                    reader.readAsDataURL(file);
                }
            });
        }
    }

    // Helper: Update Header Profile Icon
    function updateHeaderProfileIcon() {
        const profileImage = localStorage.getItem("userProfileImage");
        if (profileImage) {
            // Updates all instances of .profile-icon (e.g. in header)
            document.querySelectorAll(".profile-icon").forEach(icon => icon.src = profileImage);
        }
    }

    // Helper: Update Cart Icon Badge
    function updateCartCount() {
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
        const cartBadge = document.getElementById("cartBadge");
        if(cartBadge) {
            cartBadge.innerText = totalItems;
            
            // Trigger visual "bump" animation
            cartBadge.classList.remove("bump");
            void cartBadge.offsetWidth; // Trigger reflow to restart animation
            cartBadge.classList.add("bump");
        }
    }

    // Add to Cart Logic
    function addToCart(product) {
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const existingProductIndex = cart.findIndex(item => item.name === product.name);
        if (existingProductIndex > -1) {
            cart[existingProductIndex].quantity++;
        } else {
            cart.push({ ...product, quantity: 1 });
        }
        localStorage.setItem("shoppingCart", JSON.stringify(cart));
    }

    // 1. Make all product cards on the homepage clickable
    const productCards = document.querySelectorAll(".card");
    productCards.forEach(card => {
        card.style.cursor = "pointer"; // indicate it's clickable
        card.addEventListener("click", () => {
            window.location.href = "products.html"; // open product page
        });
    });

    // 2. Make all links under "Important" sidebar open contact page
    const importantLinks = document.querySelectorAll(".ads-sidebar a");
    importantLinks.forEach(link => {
        link.style.cursor = "pointer";
        link.addEventListener("click", (e) => {
            e.preventDefault(); // prevent default behavior if href exists
            window.location.href = "contact us.html"; // open contact page
        });
    });

    // 3. Handle "Buy Now" clicks to pass data to checkout
    const buyButtons = document.querySelectorAll(".buy-btn");
    buyButtons.forEach(btn => {
        btn.addEventListener("click", (e) => {
            e.preventDefault(); // Stop default link behavior
            
            const card = btn.closest(".product-card");
            if (card) {
                // Extract text safely
                const name = card.querySelector("p b")?.innerText || "Product";
                // Extract price: Remove "KSH", commas, and whitespace
                const priceText = card.querySelectorAll("p")[1]?.innerText || "0";
                const priceClean = priceText.replace(/[^0-9]/g, '');
                // Extract Image
                const img = card.querySelector("img")?.src || "images/logo.jpg";

                const product = { name: name, price: parseInt(priceClean), image: img };
                
                addToCart(product);
                updateCartCount();
                showToast(`${name} Added to Cart`);
            }
        });
    });

    /* ============================================
       CART MODAL FUNCTIONALITY (All Pages)
    ===============================================*/
    const cartIconContainer = document.getElementById("cartIconContainer");
    const cartModalOverlay = document.getElementById("cartModalOverlay");
    const closeCartModal = document.getElementById("closeCartModal");
    const cartModalContent = document.getElementById("cartModalContent");
    const cartModalTotal = document.getElementById("cartModalTotal");
    const checkoutBtn = document.getElementById("checkoutBtn");

    // Open cart modal
    if (cartIconContainer && cartModalOverlay) {
        cartIconContainer.addEventListener("click", () => {
            renderCartModal();
            cartModalOverlay.style.display = "flex";
            document.body.style.overflow = "hidden";
        });
    }

    // Close cart modal
    if (closeCartModal && cartModalOverlay) {
        closeCartModal.addEventListener("click", () => {
            cartModalOverlay.style.display = "none";
            document.body.style.overflow = "auto";
        });

        // Close on overlay click
        cartModalOverlay.addEventListener("click", (e) => {
            if (e.target === cartModalOverlay) {
                cartModalOverlay.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });

        // Close on Escape key
        document.addEventListener("keydown", (e) => {
            if (e.key === "Escape" && cartModalOverlay.style.display === "flex") {
                cartModalOverlay.style.display = "none";
                document.body.style.overflow = "auto";
            }
        });
    }

    // Render cart modal content
    function renderCartModal() {
        if (!cartModalContent) return;

        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        
        if (cart.length === 0) {
            cartModalContent.innerHTML = `
                <div class="cart-empty">
                    <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#ccc" stroke-width="1" stroke-linecap="round" stroke-linejoin="round">
                        <circle cx="9" cy="21" r="1"></circle>
                        <circle cx="20" cy="21" r="1"></circle>
                        <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"></path>
                    </svg>
                    <p>Your cart is empty</p>
                    <a href="products.html" class="btn" onclick="document.getElementById('cartModalOverlay').style.display='none'">Start Shopping</a>
                </div>
            `;
            if (cartModalTotal) cartModalTotal.innerText = "KSH 0";
            if (checkoutBtn) checkoutBtn.style.display = "none";
        } else {
            let html = '<div class="cart-items">';
            let total = 0;

            cart.forEach((item, index) => {
                const itemTotal = item.price * item.quantity;
                total += itemTotal;
                html += `
                    <div class="cart-item">
                        <img src="${item.image}" alt="${item.name}" class="cart-item-img">
                        <div class="cart-item-details">
                            <h4>${item.name}</h4>
                            <p class="cart-item-price">KSH ${item.price.toLocaleString()}</p>
                            <div class="cart-item-quantity">
                                <button class="qty-btn minus" data-index="${index}">−</button>
                                <span>${item.quantity}</span>
                                <button class="qty-btn plus" data-index="${index}">+</button>
                            </div>
                        </div>
                        <div class="cart-item-total">
                            <p>KSH ${itemTotal.toLocaleString()}</p>
                            <button class="remove-item" data-index="${index}" title="Remove item">
                                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <polyline points="3 6 5 6 21 6"></polyline>
                                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                </svg>
                            </button>
                        </div>
                    </div>
                `;
            });

            html += '</div>';
            cartModalContent.innerHTML = html;
            if (cartModalTotal) cartModalTotal.innerText = `KSH ${total.toLocaleString()}`;
            if (checkoutBtn) checkoutBtn.style.display = "block";

            // Add event listeners to quantity buttons
            document.querySelectorAll('.qty-btn.minus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    updateCartItemQuantity(index, -1);
                });
            });

            document.querySelectorAll('.qty-btn.plus').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.target.dataset.index);
                    updateCartItemQuantity(index, 1);
                });
            });

            document.querySelectorAll('.remove-item').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    const index = parseInt(e.currentTarget.dataset.index);
                    removeCartItem(index);
                });
            });
        }
    }

    // Update cart item quantity
    function updateCartItemQuantity(index, change) {
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

    // Remove item from cart
    function removeCartItem(index) {
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const itemName = cart[index]?.name || 'Item';
        cart.splice(index, 1);
        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        updateCartCount();
        renderCartModal();
        showToast(`${itemName} removed from cart`);
    }

    // 4. Render Cart on Checkout Page
    if (window.location.pathname.includes("checkout.html")) {
        // Auto-fill Email if available (assuming saved in localStorage from login)
        const savedEmail = localStorage.getItem("userEmail");
        if(savedEmail) document.getElementById("email").value = savedEmail;

        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const cartTableBody = document.getElementById("cartTableBody");
        const totalField = document.getElementById("totalAmount");
        const grandTotalDisplay = document.getElementById("grandTotalDisplay");

        if (cart.length === 0) {
            cartTableBody.innerHTML = "<tr><td colspan='6' style='text-align:center;'>Your cart is empty. <a href='products.html'>Go shop</a></td></tr>";
            totalField.value = 0;
            grandTotalDisplay.innerText = "KSH 0";
        } else {
            let html = ``;
            let total = 0;

            cart.forEach((item, index) => {
                const subtotal = item.price * item.quantity;
                html += `<tr>
                            <td><img src="${item.image}" alt="${item.name}" style="width:60px; height:60px; object-fit:cover; border-radius:4px;"></td>
                            <td>${item.name}</td>
                            <td>KSH ${item.price}</td>
                            <td>
                                <div class="quantity-controls">
                                    <button type="button" class="quantity-btn" onclick="updateCartItem(${index}, -1)">-</button>
                                    <span class="item-quantity">${item.quantity}</span>
                                    <button type="button" class="quantity-btn" onclick="updateCartItem(${index}, 1)">+</button>
                                </div>
                            </td>
                            <td>KSH ${subtotal}</td>
                            <td>
                                <button type="button" onclick="deleteCartItem(${index})" style="background:#ff4444; color:white; border:none; padding:5px 10px; border-radius:4px; cursor:pointer;">
                                    Delete
                                </button>
                            </td>
                         </tr>`;
                total += subtotal;
            });

            cartTableBody.innerHTML = html;
            totalField.value = total;
            grandTotalDisplay.innerText = `KSH ${total}`;
        }
    }

    // Cart Modal Event Listeners
    const cartIcon = document.getElementById("cartIconContainer");
    const cartModalOverlay = document.getElementById("cartModalOverlay");
    const closeCartModalBtn = document.getElementById("closeCartModal");

    if (cartIcon) cartIcon.addEventListener("click", toggleCartModal);
    if (closeCartModalBtn) closeCartModalBtn.addEventListener("click", toggleCartModal);
    if (cartModalOverlay) {
        cartModalOverlay.addEventListener("click", (e) => {
            if (e.target === cartModalOverlay) toggleCartModal();
        });
    }

    function toggleCartModal() {
        if (cartModalOverlay.classList.contains("active")) {
            cartModalOverlay.classList.remove("active");
        } else {
            renderCartModal();
            cartModalOverlay.classList.add("active");
        }
    }

    function renderCartModal() {
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        const modalContent = document.getElementById("cartModalContent");
        const modalTotal = document.getElementById("cartModalTotal");
        const checkoutBtn = document.getElementById("checkoutBtn");
        let total = 0;

        if (cart.length === 0) {
            modalContent.innerHTML = '<p class="empty-cart-message">Your cart is empty.</p>';
            checkoutBtn.style.display = 'none'; // Hide checkout if cart is empty
        } else {
            let html = '';
            cart.forEach((item, index) => {
                html += `
                    <div class="cart-item">
                        <div class="cart-item-info">
                            <p class="cart-item-name">${item.name}</p>
                            <p class="cart-item-price">KSH ${item.price}</p>
                        </div>
                        <div class="quantity-controls">
                            <button class="quantity-btn" onclick="changeQuantity(${index}, -1)">-</button>
                            <span class="item-quantity">${item.quantity}</span>
                            <button class="quantity-btn" onclick="changeQuantity(${index}, 1)">+</button>
                        </div>
                    </div>`;
                total += item.price * item.quantity;
            });
            modalContent.innerHTML = html;
            checkoutBtn.style.display = 'block';
        }
        modalTotal.innerText = `KSH ${total}`;
    }

    // Make changeQuantity global
    window.changeQuantity = (index, delta) => {
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) {
                cart.splice(index, 1); // Remove item if quantity is 0 or less
            }
        }
        localStorage.setItem("shoppingCart", JSON.stringify(cart));
        renderCartModal();
        updateCartCount();
    };

    // Checkout page specific helpers
    window.deleteCartItem = (index) => {
        window.changeQuantity(index, -1000); // Forces delete
        window.location.reload();
    };

    window.updateCartItem = (index, delta) => {
        const cart = JSON.parse(localStorage.getItem("shoppingCart")) || [];
        if (cart[index]) {
            cart[index].quantity += delta;
            if (cart[index].quantity <= 0) cart.splice(index, 1);
            localStorage.setItem("shoppingCart", JSON.stringify(cart));
            window.location.reload();
        }
    };

    // Helper: Show Toast Notification
    function showToast(message) {
        let toast = document.getElementById("toast");
        if (!toast) {
            toast = document.createElement("div");
            toast.id = "toast";
            toast.className = "toast";
            document.body.appendChild(toast);
        }
        toast.innerHTML = `<span class="toast-tick">✓</span> ${message}`;
        toast.className = "toast show";
        // Hide after 3 seconds
        setTimeout(() => { toast.className = toast.className.replace("show", ""); }, 3000);
    }

    // Settings: Load Data
    function loadSettings() {
        // Simulate getting data from storage
        const user = JSON.parse(localStorage.getItem("userProfile")) || {
            fname: "", lname: "", phone: "", county: "", email: "user@example.com"
        };
        const profileImage = localStorage.getItem("userProfileImage");

        document.getElementById("settingsFname").value = user.fname;
        document.getElementById("settingsLname").value = user.lname;
        document.getElementById("settingsPhone").value = user.phone;
        document.getElementById("settingsCounty").value = user.county;
        document.getElementById("currentEmail").value = user.email;

        // Load Profile Picture if available
        if (profileImage) {
            const img = document.getElementById("settingsProfilePic");
            if (img) img.src = profileImage;
        }
    }

    // Make settings functions global
    window.saveProfileSettings = () => {
        const user = JSON.parse(localStorage.getItem("userProfile")) || { email: "user@example.com" };
        
        user.fname = document.getElementById("settingsFname").value;
        user.lname = document.getElementById("settingsLname").value;
        user.phone = document.getElementById("settingsPhone").value;
        user.county = document.getElementById("settingsCounty").value;

        localStorage.setItem("userProfile", JSON.stringify(user));
        showToast("Profile Updated Successfully");
    };

    window.changeEmail = () => {
        const newEmail = document.getElementById("newEmail").value;
        if(newEmail && newEmail.includes("@")) {
            const user = JSON.parse(localStorage.getItem("userProfile")) || {};
            user.email = newEmail;
            localStorage.setItem("userProfile", JSON.stringify(user));
            document.getElementById("currentEmail").value = newEmail;
            document.getElementById("newEmail").value = "";
            showToast("Email Updated Successfully");
        } else {
            alert("Please enter a valid email.");
        }
    };

    window.changePassword = () => {
        const current = document.getElementById("currentPassword").value;
        const newPass = document.getElementById("newPassword").value;
        const confirmPass = document.getElementById("confirmNewPassword").value;

        if(newPass.length < 6) return alert("Password too short");
        if(newPass !== confirmPass) return alert("Passwords do not match");

        // In a real app, verify current password with backend here
        showToast("Password Changed Successfully");
        document.getElementById("passwordForm").reset();
    };
});
