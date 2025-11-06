import pool from '../config/database.js';
import { Option } from './Option.js';

export class Order {
  static async findAll(filters = {}) {
    const { status, limit = 100, offset = 0 } = filters;
    
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.order_date,
        o.status,
        o.total_amount,
        o.created_at,
        o.updated_at
      FROM orders o
    `;
    
    const params = [];
    let paramCount = 0;
    
    if (status) {
      query += ` WHERE o.status = $${++paramCount}`;
      params.push(status);
    }
    
    query += ` ORDER BY o.order_date DESC LIMIT $${++paramCount} OFFSET $${++paramCount}`;
    params.push(limit, offset);
    
    const result = await pool.query(query, params);
    
    // 각 주문의 아이템 정보 조회
    const ordersWithItems = await Promise.all(
      result.rows.map(async (order) => {
        const items = await OrderItem.findByOrderId(order.id);
        return { ...order, items };
      })
    );
    
    return ordersWithItems;
  }

  static async findById(id) {
    const result = await pool.query(
      'SELECT * FROM orders WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) return null;
    
    const order = result.rows[0];
    const items = await OrderItem.findByOrderId(id);
    
    return { ...order, items };
  }

  static async create(orderData) {
    const { order_number, total_amount, items } = orderData;
    
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // 주문 생성
      const orderResult = await client.query(
        `INSERT INTO orders (order_number, total_amount, status)
         VALUES ($1, $2, 'pending')
         RETURNING *`,
        [order_number, total_amount]
      );
      
      const order = orderResult.rows[0];
      
      // 주문 아이템 생성 및 재고 차감
      for (const item of items) {
        // 재고 확인 및 차감
        const menuResult = await client.query(
          'SELECT stock FROM menus WHERE id = $1',
          [item.menu_id]
        );
        
        if (menuResult.rows.length === 0) {
          throw new Error(`메뉴를 찾을 수 없습니다: ${item.menu_id}`);
        }
        
        const availableStock = menuResult.rows[0].stock;
        if (availableStock < item.quantity) {
          throw new Error(`재고가 부족합니다. 메뉴 ID: ${item.menu_id}, 요청 수량: ${item.quantity}, 사용 가능 재고: ${availableStock}`);
        }
        
        // 재고 차감
        await client.query(
          'UPDATE menus SET stock = stock - $1 WHERE id = $2',
          [item.quantity, item.menu_id]
        );
        
        // 주문 아이템 생성
        await client.query(
          `INSERT INTO order_items (order_id, menu_id, quantity, unit_price, options)
           VALUES ($1, $2, $3, $4, $5::jsonb)`,
          [order.id, item.menu_id, item.quantity, item.unit_price, JSON.stringify(item.options || [])]
        );
      }
      
      await client.query('COMMIT');
      
      // 생성된 주문 정보 반환
      return await this.findById(order.id);
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  static async updateStatus(id, status) {
    const validStatuses = ['pending', 'received', 'preparing', 'completed'];
    if (!validStatuses.includes(status)) {
      throw new Error('유효하지 않은 주문 상태입니다.');
    }
    
    const result = await pool.query(
      'UPDATE orders SET status = $1 WHERE id = $2 RETURNING id, order_number, status, updated_at',
      [status, id]
    );
    
    return result.rows[0];
  }

  static async getStats() {
    const result = await pool.query(`
      SELECT 
        COUNT(*) FILTER (WHERE true) as total,
        COUNT(*) FILTER (WHERE status = 'received') as received,
        COUNT(*) FILTER (WHERE status = 'preparing') as preparing,
        COUNT(*) FILTER (WHERE status = 'completed') as completed
      FROM orders
    `);
    
    return result.rows[0];
  }

  static async getNextOrderNumber() {
    const result = await pool.query(
      'SELECT order_number FROM orders ORDER BY id DESC LIMIT 1'
    );
    
    if (result.rows.length === 0) {
      return 'ORD-001';
    }
    
    const lastOrderNumber = result.rows[0].order_number;
    const match = lastOrderNumber.match(/ORD-(\d+)/);
    
    if (match) {
      const nextNum = parseInt(match[1]) + 1;
      return `ORD-${nextNum.toString().padStart(3, '0')}`;
    }
    
    return 'ORD-001';
  }
}

export class OrderItem {
  static async findByOrderId(orderId) {
    const result = await pool.query(
      `SELECT 
        oi.id,
        oi.order_id,
        oi.menu_id,
        m.name as menu_name,
        oi.quantity,
        oi.unit_price,
        oi.options,
        oi.created_at
      FROM order_items oi
      JOIN menus m ON oi.menu_id = m.id
      WHERE oi.order_id = $1
      ORDER BY oi.id`,
      [orderId]
    );
    
    // 옵션 정보 파싱 및 조인
    const itemsWithOptions = await Promise.all(
      result.rows.map(async (item) => {
        let options = [];
        if (item.options) {
          try {
            const optionIds = Array.isArray(item.options) ? item.options : JSON.parse(item.options);
            if (optionIds.length > 0) {
              options = await Option.findByIds(optionIds);
            }
          } catch (e) {
            console.error('옵션 파싱 오류:', e);
          }
        }
        
        return {
          ...item,
          options: options.map(opt => ({ id: opt.id, name: opt.name, price: opt.price }))
        };
      })
    );
    
    return itemsWithOptions;
  }
}

