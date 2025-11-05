import './ShoppingCart.css'

function ShoppingCart({ cart, total, onRemove, onUpdateQuantity, onOrder }) {
  return (
    <div className="shopping-cart">
      <div className="cart-content">
        <h2 className="cart-title">장바구니</h2>
        {cart.length === 0 ? (
          <div className="cart-container">
            <div className="cart-left">
              <p className="empty-cart">장바구니가 비어있습니다.</p>
            </div>
            <div className="cart-right">
              <div className="cart-total">
                <span className="total-label">총 금액</span>
                <span className="total-amount">{total.toLocaleString()}원</span>
              </div>
              <button className="order-button" onClick={onOrder} disabled>
                주문하기
              </button>
            </div>
          </div>
        ) : (
          <div className="cart-container">
            <div className="cart-left">
              <div className="cart-items">
                {cart.map(item => (
                  <div key={item.key} className="cart-item">
                    <div className="cart-item-info">
                      <span className="cart-item-name">
                        {item.menuName}
                        {item.optionNames && ` (${item.optionNames})`}
                      </span>
                      <span className="cart-item-unit-price">{item.price.toLocaleString()}원</span>
                    </div>
                    <div className="cart-item-actions">
                      <div className="quantity-controls">
                        <button 
                          className="quantity-button" 
                          onClick={() => onUpdateQuantity(item.key, item.quantity - 1)}
                        >
                          -
                        </button>
                        <span className="quantity-value">{item.quantity}</span>
                        <button 
                          className="quantity-button" 
                          onClick={() => onUpdateQuantity(item.key, item.quantity + 1)}
                        >
                          +
                        </button>
                      </div>
                      <span className="cart-item-price">{(item.price * item.quantity).toLocaleString()}원</span>
                      <button className="remove-button" onClick={() => onRemove(item.key)}>삭제</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="cart-right">
              <div className="cart-total">
                <span className="total-label">총 금액</span>
                <span className="total-amount">{total.toLocaleString()}원</span>
              </div>
              <button className="order-button" onClick={onOrder}>
                주문하기
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ShoppingCart

