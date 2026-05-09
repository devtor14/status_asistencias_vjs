function alertHandler(message) {
  if (document.body.querySelector('#alert')) return;

  const alertElement = document.createElement('div');
  alertElement.textContent = message;
  alertElement.id = 'alert';
  alertElement.classList.add('card');

  document.body.appendChild(alertElement);

  alertElement.classList.add('show');

  setTimeout(() => {
    alertElement.classList.remove('show');
    alertElement.classList.add('hide');

    alertElement.addEventListener(
      'animationend',
      () => {
        alertElement.remove();
      },
      { once: true },
    );
  }, 4000);
}

export { alertHandler };
