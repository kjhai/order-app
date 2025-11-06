import pool from '../config/database.js';

export class Menu {
  static async findAll(includeStock = false) {
    const query = includeStock
      ? 'SELECT id, name, description, price, image, stock, created_at, updated_at FROM menus ORDER BY id'
      : 'SELECT id, name, description, price, image, created_at, updated_at FROM menus ORDER BY id';
    
    const result = await pool.query(query);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM menus WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async updateStock(id, operation, amount) {
    let query;
    if (operation === 'increase') {
      query = 'UPDATE menus SET stock = stock + $1 WHERE id = $2 RETURNING id, name, stock, updated_at';
    } else if (operation === 'decrease') {
      query = 'UPDATE menus SET stock = GREATEST(0, stock - $1) WHERE id = $2 RETURNING id, name, stock, updated_at';
    } else {
      throw new Error('Invalid operation');
    }
    
    const result = await pool.query(query, [amount, id]);
    return result.rows[0];
  }

  static async decreaseStock(id, quantity) {
    const result = await pool.query(
      'UPDATE menus SET stock = stock - $1 WHERE id = $2 RETURNING id, stock',
      [quantity, id]
    );
    return result.rows[0];
  }
}

