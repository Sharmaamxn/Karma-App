import React, { useState, useEffect, createContext, useContext } from "react";
import "./App.css";
import { BrowserRouter, Routes, Route, Link, useNavigate, useParams } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

// Cart Context
const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [karmaPoints, setKarmaPoints] = useState(0);

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
      setCart(cart.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
    
    setKarmaPoints(karmaPoints + product.karma_points);
  };

  const removeFromCart = (productId) => {
    const item = cart.find(item => item.id === productId);
    if (item) {
      setKarmaPoints(karmaPoints - (item.karma_points * item.quantity));
      setCart(cart.filter(item => item.id !== productId));
    }
  };

  const updateQuantity = (productId, newQuantity) => {
    if (newQuantity === 0) {
      removeFromCart(productId);
      return;
    }
    
    const item = cart.find(item => item.id === productId);
    if (item) {
      const pointsDiff = (newQuantity - item.quantity) * item.karma_points;
      setKarmaPoints(karmaPoints + pointsDiff);
      
      setCart(cart.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  const getTotalPrice = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const getTotalItems = () => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  };

  const clearCart = () => {
    setCart([]);
    setKarmaPoints(0);
  };

  return (
    <CartContext.Provider value={{
      cart,
      karmaPoints,
      addToCart,
      removeFromCart,
      updateQuantity,
      getTotalPrice,
      getTotalItems,
      clearCart
    }}>
      {children}
    </CartContext.Provider>
  );
};

// Utility function to get badge color
const getBadgeColor = (category) => {
  const colors = {
    organic: "bg-green-100 text-green-800 border-green-200",
    fair_trade: "bg-blue-100 text-blue-800 border-blue-200",
    sustainable: "bg-emerald-100 text-emerald-800 border-emerald-200",
    eco_friendly: "bg-teal-100 text-teal-800 border-teal-200",
    carbon_neutral: "bg-gray-100 text-gray-800 border-gray-200"
  };
  return colors[category] || "bg-gray-100 text-gray-800 border-gray-200";
};

// Utility function to get carbon footprint color
const getCarbonFootprintColor = (footprint) => {
  const colors = {
    "Very Low": "text-green-600",
    "Low": "text-green-500",
    "Medium": "text-yellow-500",
    "High": "text-red-500"
  };
  return colors[footprint] || "text-gray-500";
};

// Product Card Component
const ProductCard = ({ product }) => {
  const { addToCart } = useCart();
  const hasDiscount = product.original_price && product.original_price > product.price;
  const discountPercentage = hasDiscount 
    ? Math.round(((product.original_price - product.price) / product.original_price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product);
    alert(`Added ${product.name} to cart! You earned ${product.karma_points} karma points! 🎉`);
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden">
      <div className="relative">
        <img 
          src={product.image_url} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {hasDiscount && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded-full text-sm font-bold">
            {discountPercentage}% OFF
          </div>
        )}
        <div className="absolute top-2 right-2 bg-white bg-opacity-90 px-2 py-1 rounded-full text-sm font-semibold">
          ⚡ {product.karma_points} pts
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
          {product.name}
        </h3>
        
        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
          {product.description}
        </p>
        
        {/* Ethical Badges */}
        <div className="flex flex-wrap gap-1 mb-3">
          {product.ethical_badges.map((badge, index) => (
            <span
              key={index}
              className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(badge.category)}`}
            >
              {badge.category.replace('_', ' ').toUpperCase()}
            </span>
          ))}
        </div>
        
        {/* Sustainability Score */}
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-gray-600">Sustainability:</span>
          <div className="flex-1 bg-gray-200 rounded-full h-2">
            <div 
              className="bg-green-500 h-2 rounded-full"
              style={{ width: `${product.sustainability_score}%` }}
            ></div>
          </div>
          <span className="text-sm font-medium text-green-600">
            {product.sustainability_score}%
          </span>
        </div>
        
        {/* Carbon Footprint */}
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm text-gray-600">Carbon Footprint:</span>
          <span className={`text-sm font-medium ${getCarbonFootprintColor(product.carbon_footprint)}`}>
            {product.carbon_footprint}
          </span>
        </div>
        
        {/* Price */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-gray-900">
              ${product.price}
            </span>
            {hasDiscount && (
              <span className="text-sm text-gray-500 line-through">
                ${product.original_price}
              </span>
            )}
          </div>
        </div>
        
        {/* Add to Cart Button */}
        <button
          onClick={handleAddToCart}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5M7 13h10M7 13l-4.5-4.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m10 0V9a2 2 0 00-2 2H9a2 2 0 00-2 2v4" />
          </svg>
          Add to Cart
        </button>
      </div>
    </div>
  );
};

// Header Component
const Header = () => {
  const { karmaPoints, getTotalItems } = useCart();
  const cartCount = getTotalItems();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex-shrink-0 flex items-center">
              <div className="bg-green-600 text-white rounded-full w-8 h-8 flex items-center justify-center mr-3">
                <span className="font-bold text-lg">🌱</span>
              </div>
              <h1 className="text-xl font-bold text-gray-900">Ethical Shopping Karma</h1>
            </Link>
          </div>
          
          {/* Navigation */}
          <nav className="hidden md:flex space-x-8">
            <Link to="/" className="text-gray-700 hover:text-green-600 font-medium">Products</Link>
            <Link to="/categories" className="text-gray-700 hover:text-green-600 font-medium">Categories</Link>
            <Link to="/impact" className="text-gray-700 hover:text-green-600 font-medium">Impact</Link>
            <Link to="/rewards" className="text-gray-700 hover:text-green-600 font-medium">Rewards</Link>
          </nav>
          
          {/* User Actions */}
          <div className="flex items-center space-x-4">
            {/* Karma Points */}
            <div className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm font-medium">
              ⚡ {karmaPoints} Karma
            </div>
            
            {/* Cart */}
            <Link to="/cart" className="relative">
              <button className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4m0 0L7 13m0 0l-1.5 4.5M7 13h10M7 13l-4.5-4.5M17 13v6a2 2 0 01-2 2H9a2 2 0 01-2-2v-6m10 0V9a2 2 0 00-2 2H9a2 2 0 00-2 2v4" />
                </svg>
              </button>
              {cartCount > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cartCount}
                </span>
              )}
            </Link>
          </div>
        </div>
      </div>
    </header>
  );
};

// Hero Section
const HeroSection = () => {
  return (
    <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Shop Ethically, Earn Karma
        </h2>
        <p className="text-xl md:text-2xl text-green-100 mb-8 max-w-3xl mx-auto">
          Make sustainable choices that reward you with karma points and help create a better world
        </p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">🌍</div>
            <div className="text-sm">Sustainable Impact</div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">⚡</div>
            <div className="text-sm">Karma Rewards</div>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4 text-center">
            <div className="text-2xl font-bold">🏆</div>
            <div className="text-sm">Ethical Choices</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Stats Component
const StatsSection = ({ totalProducts, totalKarma, totalUsers }) => {
  return (
    <div className="bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">{totalProducts}</div>
            <div className="text-gray-600">Ethical Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-600 mb-2">{totalKarma}</div>
            <div className="text-gray-600">Karma Points Earned</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">{totalUsers}</div>
            <div className="text-gray-600">Conscious Shoppers</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Filter Component
const ProductFilters = ({ onFilterChange, categories, selectedCategory }) => {
  return (
    <div className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => onFilterChange('all')}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              selectedCategory === 'all'
                ? 'bg-green-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Products
          </button>
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => onFilterChange(category)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === category
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Main Home Component
const Home = () => {
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API}/products`);
      setProducts(response.data);
      setFilteredProducts(response.data);
      setLoading(false);
    } catch (e) {
      console.error('Error fetching products:', e);
      setError('Failed to load products. Please try again.');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Get unique categories
  const categories = [...new Set(products.map(product => product.category))];

  // Filter products by category
  const handleFilterChange = (category) => {
    setSelectedCategory(category);
    if (category === 'all') {
      setFilteredProducts(products);
    } else {
      setFilteredProducts(products.filter(product => product.category === category));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ethical products...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={fetchProducts}
            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const totalKarmaAvailable = products.reduce((sum, product) => sum + product.karma_points, 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <HeroSection />
      <StatsSection 
        totalProducts={products.length} 
        totalKarma={totalKarmaAvailable} 
        totalUsers={1247} 
      />
      <ProductFilters 
        onFilterChange={handleFilterChange}
        categories={categories}
        selectedCategory={selectedCategory}
      />
      
      {/* Products Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            {selectedCategory === 'all' ? 'All Products' : selectedCategory}
          </h2>
          <p className="text-gray-600">
            {filteredProducts.length} products found
          </p>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
            />
          ))}
        </div>
        
        {filteredProducts.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-600 text-lg">No products found in this category.</p>
          </div>
        )}
      </main>
      
      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-gray-300">
            © 2025 Ethical Shopping Karma. Making the world better, one purchase at a time.
          </p>
        </div>
      </footer>
    </div>
  );
};

// Categories Page
const Categories = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const response = await axios.get(`${API}/products`);
        setProducts(response.data);
        setLoading(false);
      } catch (e) {
        console.error('Error fetching products:', e);
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  const categories = [...new Set(products.map(product => product.category))];
  const getCategoryProducts = (category) => {
    return products.filter(product => product.category === category);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Product Categories</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {categories.map((category) => {
            const categoryProducts = getCategoryProducts(category);
            const totalKarma = categoryProducts.reduce((sum, product) => sum + product.karma_points, 0);
            
            return (
              <Link 
                key={category}
                to={`/category/${category}`}
                className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 overflow-hidden"
              >
                <div className="p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">{category}</h3>
                  <p className="text-gray-600 mb-4">{categoryProducts.length} products</p>
                  <div className="flex items-center justify-between">
                    <span className="text-green-600 font-medium">⚡ {totalKarma} karma points</span>
                    <svg className="w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Category Page
const CategoryPage = () => {
  const { category } = useParams();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategoryProducts = async () => {
      try {
        const response = await axios.get(`${API}/products/category/${category}`);
        setProducts(response.data);
        setLoading(false);
      } catch (e) {
        console.error('Error fetching category products:', e);
        setLoading(false);
      }
    };
    fetchCategoryProducts();
  }, [category]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-2 mb-8">
          <Link to="/categories" className="text-green-600 hover:text-green-700">
            ← Back to Categories
          </Link>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-8">{category}</h1>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </div>
    </div>
  );
};

// Impact Page
const Impact = () => {
  const { karmaPoints } = useCart();
  
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Your Impact</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-green-600 mb-2">⚡ {karmaPoints}</div>
            <div className="text-gray-600">Total Karma Points</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-blue-600 mb-2">🌱 {Math.floor(karmaPoints / 10)}</div>
            <div className="text-gray-600">Trees Planted</div>
          </div>
          
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="text-3xl font-bold text-purple-600 mb-2">🌍 {Math.floor(karmaPoints / 25)}kg</div>
            <div className="text-gray-600">CO2 Saved</div>
          </div>
        </div>
        
        <div className="bg-white rounded-xl shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Impact Over Time</h2>
          <div className="text-gray-600">
            <p className="mb-4">Your ethical shopping choices are making a real difference!</p>
            <ul className="space-y-2">
              <li>• Supporting sustainable farming practices</li>
              <li>• Reducing plastic waste through eco-friendly packaging</li>
              <li>• Promoting fair trade and ethical labor practices</li>
              <li>• Lowering carbon footprint through sustainable products</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

// Rewards Page
const Rewards = () => {
  const { karmaPoints } = useCart();
  
  const rewards = [
    { name: "Plant a Tree", cost: 100, description: "Plant a tree in your name", icon: "🌳" },
    { name: "5% Off Next Purchase", cost: 50, description: "Get 5% off your next order", icon: "💸" },
    { name: "Eco-Friendly Tote Bag", cost: 200, description: "Sustainable shopping bag", icon: "🛍️" },
    { name: "Carbon Offset", cost: 150, description: "Offset 1 ton of CO2", icon: "🌍" },
    { name: "Organic Seeds Kit", cost: 75, description: "Grow your own organic herbs", icon: "🌱" },
    { name: "Solar Charger", cost: 500, description: "Sustainable phone charger", icon: "☀️" }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Rewards Store</h1>
          <div className="bg-yellow-100 text-yellow-800 px-4 py-2 rounded-full font-medium">
            ⚡ {karmaPoints} Karma Points
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {rewards.map((reward, index) => {
            const canAfford = karmaPoints >= reward.cost;
            
            return (
              <div key={index} className="bg-white rounded-xl shadow-lg p-6">
                <div className="text-4xl mb-4">{reward.icon}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reward.name}</h3>
                <p className="text-gray-600 mb-4">{reward.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-green-600 font-medium">⚡ {reward.cost} pts</span>
                  <button
                    className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                      canAfford 
                        ? 'bg-green-600 text-white hover:bg-green-700' 
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    }`}
                    disabled={!canAfford}
                  >
                    {canAfford ? 'Redeem' : 'Not Enough Points'}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Cart Page
const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getTotalPrice, getTotalItems, clearCart } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🛒</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Your cart is empty</h2>
            <p className="text-gray-600 mb-8">Add some ethical products to start earning karma!</p>
            <Link
              to="/"
              className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
            >
              Start Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Shopping Cart</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Cart Items */}
          <div className="lg:col-span-2">
            {cart.map((item) => (
              <div key={item.id} className="bg-white rounded-xl shadow-lg p-6 mb-4">
                <div className="flex items-center gap-4">
                  <img 
                    src={item.image_url} 
                    alt={item.name}
                    className="w-20 h-20 object-cover rounded-lg"
                  />
                  <div className="flex-1">
                    <h3 className="font-bold text-lg text-gray-900">{item.name}</h3>
                    <p className="text-gray-600 mb-2">${item.price}</p>
                    <div className="flex items-center gap-1 mb-2">
                      {item.ethical_badges.map((badge, index) => (
                        <span
                          key={index}
                          className={`px-2 py-1 rounded-full text-xs font-medium border ${getBadgeColor(badge.category)}`}
                        >
                          {badge.category.replace('_', ' ').toUpperCase()}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{item.quantity}</span>
                        <button
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="w-8 h-8 bg-gray-200 rounded-full flex items-center justify-center hover:bg-gray-300"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => removeFromCart(item.id)}
                        className="text-red-600 hover:text-red-700 font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                    <div className="text-sm text-green-600">
                      ⚡ {item.karma_points * item.quantity} pts
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Items ({getTotalItems()})</span>
                  <span>${getTotalPrice().toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>FREE</span>
                </div>
                <div className="border-t pt-2">
                  <div className="flex justify-between font-bold">
                    <span>Total</span>
                    <span>${getTotalPrice().toFixed(2)}</span>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors mb-2">
                Checkout
              </button>
              
              <button
                onClick={clearCart}
                className="w-full bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Clear Cart
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

function App() {
  return (
    <div className="App">
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
        </Routes>
      </BrowserRouter>
    </div>
  );
}

export default App;