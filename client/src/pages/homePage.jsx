import React from 'react';
import { Link } from 'react-router-dom';
import Hero from '../components/Hero.jsx';
const HomePage = () => {
  return (
    <div dir="ltr" className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <img
        src="/backGround.png"
        alt=""
        className="absolute inset-0 -z-20 h-full w-full object-cover"
      />

      {/* Hero */}
      <Hero />
    </div>
  );
};

export default HomePage;
