const productsContainer = document.getElementById('products');
const cartCount = document.getElementById('cart-count');
const cartModal = document.getElementById('cart-modal');
const razorpayButton = document.getElementById('razorpay-button');
let cart = [];
let products = [];

// Fetch products from the Fake Store API
async function fetchProducts() {
    try {
        const response = await fetch('https://fakestoreapi.com/products');
        products = await response.json();
        displayProducts(products);
    } catch (error) {
        console.error('Error fetching products:', error);
    }
}

// Display products on the page
function displayProducts(products) {
    products.forEach(product => {
        const productDiv = document.createElement('div');
        productDiv.classList.add('product');
        productDiv.innerHTML = `
            <img src="${product.image}" alt="${product.title}">
            <h3>${product.title}</h3>
            <p>$${product.price}</p>
            <button onclick="addToCart(${product.id})">Add to Cart</button>
        `;
        productsContainer.appendChild(productDiv);
    });
}

// Update cart item count in the UI
function updateCartCount() {
    cartCount.textContent = cart.length;
    razorpayButton.style.display = cart.length > 0 ? 'block' : 'none'; // Show/hide Razorpay button
}

// Add product to the cart
function addToCart(productId) {
    const existingCartItem = cart.find(item => item.productId === productId);
    
    if (existingCartItem) {
        existingCartItem.quantity++;
    } else {
        cart.push({ productId: productId, quantity: 1 });
    }

    updateCartCount();
    alert(`Product added to cart! Current quantity: ${existingCartItem ? existingCartItem.quantity : 1}`);
}

// Show cart items
function showCart() {
    const cartItemsContainer = document.getElementById('cart-items');
    cartItemsContainer.innerHTML = ''; // Clear previous items

    if (cart.length === 0) {
        cartItemsContainer.innerHTML = '<p>Your cart is empty.</p>';
    } else {
        cart.forEach(item => {
            const product = products.find(p => p.id === item.productId);
            const itemDiv = document.createElement('div');
            itemDiv.innerHTML = `
                <p>${product.title} - $${product.price} x ${item.quantity}</p>
                <button onclick="removeFromCart(${item.productId})">Remove</button>
            `;
            cartItemsContainer.appendChild(itemDiv);
        });
    }

    cartModal.style.display = 'block'; // Show the modal
}

// Close cart modal
function closeCart() {
    cartModal.style.display = 'none';
}

// Remove item from cart
function removeFromCart(productId) {
    cart = cart.filter(item => item.productId !== productId);
    updateCartCount();
    showCart(); // Refresh cart display
}
// Show Razorpay payment
function showRazorpay() {
    console.log('Proceed to Checkout clicked');
    if (cart.length === 0) {
        alert('Your cart is empty! Add items to cart before proceeding.');
        return;
    }

    // Calculate total amount
    const totalAmount = cart.reduce((total, item) => {
        const product = products.find(p => p.id === item.productId);
        return total + (product.price * item.quantity);
    }, 0) * 100; // Amount in paise (1 INR = 100 paise)

    const options = {
        key: 'rzp_test_XFPj30xcwYBAgb', // Your Razorpay API key
        amount: totalAmount, // Total price in paise
        currency: 'INR',
        name: 'Shopping App',
        description: 'Test Transaction',
        handler: function (response) {
            alert('Payment successful! Payment ID: ' + response.razorpay_payment_id);
            closeCart(); // Close the cart modal after payment
            // Optionally, clear the cart here or send cart data to your server
            cart = []; // Clear the cart
            updateCartCount(); // Update the UI
        },
        prefill: {
            name: 'Customer Name',
            email: 'customer@example.com',
            contact: '9999999999'
        },
        notes: {
            address: 'Customer address'
        },
        theme: {
            color: '#F37254'
        }
    };

    const rzp1 = new Razorpay(options);
    rzp1.open();
}

// Initialize products when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
    fetchProducts(); // Fetch and display products
});
