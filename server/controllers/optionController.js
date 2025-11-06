import { Option } from '../models/Option.js';

export const getOptions = async (req, res) => {
  try {
    const menuId = req.query.menu_id ? parseInt(req.query.menu_id) : null;
    const options = await Option.findAll(menuId);
    
    res.json({ options });
  } catch (error) {
    console.error('옵션 조회 오류:', error);
    res.status(500).json({ error: '옵션 조회 중 오류가 발생했습니다.' });
  }
};

