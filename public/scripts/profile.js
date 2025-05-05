const params = new URLSearchParams(window.location.search);
const profileId = params.get('id');

if (!profileId) {
  document.getElementById('profile-info').textContent = 'ID do perfil não encontrado.';
  window.location.href = '/login';
} else {
  fetch(`/api/profile/${profileId}`)
    .then(response => response.json())
    .then(profileData => {
      if (profileData.error) {
        document.getElementById('profile-info').textContent = profileData.error;
      } else {
        localStorage.setItem('access_token', profileData.access_token);
        localStorage.setItem('login', profileData.login);
        document.getElementById('profile-image').src = profileData.profile_image_url;
        document.getElementById('login').textContent = `Login: ${profileData.login}`;
        document.getElementById('display-name').textContent = `${profileData.display_name}`;
        document.getElementById('description').textContent = `Descrição: ${profileData.description}`;

        // Botões de navegação
        document.getElementById('editor-screen').addEventListener('click', () => {
          window.location.href = `/editor?user=${profileData.login}`;
        });

        document.getElementById('show-screen').addEventListener('click', () => {
          window.location.href = `/show?user=${profileData.login}`;
        });

        // Exibir usuários da whitelist
        if (profileData.whitelist && profileData.whitelist.length > 0) {
          profileData.whitelist.forEach(user => {
            addWhitelistUserToDOM(user, profileData.login, profileId);
          });
        } else {
          document.getElementById('whitelist-list').textContent = 'Ainda não há usuários registrados na sua whitelist.';
        }

        // Adicionar usuário à whitelist
        document.getElementById('addWhitelist-btn').addEventListener('click', () => {
          const userToAdd = document.getElementById('userToAdd').value;
          if (userToAdd) {
            fetch(`/whitelist/${profileData.login}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ usernameToAdd: userToAdd, tempId: profileId })
            })
            .then(async response => {
              const result = await response.json();
              if (response.ok) {
                addWhitelistUserToDOM(userToAdd, profileData.login, profileId);
              } else {
                console.error('Erro ao adicionar usuário à whitelist:', result.error);
                alert(result.error);
              }
            })
            .catch(err => {
              console.error('Erro inesperado:', err);
              alert('Erro inesperado ao tentar adicionar à whitelist.');
            });
          }
        });
      }
    })
    .catch(() => {
      document.getElementById('profile-info').textContent = 'Erro ao carregar o perfil.';
      console.error('Erro ao carregar o perfil:', error);
    });
}

// Função auxiliar para adicionar usuário da whitelist no DOM
function addWhitelistUserToDOM(username, login, profileId) {
  const userElement = document.createElement('div');
  userElement.className = 'whitelist-user';
  userElement.textContent = username;

  const deleteUser = document.createElement('button');
  deleteUser.textContent = '-';
  deleteUser.className = 'delete-user';

  deleteUser.addEventListener('click', (event) => {
    const userToRemove = event.target.parentElement.textContent.slice(0, -1);
    fetch(`/whitelist/${login}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ usernameToRemove: userToRemove, tempId: profileId })
    })
      .then(response => response.json())
      .then(result => {
        if (result.success) {
          userElement.remove();
        } else {
          console.error('Erro ao remover usuário da whitelist:', result.error);
        }
      });
  });

  userElement.appendChild(deleteUser);
  document.getElementById('whitelist').appendChild(userElement);
}
