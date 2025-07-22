import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'default' | 'outline' | 'ghost' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  children: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  ...props 
}) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'outline':
        return {
          border: '1px solid #d1d5db',
          backgroundColor: 'transparent',
          color: '#374151'
        };
      case 'ghost':
        return {
          backgroundColor: 'transparent',
          color: '#374151'
        };
      case 'destructive':
        return {
          backgroundColor: '#dc2626',
          color: 'white'
        };
      default:
        return {
          backgroundColor: '#2563eb',
          color: 'white'
        };
    }
  };

  const getSizeStyles = () => {
    switch (size) {
      case 'sm':
        return {
          height: '36px',
          padding: '0 12px',
          fontSize: '14px'
        };
      case 'lg':
        return {
          height: '44px',
          padding: '0 32px',
          fontSize: '16px'
        };
      default:
        return {
          height: '40px',
          padding: '0 16px',
          fontSize: '14px'
        };
    }
  };

  return (
    <button
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: '6px',
        fontWeight: '500',
        transition: 'all 0.2s',
        border: 'none',
        cursor: 'pointer',
        ...getVariantStyles(),
        ...getSizeStyles()
      }}
      {...props}
    >
      {children}
    </button>
  );
};