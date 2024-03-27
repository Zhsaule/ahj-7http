import runRequest from './Request';

export default class EditForm {
  constructor(parentTicket) {
    this.parentTicket = parentTicket;
  }

  static get markup() {
    return `
      <form class="edit-form">
        <p class="title">Добавить тикет</p>
        <p>Краткое описание</p>
        <input class="name" type="text" required>
        <p>Подробное описание</p>
        <textarea class="description" rows="3" required></textarea>
        <div class="buttons">
          <button class="button button-cancel" type="reset">Отмена</button>
          <button class="button button-ok" type="submit">Ok</button>
        </div>      
      </form>
    `;
  }

  static get formSelector() {
    return '.edit-form';
  }

  static get titleSelector() {
    return '.title';
  }

  static get nameSelector() {
    return '.name';
  }

  static get descriptionSelector() {
    return '.description';
  }

  static get cancelSelector() {
    return '.button-cancel';
  }

  static get okSelector() {
    return '.button-ok';
  }

  bindToDOM() {
    this.container = document.createElement('div');
    this.container.className = 'modal-form';
    this.container.innerHTML = this.constructor.markup;

    document.body.appendChild(this.container);

    this.form = this.container.querySelector('.edit-form');

    this.title = this.form.querySelector(this.constructor.titleSelector);
    this.name = this.form.querySelector(this.constructor.nameSelector);
    this.description = this.form.querySelector(this.constructor.descriptionSelector);
    this.form.addEventListener('submit', this.onSubmit.bind(this));
    this.form.addEventListener('reset', this.onReset.bind(this));
  }

  async onSubmit(e) {
    e.preventDefault();

    const params = {
      data: {
        method: 'createTicket',
        id: this.id,
        status: this.status,
        name: this.name.value,
        description: this.description.value,
      },
      responseType: 'json',
      method: 'POST',
    };

    try {
      this.parentTicket.drawTicket(await runRequest(params));
    } catch (error) {
      alert(error);
    }

    this.onReset();
  }

  onReset() {
    this.container.classList.remove('modal-active');
  }

  async show(ticket) {
    if (ticket) {
      this.title.textContent = 'Изменить тикет';
      this.id = ticket.dataset.index;

      const status = ticket.querySelector(this.parentTicket.constructor.statusSelector);
      this.status = status.textContent === '\u2713' ? 'true' : 'false';

      const name = ticket.querySelector(this.parentTicket.constructor.nameSelector);
      this.name.value = name.textContent.trim();
      this.description.value = await this.parentTicket.constructor.getDescription(this.id);
    } else {
      this.title.textContent = 'Добавить тикет';
      this.id = '';
      this.status = '';
      this.name.value = '';
      this.description.value = '';
    }

    this.container.classList.add('modal-active');
  }
}
