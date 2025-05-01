const userData = {
    id: "<%= id %>", 
    login: "<%= login %>",
    displayName: "<%= displayName %>",
    email: "<%= email %>",
    profileImageUrl: "<%= profileImageUrl %>",
    description: "<%= description %>"
};

document.getElementById('profile-image').src = userData.profileImageUrl;
document.getElementById('login').textContent = `Login: ${userData.login}`;
document.getElementById('display-name').textContent = `Nome de exibição: ${userData.displayName}`;
document.getElementById('email').textContent = `Email: ${userData.email}`;
document.getElementById('description').textContent = `Descrição: ${userData.description}`;
document.getElementById('profile-id').textContent = `ID: ${userData.id}`;
document.getElementById('editor-screen').addEventListener('click', () => {
    window.location.href = `/editor?user=${userData.login}`;
}
);

document.getElementById('show-screen').addEventListener('click', () => {
    window.location.href = `/show?user=${userData.login}`;
}
);