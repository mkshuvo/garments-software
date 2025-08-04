'use client';

import { useState, useCallback } from 'react';

interface UseModalReturn {
  isOpen: boolean;
  openModal: () => void;
  closeModal: () => void;
  toggleModal: () => void;
}

export const useModal = (initialState: boolean = false): UseModalReturn => {
  const [isOpen, setIsOpen] = useState<boolean>(initialState);

  const openModal = useCallback(() => {
    setIsOpen(true);
  }, []);

  const closeModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const toggleModal = useCallback(() => {
    setIsOpen(prev => !prev);
  }, []);

  return {
    isOpen,
    openModal,
    closeModal,
    toggleModal
  };
};

// Hook for managing multiple modals
interface UseMultipleModalsReturn {
  modals: Record<string, boolean>;
  openModal: (modalName: string) => void;
  closeModal: (modalName: string) => void;
  closeAllModals: () => void;
  isAnyModalOpen: boolean;
}

export const useMultipleModals = (modalNames: string[]): UseMultipleModalsReturn => {
  const initialState = modalNames.reduce((acc, name) => {
    acc[name] = false;
    return acc;
  }, {} as Record<string, boolean>);

  const [modals, setModals] = useState<Record<string, boolean>>(initialState);

  const openModal = useCallback((modalName: string) => {
    setModals(prev => ({
      ...prev,
      [modalName]: true
    }));
  }, []);

  const closeModal = useCallback((modalName: string) => {
    setModals(prev => ({
      ...prev,
      [modalName]: false
    }));
  }, []);

  const closeAllModals = useCallback(() => {
    setModals(initialState);
  }, [initialState]);

  const isAnyModalOpen = Object.values(modals).some(isOpen => isOpen);

  return {
    modals,
    openModal,
    closeModal,
    closeAllModals,
    isAnyModalOpen
  };
};

export default useModal;