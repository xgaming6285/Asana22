"use client";

import React, { createContext, useState, useContext } from "react";

const ModalContext = createContext();

export const useModal = () => {
  return useContext(ModalContext);
};

export const ModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState(null); // Changed from modalContent to modalProps

  const openModal = (props = null) => {
    // Renamed argument for clarity
    setModalProps(props);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
    setModalProps(null); // Clear props when closing
  };

  const updateTaskOnBoard = (updatedTask) => {
    // Call the onTaskUpdate callback if provided in modal props
    if (modalProps?.onTaskUpdate && typeof modalProps.onTaskUpdate === 'function') {
      modalProps.onTaskUpdate(updatedTask);
    }
  };

  return (
    <ModalContext.Provider
      value={{ isOpen, openModal, closeModal, modalProps, updateTaskOnBoard }} // Changed modalContent to modalProps
    >
      {children}
    </ModalContext.Provider>
  );
};