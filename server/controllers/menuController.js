import { Menu } from '../models/Menu.js';

export const getMenus = async (req, res) => {
  try {
    const includeStock = req.query.include_stock === 'true';
    const menus = await Menu.findAll(includeStock);
    
    res.json({ menus });
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({ error: '메뉴 조회 중 오류가 발생했습니다.' });
  }
};

export const getMenuById = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const menu = await Menu.findById(id);
    
    if (!menu) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }
    
    res.json(menu);
  } catch (error) {
    console.error('메뉴 조회 오류:', error);
    res.status(500).json({ error: '메뉴 조회 중 오류가 발생했습니다.' });
  }
};

export const updateStock = async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const { operation, amount } = req.body;
    
    if (!operation || !amount) {
      return res.status(400).json({ error: 'operation과 amount는 필수입니다.' });
    }
    
    if (operation !== 'increase' && operation !== 'decrease') {
      return res.status(400).json({ error: 'operation은 "increase" 또는 "decrease"여야 합니다.' });
    }
    
    const updated = await Menu.updateStock(id, operation, amount);
    
    if (!updated) {
      return res.status(404).json({ error: '메뉴를 찾을 수 없습니다.' });
    }
    
    // 재고가 0 미만으로 내려간 경우 확인
    if (operation === 'decrease' && updated.stock < 0) {
      return res.status(400).json({ error: '재고는 0보다 작을 수 없습니다.' });
    }
    
    res.json(updated);
  } catch (error) {
    console.error('재고 수정 오류:', error);
    res.status(500).json({ error: '재고 수정 중 오류가 발생했습니다.' });
  }
};

