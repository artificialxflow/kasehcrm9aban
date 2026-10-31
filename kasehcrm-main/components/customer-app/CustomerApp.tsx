import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { CartProvider } from './CartContext';
import ConceptSelect from './ConceptSelect';
import MenuPage from './MenuPage';
import CartPage from './CartPage';
import CheckoutPage from './CheckoutPage';

const CustomerApp: React.FC = () => {
  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50 py-6">
        <Routes>
          <Route path="/" element={<ConceptSelect />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="checkout" element={<CheckoutPage />} />
          <Route path=":concept" element={<MenuPage />} />
        </Routes>
      </div>
    </CartProvider>
  );
};

export default CustomerApp;
