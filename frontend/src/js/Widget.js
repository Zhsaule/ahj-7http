import EditForm from './EditForm';
import DeleteForm from './DeleteForm';
import runRequest from './Request';

export default class Widget {
  constructor(parentEl) {
    this.parentEl = parentEl;
  }

  static get markup() {
    return `
      <div class="header">
        <button class="button button-add">Добавить тикет</button>
      </div>
      <div class="tickets">
      </div>
    `;
  }

  static get widgetSelector() {
    return '.widget';
  }

  static get addSelector() {
    return '.button-add';
  }

  static get ticketsSelector() {
    return '.tickets';
  }

  static get ticketSelector() {
    return '.ticket';
  }

  static get statusSelector() {
    return '.button-status';
  }

  static get textSelector() {
    return '.text';
  }

  static get nameSelector() {
    return '.name';
  }

  static get descriptionSelector() {
    return '.description';
  }

  static get createdSelector() {
    return '.created';
  }

  static get editSelector() {
    return '.button-edit';
  }

  static get deleteSelector() {
    return '.button-delete';
  }

  async bindToDOM() {
    this.widget = document.createElement('div');
    this.widget.className = 'widget';

    this.widget.innerHTML = this.constructor.markup;
    this.parentEl.appendChild(this.widget);

    this.addButton = this.widget.querySelector(this.constructor.addSelector);
    this.tickets = this.widget.querySelector(this.constructor.ticketsSelector);

    this.deleteForm = new DeleteForm(this);
    this.deleteForm.bindToDOM();

    this.editForm = new EditForm(this);
    this.editForm.bindToDOM();

    this.addButton.addEventListener('click', this.onAddButtonClick.bind(this));
    this.tickets.addEventListener('click', this.onTicketsClick.bind(this));

    const params = {
      data: {
        method: 'allTickets',
      },
      responseType: 'json',
      method: 'GET',
    };

    try {
      this.drawTicket(await runRequest(params));
    } catch (error) {
      console.error(error);
    }
  }

  async onAddButtonClick(e) {
    e.preventDefault();
    await this.editForm.show();
  }

  async onTicketsClick(e) {
    e.preventDefault();
    console.log('eeeee');
    console.log(e.target.dataset.id);
    console.log(e);
    const ticket = e.target.closest(this.constructor.ticketSelector);
    switch (e.target.dataset.id) {
      case 'button-status':
        await this.invertStatus(ticket);
        break;

      case 'button-edit':
        await this.editForm.show(ticket);
        break;

      case 'button-delete':
        this.deleteForm.show(ticket);
        break;

      default:
        await this.constructor.invertVisibleDescription(ticket);
    }
  }

  drawTicket(response) {
    // console.log(response);
    this.tickets.innerHTML = response.reduce(
      (str, { id, status, created }) => `
      ${str}
      <div class="ticket" data-index="${id}">
        <button class="ticket-button button-status" data-id="button-status">${
  status === 'true' ? '&#x2713;' : '&#x00A0;'}</button>
        <div class="text">
          <p class="name"></p>
        </div>
        <p class="created">${this.constructor.dateToString(created)}</p>
        <button class="ticket-button button-edit" data-id="button-edit">&#x270E;</button>
        <button class="ticket-button button-delete" data-id="button-delete">&#x2716;</button>
      </div>
    `, '',
    );

    this.tickets
      .querySelectorAll(this.constructor.nameSelector)
      .forEach((item, i) => {
        const name = item;
        name.textContent = response[i].name;
      });
  }

  static dateToString(timestamp) {
    const date = new Date(timestamp);

    const result = `0${date.getDate()}.0${date.getMonth() + 1}.0${
      date.getFullYear() % 100
    } 0${date.getHours()}:0${date.getMinutes()}`;

    return result.replace(/\d(\d{2})/g, '$1');
  }

  static async getDescription(id) {
    const params = {
      data: {
        method: 'ticketById',
        id,
      },
      responseType: 'text',
      method: 'GET',
    };

    try {
      return await runRequest(params);
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async invertStatus(ticket) {
    const id = ticket.dataset.index;
    const status = ticket.querySelector(this.constructor.statusSelector);
    const name = ticket.querySelector(this.constructor.nameSelector);

    const params = {
      data: {
        method: 'createTicket',
        id,
        status: status.textContent === '\u2713' ? 'false' : 'true',
        name: name.textContent,
        description: await this.constructor.getDescription(id),
      },
      responseType: 'json',
      method: 'POST',
    };

    try {
      this.drawTicket(await runRequest(params));
    } catch (error) {
      console.error(error);
    }
  }

  static async invertVisibleDescription(ticket) {
    const textContainer = ticket.querySelector(this.textSelector);
    let description = ticket.querySelector(this.descriptionSelector);
    if (description) {
      textContainer.removeChild(description);
      description = null;
    } else {
      description = document.createElement('p');
      description.className = 'description';
      textContainer.appendChild(description);

      description.textContent = await this.getDescription(ticket.dataset.index);
    }
  }
}
