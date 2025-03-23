const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const width = canvas.width = 800;
const height = canvas.height = 600;

let lastTime = 0;
let asteroidInterval = 2000; // Interval in milliseconds for asteroid generation
let nextAsteroidTime = 0;

class Bullet {
    constructor(x, y, angle) {
        this.x = x;
        this.y = y;
        this.angle = angle;
        this.speed = 10;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, 3, 0, Math.PI * 2);
        ctx.fillStyle = 'white';
        ctx.fill();
        ctx.closePath();
    }

    update() {
        this.x += Math.cos(this.angle) * this.speed;
        this.y += Math.sin(this.angle) * this.speed;

        if (this.x < 0 || this.x > width || this.y < 0 || this.y > height) {
            this.remove = true;
        }
    }
}

class Asteroid {
    constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.size = Math.random() * 50 + 50;
        this.speedX = (Math.random() - 0.5) * 2;
        this.speedY = (Math.random() - 0.5) * 2;
    }

    draw() {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.strokeStyle = 'white';
        ctx.stroke();
    }

    update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
    }
}

const ship = {
    x: width / 2,
    y: height / 2,
    angle: 0,
    rotationSpeed: 0.05,
    thrust: {
        x: 0,
        y: 0
    },
    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        ctx.strokeStyle = 'white';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(10, 0);
        ctx.lineTo(-10, -7);
        ctx.lineTo(-5, 0);
        ctx.lineTo(-10, 7);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
    },
    update() {
        this.x += this.thrust.x;
        this.y += this.thrust.y;

        if (this.x > width) this.x = 0;
        if (this.x < 0) this.x = width;
        if (this.y > height) this.y = 0;
        if (this.y < 0) this.y = height;
    }
};

let bullets = [];
let asteroids = [];

function generateAsteroid() {
    const asteroid = new Asteroid();
    asteroids.push(asteroid);
}

function gameLoop(timestamp) {
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    if (timestamp > nextAsteroidTime) {
        generateAsteroid();
        nextAsteroidTime = timestamp + asteroidInterval;
    }

    ctx.clearRect(0, 0, width, height);

    ship.update();
    ship.draw();

    bullets.forEach(bullet => {
        bullet.draw();
        bullet.update();
    });

    asteroids.forEach(asteroid => {
        asteroid.draw();
        asteroid.update();
    });

    // Collision detection
    bullets.forEach(bullet => {
        asteroids.forEach(asteroid => {
            const dx = bullet.x - asteroid.x;
            const dy = bullet.y - asteroid.y;
            const distance = Math.sqrt(dx * dx + dy * dy);

            if (distance < asteroid.size) {
                bullet.remove = true;
                asteroid.remove = true;
            }
        });
    });

    // Clean up bullets and asteroids
    bullets = bullets.filter(bullet => !bullet.remove);
    asteroids = asteroids.filter(asteroid => !asteroid.remove);

    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowUp') {
        ship.thrust.x += Math.cos(ship.angle) * 0.1;
        ship.thrust.y += Math.sin(ship.angle) * 0.1;
    } else if (e.key === 'ArrowLeft') {
        ship.angle -= ship.rotationSpeed;
    } else if (e.key === 'ArrowRight') {
        ship.angle += ship.rotationSpeed;
    } else if (e.key === 'Space') {
        const bullet = new Bullet(ship.x, ship.y, ship.angle);
        bullets.push(bullet);
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowUp') {
        ship.thrust.x = 0;
        ship.thrust.y = 0;
    }
});

requestAnimationFrame(gameLoop);
