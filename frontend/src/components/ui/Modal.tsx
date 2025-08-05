'use client';

import React, { useEffect, useRef } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  Fade,
  Backdrop,
  Box,
  useTheme,
  useMediaQuery
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  maxWidth?: 'xs' | 'sm' | 'md' | 'lg' | 'xl';
  fullWidth?: boolean;
  disableBackdropClick?: boolean;
  disableEscapeKeyDown?: boolean;
  confirmOnClose?: boolean;
  confirmMessage?: string;
  hasUnsavedChanges?: boolean;
  onConfirmClose?: () => boolean; // Custom confirmation handler that returns true if should close
}

export const Modal: React.FC<ModalProps> = ({
  open,
  onClose,
  title,
  children,
  actions,
  maxWidth = 'sm',
  fullWidth = true,
  disableBackdropClick = false,
  disableEscapeKeyDown = false,
  confirmOnClose = false,
  confirmMessage = 'You have unsaved changes. Are you sure you want to close without saving?',
  hasUnsavedChanges = false,
  onConfirmClose
}) => {
  const theme = useTheme();
  // Handle test environment where useMediaQuery might fail
  const isMobile = useMediaQuery(theme.breakpoints?.down?.('sm') || '(max-width: 600px)');
  const firstFocusableElementRef = useRef<HTMLElement | null>(null);
  const modalRef = useRef<HTMLDivElement | null>(null);

  // Prevent body scroll and interaction when modal is open
  useEffect(() => {
    if (open) {
      // Store original body styles
      const originalStyle = window.getComputedStyle(document.body);
      const originalOverflow = originalStyle.overflow;
      const originalPaddingRight = originalStyle.paddingRight;
      
      // Calculate scrollbar width to prevent layout shift
      const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
      
      // Prevent body scroll and add padding to compensate for scrollbar
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = `${scrollbarWidth}px`;
      
      // Cleanup function
      return () => {
        document.body.style.overflow = originalOverflow;
        document.body.style.paddingRight = originalPaddingRight;
      };
    }
  }, [open]);

  // Enhanced focus management for accessibility
  useEffect(() => {
    if (open) {
      // Store the element that was focused before modal opened
      const previouslyFocusedElement = document.activeElement as HTMLElement;
      
      // Focus the first focusable element when modal opens
      const timer = setTimeout(() => {
        const modalElement = document.querySelector('[role="dialog"]');
        if (modalElement) {
          const focusableElements = modalElement.querySelectorAll(
            'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable="true"]:not([disabled])'
          );
          const firstElement = focusableElements[0] as HTMLElement;
          if (firstElement) {
            firstElement.focus();
            firstFocusableElementRef.current = firstElement;
          }
        }
      }, 100);
      
      // Return focus to previously focused element when modal closes
      return () => {
        clearTimeout(timer);
        if (previouslyFocusedElement && typeof previouslyFocusedElement.focus === 'function') {
          // Small delay to ensure modal is fully closed
          setTimeout(() => {
            previouslyFocusedElement.focus();
          }, 100);
        }
      };
    }
  }, [open]);

  // Enhanced focus trapping and keyboard navigation
  const handleKeyDown = (event: React.KeyboardEvent) => {
    // Handle Escape key
    if (event.key === 'Escape') {
      if (!disableEscapeKeyDown) {
        event.preventDefault();
        event.stopPropagation();
        
        // Handle confirmation for unsaved changes
        if (hasUnsavedChanges || confirmOnClose) {
          if (onConfirmClose) {
            const shouldClose = onConfirmClose();
            if (shouldClose) onClose();
          } else {
            const confirmed = window.confirm(confirmMessage);
            if (confirmed) onClose();
          }
        } else {
          onClose();
        }
      }
      return;
    }

    // Handle Tab key for focus trapping
    if (event.key === 'Tab') {
      const modalElement = document.querySelector('[role="dialog"]');
      if (modalElement) {
        const focusableElements = modalElement.querySelectorAll(
          'button:not([disabled]), [href]:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"]):not([disabled]), [contenteditable="true"]:not([disabled])'
        );
        
        if (focusableElements.length === 0) return;
        
        const firstElement = focusableElements[0] as HTMLElement;
        const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;
        const activeElement = document.activeElement as HTMLElement;

        if (event.shiftKey) {
          // Shift + Tab (backward)
          if (activeElement === firstElement || !modalElement.contains(activeElement)) {
            event.preventDefault();
            lastElement?.focus();
          }
        } else {
          // Tab (forward)
          if (activeElement === lastElement || !modalElement.contains(activeElement)) {
            event.preventDefault();
            firstElement?.focus();
          }
        }
      }
    }

    // Handle Enter key on close button
    if (event.key === 'Enter' && (event.target as HTMLElement).getAttribute('aria-label') === 'close modal') {
      event.preventDefault();
      onClose();
    }
  };

  const handleClose = (event: object, reason: 'backdropClick' | 'escapeKeyDown') => {
    if (reason === 'backdropClick' && disableBackdropClick) {
      return;
    }
    if (reason === 'escapeKeyDown' && disableEscapeKeyDown) {
      return;
    }
    
    // Handle confirmation for escape key
    if (reason === 'escapeKeyDown' && (hasUnsavedChanges || confirmOnClose)) {
      if (onConfirmClose) {
        const shouldClose = onConfirmClose();
        if (!shouldClose) return;
      } else {
        const confirmed = window.confirm(confirmMessage);
        if (!confirmed) return;
      }
    }
    
    onClose();
  };

  // Enhanced backdrop click handler with confirmation for unsaved changes
  const handleBackdropClick = (event: React.MouseEvent) => {
    // Only handle clicks on the backdrop itself, not on the modal content
    if (event.target === event.currentTarget) {
      if (disableBackdropClick) {
        // If backdrop click is disabled, show a subtle indication
        const backdrop = event.currentTarget as HTMLElement;
        const modalPaper = document.querySelector('[role="dialog"] .MuiPaper-root') as HTMLElement;
        
        // Animate the backdrop
        backdrop.style.animation = 'none';
        backdrop.style.animation = 'modalPulse 0.4s ease-in-out';
        
        // Animate the modal paper for better feedback
        if (modalPaper) {
          modalPaper.style.animation = 'none';
          modalPaper.style.animation = 'modalShake 0.4s ease-in-out';
        }
        
        setTimeout(() => {
          backdrop.style.animation = '';
          if (modalPaper) {
            modalPaper.style.animation = '';
          }
        }, 400);
        return;
      }
      
      // Handle confirmation if needed
      if (hasUnsavedChanges || confirmOnClose) {
        // Use custom confirmation handler if provided
        if (onConfirmClose) {
          const shouldClose = onConfirmClose();
          if (!shouldClose) return;
        } else {
          // Default confirmation dialog
          const confirmed = window.confirm(confirmMessage);
          if (!confirmed) return;
        }
      }
      
      onClose();
    }
  };

  // Prevent interaction with main page elements when modal is open
  useEffect(() => {
    if (open) {
      // Get all interactive elements outside the modal
      const interactiveElements = document.querySelectorAll(
        'button:not([data-modal-element]), a:not([data-modal-element]), input:not([data-modal-element]), select:not([data-modal-element]), textarea:not([data-modal-element]), [tabindex]:not([tabindex="-1"]):not([data-modal-element])'
      );
      
      // Store original tabindex values and disable interaction
      const originalTabIndexes = new Map();
      interactiveElements.forEach((element) => {
        const htmlElement = element as HTMLElement;
        // Skip elements that are inside the modal
        if (htmlElement.closest('[role="dialog"]')) return;
        
        originalTabIndexes.set(element, htmlElement.tabIndex);
        htmlElement.tabIndex = -1;
        htmlElement.style.pointerEvents = 'none';
        htmlElement.setAttribute('aria-hidden', 'true');
      });
      
      // Add global keyboard event listener for modal-specific shortcuts
      const handleGlobalKeyDown = (event: KeyboardEvent) => {
        // Only handle if modal is the active element or contains the active element
        const modalElement = document.querySelector('[role="dialog"]');
        const activeElement = document.activeElement;
        
        if (!modalElement || (!modalElement.contains(activeElement) && activeElement !== modalElement)) {
          return;
        }
        
        // Handle Escape key globally
        if (event.key === 'Escape' && !disableEscapeKeyDown) {
          event.preventDefault();
          event.stopPropagation();
          
          if (hasUnsavedChanges || confirmOnClose) {
            if (onConfirmClose) {
              const shouldClose = onConfirmClose();
              if (shouldClose) onClose();
            } else {
              const confirmed = window.confirm(confirmMessage);
              if (confirmed) onClose();
            }
          } else {
            onClose();
          }
        }
      };
      
      document.addEventListener('keydown', handleGlobalKeyDown, true);
      
      // Cleanup function to restore interaction
      return () => {
        document.removeEventListener('keydown', handleGlobalKeyDown, true);
        interactiveElements.forEach((element) => {
          const htmlElement = element as HTMLElement;
          if (htmlElement.closest('[role="dialog"]')) return;
          
          const originalTabIndex = originalTabIndexes.get(element);
          if (originalTabIndex !== undefined) {
            htmlElement.tabIndex = originalTabIndex;
          } else {
            htmlElement.removeAttribute('tabindex');
          }
          htmlElement.style.pointerEvents = '';
          htmlElement.removeAttribute('aria-hidden');
        });
      };
    }
  }, [open, disableEscapeKeyDown, hasUnsavedChanges, confirmOnClose, onConfirmClose, confirmMessage, onClose]);

  return (
    <Dialog
      ref={modalRef}
      open={open}
      onClose={handleClose}
      maxWidth={maxWidth}
      fullWidth={fullWidth}
      fullScreen={isMobile}
      TransitionComponent={Fade}
      TransitionProps={{
        timeout: {
          enter: 300,
          exit: 200
        },
        easing: {
          enter: theme.transitions.easing.easeOut,
          exit: theme.transitions.easing.easeIn
        }
      }}
      BackdropComponent={Backdrop}
      BackdropProps={{
        timeout: {
          enter: 300,
          exit: 200
        },
        onClick: handleBackdropClick,
        sx: {
          backgroundColor: 'rgba(0, 0, 0, 0.75)',
          backdropFilter: 'blur(8px)',
          cursor: disableBackdropClick ? 'not-allowed' : 'pointer',
          zIndex: theme.zIndex.modal - 1,
          // Ensure backdrop covers entire viewport and prevents interaction
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          width: '100vw',
          height: '100vh',
          // Prevent scrolling and interaction with background
          overscrollBehavior: 'contain',
          touchAction: 'none',
          // Enhanced visual feedback with smooth transitions
          transition: theme.transitions.create(['background-color', 'backdrop-filter', 'opacity'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut
          }),
          // Smooth backdrop animations
          '&.MuiBackdrop-root': {
            opacity: 0,
            transition: theme.transitions.create('opacity', {
              duration: 300,
              easing: theme.transitions.easing.easeOut
            })
          },
          '&.MuiBackdrop-root.MuiBackdrop-invisible': {
            opacity: 0
          },
          // Add shake animation for when backdrop click is disabled
          '@keyframes modalShake': {
            '0%, 100%': { transform: 'translateX(0)' },
            '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-2px)' },
            '20%, 40%, 60%, 80%': { transform: 'translateX(2px)' }
          },
          // Add pulse animation for disabled state
          '@keyframes modalPulse': {
            '0%': { backgroundColor: 'rgba(0, 0, 0, 0.75)' },
            '50%': { backgroundColor: 'rgba(0, 0, 0, 0.85)' },
            '100%': { backgroundColor: 'rgba(0, 0, 0, 0.75)' }
          },
          // Hover effect for better UX
          '&:hover': {
            backgroundColor: disableBackdropClick 
              ? 'rgba(0, 0, 0, 0.75)' 
              : 'rgba(0, 0, 0, 0.8)',
            transition: theme.transitions.create('background-color', {
              duration: 150,
              easing: theme.transitions.easing.easeInOut
            })
          }
        }
      }}
      PaperProps={{
        'data-modal-element': 'true',
        sx: {
          borderRadius: isMobile ? 0 : 2,
          boxShadow: theme.shadows[24],
          maxHeight: isMobile ? '100vh' : '90vh',
          overflow: 'hidden',
          position: 'relative',
          zIndex: theme.zIndex.modal,
          // Prevent interaction with elements behind modal
          pointerEvents: 'auto',
          // Ensure modal is properly centered
          margin: isMobile ? 0 : 'auto',
          // Add subtle border for better definition
          border: `1px solid ${theme.palette.divider}`,
          // Enhanced smooth transitions and animations
          transition: theme.transitions.create(['transform', 'opacity', 'box-shadow'], {
            duration: theme.transitions.duration.standard,
            easing: theme.transitions.easing.easeInOut
          }),
          // Add entrance animation
          '@keyframes modalSlideIn': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-20px) scale(0.95)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)'
            }
          },
          // Add exit animation
          '@keyframes modalSlideOut': {
            '0%': {
              opacity: 1,
              transform: 'translateY(0) scale(1)'
            },
            '100%': {
              opacity: 0,
              transform: 'translateY(-20px) scale(0.95)'
            }
          },
          // Apply entrance animation
          animation: open ? 'modalSlideIn 0.3s ease-out' : 'modalSlideOut 0.2s ease-in',
          // Smooth hover effects
          '&:hover': {
            boxShadow: theme.shadows[24],
            transition: theme.transitions.create('box-shadow', {
              duration: 200,
              easing: theme.transitions.easing.easeInOut
            })
          },
          // Ensure all child elements are marked as modal elements
          '& *': {
            '&[data-modal-element]': {
              // Modal element styles can go here if needed
            }
          }
        }
      }}
      onKeyDown={handleKeyDown}
      aria-labelledby="modal-title"
      aria-describedby="modal-content"
      aria-modal="true"
      role="dialog"
    >
      <DialogTitle
        id="modal-title"
        component="h2"
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: `1px solid ${theme.palette.divider}`,
          pb: 2,
          // Add smooth entrance animation for title
          animation: open ? 'fadeInDown 0.4s ease-out 0.1s both' : 'fadeOutUp 0.2s ease-in both',
          '@keyframes fadeInDown': {
            '0%': {
              opacity: 0,
              transform: 'translateY(-10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          '@keyframes fadeOutUp': {
            '0%': {
              opacity: 1,
              transform: 'translateY(0)'
            },
            '100%': {
              opacity: 0,
              transform: 'translateY(-10px)'
            }
          }
        }}
      >
        <Box 
          component="span" 
          sx={{ fontWeight: 600 }}
          role="heading"
          aria-level={2}
        >
          {title}
        </Box>
        <IconButton
          aria-label={`Close ${title} modal`}
          onClick={onClose}
          data-modal-element="true"
          tabIndex={0}
          sx={{
            color: theme.palette.grey[500],
            transition: theme.transitions.create(['background-color', 'transform', 'color'], {
              duration: 200,
              easing: theme.transitions.easing.easeInOut
            }),
            '&:hover': {
              backgroundColor: theme.palette.action.hover,
              color: theme.palette.grey[700],
              transform: 'scale(1.1)'
            },
            '&:active': {
              transform: 'scale(0.95)',
              transition: theme.transitions.create('transform', {
                duration: 100
              })
            },
            '&:focus': {
              outline: `2px solid ${theme.palette.primary.main}`,
              outlineOffset: '2px',
              transition: theme.transitions.create('outline', {
                duration: 150
              })
            }
          }}
        >
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent
        id="modal-content"
        role="document"
        tabIndex={-1}
        sx={{
          p: 3,
          overflow: 'auto',
          // Add smooth entrance animation for content
          animation: open ? 'fadeInUp 0.4s ease-out 0.2s both' : 'fadeOutDown 0.2s ease-in both',
          '@keyframes fadeInUp': {
            '0%': {
              opacity: 0,
              transform: 'translateY(10px)'
            },
            '100%': {
              opacity: 1,
              transform: 'translateY(0)'
            }
          },
          '@keyframes fadeOutDown': {
            '0%': {
              opacity: 1,
              transform: 'translateY(0)'
            },
            '100%': {
              opacity: 0,
              transform: 'translateY(10px)'
            }
          },
          '&::-webkit-scrollbar': {
            width: '8px'
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: theme.palette.grey[100]
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: theme.palette.grey[400],
            borderRadius: '4px',
            transition: theme.transitions.create('background-color', {
              duration: 200
            }),
            '&:hover': {
              backgroundColor: theme.palette.grey[600]
            }
          },
          // Ensure focus indicators are visible with smooth transitions
          '& *:focus': {
            outline: `2px solid ${theme.palette.primary.main}`,
            outlineOffset: '2px',
            transition: theme.transitions.create('outline', {
              duration: 150
            })
          }
        }}
      >
        {children}
      </DialogContent>
      {actions && (
        <DialogActions
          role="group"
          aria-label="Modal actions"
          sx={{
            borderTop: `1px solid ${theme.palette.divider}`,
            p: 3,
            gap: 2,
            // Add smooth entrance animation for actions
            animation: open ? 'fadeInUp 0.4s ease-out 0.3s both' : 'fadeOutDown 0.2s ease-in both',
            // Ensure action buttons have proper focus indicators with transitions
            '& button': {
              transition: theme.transitions.create(['transform', 'box-shadow'], {
                duration: 200,
                easing: theme.transitions.easing.easeInOut
              }),
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: theme.shadows[4]
              },
              '&:active': {
                transform: 'translateY(0)',
                transition: theme.transitions.create('transform', {
                  duration: 100
                })
              },
              '&:focus': {
                outline: `2px solid ${theme.palette.primary.main}`,
                outlineOffset: '2px',
                transition: theme.transitions.create('outline', {
                  duration: 150
                })
              }
            }
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default Modal;