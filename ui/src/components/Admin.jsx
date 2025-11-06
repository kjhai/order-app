import { useState, useEffect } from 'react'
import './Admin.css'
import AdminDashboard from './AdminDashboard'
import InventoryStatus from './InventoryStatus'
import OrderStatus from './OrderStatus'
import { api } from '../api'

function Admin() {
  const [inventory, setInventory] = useState([])
  const [orders, setOrders] = useState([])
  const [stats, setStats] = useState({ total: 0, received: 0, preparing: 0, completed: 0 })
  const [loading, setLoading] = useState(true)

  // 데이터 로드
  useEffect(() => {
    loadData()
  }, [])

  // 데이터 새로고침 (주문 상태 변경 후)
  const loadData = async () => {
    try {
      setLoading(true)
      const [menus, ordersData, statsData] = await Promise.all([
        api.getMenus(true),
        api.getOrders(),
        api.getOrderStats()
      ])
      
      setInventory(menus.map(menu => ({
        id: menu.id,
        name: menu.name,
        stock: menu.stock
      })))
      
      setOrders(ordersData.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: new Date(order.order_date),
        items: order.items || [],
        status: order.status,
        totalAmount: order.total_amount
      })))
      
      setStats(statsData)
    } catch (error) {
      console.error('데이터 로드 실패:', error)
      alert('데이터를 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  // 재고 증가
  const increaseStock = async (menuId) => {
    try {
      await api.updateStock(menuId, 'increase', 1)
      await loadData()
    } catch (error) {
      console.error('재고 증가 실패:', error)
      alert(`재고 증가 실패: ${error.message}`)
    }
  }

  // 재고 감소
  const decreaseStock = async (menuId) => {
    try {
      await api.updateStock(menuId, 'decrease', 1)
      await loadData()
    } catch (error) {
      console.error('재고 감소 실패:', error)
      alert(`재고 감소 실패: ${error.message}`)
    }
  }

  // 주문 상태 변경
  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      await api.updateOrderStatus(orderId, newStatus)
      await loadData()
    } catch (error) {
      console.error('주문 상태 변경 실패:', error)
      alert(`주문 상태 변경 실패: ${error.message}`)
    }
  }

  if (loading) {
    return (
      <div className="admin-container">
        <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
      </div>
    )
  }

  return (
    <div className="admin-container">
      <div className="admin-content">
        <AdminDashboard stats={stats} />
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

