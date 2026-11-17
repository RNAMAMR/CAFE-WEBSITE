/* ============================================================
   BREW & BLOOM — MASTER JAVASCRIPT
   Handles: Cart, Menu Filter, Reviews, Reservations, Contact
   ============================================================ */

(function () {
    'use strict';

    /* ============================================================
       1. CART SYSTEM (shared across all pages)
       ============================================================ */
    const Cart = {
        get() {
            return JSON.parse(localStorage.getItem('cart')) || [];
        },
        save(cart) {
            localStorage.setItem('cart', JSON.stringify(cart));
            this.updateCount();
        },
        add(name, price) {
            const cart = this.get();
            const existing = cart.find(item => item.name === name);
            if (existing) {
                existing.quantity += 1;
            } else {
                cart.push({ name, price: Number(price), quantity: 1 });
            }
            this.save(cart);
            showNotification(`✅ ${name} added to cart!`);
        },
        updateQuantity(index, change) {
            const cart = this.get();
            if (!cart[index]) return;
            cart[index].quantity += change;
            if (cart[index].quantity <= 0) cart.splice(index, 1);
            this.save(cart);
        },
        remove(index) {
            const cart = this.get();
            cart.splice(index, 1);
            this.save(cart);
        },
        clear() {
            localStorage.removeItem('cart');
            this.updateCount();
        },
        totalItems() {
            return this.get().reduce((sum, item) => sum + item.quantity, 0);
        },
        totals() {
            const cart = this.get();
            const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);
            const tax = subtotal * 0.08;
            const total = subtotal + tax;
            return { subtotal, tax, total };
        },
        updateCount() {
            const badge = document.getElementById('cartCount');
            if (badge) badge.textContent = this.totalItems();
        }
    };

    window.addToCart = (name, price) => Cart.add(name, price);
    window.updateQuantity = (index, change) => {
        Cart.updateQuantity(index, change);
        renderCartPage();
    };
    window.removeItem = (index) => {
        Cart.remove(index);
        renderCartPage();
    };

    /* ============================================================
       2. NOTIFICATION SYSTEM
       ============================================================ */
    function showNotification(message) {
        const n = document.createElement('div');
        n.className = 'notification';
        n.textContent = message;
        document.body.appendChild(n);

        setTimeout(() => n.classList.add('show'), 100);

        setTimeout(() => {
            n.classList.remove('show');
            setTimeout(() => n.remove(), 400);
        }, 3000);
    }

    /* ============================================================
       3. CART PAGE RENDERING
       ============================================================ */
    function renderCartPage() {
        const cartItemsContainer = document.getElementById('cartItems');
        const cartSummaryContainer = document.getElementById('cartSummary');
        if (!cartItemsContainer || !cartSummaryContainer) return;

        const cart = Cart.get();

        if (cart.length === 0) {
            cartItemsContainer.innerHTML = `
                <div class="empty-cart">
                    <h2>🛒 Your cart is empty</h2>
                    <p>Browse our menu and add some delicious items!</p>
                    <a href="menu.html" class="btn btn-primary">View Menu</a>
                </div>
            `;
            cartSummaryContainer.innerHTML = '';
            Cart.updateCount();
            return;
        }

        let html = '<div class="cart-items-list">';
        cart.forEach((item, index) => {
            const itemTotal = item.price * item.quantity;
            html += `
                <div class="cart-item">
                    <div class="cart-item-details">
                        <h3>${escapeHtml(item.name)}</h3>
                        <p>₱${item.price.toFixed(2)} each</p>
                    </div>
                    <div class="cart-item-controls">
                        <button onclick="updateQuantity(${index}, -1)" class="btn-qty" aria-label="Decrease quantity">−</button>
                        <span class="quantity">${item.quantity}</span>
                        <button onclick="updateQuantity(${index}, 1)" class="btn-qty" aria-label="Increase quantity">+</button>
                        <span class="cart-item-total">₱${itemTotal.toFixed(2)}</span>
                        <button onclick="removeItem(${index})" class="btn-remove" aria-label="Remove item">✕</button>
                    </div>
                </div>
            `;
        });
        html += '</div>';
        cartItemsContainer.innerHTML = html;

        const { subtotal, tax, total } = Cart.totals();
        cartSummaryContainer.innerHTML = `
            <div class="cart-summary">
                <h3>Order Summary</h3>
                <div class="summary-row">
                    <span>Subtotal</span>
                    <span>₱${subtotal.toFixed(2)}</span>
                </div>
                <div class="summary-row">
                    <span>Tax (8%)</span>
                    <span>₱${tax.toFixed(2)}</span>
                </div>
                <div class="summary-row total">
                    <span><strong>Total</strong></span>
                    <span><strong>₱${total.toFixed(2)}</strong></span>
                </div>
                <a href="checkout.html" class="btn btn-primary btn-checkout">Proceed to Checkout</a>
                <a href="menu.html" class="btn btn-secondary">Continue Shopping</a>
            </div>
        `;

        Cart.updateCount();
    }

    /* ============================================================
       4. MENU CATEGORY FILTER
       ============================================================ */
    function setupMenuFilter() {
        const buttons = document.querySelectorAll('.category-btn');
        const menuItems = document.querySelectorAll('.menu-item');
        if (buttons.length === 0 || menuItems.length === 0) return;

        buttons.forEach(button => {
            button.addEventListener('click', function () {
                buttons.forEach(btn => btn.classList.remove('active'));
                this.classList.add('active');

                const category = this.dataset.category;

                menuItems.forEach(item => {
                    if (category === 'all' || item.dataset.category === category) {
                        item.style.display = 'flex';
                    } else {
                        item.style.display = 'none';
                    }
                });
            });
        });
    }

    /* ============================================================
       5. REVIEWS SYSTEM
       ============================================================ */
    const sampleReviews = [
        { id: 1, name: 'Maria Santos', rating: 5, text: 'Absolutely love this place! The coffee is always perfect, and the staff is incredibly friendly. The atmosphere is cozy and welcoming. Best cafe in town!', date: '2 days ago' },
        { id: 2, name: 'Juan Dela Cruz', rating: 4, text: 'Great coffee and pastries. The avocado toast is amazing! Only downside is it gets busy during lunch hours, but totally worth the wait.', date: '5 days ago' },
        { id: 3, name: 'Anna Reyes', rating: 5, text: 'The matcha latte is divine! I love coming here to work. The WiFi is fast and there are plenty of outlets. Perfect study spot!', date: '1 week ago' },
        { id: 4, name: 'Carlo Mendoza', rating: 5, text: "Best coffee shop I've ever been to. The beans are fresh, the baristas are skilled, and the atmosphere is unmatched. Highly recommend!", date: '1 week ago' },
        { id: 5, name: 'Sofia Garcia', rating: 4, text: 'Lovely little cafe with delicious food. The croissants are flaky and buttery. Will definitely be coming back!', date: '2 weeks ago' },
        { id: 6, name: 'Miguel Torres', rating: 5, text: "A hidden gem! The coffee is exceptional and the staff makes you feel like family. Can't recommend this place enough.", date: '2 weeks ago' }
    ];

    function setupReviews() {
        const reviewsGrid = document.getElementById('reviewsGrid');
        const reviewForm = document.getElementById('reviewForm');
        if (!reviewsGrid) return;

        let reviews = JSON.parse(localStorage.getItem('reviews')) || sampleReviews;

        function render() {
            if (reviews.length === 0) {
                reviewsGrid.innerHTML = `
                    <div class="no-reviews">
                        <p>No reviews yet. Be the first to share your experience!</p>
                    </div>
                `;
                return;
            }
            reviewsGrid.innerHTML = reviews.map(review => {
                const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
                return `
                    <div class="review-card">
                        <div class="review-header">
                            <div class="reviewer-info">
                                <span class="reviewer-name">${escapeHtml(review.name)}</span>
                                <span class="reviewer-date">${review.date || 'Just now'}</span>
                            </div>
                            <div class="review-stars">${stars}</div>
                        </div>
                        <p class="review-text">${escapeHtml(review.text)}</p>
                    </div>
                `;
            }).join('');
        }

        function updateStats() {
            const total = reviews.length;
            const avg = total > 0 ? (reviews.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : '0.0';
            const recommend = total > 0 ? Math.round((reviews.filter(r => r.rating >= 4).length / total) * 100) : 0;
            const statNumbers = document.querySelectorAll('.stat-number');
            if (statNumbers.length >= 3) {
                statNumbers[0].textContent = avg;
                statNumbers[1].textContent = total;
                statNumbers[2].textContent = recommend + '%';
            }
        }

        function addReview(name, rating, text) {
            reviews.unshift({
                id: Date.now(),
                name,
                rating: parseInt(rating),
                text,
                date: 'Just now'
            });
            localStorage.setItem('reviews', JSON.stringify(reviews));
            render();
            updateStats();
            showNotification('❤️ Thank you for your review!');
        }

        if (reviewForm) {
            reviewForm.addEventListener('submit', function (e) {
                e.preventDefault();
                const name = document.getElementById('reviewName').value.trim();
                const rating = document.getElementById('reviewRating').value;
                const text = document.getElementById('reviewText').value.trim();
                if (name && text) {
                    addReview(name, rating, text);
                    this.reset();
                }
            });
        }

        render();
        updateStats();
    }

    /* ============================================================
       6. RESERVATION FORM
       ============================================================ */
    function setupReservationForm() {
        const form = document.querySelector('.reservation-form');
        if (!form) return;

        const dateInput = document.getElementById('date');
        if (dateInput) {
            const today = new Date().toISOString().split('T')[0];
            dateInput.setAttribute('min', today);
        }

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const phone = document.getElementById('phone').value.trim();
            const date = document.getElementById('date').value;
            const time = document.getElementById('time').value;
            const guests = document.getElementById('guests').value;
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !phone || !date || !time || !guests) {
                showNotification('⚠️ Please fill in all required fields.');
                return;
            }

            const selectedDate = new Date(date);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            if (selectedDate < today) {
                showNotification('⚠️ Please select a future date.');
                return;
            }

            const reservations = JSON.parse(localStorage.getItem('reservations')) || [];
            reservations.push({
                id: Date.now(),
                name, email, phone, date, time, guests, message,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('reservations', JSON.stringify(reservations));

            showNotification(`✅ Reservation confirmed for ${name} on ${date} at ${time}!`);
            form.reset();

            if (dateInput) {
                const today2 = new Date().toISOString().split('T')[0];
                dateInput.setAttribute('min', today2);
            }
        });
    }

    /* ============================================================
       7. CONTACT FORM
       ============================================================ */
    function setupContactForm() {
        const form = document.querySelector('.contact-form form');
        if (!form) return;

        form.addEventListener('submit', function (e) {
            e.preventDefault();

            const name = document.getElementById('name').value.trim();
            const email = document.getElementById('email').value.trim();
            const subject = document.getElementById('subject').value.trim();
            const message = document.getElementById('message').value.trim();

            if (!name || !email || !message) {
                showNotification('⚠️ Please fill in all required fields.');
                return;
            }

            if (!/^\S+@\S+\.\S+$/.test(email)) {
                showNotification('⚠️ Please enter a valid email address.');
                return;
            }

            const messages = JSON.parse(localStorage.getItem('messages')) || [];
            messages.push({
                id: Date.now(),
                name, email, subject, message,
                createdAt: new Date().toISOString()
            });
            localStorage.setItem('messages', JSON.stringify(messages));

            showNotification(`✅ Thanks, ${name}! We'll get back to you soon.`);
            form.reset();
        });
    }

    /* ============================================================
       8. HAMBURGER MENU (mobile navigation) — improved
       ============================================================ */
    function setupHamburgerMenu() {
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        if (!hamburger || !navLinks) return;

        function closeMenu() {
            navLinks.classList.remove('open');
            hamburger.classList.remove('active');
        }

        hamburger.addEventListener('click', (e) => {
            e.stopPropagation();
            navLinks.classList.toggle('open');
            hamburger.classList.toggle('active');
        });

        // Close menu when a nav link is clicked
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', closeMenu);
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (navLinks.classList.contains('open') &&
                !navLinks.contains(e.target) &&
                !hamburger.contains(e.target)) {
                closeMenu();
            }
        });

        // Close menu on resize to desktop
        window.addEventListener('resize', () => {
            if (window.innerWidth > 768) closeMenu();
        });

        // Close on Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') closeMenu();
        });
    }

    /* ============================================================
       9. UTILITY: Escape HTML
       ============================================================ */
    function escapeHtml(str) {
        if (!str) return '';
        return String(str)
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#039;');
    }

    /* ============================================================
       10. INITIALIZE
       ============================================================ */
    document.addEventListener('DOMContentLoaded', () => {
        Cart.updateCount();
        renderCartPage();
        setupMenuFilter();
        setupReviews();
        setupReservationForm();
        setupContactForm();
        setupHamburgerMenu();

        console.log('✅ Brew & Bloom — all systems loaded');
    });

})();