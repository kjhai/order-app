// API 기본 URL (환경 변수 또는 기본값 사용)
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// 디버깅: 환경 변수 확인 (프로덕션에서도 표시)
console.log('🔍 API Base URL:', API_BASE_URL);
console.log('🔍 VITE_API_URL:', import.meta.env.VITE_API_URL || '(설정되지 않음)');

// API 클라이언트 함수들
export const api = {
  // 메뉴 관련 API
  async getMenus(includeStock = false) {
    const url = includeStock 
      ? `${API_BASE_URL}/menus?include_stock=true`
      : `${API_BASE_URL}/menus`;
    
    console.log('Fetching menus from:', url);
    
    try {
      const response = await fetch(url);
      if (!response.ok) {
        const errorText = await response.text();
        console.error('메뉴 조회 실패:', response.status, errorText);
        throw new Error(`메뉴 조회 실패 (${response.status}): ${errorText}`);
      }
      const data = await response.json();
      return data.menus;
    } catch (error) {
      console.error('메뉴 조회 네트워크 오류:', error);
      throw new Error(`API 호출 실패: ${error.message}. API URL: ${API_BASE_URL}`);
    }
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

