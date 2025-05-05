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
        //ADD WHITELIST OPTION
        document.getElementById('addWhitelist-btn').addEventListener('click', () => {
          const userToAdd = document.getElementById('userToAdd').value;
          if (userToAdd) {
            fetch(`/whitelist/${data.login}`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              body: JSON.stringify({ user: userToAdd, tempId: profileId })
            })
            .then(response => response.json())
            .then(data => {
              if (data.success) {
                const userElement = document.createElement('div');
                userElement.className = 'whitelist-user';
                userElement.textContent = userToAdd;
                const deleteUser = document.createElement('button');
                deleteUser.textContent = '-';
                deleteUser.className = 'delete-user';
                deleteUser.addEventListener('click', () => {
                  fetch(`/whitelist/${data.login}`, {
                    method: 'DELETE',
                    headers: {
                      'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ usernameToRemove: userToAdd, tempId: profileId })
                  })
                  .then(response => response.json())
                  .then(data => {
                    if (data.success) {
                      userElement.remove();
                    } else {
                      console.error('Erro ao remover usuário da whitelist:', data.error);
                    }
                  });
                });
                userElement.appendChild(deleteUser);
                document.getElementById('whitelist').appendChild(userElement);
              } else {
                console.error('Erro ao adicionar usuário à whitelist:', data.error);
              }
            });
        if(data.whitelist) {
          console.log(data.whitelist);
          if(data.whitelist.length > 0) {
            data.whitelist.forEach(user => {
              const userElement = document.createElement('div');
              userElement.className = 'whitelist-user';
              userElement.textContent = user;
              const deleteUser = document.createElement('button');
              deleteUser.textContent = '-';
              deleteUser.className = 'delete-user';
              deleteUser.addEventListener('click', () => {
                fetch(`/whitelist/${data.login}`, {
                  method: 'DELETE',
                  headers: {
                    'Content-Type': 'application/json'
                  },
                  body: JSON.stringify({ usernameToRemove: user, tempId: profileId })
                })
                .then(response => response.json())
                .then(data => {
                  if (data.success) {
                    userElement.remove();
                  } else {
                    console.error('Erro ao remover usuário da whitelist:', data.error);
                  }
                });
              });
              userElement.appendChild(deleteUser);
              document.getElementById('whitelist').appendChild(userElement);
            });
          } else {
            document.getElementById('whitelist').textContent = 'Ainda não há usuários registrados na sua whitelist.';
          }
        }
    }
    })
    .catch(() => {
      document.getElementById('profile-info').textContent = 'Erro ao carregar o perfil.';
      window.location.href = '/login';
    });
  }}
)}
