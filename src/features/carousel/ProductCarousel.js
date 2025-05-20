import React, { useState, useEffect, useRef } from 'react';
import './carosole.css';
import { useSelector } from 'react-redux';
import { selectAllProducts } from '../product/productSlice';
import { Link } from 'react-router-dom';

const ProductCarousel = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const autoSlideRef = useRef(null);
  const products = useSelector(selectAllProducts);

  // Fallback for products if empty or invalid
  const displayProducts = products.length > 0 ? products : [
    {
      id: 1,
      thumbnail: 'https://via.placeholder.com/1000x400?text=Product+1',
      title: 'Product 1',
      description: 'Amazing product description',
    },
    {
      id: 2,
      thumbnail: 'https://via.placeholder.com/1000x400?text=Product+2',
      title: 'Product 2',
      description: 'Another great product',
    },
    {
      id: 3,
      thumbnail: 'https://via.placeholder.com/1000x400?text=Product+3',
      title: 'Product 3',
      description: 'Best deal available',
    },
  ];

  const goToSlide = (index) => {
    setCurrentIndex(index >= displayProducts.length ? 0 : index < 0 ? displayProducts.length - 1 : index);
    resetAutoSlide();
  };

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % displayProducts.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + displayProducts.length) % displayProducts.length);
  };

  const startAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = setInterval(nextSlide, 5000);
  };

  const resetAutoSlide = () => {
    startAutoSlide();
  };

  const stopAutoSlide = () => {
    clearInterval(autoSlideRef.current);
    autoSlideRef.current = null;
  };

  useEffect(() => {
    startAutoSlide();
    return () => clearInterval(autoSlideRef.current);
  }, []);

  return (
    <div
      className="carousel-container"
      onMouseEnter={stopAutoSlide}
      onMouseLeave={startAutoSlide}
    >
      <div
        className="carousel"
        style={{ transform: `translateX(-${currentIndex * 100}%)` }}
      >
        {products.map((product) => (
          <div key={product.id} className="carousel-item">
            <Link to={`/product-detail/${product.id}`} className="carousel-link">
              <img
                src={product.thumbnail || 'https://via.placeholder.com/1000x400?text=No+Image'}
                alt={product.title || 'Product'}
                onError={(e) => {
                  e.target.src = 'https://via.placeholder.com/1000x400?text=Image+Failed';
                }}
              />
              <div className="carousel-caption">
                <h3>{product.title || 'Untitled Product'}</h3>
                <p>{product.description || 'No description available'}</p>
              </div>
            </Link>
          </div>
        ))}
      </div>
      <div className="carousel-nav">
        <button
          onClick={() => {
            prevSlide();
            resetAutoSlide();
          }}
          className="nav-button"
        >
          ❮
        </button>
        <button
          onClick={() => {
            nextSlide();
            resetAutoSlide();
          }}
          className="nav-button"
        >
          ❯
        </button>
      </div>
      <div className="dots">
        {displayProducts.map((_, index) => (
          <span
            key={index}
            className={`dot ${currentIndex === index ? 'active' : ''}`}
            onClick={() => goToSlide(index)}
          ></span>
        ))}
      </div>
    </div>
  );
};

export default ProductCarousel;