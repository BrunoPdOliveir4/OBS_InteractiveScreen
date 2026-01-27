import { apiService } from '../core/ApiService.js';

class LoginPage {
  constructor() {
    this.canvas = null;
    this.ctx = null;
    this.particles = [];
  }

  async init() {
    this.initCanvas();
    this.setupMouseTrail();
    this.animate();
    await this.setupOAuth();
  }

  initCanvas() {
    this.canvas = document.getElementById('mouse-trail');
    if (!this.canvas) return;

    this.ctx = this.canvas.getContext('2d');
    this.resizeCanvas();

    window.addEventListener('resize', () => this.resizeCanvas());
  }

  resizeCanvas() {
    if (this.canvas) {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight;
    }
  }

  setupMouseTrail() {
    document.addEventListener('mousemove', (e) => {
      for (let i = 0; i < 3; i++) {
        this.particles.push({
          x: e.clientX,
          y: e.clientY,
          alpha: 1,
          radius: Math.random() * 4 + 2,
          dx: (Math.random() - 0.5) * 2,
          dy: (Math.random() - 0.5) * 2,
        });
      }
    });
  }

  animate() {
    if (!this.ctx) return;

    this.ctx.fillStyle = 'rgba(14,14,16,0)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

    this.particles.forEach((p, i) => {
      p.x += p.dx;
      p.y += p.dy;
      p.alpha -= 0.02;

      if (p.alpha <= 0) {
        this.particles.splice(i, 1);
      } else {
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
        this.ctx.fillStyle = `rgba(145,70,255,${p.alpha})`;
        this.ctx.shadowColor = '#9146FF';
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
      }
    });

    requestAnimationFrame(() => this.animate());
  }

  async setupOAuth() {
    const loginButton = document.getElementById('login-button');
    const errorMessage = document.getElementById('error-message');

    try {
      const data = await apiService.get('/get-oauth-info');
      const { clientId, redirectUri } = data;

      const loginUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=code&scope=user:read:email`;

      loginButton?.addEventListener('click', () => {
        window.location.href = loginUrl;
      });

      // Handle OAuth callback
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        try {
          await apiService.post('/get-token', { code });
        } catch (tokenError) {
          if (errorMessage) {
            errorMessage.textContent = 'Falha ao obter o token de acesso.';
          }
        }
      }
    } catch (error) {
      if (errorMessage) {
        errorMessage.textContent = 'Erro ao obter as configuracoes de OAuth.';
      }
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const loginPage = new LoginPage();
  loginPage.init();
});

export default LoginPage;
