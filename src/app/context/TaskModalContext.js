"use client";

import { createContext, useContext, useState } from "react";
import CreateTaskModal from "../components/CreateTaskModal";

const TaskModalContext = createContext({
  openTaskModal: () => {},
  closeTaskModal: () => {},
});

export function TaskModalProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [modalProps, setModalProps] = useState(null);

  const openTaskModal = (props = {}) => {
    setModalProps({ type: "task", ...props });
    setIsOpen(true);
  };

  const closeTaskModal = () => {
    setIsOpen(false);
    setModalProps(null);
  };

  return (
    <TaskModalContext.Provider
      value={{
        openTaskModal,
        closeTaskModal,
      }}
    >
      {children}
      {/* Render the modal here so it's available everywhere */}
      <CreateTaskModal
        isOpen={isOpen}
        onClose={closeTaskModal}
        modalProps={modalProps}
      />
    </TaskModalContext.Provider>
  );
}

export function useTaskModal() {
  const context = useContext(TaskModalContext);
  if (!context) {
    throw new Error("useTaskModal must be used within a TaskModalProvider");
  }
  return context;
}
