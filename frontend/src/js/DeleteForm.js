import runRequest from './Request';

export default class DeleteForm {
  constructor(parentTicket) {
    this.parentTicket = parentTicket;
  }

  static get markup() {
    return `
      <form class="delete-form">
        <p class="title">Удалить тикет</p>
        <p>Вы уверены, что хотите удалить тикет? <br>Это действие необратимо.</p>
        <div class="buttons">
          <button class="button button-cancel" type="reset">Отмена</button>
          <button class="button button-ok" type="submit">Ok</button>
        </div>      
      </form>
    `;
  }

  static get formSelector() {
    return '.delete-form';
  }

  static get titleSelector() {
    return '.title';
  }

  static get cancelSelector() {
    return '.button-cancel';
  }

  static get okSelector() {
    return '.button-ok';
  }

  bindToDOM() {
    // document.body.innerHTML += DeleteForm.markup;
    this.container = document.createElement('div');
    this.container.className = 'modal-form';
    this.container.innerHTML = this.constructor.markup;

    document.body.appendChild(this.container);

    this.form = document.querySelector('.delete-form');
    this.title = this.form.querySelector(this.constructor.titleSelector);
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.form.addEventListener('reset', this.onReset.bind(this));
  }

  async onSubmit(e) {
    e.preventDefault();

    const params = {
      data: {
        method: 'deleteTicket',
        id: this.id,
      },
      responseType: 'json',
      method: 'POST',
    };

    try {
      this.parentTicket.drawTicket(await runRequest(params));
    } catch (error) {
      console.error(error);
    }

    this.onReset();
  }

  onReset() {
    this.container.classList.remove('modal-active');
  }

  show(ticket) {
    this.id = ticket.dataset.index;
    this.container.classList.add('modal-active');
  }
}
