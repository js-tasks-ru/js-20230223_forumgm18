export default class SortableTable {
  subElements = {};
  constructor(headerConfig = [], data = []) {
    this.headerConfig = headerConfig;
    this.data = data;
    this.render()
  }
  render() {
    const wrp = document.createElement('div');
    wrp.innerHTML = `
        <div class="sortable-table">
          ${this.headerTpl()}
          ${this.bodyTpl(this.data)}
          <div data-element="loading" class="loading-line sortable-table__loading-line"></div>
          <div data-element="emptyPlaceholder" class="sortable-table__empty-placeholder">
            <div>
              <p>No products satisfies your filter criteria</p>
              <button type="button" class="button-primary-outline">Reset all filters</button>
            </div>
          </div>
        </div>  
    `;
     this.element = wrp.firstElementChild; 
     this.getSubElements();
  }
  getSubElements(){
    this.element
      .querySelectorAll('[data-element]')
      .forEach(el => this.subElements[el.dataset.element] = el);
  }
  headerTpl() {
    const headCells = this.headerConfig.map(el => this.headerCell(el));
    return `
      <div data-element="header" class="sortable-table__header sortable-table__row">
        ${headCells.join('')}
      </div>
    `
  }
  headerCell({id, title, sortable}) {
    return `
      <div class="sortable-table__cell" data-id="${id}" data-sortable="${sortable}">
        <span>${title}</span>
        <span data-element="arrow" class="sortable-table__sort-arrow">
          <span class="sort-arrow"></span>
        </span>
      </div>
    `
  }

  bodyRowTpl(el) {
    const rowArr = this.headerConfig.map(itm => this.bodyRowCellTpl(el, itm));
    return `
      <a href="/products/${el.id}" class="sortable-table__row">
      ${rowArr.join('')}
      </a>
    `
  }

  bodyRowCellTpl(curDataRow, { id, template }) {
    return template ? template(curDataRow[id]) : `<div class="sortable-table__cell">${curDataRow[id]}</div>` 
  }

  bodyTpl(data) {
    const bobyRows = data.map(el => this.bodyRowTpl(el));
    return `
      <div data-element="body" class="sortable-table__body">
        ${bobyRows.join('')}
      </div>
      `
  }

  sort(field, order){
    const headerOrderedFiled = this.subElements.header.querySelector(`[data-id="${field}"]`);
    this.subElements.header
      .querySelectorAll('[data-order]')
      .forEach(el => el.dataset.order = '');
    if (headerOrderedFiled) headerOrderedFiled.dataset.order = order; 
    this.subElements.body.innerHTML = this.bodyTpl(this.dataSort(field, order));
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

  remove() {
    if (this.element) this.element.remove()
  }
  destroy() {
    this.remove();
    this.subElements = {}
  }
}

