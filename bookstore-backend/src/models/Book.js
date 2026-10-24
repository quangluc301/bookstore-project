class BookModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.title = data.title || '';
    this.author = data.author || '';
    this.publisher = data.publisher || null;
    this.publication_year = data.publication_year || null;
    this.price = data.price || 0;
    this.stock = data.stock || 0;
    this.is_active = data.is_active !== undefined ? data.is_active : true;
    this.created_at = data.created_at || new Date();
  }
}

module.exports = BookModel;
