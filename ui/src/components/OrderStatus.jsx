import './OrderStatus.css'

function OrderStatus({ orders, onStatusChange }) {
  // 날짜 포맷팅 함수
  const formatDate = (date) => {
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hours = date.getHours().toString().padStart(2, '0')
    const minutes = date.getMinutes().toString().padStart(2, '0')
    return `${month}월 ${day}일 ${hours}:${minutes}`
  }

  // 주문 상태에 따른 버튼 텍스트 및 다음 상태 반환
  const getStatusButton = (status) => {
    switch (status) {
      case 'pending':
        return { text: '주문 접수', nextStatus: 'received' }
      case 'received':
        return { text: '제조 시작', nextStatus: 'preparing' }
      case 'preparing':
        return { text: '제조 완료', nextStatus: 'completed' }
      case 'completed':
        return null
      default:
        return null
    }
  }

  // 주문 목록을 최신순으로 정렬
  const sortedOrders = [...orders].sort((a, b) => b.date - a.date)

  return (
    <div className="order-status">
      <h2 className="section-title">주문 현황</h2>
      {sortedOrders.length === 0 ? (
        <div className="empty-orders">주문이 없습니다.</div>
      ) : (
        <div className="order-list">
          {sortedOrders.map(order => {
            const statusButton = getStatusButton(order.status)
            return (
              <div key={order.id} className="order-item">
                <div className="order-info">
                  <div className="order-header">
                    <span className="order-date">{formatDate(order.date)}</span>
                    <span className="order-number">주문번호: {order.orderNumber}</span>
                  </div>
                  <div className="order-items">
                    {order.items.map((item, index) => (
                      <div key={index} className="order-item-detail">
                        {item.menu_name} x {item.quantity}
                        {item.options && item.options.length > 0 && (
                          <span className="order-options">
                            ({item.options.map(opt => opt.name).join(', ')})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                  <div className="order-amount">{order.totalAmount.toLocaleString()}원</div>
                </div>
                {statusButton && (
                  <button
                    className="order-action-button"
                    onClick={() => onStatusChange(order.id, statusButton.nextStatus)}
                  >
                    {statusButton.text}
                  </button>
                )}
                {order.status === 'completed' && (
                  <div className="order-completed">제조 완료</div>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default OrderStatus

