export const showPopup = (message, isError = false) => {
    const popup = document.getElementById('popup');
    const messageElement = document.getElementById('popup-message');
    messageElement.textContent = message;
    popup.style.backgroundColor = isError ? '#d9534f' : '#5cb85c'; // vermelho ou verde
    popup.classList.remove('hidden');
    popup.classList.add('show');
    
    setTimeout(() => {
        popup.classList.remove('show');
        popup.classList.add('hidden');
    }, 3000);
}
      
