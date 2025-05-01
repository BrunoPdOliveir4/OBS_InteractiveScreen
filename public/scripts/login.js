const container = document.getElementById('container');
const loginButton = document.getElementById('login-button');
const errorMessage = document.getElementById('error-message');

loginButton.addEventListener('click', () => {
    window.location.href = loginUrl;  
});

const urlParams = new URLSearchParams(window.location.search);
const code = urlParams.get('code');
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