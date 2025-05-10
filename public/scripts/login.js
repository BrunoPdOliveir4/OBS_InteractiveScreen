const container = document.getElementById('container');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
const canvas = document.getElementById('mouse-trail');
const ctx = canvas.getContext('2d');

canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

let particles = [];

fetch('/get-oauth-info')
      .then(response => response.json())
      .then(data => {
        const clientId = data.clientId;
        const redirectUri = data.redirectUri;
        
        const loginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=user:read:email`;
        
        loginButton.addEventListener('click', () => {
            window.location.href = loginUrl;
        });
        
        const urlParams = new URLSearchParams(window.location.search);
        const code = urlParams.get('code');

        if (code) {
          fetch('/get-token', {
            method: 'POST',
            body: JSON.stringify({ code }),
            headers: {
              'Content-Type': 'application/json'
            }
          })
          .then(response => response.json())
          .then(data => {
            if (data.access_token) {
              container.innerHTML = `<p>Bem-vindo, seu login foi bem-sucedido! Acesso concedido com o token: ${data.access_token}</p>`;
            } else {
              errorMessage.textContent = 'Falha ao obter o token de acesso.';
            }
          })
          .catch(err => {
            errorMessage.textContent = 'Erro de conexão. Tente novamente mais tarde.';
          });
        }
      })
      .catch(err => {
        errorMessage.textContent = 'Erro ao obter as configurações de OAuth.';
      });


window.addEventListener('resize', () => {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
});

document.addEventListener('mousemove', (e) => {
  for (let i = 0; i < 3; i++) {
    particles.push({
      x: e.clientX,
      y: e.clientY,
      alpha: 1,
      radius: Math.random() * 4 + 2,
      dx: (Math.random() - 0.5) * 2,
      dy: (Math.random() - 0.5) * 2
    });
  }
});

function animate() {
  ctx.fillStyle = 'rgba(14,14,16,0)';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  particles.forEach((p, i) => {
    p.x += p.dx;
    p.y += p.dy;
    p.alpha -= 0.02;

    if (p.alpha <= 0) {
      particles.splice(i, 1);
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(145,70,255,${p.alpha})`; 
      ctx.shadowColor = '#9146FF';
      ctx.shadowBlur = 10;
      ctx.fill();
    }
  });

  requestAnimationFrame(animate);
}

animate();
