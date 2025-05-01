function getAccessToken() {
    const hash = document.location.hash;
    if (hash) {
        const params = new URLSearchParams(hash.substring(1)); // Remove the '#' from the fragment
        return params.get('access_token');
    }

}

const accessToken = getAccessToken();
console.log('Access Token:', accessToken);
if (!accessToken) {
    document.getElementById('error-message').textContent = 'Token de acesso não encontrado. Por favor, faça login novamente.';
} else {
    fetch(`/profile?access_token=${accessToken}`)
      .then(response => response.json())
      .then(data => {
        if (data.error) {
          document.getElementById('error-message').textContent = data.error;
        } else {
          document.getElementById('profile-image').src = data.profileImageUrl;
          document.getElementById('login').innerHTML = `Login: <strong>${data.login}</strong>`;
          document.getElementById('display-name').innerHTML = `Nome de exibição: <strong>${data.displayName}</strong>`;
          document.getElementById('email').innerHTML = `Email: <strong>${data.email}</strong>`;
          document.getElementById('description').innerHTML = `Descrição: <strong>${data.description}</strong>`;
        }
    })
    .catch(err => {
    document.getElementById('error-message').textContent = 'Erro ao carregar as informações do perfil.';
    });
}