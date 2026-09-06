import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import BroadcastProgressModal from './BroadcastProgressModal';

describe('BroadcastProgressModal Component', () => {
  // Unit Tests for specific behaviors and edge cases
  
  describe('Visibility', () => {
    it('should not render when isOpen is false', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={false} 
          status="broadcasting"
          current={1}
          total={5}
        />
      );
      expect(container.firstChild).toBeNull();
    });

    it('should render when isOpen is true', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={1}
          total={5}
        />
      );
      expect(screen.getByText('WhatsApp Broadcast')).toBeInTheDocument();
    });
  });

  describe('Status: detecting-location', () => {
    it('should display location detection message', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="detecting-location"
          current={0}
          total={5}
        />
      );
      expect(screen.getByText('Detecting your location...')).toBeInTheDocument();
      expect(screen.getByText('📍')).toBeInTheDocument();
    });

    it('should show progress bar during location detection', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="detecting-location"
          current={0}
          total={5}
        />
      );
      expect(container.querySelector('.broadcast-progress-bar')).toBeInTheDocument();
    });

    it('should not show cancel or close buttons during location detection', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="detecting-location"
          current={0}
          total={5}
        />
      );
      expect(screen.queryByText('Cancel Broadcast')).not.toBeInTheDocument();
      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });
  });

  describe('Status: broadcasting', () => {
    it('should display current progress message', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={3}
          total={5}
        />
      );
      expect(screen.getByText('Sending to contact 3 of 5')).toBeInTheDocument();
      expect(screen.getByText('📤')).toBeInTheDocument();
    });

    it('should show progress bar with correct percentage', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={3}
          total={5}
        />
      );
      const progressFill = container.querySelector('.broadcast-progress-fill');
      expect(progressFill).toHaveStyle({ width: '60%' });
      expect(screen.getByText('60% complete')).toBeInTheDocument();
    });

    it('should show cancel button during broadcasting', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={2}
          total={5}
          onCancel={() => {}}
        />
      );
      expect(screen.getByText('Cancel Broadcast')).toBeInTheDocument();
    });

    it('should call onCancel when cancel button is clicked', () => {
      const mockCancel = jest.fn();
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={2}
          total={5}
          onCancel={mockCancel}
        />
      );
      fireEvent.click(screen.getByText('Cancel Broadcast'));
      expect(mockCancel).toHaveBeenCalledTimes(1);
    });

    it('should not show close button during broadcasting', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={2}
          total={5}
        />
      );
      expect(screen.queryByText('Close')).not.toBeInTheDocument();
    });
  });

  describe('Status: complete', () => {
    it('should display success message with contact count', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
        />
      );
      expect(screen.getByText('Successfully sent to 5 contacts')).toBeInTheDocument();
      expect(screen.getByText('✅')).toBeInTheDocument();
    });

    it('should use singular "contact" for single contact', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={1}
          total={1}
        />
      );
      expect(screen.getByText('Successfully sent to 1 contact')).toBeInTheDocument();
    });

    it('should show success details and instructions', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
        />
      );
      expect(screen.getByText('Your emergency alert has been sent via WhatsApp.')).toBeInTheDocument();
      expect(screen.getByText('Please confirm each message in WhatsApp to complete the broadcast.')).toBeInTheDocument();
    });

    it('should show close button on complete', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should call onClose when close button is clicked', () => {
      const mockClose = jest.fn();
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
          onClose={mockClose}
        />
      );
      fireEvent.click(screen.getByText('Close'));
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should not show progress bar on complete', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
        />
      );
      expect(container.querySelector('.broadcast-progress-bar')).not.toBeInTheDocument();
    });

    it('should not show cancel button on complete', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
        />
      );
      expect(screen.queryByText('Cancel Broadcast')).not.toBeInTheDocument();
    });
  });

  describe('Status: error', () => {
    it('should display error message', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
          errorMessage="Network connection failed"
        />
      );
      const errorMessages = screen.getAllByText('Network connection failed');
      expect(errorMessages.length).toBeGreaterThan(0);
      expect(screen.getByText('❌')).toBeInTheDocument();
    });

    it('should display default error message when no errorMessage provided', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
        />
      );
      expect(screen.getByText('An error occurred during broadcast')).toBeInTheDocument();
    });

    it('should show error details and SMS fallback message', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
          errorMessage="Failed to open WhatsApp"
        />
      );
      expect(screen.getByText('Unable to complete the broadcast.')).toBeInTheDocument();
      expect(screen.getByText('SMS notifications have been sent as a fallback.')).toBeInTheDocument();
    });

    it('should show close button on error', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
          onClose={() => {}}
        />
      );
      expect(screen.getByText('Close')).toBeInTheDocument();
    });

    it('should not show cancel button on error', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
        />
      );
      expect(screen.queryByText('Cancel Broadcast')).not.toBeInTheDocument();
    });

    it('should not show progress bar on error', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
        />
      );
      expect(container.querySelector('.broadcast-progress-bar')).not.toBeInTheDocument();
    });
  });

  describe('Progress Calculation', () => {
    it('should calculate 0% progress when current is 0', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={0}
          total={5}
        />
      );
      const progressFill = container.querySelector('.broadcast-progress-fill');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('should calculate 100% progress when current equals total', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={5}
          total={5}
        />
      );
      const progressFill = container.querySelector('.broadcast-progress-fill');
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('should handle zero total gracefully', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={0}
          total={0}
        />
      );
      const progressFill = container.querySelector('.broadcast-progress-fill');
      expect(progressFill).toHaveStyle({ width: '0%' });
    });
  });

  describe('Overlay Click Behavior', () => {
    it('should close modal when clicking overlay in complete state', () => {
      const mockClose = jest.fn();
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
          onClose={mockClose}
        />
      );
      const overlay = container.querySelector('.broadcast-modal-overlay');
      fireEvent.click(overlay);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should close modal when clicking overlay in error state', () => {
      const mockClose = jest.fn();
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
          onClose={mockClose}
        />
      );
      const overlay = container.querySelector('.broadcast-modal-overlay');
      fireEvent.click(overlay);
      expect(mockClose).toHaveBeenCalledTimes(1);
    });

    it('should not close modal when clicking overlay during broadcasting', () => {
      const mockClose = jest.fn();
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={2}
          total={5}
          onClose={mockClose}
        />
      );
      const overlay = container.querySelector('.broadcast-modal-overlay');
      fireEvent.click(overlay);
      expect(mockClose).not.toHaveBeenCalled();
    });

    it('should not close modal when clicking modal content', () => {
      const mockClose = jest.fn();
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="complete"
          current={5}
          total={5}
          onClose={mockClose}
        />
      );
      const modal = container.querySelector('.broadcast-modal');
      fireEvent.click(modal);
      expect(mockClose).not.toHaveBeenCalled();
    });
  });

  describe('Default Props', () => {
    it('should use default status when not provided', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          current={0}
          total={5}
        />
      );
      expect(screen.getByText('Detecting your location...')).toBeInTheDocument();
    });

    it('should use default current value when not provided', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          total={5}
        />
      );
      expect(screen.getByText('Sending to contact 0 of 5')).toBeInTheDocument();
    });

    it('should use default total value when not provided', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={0}
        />
      );
      expect(screen.getByText('Sending to contact 0 of 0')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('should handle undefined callbacks gracefully', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={2}
          total={5}
        />
      );
      // Should render without errors even without callbacks
      expect(screen.getByText('WhatsApp Broadcast')).toBeInTheDocument();
    });

    it('should handle negative current value', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={-1}
          total={5}
        />
      );
      const progressFill = container.querySelector('.broadcast-progress-fill');
      // Should clamp to 0%
      expect(progressFill).toHaveStyle({ width: '0%' });
    });

    it('should handle current greater than total', () => {
      const { container } = render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="broadcasting"
          current={7}
          total={5}
        />
      );
      const progressFill = container.querySelector('.broadcast-progress-fill');
      // Should clamp to 100%
      expect(progressFill).toHaveStyle({ width: '100%' });
    });

    it('should handle empty errorMessage string', () => {
      render(
        <BroadcastProgressModal 
          isOpen={true} 
          status="error"
          current={2}
          total={5}
          errorMessage=""
        />
      );
      expect(screen.getByText('An error occurred during broadcast')).toBeInTheDocument();
    });
  });
});
