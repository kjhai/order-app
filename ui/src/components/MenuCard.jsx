import { useState } from 'react'
import './MenuCard.css'

function MenuCard({ menuItem, options, onAddToCart }) {
  const [selectedOptions, setSelectedOptions] = useState([])
  const [imageError, setImageError] = useState(false)

  const handleOptionChange = (option, checked) => {
    if (checked) {
      setSelectedOptions([...selectedOptions, option])
    } else {
      setSelectedOptions(selectedOptions.filter(opt => opt.id !== option.id))
    }
  }

  const handleAddToCart = () => {
    onAddToCart(menuItem, selectedOptions)
    // 옵션 초기화
    setSelectedOptions([])
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div className="menu-card">
      <div className="menu-image">
        {!imageError ? (
          <img 
            src={menuItem.image || 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?w=400&h=300&fit=crop'} 
            alt={menuItem.name}
            className="menu-image-img"
            onError={handleImageError}
          />
        ) : (
          <div className="menu-image-placeholder">
            <span>이미지 없음</span>
          </div>
        )}
      </div>
      <div className="menu-info">
        <h3 className="menu-name">{menuItem.name}</h3>
        <p className="menu-price">{menuItem.price.toLocaleString()}원</p>
        <p className="menu-description">{menuItem.description}</p>
      </div>
      <div className="menu-options">
        {options.map(option => (
          <label key={option.id} className="option-label">
            <input
              type="checkbox"
              checked={selectedOptions.some(opt => opt.id === option.id)}
              onChange={(e) => handleOptionChange(option, e.target.checked)}
            />
            <span className="option-text">
              {option.name} ({option.price > 0 ? `+${option.price.toLocaleString()}원` : '+0원'})
            </span>
          </label>
        ))}
      </div>
      <button className="add-to-cart-button" onClick={handleAddToCart}>
        담기
      </button>
    </div>
  )
}

export default MenuCard

