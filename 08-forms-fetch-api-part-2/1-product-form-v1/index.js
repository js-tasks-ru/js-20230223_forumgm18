import escapeHtml from './utils/escape-html.js';
import fetchJson from './utils/fetch-json.js';

const IMGUR_CLIENT_ID = '28aaa2e823b03b1';
const BACKEND_URL = 'https://course-js.javascript.ru';

const CATEGORIES_URL = 'api/rest/categories';
const PRODUCT_URL = 'api/rest/products';

// api/rest/categories?_sort=weight&_refs=subcategory    // GET
// https://api.imgur.com/3/image           // POST

// api/rest/products // PUT
// {url: "https://i.imgur.com/Jo4q8BG.jpg", source: "3tDtTGzjGKg.jpg"}
export default class ProductForm {
  subElements = {};
  productData = {};
  defaultProductData = {
    title: '',
    description: '',
    quantity: 1,
    subcategory: '',
    status: 1,
    price: 100,
    discount: 0,
    images: []
  };

  constructor (productId) {
    this.productId = productId;
    this.categoriesUrl = new URL(CATEGORIES_URL, BACKEND_URL);
    this.productUrl = new URL(PRODUCT_URL, BACKEND_URL);
    this.imageUploadUrl = new URL('https://api.imgur.com/3/image');
    this.render();
  }

  async preLoadData() {
    try {
      this.categoriesUrl.searchParams.set('_sort', 'weight');
      this.categoriesUrl.searchParams.set('_refs', 'subcategory');
      this.productUrl.searchParams.set('id', this.productId);

      const categoriesPromise = fetchJson(this.categoriesUrl);
      const productPromise = this.productId ? fetchJson(this.productUrl) : Promise.resolve(this.defaultProductData);
      const [categories, product] = await Promise.all([categoriesPromise, productPromise]);

      this.categories = categories;
      this.productData = product[0];
      this.productId = product[0].id;

      Promise.resolve({ok: true});

    } catch(err) {
      console.error(err);
      Promise.reject(err);
    }


  }

  async render () {
    await this.preLoadData();

    const wrapper = document.createElement('div');
    wrapper.innerHTML = this.renderForm();
    this.element = wrapper.firstElementChild;
    this.getSubElements();
    this.renderCategories(this.categories);
    this.updateForm();
    this.initListeners();
  }
  getSubElements() {
    this.element
      .querySelectorAll('[data-element]')
      .forEach(el => this.subElements[el.dataset.element] = el);
  }


  getFormFields() {
    const formElems = this.subElements.productForm.elements;
    return  Array.from(formElems).filter( item => !!item.name && item.classList.contains('form-control'));
  }

  updateForm() {
    const 
      data = this.productData,
      formFields =  this.getFormFields();
    ;
    
    formFields.forEach(el => {
      if (data[el.name]) {
        el.value = data[el.name];
      };
    });

    this.renderImgList(data.images);

  }

  renderForm() {
    return `
      <div class="product-form">
        <form data-element="productForm" class="form-grid">
          <div class="form-group form-group__half_left">
            <fieldset>
              <label class="form-label">Название товара</label>
              <input required="" type="text" id="title" name="title" class="form-control" placeholder="Название товара">
            </fieldset>
          </div>
          <div class="form-group form-group__wide">
            <label class="form-label">Описание</label>
            <textarea required="" class="form-control" id="description" name="description" data-element="productDescription" placeholder="Описание товара"></textarea>
          </div>
          <div class="form-group form-group__wide" data-element="sortable-list-container">
            <label class="form-label">Фото</label>
            <div data-element="imageListContainer">
              <ul class="sortable-list"></ul>
            </div>
            <button type="button" data-element="uploadImage" class="button-primary-outline"><span>Загрузить</span></button>            
          </div>
          <div class="form-group form-group__half_left">
            <label class="form-label">Категория</label>
            <select class="form-control" id="subcategory" name="subcategory" data-element="subcategory">
            </select>
          </div>
          <div class="form-group form-group__half_left form-group__two-col">
            <fieldset>
              <label class="form-label">Цена ($)</label>
              <input required="" type="number" id="price" name="price" class="form-control" placeholder="100">
            </fieldset>
            <fieldset>
              <label class="form-label">Скидка ($)</label>
              <input required="" type="number" id="discount" name="discount" class="form-control" placeholder="0">
            </fieldset>
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Количество</label>
            <input required="" type="number" class="form-control" id="quantity" name="quantity" placeholder="1">
          </div>
          <div class="form-group form-group__part-half">
            <label class="form-label">Статус</label>
            <select class="form-control" id="status" name="status">
              <option value="1">Активен</option>
              <option value="0">Неактивен</option>
            </select>
          </div>
          <div class="form-buttons">
            <button type="submit" name="save" class="button-primary-outline">
              Сохранить товар
            </button>
          </div>
        </form>
      </div>

    `;
  }
  renderSelectRows(categories) {
    const subCat = [];
    categories.forEach(el => 
      el.subcategories.forEach(itm => 
        subCat.push({
                      id: itm.id,
                      title: escapeHtml(`${el.title} > ${itm.title}`)
                    })
        )
    );

    return subCat
      .map(el => `<option value="${el.id}">${el.title}</option>`)
      .join('');
  }

  renderCategories(categories) {
    const {subcategory} = this.subElements;
    subcategory.innerHTML = this.renderSelectRows(categories)
  }

  getImgListRow({id, url, source}) {
    return `
      <li class="products-edit__imagelist-item sortable-list__item" style="">
        <input type="hidden" name="url" value="${url}">
        <input type="hidden" name="source" value="${source}">
        <span>
          <img src="icon-grab.svg" data-grab-handle="" alt="grab">
          <img class="sortable-table__cell-img" alt="" src="${escapeHtml(url)}">
          <span>${source}</span>
        </span>
        <button type="button">
          <img src="icon-trash.svg" data-delete-handle="${id}" alt="delete">
        </button>
      </li>
    `;
  }

  updateImgList(newItem) {
    const 
      ul = document.createElement('ul'),
      {imageListContainer} = this.subElements
    ;
    ul.innerHTML = this.getImgListRow(newItem);
    
    imageListContainer.firstElementChild.append(ul.firstElementChild);
  }

  renderImgList(images) {
    if (!images || images.length === 0 ) return '';
    const 
      {imageListContainer} = this.subElements,
      imgRows = images.map(el => this.getImgListRow(el)).join('')
    ;

    imageListContainer.firstElementChild.innerHTML = imgRows;
  }

  initListeners() {
    const {productForm, uploadImage, imageListContainer} = this.subElements;
    uploadImage.addEventListener('click', this.uploadImage);
    imageListContainer.addEventListener('pointerdown', this.imageListClick);
    productForm.addEventListener('submit', this.submitForm);
  }

  uploadImage = (e) => {
    const fileInput = document.createElement('input');
    fileInput.type = 'file';
    fileInput.addEventListener('change', async e => {
      const file = e.target.files[0];
      const body = new FormData();  

      body.append('image', file, file.name);

      try {
        const  
          params = {
            method: 'POST',
            headers: {
              Authorization: `Client-ID ${IMGUR_CLIENT_ID}`
            },
            body,
            referrer: ''
          },
          result = await fetchJson(this.imageUploadUrl, params)
        ;
        
        if (result.success) {
          const 
            {id, link} = result.data,
            imageListItem = {id, url: link, source: file.name},
            {images} = this.productData;
          ;
          images.push(imageListItem);
          this.updateImgList(imageListItem);
        }
        
      } catch (err) {
        console.error(err);
      }
    });

    fileInput.click();
    fileInput.remove();
  }

  imageListClick = (e) => {
    const delBtn = e.target.closest('[data-delete-handle]');
    if (!delBtn) return;

    const
      {images} = this.productData,
      id = delBtn.dataset.deleteHandle,
      itemIndex = images.indexOf(el => el.id === id),
      li = delBtn.closest('li')
    ;
    if (itemIndex > -1 ) images.splice(itemIndex, 1);
    if (li) li.remove();
  }

  async save() {
    const 
      formFields =  this.getFormFields(),
      formData = new FormData(this.subElements.productForm),
      bodyObj = {}
    ;
    formFields.forEach(el => {
      const val = formData.get(el.name);
      bodyObj[el.name] = (el.type === 'number' || el.name === 'status') ? Number(val) : val;
    });
    if (this.productId) {
      bodyObj.id = this.productId;
    }  
    bodyObj.title = escapeHtml(bodyObj.title);
    bodyObj.description = escapeHtml(bodyObj.description);
    bodyObj.images = this.productData.images.map(el => ({url: el.url, source: el.source}));


    const 
      method = this.productId ? 'PATCH' : 'PUT',
      params = {
        method,
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(bodyObj)
      };

      const res = await fetchJson(this.productUrl, params);
      this.productData = res;
      this.productId = res.id;  

      const eventName = this.productId ? 'product-saved' : 'product-updated';
      this.element.dispatchEvent(new CustomEvent(eventName, {detail: res, bubbles: true}));
      this.updateForm();

  }
  submitForm = e => {
    e.preventDefault();
    this.save();
  }
  
  remove() {
    if (this.element) this.element.remove()
  }
  destroy() {
    this.remove()

  }
}
