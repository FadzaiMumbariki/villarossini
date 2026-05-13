// ===== CAROUSEL FUNCTIONALITY =====
let currentSlide = 0;
const slides = document.querySelectorAll('.carousel-slide');
const dots = document.querySelectorAll('.dot');
const carouselBtnPrev = document.querySelector('.carousel-btn-prev');
const carouselBtnNext = document.querySelector('.carousel-btn-next');

function updateCarousel() {
    slides.forEach((slide, index) => {
        slide.classList.remove('active', 'prev');
        if (index === currentSlide) {
            slide.classList.add('active');
        } else if (index === (currentSlide - 1 + slides.length) % slides.length) {
            slide.classList.add('prev');
        }
    });

    dots.forEach((dot, index) => {
        dot.classList.remove('active');
        if (index === currentSlide) {
            dot.classList.add('active');
        }
    });
}

function nextSlide() {
    currentSlide = (currentSlide + 1) % slides.length;
    updateCarousel();
}

function prevSlide() {
    currentSlide = (currentSlide - 1 + slides.length) % slides.length;
    updateCarousel();
}

function goToSlide(index) {
    currentSlide = index;
    updateCarousel();
}

if (carouselBtnNext) {
    carouselBtnNext.addEventListener('click', nextSlide);
}

if (carouselBtnPrev) {
    carouselBtnPrev.addEventListener('click', prevSlide);
}

dots.forEach(dot => {
    dot.addEventListener('click', (e) => {
        const slideIndex = parseInt(e.target.getAttribute('data-slide'));
        goToSlide(slideIndex);
    });
});

// Auto-rotate carousel every 8 seconds
setInterval(nextSlide, 8000);

// Initialize carousel
updateCarousel();

// ===== THREE.JS SETUP =====
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

const container = document.getElementById('canvas-container');
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setClearColor(0x0a0e27, 0.1);
container.appendChild(renderer.domElement);

camera.position.z = 30;

// ===== LIGHTING =====
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
scene.add(ambientLight);

const pointLight1 = new THREE.PointLight(0xd4af37, 1, 100);
pointLight1.position.set(30, 30, 30);
scene.add(pointLight1);

const pointLight2 = new THREE.PointLight(0x00d9ff, 0.8, 100);
pointLight2.position.set(-30, -30, 30);
scene.add(pointLight2);

// ===== GEOMETRY & OBJECTS =====
const objects = [];

// Create rotating cube
const cubeGeometry = new THREE.BoxGeometry(8, 8, 8);
const cubeMaterial = new THREE.MeshPhongMaterial({
    color: 0xd4af37,
    emissive: 0x4a3820,
    shininess: 100,
    wireframe: false
});
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.rotation.x = 0.5;
cube.rotation.y = 0.5;
scene.add(cube);
objects.push({ mesh: cube, speed: 0.005 });

// Create orbiting spheres
const sphereGeometry = new THREE.SphereGeometry(2, 32, 32);
const sphereMaterial = new THREE.MeshPhongMaterial({
    color: 0x00d9ff,
    emissive: 0x006666,
    shininess: 120
});
const sphere1 = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere1.position.x = 15;
scene.add(sphere1);
objects.push({ mesh: sphere1, orbit: true, orbitRadius: 15, speed: 0.005, angle: 0 });

const sphere2 = new THREE.Mesh(sphereGeometry, sphereMaterial);
sphere2.position.x = -15;
scene.add(sphere2);
objects.push({ mesh: sphere2, orbit: true, orbitRadius: 15, speed: 0.004, angle: Math.PI });

// Create rotating torus
const torusGeometry = new THREE.TorusGeometry(12, 4, 64, 100);
const torusMaterial = new THREE.MeshPhongMaterial({
    color: 0x00d9ff,
    emissive: 0x003333,
    shininess: 80,
    wireframe: false
});
const torus = new THREE.Mesh(torusGeometry, torusMaterial);
torus.rotation.x = 0.3;
torus.rotation.z = 0.5;
scene.add(torus);
objects.push({ mesh: torus, speed: 0.003, axis: 'y' });

// Create floating icosahedrons
const icoGeometry = new THREE.IcosahedronGeometry(3, 4);
const icoMaterial = new THREE.MeshPhongMaterial({
    color: 0xd4af37,
    emissive: 0x4a3820,
    shininess: 100,
    transparent: true,
    opacity: 0.8
});
const ico1 = new THREE.Mesh(icoGeometry, icoMaterial);
ico1.position.set(10, -10, 0);
scene.add(ico1);
objects.push({ mesh: ico1, speed: 0.006, axis: 'x' });

const ico2 = new THREE.Mesh(icoGeometry, icoMaterial);
ico2.position.set(-10, 10, 0);
scene.add(ico2);
objects.push({ mesh: ico2, speed: 0.006, axis: 'z' });

// ===== PARTICLE SYSTEM =====
const particleCount = 100;
const particleGeometry = new THREE.BufferGeometry();
const positions = new Float32Array(particleCount * 3);

for (let i = 0; i < particleCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 100;
    positions[i + 1] = (Math.random() - 0.5) * 100;
    positions[i + 2] = (Math.random() - 0.5) * 100;
}

particleGeometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));

const particleMaterial = new THREE.PointsMaterial({
    color: 0x00d9ff,
    size: 0.5,
    transparent: true,
    opacity: 0.6
});

const particles = new THREE.Points(particleGeometry, particleMaterial);
scene.add(particles);

// ===== ANIMATION LOOP =====
let time = 0;

function animate() {
    requestAnimationFrame(animate);
    time += 0.016;

    // Animate objects
    objects.forEach(obj => {
        if (obj.orbit) {
            obj.angle += obj.speed;
            obj.mesh.position.x = Math.cos(obj.angle) * obj.orbitRadius;
            obj.mesh.position.y = Math.sin(obj.angle) * obj.orbitRadius;
        } else if (obj.axis === 'x') {
            obj.mesh.rotation.x += obj.speed;
        } else if (obj.axis === 'y') {
            obj.mesh.rotation.y += obj.speed;
        } else if (obj.axis === 'z') {
            obj.mesh.rotation.z += obj.speed;
        } else {
            obj.mesh.rotation.x += obj.speed;
            obj.mesh.rotation.y += obj.speed;
            obj.mesh.rotation.z += obj.speed * 0.5;
        }
    });

    // Update cube color based on time
    const hue = (time * 0.02) % 1;
    cube.material.color.setHSL(0.15, 1, 0.5);

    // Pulse effect on point lights
    pointLight1.intensity = 1 + 0.5 * Math.sin(time * 0.002);
    pointLight2.intensity = 0.8 + 0.5 * Math.sin(time * 0.003 + Math.PI);

    // Animate particles
    const positionAttribute = particleGeometry.getAttribute('position');
    const positions = positionAttribute.array;
    
    for (let i = 0; i < particleCount; i++) {
        positions[i * 3 + 1] += Math.sin(time * 0.001 + i) * 0.05;
    }
    positionAttribute.needsUpdate = true;

    particles.rotation.x += 0.0002;
    particles.rotation.y += 0.0003;

    renderer.render(scene, camera);
}

animate();

// ===== WINDOW RESIZE =====
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// ===== SCROLL INTERACTIONS =====
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
    const scrollPercent = scrollY / maxScroll;

    camera.position.y = scrollPercent * 20 - 10;
    camera.rotation.x = scrollPercent * 0.5;
});

// ===== MOUSE INTERACTIONS =====
let mouseX = 0;
let mouseY = 0;

document.addEventListener('mousemove', (e) => {
    mouseX = (e.clientX / window.innerWidth) * 2 - 1;
    mouseY = -(e.clientY / window.innerHeight) * 2 + 1;

    camera.rotation.y = mouseX * 0.3;
    camera.rotation.x = mouseY * 0.2;
});

// ===== SMOOTH SCROLL NAVIGATION =====
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            target.scrollIntoView({ behavior: 'smooth' });
        }
    });
});

// ===== BUTTON INTERACTIONS =====
const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .cta-button');

buttons.forEach(button => {
    button.addEventListener('click', function() {
        // Create ripple effect
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(255, 255, 255, 0.6)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s ease-out';
        ripple.style.pointerEvents = 'none';
        
        const rect = this.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height);
        const x = event.clientX - rect.left - size / 2;
        const y = event.clientY - rect.top - size / 2;
        
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = x + 'px';
        ripple.style.top = y + 'px';
        
        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);
        
        setTimeout(() => ripple.remove(), 600);

        // Show notification
        showNotification('Action registered! ✨');
    });
});

// ===== FORM SUBMISSION =====
const form = document.querySelector('.contact-form');
if (form) {
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        showNotification('Message sent successfully! 🎉');
        form.reset();
    });
}

// ===== NOTIFICATION SYSTEM =====
function showNotification(message) {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 100px;
        right: 20px;
        background: linear-gradient(135deg, #d4af37 0%, #f5d96f 100%);
        color: #1a1a1a;
        padding: 1rem 2rem;
        border-radius: 50px;
        font-weight: bold;
        box-shadow: 0 10px 30px rgba(212, 175, 55, 0.4);
        animation: slideInFromRight 0.5s ease-out, slideOutToRight 0.5s ease-out 2.5s forwards;
        z-index: 9999;
        letter-spacing: 0.05em;
    `;

    document.body.appendChild(notification);

    setTimeout(() => notification.remove(), 3000);
}

// ===== ADD ANIMATION KEYFRAMES DYNAMICALLY =====
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }

    @keyframes slideInFromRight {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }

    @keyframes slideOutToRight {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ===== PARALLAX EFFECT ON SCROLL =====
window.addEventListener('scroll', () => {
    const hero = document.querySelector('.hero');
    const offset = window.scrollY;
    if (hero) {
        hero.style.transform = `translateY(${offset * 0.5}px)`;
    }
});

// ===== CARD HOVER EFFECTS =====
const roomCards = document.querySelectorAll('.room-card');
const amenityCards = document.querySelectorAll('.amenity-card');

[...roomCards, ...amenityCards].forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const rotateX = (y - rect.height / 2) / 10;
        const rotateY = (rect.width / 2 - x) / 10;

        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateZ(20px)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
    });
});

// ===== INTERSECTION OBSERVER FOR ANIMATIONS =====
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.animation = getAnimationForElement(entry.target);
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

function getAnimationForElement(element) {
    if (element.classList.contains('room-card')) {
        return 'slideInUp 0.8s ease-out forwards';
    } else if (element.classList.contains('amenity-card')) {
        return 'slideInUp 0.8s ease-out forwards';
    } else if (element.classList.contains('section-title')) {
        return 'slideInDown 0.8s ease-out forwards';
    }
    return 'none';
}

document.querySelectorAll('.room-card, .amenity-card, .section-title').forEach(el => {
    observer.observe(el);
});

// ===== INITIALIZATION MESSAGE =====
console.log('%c🎉 LUXOR Hotel Website Loaded', 'font-size: 20px; color: #d4af37; font-weight: bold;');
console.log('%cExploring 3D luxury experience...', 'font-size: 14px; color: #00d9ff;');