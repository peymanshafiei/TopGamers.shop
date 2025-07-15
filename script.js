// Date and Time Display
function updateDateTime() {
    const now = new Date();
    const options = {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZone: 'Asia/Tehran'
    };
    
    const persianDate = now.toLocaleDateString('fa-IR', options);
    document.getElementById('currentDateTime').textContent = persianDate;
}

// Update time every second
setInterval(updateDateTime, 1000);
updateDateTime();

// Hero Slider
let currentSlide = 0;
const slides = document.querySelectorAll('.slide');
const dots = document.querySelectorAll('.dot');

function showSlide(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));
    
    slides[index].classList.add('active');
    dots[index].classList.add('active');
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    showSlide(currentSlide);
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    showSlide(currentSlide);
}

// Auto-play slider
setInterval(nextSlide, 5000);

// Slider controls
document.querySelector('.next-slide').addEventListener('click', nextSlide);
document.querySelector('.prev-slide').addEventListener('click', prevSlide);

// Dot navigation
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        currentSlide = index;
        showSlide(currentSlide);
    });
});

// Mobile Navigation
const hamburger = document.querySelector('.hamburger');
const navMenu = document.querySelector('.nav-menu');

hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('active');
    navMenu.classList.toggle('active');
});

// Close mobile menu when clicking on a link
document.querySelectorAll('.nav-menu a').forEach(link => {
    link.addEventListener('click', () => {
        hamburger.classList.remove('active');
        navMenu.classList.remove('active');
    });
});

// Smooth scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            });
        }
    });
});

// Game card click to filter
document.querySelectorAll('.game-card').forEach(card => {
    card.addEventListener('click', () => {
        const game = card.getAttribute('data-game');
        document.getElementById('gameFilter').value = game;
        filterProducts();
        document.getElementById('products').scrollIntoView({ behavior: 'smooth' });
    });
});

// Advanced Product Search and Filter
const searchInput = document.getElementById('searchInput');
const gameFilter = document.getElementById('gameFilter');
const priceFilter = document.getElementById('priceFilter');
const productsGrid = document.getElementById('productsGrid');

function filterProducts() {
    const searchTerm = searchInput.value.toLowerCase();
    const selectedGame = gameFilter.value;
    const selectedPriceRange = priceFilter.value;
    const products = productsGrid.querySelectorAll('.product-card');

    products.forEach(product => {
        const productName = product.getAttribute('data-name').toLowerCase();
        const productGame = product.getAttribute('data-game');
        const productPrice = parseInt(product.getAttribute('data-price'));
        
        // Search filter
        const matchesSearch = productName.includes(searchTerm);
        
        // Game filter
        const matchesGame = selectedGame === '' || productGame === selectedGame;
        
        // Price filter
        let matchesPrice = true;
        if (selectedPriceRange) {
            if (selectedPriceRange === '0-50000') {
                matchesPrice = productPrice < 50000;
            } else if (selectedPriceRange === '50000-100000') {
                matchesPrice = productPrice >= 50000 && productPrice < 100000;
            } else if (selectedPriceRange === '100000-200000') {
                matchesPrice = productPrice >= 100000 && productPrice < 200000;
            } else if (selectedPriceRange === '200000+') {
                matchesPrice = productPrice >= 200000;
            }
        }
        
        if (matchesSearch && matchesGame && matchesPrice) {
            product.style.display = 'block';
            product.classList.add('fade-in');
        } else {
            product.style.display = 'none';
        }
    });
}

searchInput.addEventListener('input', filterProducts);
gameFilter.addEventListener('change', filterProducts);
priceFilter.addEventListener('change', filterProducts);

// Modal functionality
const modal = document.getElementById('orderModal');
const closeBtn = document.querySelector('.close');

closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

window.addEventListener('click', (e) => {
    if (e.target === modal) {
        modal.style.display = 'none';
    }
});

// Buy Product Function
function buyProduct(productName, price) {
    const productNameField = document.getElementById('productName');
    const productPriceField = document.getElementById('productPrice');
    
    productNameField.value = productName;
    productPriceField.value = price.toLocaleString() + ' تومان';
    
    modal.style.display = 'block';
    
    // Add animation
    modal.querySelector('.modal-content').classList.add('slide-up');
}

// Order Form Submission
const orderForm = document.getElementById('orderForm');

orderForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    const submitBtn = e.target.querySelector('button[type="submit"]');
    const originalText = submitBtn.textContent;
    submitBtn.innerHTML = '<span class="loading"></span> در حال پردازش...';
    submitBtn.disabled = true;
    
    const formData = {
        customerName: document.getElementById('customerName').value,
        customerPhone: document.getElementById('customerPhone').value,
        gameName: document.getElementById('gameName').value,
        gameId: document.getElementById('gameId').value,
        productName: document.getElementById('productName').value,
        productPrice: document.getElementById('productPrice').value,
        orderNotes: document.getElementById('orderNotes').value,
        orderDate: new Date().toLocaleString('fa-IR'),
        orderId: 'TG' + Date.now()
    };
    
    // Validate form
    if (!formData.customerName || !formData.customerPhone || !formData.gameId || !formData.gameName) {
        alert('لطفاً تمام فیلدهای اجباری را پر کنید.');
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
        return;
    }
    
    // Save order to localStorage
    let orders = JSON.parse(localStorage.getItem('orders') || '[]');
    orders.push(formData);
    localStorage.setItem('orders', JSON.stringify(orders));
    
    // Show success message
    alert(`سفارش شما با موفقیت ثبت شد!\nشماره سفارش: ${formData.orderId}\nدر حال انتقال به درگاه پرداخت...`);
    
    // Extract price number for ZarinPal
    const priceNumber = formData.productPrice.replace(/[^\d]/g, '');
    
    // Create detailed description for payment
    const description = `خرید ${formData.productName} - بازی: ${getGameNamePersian(formData.gameName)} - سفارش: ${formData.orderId}`;
    
    // Create ZarinPal URL with callback
    const callbackUrl = 'https://topgamers.com'; // Your custom domain
    const zarinpalUrl = `https://zarinp.al/mp40gam?amount=${priceNumber}&description=${encodeURIComponent(description)}&callback_url=${encodeURIComponent(callbackUrl)}`;
    
    // Close modal
    modal.style.display = 'none';
    
    // Reset form
    orderForm.reset();
    submitBtn.textContent = originalText;
    submitBtn.disabled = false;
    
    // Redirect to payment
    window.open(zarinpalUrl, '_blank');
});

// Helper function to get Persian game names
function getGameNamePersian(gameCode) {
    const gameNames = {
        'freefire': 'فری فایر',
        'cod': 'کالاف دیوتی موبایل',
        'pubg': 'پابجی موبایل',
        'roblox': 'روبلاکس',
        'clash': 'کلش رویال',
        'minecraft': 'ماینکرافت'
    };
    return gameNames[gameCode] || gameCode;
}

// Order Tracking
function trackOrder() {
    const orderId = document.getElementById('orderIdInput').value;
    const trackingResult = document.getElementById('trackingResult');
    
    if (!orderId) {
        alert('لطفاً شماره سفارش را وارد کنید.');
        return;
    }
    
    const orders = JSON.parse(localStorage.getItem('orders') || '[]');
    const order = orders.find(o => o.orderId === orderId);
    
    if (order) {
        trackingResult.innerHTML = `
            <h3>جزئیات سفارش</h3>
            <p><strong>شماره سفارش:</strong> ${order.orderId}</p>
            <p><strong>نام مشتری:</strong> ${order.customerName}</p>
            <p><strong>محصول:</strong> ${order.productName}</p>
            <p><strong>بازی:</strong> ${getGameNamePersian(order.gameName)}</p>
            <p><strong>تاریخ سفارش:</strong> ${order.orderDate}</p>
            <p><strong>وضعیت:</strong> <span style="color: #ff6b00;">در حال پردازش</span></p>
            <p><em>سفارش شما در صف پردازش قرار دارد و به زودی انجام خواهد شد.</em></p>
        `;
        trackingResult.style.display = 'block';
    } else {
        trackingResult.innerHTML = `
            <h3>سفارش یافت نشد</h3>
            <p>متأسفانه سفارشی با این شماره یافت نشد. لطفاً شماره سفارش را بررسی کنید یا با پشتیبانی تماس بگیرید.</p>
        `;
        trackingResult.style.display = 'block';
    }
}

// Contact Form
document.querySelector('.contact-form form').addEventListener('submit', (e) => {
    e.preventDefault();
    alert('پیام شما با موفقیت ارسال شد. به زودی با شما تماس خواهیم گرفت.');
    e.target.reset();
});

// Scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
            entry.target.classList.add('fade-in');
        }
    });
}, observerOptions);

// Apply animations to elements
document.addEventListener('DOMContentLoaded', () => {
    const animatedElements = document.querySelectorAll('.product-card, .game-card, .feature, .blog-card, .review-card, .step, .bestseller-card');
    
    animatedElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        observer.observe(el);
    });
});

// Header scroll effect
window.addEventListener('scroll', () => {
    const header = document.querySelector('.header');
    if (window.scrollY > 100) {
        header.style.background = 'rgba(26, 26, 26, 0.95)';
        header.style.backdropFilter = 'blur(10px)';
    } else {
        header.style.background = 'linear-gradient(135deg, #1a1a1a, #2d2d2d)';
        header.style.backdropFilter = 'none';
    }
});

// Loading animation
window.addEventListener('load', () => {
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);
});

// Add interactive button effects
document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', (e) => {
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.3)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = '50%';
        ripple.style.top = '50%';
        ripple.style.width = '100px';
        ripple.style.height = '100px';
        ripple.style.marginLeft = '-50px';
        ripple.style.marginTop = '-50px';
        
        e.target.appendChild(ripple);
        
        setTimeout(() => {
            ripple.remove();
        }, 600);
    });
});

// Performance optimization
const debounce = (func, wait) => {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
};

// Debounced search
const debouncedFilter = debounce(filterProducts, 300);
searchInput.removeEventListener('input', filterProducts);
searchInput.addEventListener('input', debouncedFilter);

// Lazy loading for images
const images = document.querySelectorAll('img');
const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            const img = entry.target;
            if (img.dataset.src) {
                img.src = img.dataset.src;
                img.removeAttribute('data-src');
                imageObserver.unobserve(img);
            }
        }
    });
});

images.forEach(img => imageObserver.observe(img));

// Add ripple animation CSS dynamically
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(2);
            opacity: 0;
        }
    }
    
    .btn {
        position: relative;
        overflow: hidden;
    }
    
    .highlight {
        background: linear-gradient(45deg, #ff6b00, #ff8533);
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        background-clip: text;
    }
`;
document.head.appendChild(style);

// Console welcome message
console.log('%cTopGamers 🎮', 'color: #ff6b00; font-size: 24px; font-weight: bold;');
console.log('%cبهترین فروشگاه آیتم‌های بازی در ایران', 'color: #0066cc; font-size: 16px;');
console.log('%cتماس با پشتیبانی: 09028506317', 'color: #25D366; font-size: 14px;');

// Error handling
window.addEventListener('error', (e) => {
    console.error('خطا در سایت:', e.error);
});

// Service Worker registration (for future PWA implementation)
if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
        // Service worker will be added later
    });
}
