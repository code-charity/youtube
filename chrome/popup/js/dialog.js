/*--------------------------------------------------------------
>>> DIALOG:
----------------------------------------------------------------
1.0 Open dialog
2.0 Close dialog
3.0 Confirm
--------------------------------------------------------------*/


/*--------------------------------------------------------------
1.0 Open dialog
--------------------------------------------------------------*/

function openDialog(list, styles) {
  let dialog_surface = document.createElement('div');

  dialog_surface.classList.add('dialog__surface');

  if (typeof list == 'object')
    dialog_surface.appendChild(list);

  if (styles)
    for (let key in styles)
      dialog_surface.style[key] = styles[key];

  document.querySelector('.dialog').appendChild(dialog_surface);
  document.querySelector('.dialog').classList.add('dialog--open');
  dialog_surface.classList.add('dialog__surface--open');

  return dialog_surface;
}


/*--------------------------------------------------------------
2.0 Close dialog
--------------------------------------------------------------*/

function closeDialog() {
  if (document.querySelector('.dialog').classList.contains('dialog--open')) {
    while (document.querySelector('.dialog__surface'))
      document.querySelector('.dialog__surface').classList.remove('dialog__surface');

    document.querySelector('.dialog').classList.remove('dialog--open');
    document.querySelector('.dialog__surface--open').remove();
  }
}

document.querySelector('.dialog__backdrop').addEventListener('click', closeDialog);


/*--------------------------------------------------------------
3.0 Config
--------------------------------------------------------------*/

function dialogConfirm(text, func) {
  let dialog_surface = openDialog(0),
  label = document.createElement('div'),
  container = document.createElement('div'),
  button_allow = document.createElement('div'),
  deny = document.createElement('div');

  label.classList.add('dialog__surface__label');
  label.innerHTML = text;

  button_allow.classList.add('dialog__surface__button');
  button_allow.innerHTML = 'Allow';
  button_allow.onclick = function () {
    func();
    closeDialog();
  };

  deny.classList.add('dialog__surface__button');
  deny.innerHTML = 'Deny';
  deny.onclick = closeDialog;

  container.style.display = 'flex';
  container.appendChild(deny);
  container.appendChild(button_allow);

  dialog_surface.appendChild(label);
  dialog_surface.appendChild(container);
}
