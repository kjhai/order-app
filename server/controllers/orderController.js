import { Order } from '../models/Order.js';
import pool from '../config/database.js';

export const getOrders = async (req, res) => {
  try {
    const filters = {
      status: req.query.status,
      limit: parseInt(req.query.limit) || 100,
      offset: parseInt(req.query.offset) || 0,
    };
    
    const orders = await Order.findAll(filters);
    
    // 전체 개수 조회
    let countQuery = 'SELECT COUNT(*) FROM orders';
    const countParams = [];
    if (filters.status) {
      countQuery += ' WHERE status = $1';
      countParams.push(filters.status);
    }
    const countResult = await pool.query(countQuery, countParams);
    const total = parseInt(countResult.rows[0].count);
    
    res.json({ orders, total });
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({ error: '주문 조회 중 오류가 발생했습니다.' });
  }
};

export const getOrderById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const order = await Order.findById(id);
    
    if (!order) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }
    
    res.json(order);
  } catch (error) {
    console.error('주문 조회 오류:', error);
    res.status(500).json({ error: '주문 조회 중 오류가 발생했습니다.' });
  }
};

export const createOrder = async (req, res) => {
  try {
    const { items, total_amount } = req.body;
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ error: '주문 항목이 필요합니다.' });
    }
    
    if (!total_amount || total_amount <= 0) {
      return res.status(400).json({ error: '총 금액이 필요합니다.' });
    }
    
    // 주문 번호 생성
    const order_number = await Order.getNextOrderNumber();
    
    const orderData = {
      order_number,
      total_amount,
      items,
    };
    
    const order = await Order.create(orderData);
    
    res.status(201).json(order);
  } catch (error) {
    console.error('주문 생성 오류:', error);
    
    if (error.message.includes('재고가 부족')) {
      return res.status(400).json({ 
        error: error.message,
        details: {
          message: error.message
        }
      });
    }
    
    res.status(500).json({ error: '주문 생성 중 오류가 발생했습니다.', details: { message: error.message } });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { status } = req.body;
    
    if (!status) {
      return res.status(400).json({ error: '상태가 필요합니다.' });
    }
    
    const updated = await Order.updateStatus(id, status);
    
    if (!updated) {
      return res.status(404).json({ error: '주문을 찾을 수 없습니다.' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('주문 상태 변경 오류:', error);
    
    if (error.message.includes('유효하지 않은')) {
      return res.status(400).json({ error: error.message });
    }
    
    res.status(500).json({ error: '주문 상태 변경 중 오류가 발생했습니다.' });
  }
};

export const getOrderStats = async (req, res) => {
  try {
    const stats = await Order.getStats();
    
    res.json({
      total: parseInt(stats.total),
      received: parseInt(stats.received),
      preparing: parseInt(stats.preparing),
      completed: parseInt(stats.completed),
    });
  } catch (error) {
    console.error('주문 통계 조회 오류:', error);
    res.status(500).json({ error: '주문 통계 조회 중 오류가 발생했습니다.' });
  }
};

