import React, { useState } from 'react';
import { helplines, categories } from '../data/helplines';
import '../styles/Helplines.css';

function HelplineNumbers() {
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredHelplines = selectedCategory === 'All'
    ? helplines
    : helplines.filter(h => h.category === selectedCategory);

  return (
    <div className="helplines-container">
      <h2>Emergency Helplines</h2>
      <p className="helplines-subtitle">India Emergency Contact Numbers</p>

      <div className="category-filters">
        {categories.map((category) => (
          <button
            key={category}
            className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            onClick={() => setSelectedCategory(category)}
          >
            {category}
          </button>
        ))}
      </div>

      <div className="helplines-list">
        {filteredHelplines.map((helpline) => (
          <div key={helpline.id} className="helpline-card">
            <div className="helpline-header">
              <h3>{helpline.name}</h3>
              <span className="helpline-category">{helpline.category}</span>
            </div>
            <p className="helpline-description">{helpline.description}</p>
            <p className="helpline-available">Available: {helpline.available}</p>
            <div className="helpline-actions">
              <a href={`tel:${helpline.number}`} className="btn-call">
                📞 Call {helpline.number}
              </a>
              {helpline.whatsapp && (
                <a
                  href={`https://wa.me/${helpline.number}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-whatsapp"
                >
                  💬 WhatsApp
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default HelplineNumbers;
