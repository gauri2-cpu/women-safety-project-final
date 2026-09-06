import React from 'react';
import './BroadcastProgressModal.css';

/**
 * BroadcastProgressModal Component
 * 
 * Displays real-time progress during WhatsApp broadcast process
 * 
 * @param {boolean} isOpen - Whether the modal is visible
 * @param {string} status - Current status: 'detecting-location', 'broadcasting', 'complete', 'error'
 * @param {number} current - Current contact index (0-based)
 * @param {number} total - Total number of contacts
 * @param {Function} onCancel - Callback to cancel ongoing broadcast
 * @param {Function} onClose - Callback to close modal (complete/error states)
 * @param {string} errorMessage - Optional error message to display
 * 
 * Validates: Requirements 6.3, 6.4
 */
function BroadcastProgressModal({ 
  isOpen, 
  status = 'detecting-location',
  current = 0, 
  total = 0, 
  onCancel, 
  onClose,
  errorMessage = ''
}) {
  if (!isOpen) return null;

  // Calculate progress percentage (clamped between 0 and 100)
  const progressPercentage = total > 0 
    ? Math.max(0, Math.min(100, Math.round((current / total) * 100)))
    : 0;

  // Status messages
  const statusMessages = {
    'detecting-location': 'Detecting your location...',
    'broadcasting': `Sending to contact ${current} of ${total}`,
    'complete': `Successfully sent to ${total} contact${total !== 1 ? 's' : ''}`,
    'error': errorMessage || 'An error occurred during broadcast'
  };

  // Status icons
  const statusIcons = {
    'detecting-location': '📍',
    'broadcasting': '📤',
    'complete': '✅',
    'error': '❌'
  };

  const currentMessage = statusMessages[status] || 'Processing...';
  const currentIcon = statusIcons[status] || '⏳';

  // Show cancel button only during broadcasting
  const showCancel = status === 'broadcasting';
  
  // Show close button only on complete or error
  const showClose = status === 'complete' || status === 'error';

  return (
    <div className="broadcast-modal-overlay" onClick={(e) => {
      // Close modal if clicking overlay (only when close is available)
      if (showClose && e.target.className === 'broadcast-modal-overlay') {
        onClose && onClose();
      }
    }}>
      <div className="broadcast-modal">
        <div className="broadcast-modal-header">
          <span className="broadcast-modal-icon">{currentIcon}</span>
          <h3 className="broadcast-modal-title">WhatsApp Broadcast</h3>
        </div>

        <div className="broadcast-modal-body">
          <p className="broadcast-modal-status">{currentMessage}</p>

          {/* Progress bar - show for detecting-location and broadcasting */}
          {(status === 'detecting-location' || status === 'broadcasting') && (
            <div className="broadcast-progress-container">
              <div className="broadcast-progress-bar">
                <div 
                  className="broadcast-progress-fill"
                  style={{ width: `${progressPercentage}%` }}
                />
              </div>
              {status === 'broadcasting' && (
                <p className="broadcast-progress-text">
                  {progressPercentage}% complete
                </p>
              )}
            </div>
          )}

          {/* Success message details */}
          {status === 'complete' && (
            <div className="broadcast-success-details">
              <p>Your emergency alert has been sent via WhatsApp.</p>
              <p className="broadcast-note">
                Please confirm each message in WhatsApp to complete the broadcast.
              </p>
            </div>
          )}

          {/* Error message details */}
          {status === 'error' && (
            <div className="broadcast-error-details">
              <p>Unable to complete the broadcast.</p>
              {errorMessage && (
                <p className="broadcast-error-message">{errorMessage}</p>
              )}
              <p className="broadcast-note">
                SMS notifications have been sent as a fallback.
              </p>
            </div>
          )}
        </div>

        <div className="broadcast-modal-footer">
          {showCancel && (
            <button 
              className="broadcast-btn broadcast-btn-cancel"
              onClick={onCancel}
            >
              Cancel Broadcast
            </button>
          )}
          
          {showClose && (
            <button 
              className="broadcast-btn broadcast-btn-close"
              onClick={onClose}
            >
              Close
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default BroadcastProgressModal;
