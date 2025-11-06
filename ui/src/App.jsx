import { useState, useEffect } from 'react'
import './App.css'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import Admin from './components/Admin'
import { api } from './api'

function App() {
  const [currentPage, setCurrentPage] = useState('order') // 'order' or 'admin'
  const [menuItems, setMenuItems] = useState([])
  const [options, setOptions] = useState([])
  const [loading, setLoading] = useState(true)

  // 메뉴 및 옵션 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true)
        const [menus, opts] = await Promise.all([
          api.getMenus(),
          api.getOptions()
        ])
        setMenuItems(menus)
        setOptions(opts.map(opt => ({ id: opt.id, name: opt.name, price: opt.price })))
      } catch (error) {
        console.error('데이터 로드 실패:', error)
        alert('데이터를 불러오는데 실패했습니다.')
      } finally {
        setLoading(false)
      }
    }
    loadData()
  }, [])

  // 장바구니 상태
  const [cart, setCart] = useState([])

  // 장바구니에 추가
  const addToCart = (menuItem, selectedOptions) => {
    const optionNames = selectedOptions.map(opt => opt.name).join(', ')
    const optionPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
    const optionIds = selectedOptions.map(opt => opt.id).sort()
    const itemKey = `${menuItem.id}-${optionIds.join(',')}`
    
    const existingItem = cart.find(item => item.key === itemKey)
    
    if (existingItem) {
      // 동일한 아이템이 있으면 수량 증가
      setCart(cart.map(item => 
        item.key === itemKey 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ))
    } else {
      // 새 아이템 추가
      const newItem = {
        key: itemKey,
        menuId: menuItem.id,
        menuName: menuItem.name,
        price: menuItem.price + optionPrice,
        optionNames: optionNames,
        optionIds: optionIds,
        quantity: 1
      }
      setCart([...cart, newItem])
    }
  }

  // 장바구니에서 제거
  const removeFromCart = (itemKey) => {
    setCart(cart.filter(item => item.key !== itemKey))
  }

  // 장바구니 수량 업데이트
  const updateQuantity = (itemKey, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(itemKey)
      return
    }
    setCart(cart.map(item => 
      item.key === itemKey 
        ? { ...item, quantity: newQuantity }
        : item
    ))
  }

  // 총 금액 계산
  const calculateTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0)
  }

  // 주문하기
  const handleOrder = async () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }

    try {
      // 주문 데이터 구성
      const items = cart.map(item => ({
        menu_id: item.menuId,
        quantity: item.quantity,
        options: item.optionIds || [],
        unit_price: item.price
      }))

      const orderData = {
        items,
        total_amount: calculateTotal()
      }

      await api.createOrder(orderData)
      alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
      setCart([])
    } catch (error) {
      console.error('주문 실패:', error)
      alert(`주문 실패: ${error.message}`)
    }
  }

  return (
    <div className="App">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      {currentPage === 'order' ? (
        <>
          {loading ? (
            <div style={{ padding: '20px', textAlign: 'center' }}>로딩 중...</div>
          ) : (
            <>
              <div className="menu-section">
                <div className="menu-grid">
                  {menuItems.map(item => (
                    <MenuCard
                      key={item.id}
                      menuItem={item}
                      options={options}
                      onAddToCart={addToCart}
                    />
                  ))}
                </div>
              </div>
              <ShoppingCart
                cart={cart}
                total={calculateTotal()}
                onRemove={removeFromCart}
                onUpdateQuantity={updateQuantity}
                onOrder={handleOrder}
              />
            </>
          )}
        </>
      ) : (
        <Admin />
      )}
    </div>
  )
}

export default App
