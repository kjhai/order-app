// API 기본 URL
const API_BASE_URL = 'http://localhost:3000/api';

// API 클라이언트 함수들
export const api = {
  // 메뉴 관련 API
  async getMenus(includeStock = false) {
    const url = includeStock 
      ? `${API_BASE_URL}/menus?include_stock=true`
      : `${API_BASE_URL}/menus`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('메뉴 조회 실패');
    }
    const data = await response.json();
    return data.menus;
  },

  // 옵션 관련 API
  async getOptions(menuId = null) {
    const url = menuId
      ? `${API_BASE_URL}/options?menu_id=${menuId}`
      : `${API_BASE_URL}/options`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('옵션 조회 실패');
    }
    const data = await response.json();
    return data.options;
  },

  // 주문 관련 API
  async getOrders(status = null) {
    const url = status
      ? `${API_BASE_URL}/orders?status=${status}`
      : `${API_BASE_URL}/orders`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error('주문 조회 실패');
    }
    const data = await response.json();
    return data.orders;
  },

  async createOrder(orderData) {
    const response = await fetch(`${API_BASE_URL}/orders`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(orderData),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '주문 생성 실패');
    }
    
    return await response.json();
  },

  async updateOrderStatus(orderId, status) {
    const response = await fetch(`${API_BASE_URL}/orders/${orderId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '주문 상태 변경 실패');
    }
    
    return await response.json();
  },

  async getOrderStats() {
    const response = await fetch(`${API_BASE_URL}/orders/stats`);
    if (!response.ok) {
      throw new Error('주문 통계 조회 실패');
    }
    return await response.json();
  },

  // 재고 관리 API
  async updateStock(menuId, operation, amount) {
    const response = await fetch(`${API_BASE_URL}/menus/${menuId}/stock`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ operation, amount }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || '재고 수정 실패');
    }
    
    return await response.json();
  },
};

