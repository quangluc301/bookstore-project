class UserModel {
  constructor(data = {}) {
    this.id = data.id || null;
    this.email = data.email || '';
    this.full_name = data.full_name || '';
    this.password_hash = data.password_hash || '';
    this.role = data.role || 'USER';
    this.created_at = data.created_at || new Date();
  }
}

module.exports = UserModel;
