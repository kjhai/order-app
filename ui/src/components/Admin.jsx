import { useState, useEffect } from 'react'
import './Admin.css'
import AdminDashboard from './AdminDashboard'
import InventoryStatus from './InventoryStatus'
import OrderStatus from './OrderStatus'

function Admin() {
  // 재고 상태 (초기값: 각 메뉴 10개)
  const [inventory, setInventory] = useState({
    1: { name: '아메리카노(ICE)', stock: 10 },
    2: { name: '아메리카노(HOT)', stock: 10 },
    3: { name: '카페라떼', stock: 10 }
  })

  // 주문 상태 관리
  const [orders, setOrders] = useState([
    {
      id: 1,
      orderNumber: 'ORD-001',
      date: new Date(2024, 6, 31, 13, 0), // 7월 31일 13:00
      items: [
        { menuName: '아메리카노(ICE)', quantity: 1, price: 4000 }
      ],
      status: 'received', // 'received', 'preparing', 'completed'
      totalAmount: 4000
    }
  ])

  // 재고 증가
  const increaseStock = (menuId) => {
    setInventory(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        stock: prev[menuId].stock + 1
      }
    }))
  }

  // 재고 감소
  const decreaseStock = (menuId) => {
    setInventory(prev => ({
      ...prev,
      [menuId]: {
        ...prev[menuId],
        stock: Math.max(0, prev[menuId].stock - 1)
      }
    }))
  }

  // 주문 상태 변경
  const updateOrderStatus = (orderId, newStatus) => {
    setOrders(prev => prev.map(order =>
      order.id === orderId ? { ...order, status: newStatus } : order
    ))
  }

  // 대시보드 통계 계산
  const getDashboardStats = () => {
    const totalOrders = orders.length
    const receivedOrders = orders.filter(o => o.status === 'received').length
    const preparingOrders = orders.filter(o => o.status === 'preparing').length
    const completedOrders = orders.filter(o => o.status === 'completed').length

    return {
      total: totalOrders,
      received: receivedOrders,
      preparing: preparingOrders,
      completed: completedOrders
    }
  }

  return (
    <div className="admin-container">
      <div className="admin-content">
        <AdminDashboard stats={getDashboardStats()} />
        <InventoryStatus 
          inventory={inventory}
          onIncrease={increaseStock}
          onDecrease={decreaseStock}
        />
        <OrderStatus 
          orders={orders}
          onStatusChange={updateOrderStatus}
        />
      </div>
    </div>
  )
}

export default Admin

