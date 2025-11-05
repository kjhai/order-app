import { useState } from 'react'
import './App.css'
import Header from './components/Header'
import MenuCard from './components/MenuCard'
import ShoppingCart from './components/ShoppingCart'
import Admin from './components/Admin'

function App() {
  const [currentPage, setCurrentPage] = useState('order') // 'order' or 'admin'
  // 메뉴 데이터
  const menuItems = [
    {
      id: 1,
      name: '아메리카노(ICE)',
      price: 4000,
      description: '시원한 아메리카노',
      image: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?w=400&h=300&fit=crop'
    },
    {
      id: 2,
      name: '아메리카노(HOT)',
      price: 4000,
      description: '따뜻한 아메리카노',
      image: 'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=400&h=300&fit=crop'
    },
    {
      id: 3,
      name: '카페라떼',
      price: 5000,
      description: '부드러운 라떼',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
    },
    {
      id: 4,
      name: '카푸치노',
      price: 5000,
      description: '향긋한 카푸치노',
      image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=400&h=300&fit=crop'
    },
    {
      id: 5,
      name: '에스프레소',
      price: 3500,
      description: '진한 에스프레소',
      image: 'https://images.unsplash.com/photo-1510591509098-f4fdc6d0ff04?w=400&h=300&fit=crop'
    },
    {
      id: 6,
      name: '바닐라라떼',
      price: 5500,
      description: '달콤한 바닐라라떼',
      image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=400&h=300&fit=crop'
    }
  ]

  // 옵션 데이터
  const options = [
    { id: 'shot', name: '샷 추가', price: 500 },
    { id: 'syrup', name: '시럽 추가', price: 0 }
  ]

  // 장바구니 상태
  const [cart, setCart] = useState([])

  // 장바구니에 추가
  const addToCart = (menuItem, selectedOptions) => {
    const optionNames = selectedOptions.map(opt => opt.name).join(', ')
    const optionPrice = selectedOptions.reduce((sum, opt) => sum + opt.price, 0)
    const itemKey = `${menuItem.id}-${selectedOptions.map(o => o.id).sort().join(',')}`
    
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
  const handleOrder = () => {
    if (cart.length === 0) {
      alert('장바구니가 비어있습니다.')
      return
    }
    alert(`주문이 완료되었습니다!\n총 금액: ${calculateTotal().toLocaleString()}원`)
    setCart([])
  }

  return (
    <div className="App">
      <Header currentPage={currentPage} onPageChange={setCurrentPage} />
      {currentPage === 'order' ? (
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
      ) : (
        <Admin />
      )}
    </div>
  )
}

export default App
