function showDynamicAlert(message, title = 'Alerta') {
  // Verifica se já existe um modal na página e o remove
  const existingModal = document.getElementById('dynamicAlertModal');
  if (existingModal) {
    existingModal.parentNode.removeChild(existingModal);
  }

  // Cria os elementos do modal
  const modalDiv = document.createElement('div');
  modalDiv.id = 'dynamicAlertModal';
  modalDiv.className = 'modal fade';
  modalDiv.tabIndex = -1;
  modalDiv.setAttribute('aria-labelledby', 'dynamicAlertModalLabel');
  modalDiv.setAttribute('aria-hidden', 'true');

  modalDiv.innerHTML = `
      <div class="modal-dialog">
          <div class="modal-content">
              <div class="modal-header">
                  <h5 class="modal-title">${title}</h5>
                  <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Fechar"></button>
              </div>
              <div class="modal-body">
                  ${message}
              </div>
              <div class="modal-footer">
                  <button type="button" id="dynamicAlertOkButton" 'class="btn btn-primary" data-bs-dismiss="modal">OK</button>
              </div>
          </div>
      </div>
  `;

  // Adiciona o modal ao corpo do documento
  document.body.appendChild(modalDiv);

  // Inicializa e exibe o modal
  const alertModal = new bootstrap.Modal(modalDiv);
  alertModal.show();

  // Adiciona evento ao botão OK
  document.getElementById('dynamicAlertOkButton').addEventListener('click', function () {
    if (typeof onOk === 'function') {
      onOk();
    }
    alertModal.hide(); // Fecha o modal
  });

  // Remove o modal do DOM após ser fechado
  modalDiv.addEventListener('hidden.bs.modal', function () {
    modalDiv.parentNode.removeChild(modalDiv);
  });
}

function removeNotificationsByType(toastType) {
  const toastContainer = document.getElementById('toastContainer');
  if (toastContainer) {
    const toastElements = toastContainer.querySelectorAll('.toast');
    toastElements.forEach(function(toastEl) {
      // Seleciona o elemento que contém a mensagem
      const messageEl = toastEl.querySelector('.toast-body');
      if (messageEl && messageEl.textContent.includes(toastType)) {
        // Obtém a instância do toast, se existir, e a destrói
        const toastInstance = bootstrap.Toast.getInstance(toastEl);
        if (toastInstance) {
          toastInstance.dispose();
        }
        // Remove o elemento do DOM
        toastEl.parentNode.removeChild(toastEl);
      }
    });
  }
}



function showNotification(message, title = 'Notificação') {
  // Verifica se o contêiner de toasts já existe
  let toastContainer = document.getElementById('toastContainer');
  if (!toastContainer) {
    // Se não existir, cria o contêiner
    toastContainer = document.createElement('div');
    toastContainer.id = 'toastContainer';
    toastContainer.className = 'toast-container position-fixed d-flex flex-column align-items-center';
    toastContainer.style.top = '20px'; // Ajuste conforme necessário
    toastContainer.style.left = '50%';
    toastContainer.style.transform = 'translateX(-50%)';
    toastContainer.style.zIndex = '9999'; // Define um z-index alto
    document.body.appendChild(toastContainer);
  }

  // Gerar o hash SHA-256 da mensagem usando CryptoJS
  const hash = CryptoJS.SHA256(message);
  const hashHex = hash.toString(CryptoJS.enc.Hex);
  const toastId = 'toast' + hashHex;

  if (document.getElementById(toastId))
    return
  // Cria o elemento do toast
  const toastDiv = document.createElement('div');
  toastDiv.id = toastId;
  toastDiv.className = 'toast align-items-center text-bg-danger border-0 mb-2';
  toastDiv.style.maxWidth = '600px'; // Define a largura máxima
  toastDiv.style.width = '100%'; // O toast ocupa toda a largura disponível até o máximo definido
  toastDiv.setAttribute('role', 'alert');
  toastDiv.setAttribute('aria-live', 'assertive');
  toastDiv.setAttribute('aria-atomic', 'true');

  // Conteúdo do toast
  toastDiv.innerHTML = `
      <div class="d-flex">
          <div class="toast-body">
              <strong>${title}</strong><br>
              ${message}
          </div>
          <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Fechar"></button>
      </div>
  `;

  // Adiciona o toast ao contêiner
  toastContainer.appendChild(toastDiv);

  // Inicializa e exibe o toast
  const toastElement = new bootstrap.Toast(toastDiv, {
    autohide: false
  });
  toastElement.show();

  // Remove o toast do DOM após ser ocultado
  toastDiv.addEventListener('hidden.bs.toast', function () {
    toastDiv.parentNode.removeChild(toastDiv);
  });
}

