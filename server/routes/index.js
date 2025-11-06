import express from 'express';
import * as menuController from '../controllers/menuController.js';
import * as optionController from '../controllers/optionController.js';
import * as orderController from '../controllers/orderController.js';

const router = express.Router();

// 메뉴 관련 라우트
router.get('/menus', menuController.getMenus);
router.get('/menus/:id', menuController.getMenuById);
router.patch('/menus/:id/stock', menuController.updateStock);

// 옵션 관련 라우트
router.get('/options', optionController.getOptions);

// 주문 관련 라우트
router.get('/orders', orderController.getOrders);
router.get('/orders/stats', orderController.getOrderStats);
router.get('/orders/:id', orderController.getOrderById);
router.post('/orders', orderController.createOrder);
router.patch('/orders/:id/status', orderController.updateOrderStatus);

export default router;
