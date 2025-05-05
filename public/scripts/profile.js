const params = new URLSearchParams(window.location.search);
const profileId = params.get('id');

if (!profileId) {
  document.getElementById('profile-info').textContent = 'ID do perfil não encontrado.';
  window.location.href = '/login';
} else {
  fetch(`/api/profile/${profileId}`)
    .then(response => response.json())
    .then(data => {
      if (data.error) {
        document.getElementById('profile-info').textContent = data.error;
      } else {
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('login', data.login);
        document.getElementById('profile-image').src = data.profile_image_url;
        document.getElementById('login').textContent = `Login: ${data.login}`;
        document.getElementById('display-name').textContent = `${data.display_name}`;
        document.getElementById('description').textContent = `Descrição: ${data.description}`;
      
        document.getElementById('editor-screen').addEventListener('click', () => {
            window.location.href = `/editor?user=${data.login}`;
        }
        );
        
        document.getElementById('show-screen').addEventListener('click', () => {
            window.location.href = `/show?user=${data.login}`;
        }
        );

        if(data.whitelist) {
          console.log(data.whitelist);
          document.getElementById('whitelist-list').textContent = 'Whitelist: Sim';
        }
    }
    })
    .catch(() => {
      document.getElementById('profile-info').textContent = 'Erro ao carregar o perfil.';
      window.location.href = '/login';
    });
}

