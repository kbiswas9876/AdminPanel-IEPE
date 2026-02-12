'use client';

import React from 'react';
import { Eye } from 'lucide-react';

export interface PrimaryActionButtonProps {
  onClick?: (event: React.MouseEvent<HTMLButtonElement>) => void;
  label?: string;
  className?: string;
}

/**
 * PrimaryActionButton
 * A prominent action button for navigating to solutions view.
 * Adapted for Admin Panel - navigation handled via onClick callback.
 */
const PrimaryActionButton: React.FC<PrimaryActionButtonProps> = ({
  onClick,
  label = 'View Solutions',
  className
}) => {
  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    if (onClick) {
      try {
        onClick(event);
      } catch (err) {
        console.error('PrimaryActionButton onClick error:', err);
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      title={label}
      aria-label={label}
      className={[
        // Base style (not fixed positioned in modal)
        'inline-flex items-center gap-2 rounded-full bg-blue-600 text-white',
        'px-6 py-3.5 mx-auto',
        // Effects
        'shadow-lg hover:shadow-xl transition-all duration-200',
        'hover:bg-blue-700 focus:outline-none',
        'focus-visible:ring-2 focus-visible:ring-blue-500',
        'focus-visible:ring-offset-2',
        // Responsive text weight
        'font-semibold',
        className || ''
      ].join(' ')}
      data-testid="primary-action-button"
    >
      <Eye className="h-5 w-5" aria-hidden="true" />
      <span>{label}</span>
    </button>
  );
};

export default PrimaryActionButton;

