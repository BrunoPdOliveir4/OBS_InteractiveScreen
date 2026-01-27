import { apiService } from '../core/ApiService.js';
import { stateManager } from '../managers/StateManager.js';
import { showPopup } from '../components/PopUp.js';
import { redirect } from '../utils/helpers.js';
import { ROUTES } from '../utils/constants.js';

class ProfilePage {
  constructor() {
    this.profileId = stateManager.getUrlParam('id');
    this.profileData = null;
  }

  async init() {
    if (!this.profileId) {
      this.showError('ID do perfil nao encontrado.');
      redirect(ROUTES.LOGIN);
      return;
    }

    await this.loadProfile();
  }

  async loadProfile() {
    try {
      this.profileData = await apiService.get(`/api/profile/${this.profileId}`);

      if (this.profileData.error) {
        this.showError(this.profileData.error);
        return;
      }

      this.saveCredentials();
      this.displayProfile();
      this.setupNavigation();
      this.displayWhitelist();
      this.setupWhitelistForm();
    } catch (error) {
      this.showError('Erro ao carregar o perfil.');
      redirect(ROUTES.LOGIN);
    }
  }

  saveCredentials() {
    stateManager.saveCredentials(this.profileData.login, this.profileData.access_token);
  }

  displayProfile() {
    const profileImage = document.getElementById('profile-image');
    const loginEl = document.getElementById('login');
    const displayName = document.getElementById('display-name');
    const description = document.getElementById('description');

    if (profileImage) profileImage.src = this.profileData.profile_image_url;
    if (loginEl) loginEl.textContent = `Login: ${this.profileData.login}`;
    if (displayName) displayName.textContent = this.profileData.display_name;
    if (description) description.textContent = `Descricao: ${this.profileData.description}`;
  }

  setupNavigation() {
    document.getElementById('editor-screen')?.addEventListener('click', () => {
      redirect(`${ROUTES.EDITOR}?user=${this.profileData.login}`);
    });

    document.getElementById('show-screen')?.addEventListener('click', () => {
      redirect(`${ROUTES.SHOW}?user=${this.profileData.login}`);
    });
  }

  displayWhitelist() {
    const whitelistEl = document.getElementById('whitelist-list');
    if (!whitelistEl) return;

    if (this.profileData.whitelist && this.profileData.whitelist.length > 0) {
      whitelistEl.innerHTML = '';
      this.profileData.whitelist.forEach((user) => {
        this.addWhitelistUserToDOM(user);
      });
    } else {
      whitelistEl.textContent = 'Ainda nao ha usuarios registrados na sua whitelist.';
    }
  }

  addWhitelistUserToDOM(username) {
    const whitelistEl = document.getElementById('whitelist-list');
    if (!whitelistEl) return;

    // Clear "no users" message if present
    if (whitelistEl.textContent.includes('Ainda nao ha')) {
      whitelistEl.textContent = '';
    }

    const userElement = document.createElement('div');
    userElement.className = 'whitelist-user';
    userElement.textContent = username;

    const deleteBtn = document.createElement('button');
    deleteBtn.textContent = '-';
    deleteBtn.className = 'delete-user';
    deleteBtn.dataset.username = username;

    deleteBtn.addEventListener('click', async (e) => {
      const usernameToRemove = e.target.dataset.username;
      await this.removeFromWhitelist(usernameToRemove, userElement);
    });

    userElement.appendChild(deleteBtn);
    whitelistEl.appendChild(userElement);
  }

  async removeFromWhitelist(username, element) {
    if (username === this.profileData.login) {
      showPopup('Voce nao pode remover a si mesmo da whitelist.', true);
      return;
    }

    try {
      const result = await apiService.delete(`/whitelist/${this.profileData.login}`, {
        usernameToRemove: username,
        tempId: this.profileId,
      });

      if (result.error) {
        showPopup(result.error, true);
        return;
      }

      element.remove();
    } catch (error) {
      showPopup(error.data?.error || 'Erro ao remover usuario da whitelist.', true);
    }
  }

  setupWhitelistForm() {
    const addBtn = document.getElementById('addWhitelist-btn');
    const input = document.getElementById('userToAdd');

    addBtn?.addEventListener('click', async () => {
      const userToAdd = input?.value?.trim();

      if (!userToAdd) {
        showPopup('Digite um nome de usuario.', true);
        return;
      }

      await this.addToWhitelist(userToAdd);
      if (input) input.value = '';
    });
  }

  async addToWhitelist(username) {
    try {
      const result = await apiService.post(`/whitelist/${this.profileData.login}`, {
        usernameToAdd: username,
        tempId: this.profileId,
      });

      if (result.error) {
        showPopup(result.error, true);
        return;
      }

      this.addWhitelistUserToDOM(username);
    } catch (error) {
      showPopup(error.data?.error || 'Erro ao adicionar usuario a whitelist.', true);
    }
  }

  showError(message) {
    const profileInfo = document.getElementById('profile-info');
    if (profileInfo) {
      profileInfo.textContent = message;
    }
  }
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  const profilePage = new ProfilePage();
  profilePage.init();
});

export default ProfilePage;
