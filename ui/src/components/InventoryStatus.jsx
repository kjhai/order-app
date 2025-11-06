import './InventoryStatus.css'

function InventoryStatus({ inventory, onIncrease, onDecrease }) {
  // 재고 상태 판단 함수
  const getStockStatus = (stock) => {
    if (stock === 0) return { text: '품절', className: 'status-out-of-stock' }
    if (stock < 5) return { text: '주의', className: 'status-warning' }
    return { text: '정상', className: 'status-normal' }
  }

  return (
    <div className="inventory-status">
      <h2 className="section-title">재고 현황</h2>
      <div className="inventory-grid">
        {inventory.map((item) => {
          const status = getStockStatus(item.stock)
          return (
            <div key={item.id} className="inventory-card">
              <div className="inventory-menu-name">{item.name}</div>
              <div className="inventory-stock-info">
                <span className="inventory-stock-count">{item.stock}개</span>
                <span className={`inventory-status-badge ${status.className}`}>
                  {status.text}
                </span>
              </div>
              <div className="inventory-controls">
                <button 
                  className="inventory-button inventory-button-minus"
                  onClick={() => onDecrease(item.id)}
                >
                  -
                </button>
                <button 
                  className="inventory-button inventory-button-plus"
                  onClick={() => onIncrease(item.id)}
                >
                  +
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default InventoryStatus

