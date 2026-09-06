import React from 'react';
import '../styles/QuickExit.css';

function QuickExit() {
  const handleQuickExit = () => {
    // Redirect to YouTube decoy page
    window.location.replace('/decoy.html');
  };

  return (
    <button 
      className="quick-exit-btn" 
      onClick={handleQuickExit} 
      title="Quick Exit - Escape to safe page"
      aria-label="Quick Exit"
    >
      ⚠️
    </button>
  );
}

export default QuickExit;
