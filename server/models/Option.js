import pool from '../config/database.js';

export class Option {
  static async findAll(menuId = null) {
    let query;
    let params;
    
    if (menuId) {
      query = `
        SELECT id, name, price, menu_id, created_at, updated_at 
        FROM options 
        WHERE menu_id IS NULL OR menu_id = $1
        ORDER BY id
      `;
      params = [menuId];
    } else {
      query = 'SELECT id, name, price, menu_id, created_at, updated_at FROM options ORDER BY id';
      params = [];
    }
    
    const result = await pool.query(query, params);
    return result.rows;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM options WHERE id = $1',
      [id]
    );
    return result.rows[0];
  }

  static async findByIds(ids) {
    if (!ids || ids.length === 0) return [];
    
    const result = await pool.query(
      'SELECT id, name, price FROM options WHERE id = ANY($1::int[])',
      [ids]
    );
    return result.rows;
  }
}

