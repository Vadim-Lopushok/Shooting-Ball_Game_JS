class Projectile {
  constructor(x, y, radius, color, velocity) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.color = color;
    this.velocity = velocity;
  }

  draw() {
    context.beginPath();
    context.arc(this.x, this.y, this.radius, 0, Math.PI * 2, false);
    context.fillStyle = this.color;
    context.fill();
  }

  update() {
    this.draw();
    this.x = this.x + this.velocity.x;
    this.y = this.y + this.velocity.y;
  }
}

let projectiles = [];
let intervalId;
let animationId;
const scoreEl = document.querySelector('#scoreEl');
const modalEl = document.querySelector('#modalEl');
const modalScoreEl = document.querySelector('#modalScoreEl');
const buttonEl = document.querySelector('#buttonEl');
const startButtonEl = document.querySelector('#startButtonEl');
const startModalEl = document.querySelector('#startModalEl');
let score = 0;

function animate() {
  animationId = requestAnimationFrame(animate);
  context.fillStyle = 'rgba(0, 0, 0, 0.1)';
  context.fillRect(0, 0, canvas.width, canvas.height);

  player.update();
  for (let index = particles.length - 1; index >= 0; index--) {
    const particle = particles[index];
    if (particle.alpha <= 0) {
      particles.splice(index, 1);
    } else {
      particle.update();
    }
    particle.update();
  }

  for (let index = projectiles.length - 1; index >= 0; index--) {
    const projectile = projectiles[index];
    projectile.update();

    // remove from edges of screen
    if (projectile.x + projectile.radius < 0 || projectile.x -
      projectile.radius > canvas.width || projectile.y + projectile.radius <
      0 || projectile.y - projectile.radius > canvas.height) {
      projectiles.splice(index, 1);
    }
  }

  for (let index = enemies.length - 1; index >= 0; index--) {
    const enemy = enemies[index];

    enemy.update();

    const distance = Math.hypot(player.x - enemy.x, player.y - enemy.y);

    // End Game
    if (distance - enemy.radius - player.radius < 1) {
      cancelAnimationFrame(animationId);
      clearInterval(intervalId);

      modalEl.style.display = 'block';
      gsap.fromTo('#modalEl', {
        scale: 0.8,
        opacity: 0,
      }, {
        scale: 1,
        opacity: 1,
        ease: 'expo',
      });

      modalScoreEl.innerHTML = score;
    }

    for (let projectileIndex = projectiles.length - 1; projectileIndex >=
    0; projectileIndex--) {
      const projectile = projectiles[projectileIndex];
      const distance = Math.hypot(projectile.x - enemy.x,
        projectile.y - enemy.y);

      // When projectiles touch enemy
      if (distance - enemy.radius - projectile.radius < 1) {
        // create explosions
        for (let i = 0; i < enemy.radius * 2; i++) {
          particles.push(
            new Particle(projectile.x, projectile.y, Math.random() * 2,
              enemy.color, {
                x: (Math.random() - 0.5) * (Math.random() * 6),
                y: (Math.random() - 0.5) * (Math.random() * 6),
              }));
        }
        // this is where we shrink our enemy
        if (enemy.radius - 10 > 5) {
          score += 100;
          scoreEl.innerHTML = score;
          gsap.to(enemy, {
            radius: enemy.radius - 10,
          });
          projectiles.splice(projectileIndex, 1);
        } else {
          //remove enemy if they are too small
          score += 150;
          scoreEl.innerHTML = score;
          enemies.splice(index, 1);
          projectiles.splice(projectileIndex, 1);
        }
      }
    }
  }
}

function init() {
  player = new Player(x, y, 10, 'white');
  projectiles = [];
  enemies = [];
  particles = [];
  animationId;
  score = 0;
  scoreEl.innerHTML = '0';
}

addEventListener('click', (event) => {
  const angle = Math.atan2(event.clientY - player.y,
    event.clientX - player.x);
  const velocity = {
    x: Math.cos(angle) * 5, y: Math.sin(angle) * 5,
  };

  projectiles.push(
    new Projectile(player.x, player.y, 5, 'white', velocity));
});

// restart game
buttonEl.addEventListener('click', () => {
  init();
  animate();
  spawnEnemies();
  gsap.to('#modalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: 'expo.in',
    onComplete: () => {
      modalEl.style.display = 'none';
    },
  });
});

startButtonEl.addEventListener('click', () => {
  init();
  animate();
  spawnEnemies();
  gsap.to('#startModalEl', {
    opacity: 0,
    scale: 0.8,
    duration: 0.2,
    ease: 'expo.in',
    onComplete: () => {
      startModalEl.style.display = 'none';
    },
  });
});

window.addEventListener('keydown', (event) => {
  switch (event.key) {
    case 'ArrowRight':
      player.velocity.x += 1;
      break;

    case 'ArrowUp':
      player.velocity.y -= 1;
      break;

    case 'ArrowLeft':
      player.velocity.x -= 1;
      break;

    case 'ArrowDown':
      player.velocity.y += 1;
      break;
  }
})