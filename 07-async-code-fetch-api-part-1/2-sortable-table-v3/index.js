import fetchJson from './utils/fetch-json.js';

const BACKEND_URL = 'https://course-js.javascript.ru';

export default class SortableTable {
  subElements = {};
  defaultLoadingClass = 'sortable-table_loading';

  constructor(headersConfig, { 
    url = '',
    data = [], 
    sorted = {
      id: headersConfig.find(item => item.sortable).id, 
      order: 'desc'
    }, 
    isSortLocally = false,
    loadingClass = this.defaultLoadingClass,
    start = 1,
    step = 20,

  } = {}) {
    this.url = new URL(url, BACKEND_URL);
    this.headerConfig = headersConfig;
    this.data = [...data];
    this.sorted = {...sorted};
    this.isSortLocally = isSortLocally;
    this.start = start;
    this.step = step;
    this.end = start + step;
    this.loadingClass = loadingClass;
    this.isLoading = false;  
  
    this.preRender();
    this.getSubElements();
    this.addListeners();
    this.render();

 }
  template() {
     return `
        <div class="sortable-table ${this.loadingClass}">
          ${this.getTableHeader()}
          <div data-element="body" class="sortable-table__body"></div>
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>  
    `;

  }
  preRender() {
    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.template();
    this.element = wrapper.firstElementChild; 
  }

  getSubElements(){
    this.element
      .querySelectorAll('[data-element]')
      .forEach(el => this.subElements[el.dataset.element] = el);
  }
  addListeners() {
    this.subElements.header.addEventListener('pointerdown', e => {
      const cell = e.target.closest('[data-sortable="true"]');
      if (cell) {
        const id = cell.dataset.id;
        let order;  
        switch(cell.dataset.order) {
          case 'asc': 
            order = 'desc';
            break;
          case 'desc': 
            order = 'asc';
            break;
          default: 
            order = 'desc';
        }
        this.sort(id, order);
      }
    });
    
    window.addEventListener('scroll', this.pageScroll);
  }
  getTableHeader() {
    const headCells = this.headerConfig.map(el => this.getHeaderCell(el));
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headCells.join('')}
      </div>
    `
  }
  getHeaderCell({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `
  }

  getTableBodyRow(el) {
    const rowArr = this.headerConfig.map(itm => this.getTableBodyRowCell(el, itm));
    return `
      <a href="/products/${el.id}" class="sortable-table__row">
        ${rowArr.join('')}
      </a>
    `
  }

  getTableBodyRowCell(curDataRow, { id, template }) {
    return template ? template(curDataRow[id]) : `<div class="sortable-table__cell">${curDataRow[id]}</div>` 
  }

  getTableBody(data) {
    return data
      .map(el => this.getTableBodyRow(el))
      .join('')
  }


  sort(field, order){
    const 
      {header} = this.subElements,
      headerOrderedFiled = header.querySelector(`[data-id="${field}"]`)
    ;
    header
      .querySelectorAll('[data-order]')
      .forEach(el => el.dataset.order = '');

    if (headerOrderedFiled) headerOrderedFiled.dataset.order = order; 

    this.sorted.id = field;
    this.order = order;

    if (this.isSortLocally) {
      this.sortOnClient(field, order);
    } else {
      this.sortOnServer(field, order);
    }
  }
  sortOnClient(field, order) {
    const 
      { body } = this.subElements,
      sortedData = this.dataSort(field, order)
    ;

    body.innerHTML = this.getTableBody(sortedData);
  }

  dataSort(field, order = 'asc'){
    const 
      arr = [...this.data],
      {sortType} = this.headerConfig.find(el => el.id === field),
      directions = {
         asc:  1, 
        desc: -1
      },
      direction = directions[order]
    ;

      switch(sortType) {
        case 'number' :
          return arr.sort( (a, b) => direction * (a[field] - b[field]) );
        case 'string': 
          return arr.sort( (a, b) => direction * a[field].localeCompare(b[field], ['ru', 'en']) )
        default: 
          throw new Error(`Неизвестный тип ${sortType}`);  
      }
  }

  async sortOnServer(field, order) {
    this.start = 1;
    this.end = this.start + this.step

    const 
      { body } = this.subElements,
      data = await this.loadData(field, order, this.start, this.end)
    ;
    this.data = data;
    body.innerHTML = this.getTableBody(data);
  }

  async loadData(id = this.sorted.id, order = this.sorted.order, start = this.start, end = this.end) {
    try {
      this.url.searchParams.set('_sort', id);
      this.url.searchParams.set('_order', order);
      this.url.searchParams.set('_start', start);
      this.url.searchParams.set('_end', end);

      return await fetchJson(this.url);

    } catch(e) {
      console.error(e);
      return Promise.reject(err);
    }
  }

  update(data) {
      const 
        { body } = this.subElements,
        newRows = document.createElement('div')
      ;
      this.data = [ ...this.data, ...data ];
      newRows.innerHTML = this.getTableBody(data);
      body.append(...newRows.childNodes);
  }

  async render(id = this.sorted.id, order = this.sorted.order, start = this.start, end = this.end) {
    this.element.classList.add(this.loadingClass);
    try {
      this.sorted = { id, order }
      this.start = start
      this.end = end
      const 
        data = await this.loadData(id, order, start, end);
        this.update(data)
    } catch(e) {
      console.error(e);
    }
    this.element.classList.remove(this.loadingClass);
  }


  pageScroll = async () => {
    const 
      { bottom } = this.element.getBoundingClientRect(),
      { id, order } = this.sorted,
      clientHeight = document.documentElement.clientHeight
    ;

    if (bottom < clientHeight && !this.isLoading && !this.isSortLocally) {
      this.start = this.end;
      this.end = this.start + this.step;

      this.isLoading = true;

      const data = await this.loadData(id, order, this.start, this.end);

      this.update(data);

      this.isLoading = false;
    }
  } 

  remove() {
    if (this.element) this.element.remove()
  }

  destroy() {
    window.removeEventListener('scroll', this.pageScroll);
    this.remove();
    this.subElements = {}

  }
}

