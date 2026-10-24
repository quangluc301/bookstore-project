class OrderModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.user_id = data.user_id || null;
    this.total_amount = data.total_amount || 0;
    this.status = data.status || 'PENDING';
    this.created_at = data.created_at || new Date();
  }
}

module.exports = OrderModel;
