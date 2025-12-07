import { useState, useCallback } from "react";

/**
 * Hook para gestionar el estado de un modal
 * 
 * @param initialState - Estado inicial del modal (abierto/cerrado)
 * @returns Objeto con estado y funciones de control
 * 
 * @example
 * ```tsx
 * const { isOpen, openModal, closeModal, toggleModal } = useModal();
 * 
 * return (
 *   <>
 *     <button onClick={openModal}>Abrir Modal</button>
 *     <Modal isOpen={isOpen} onClose={closeModal}>
 *       <p>Contenido del modal</p>
 *     </Modal>
 *   </>
 * );
 * ```
 */
export const useModal = (initialState: boolean = false) => {
  const [isOpen, setIsOpen] = useState(initialState);

  const openModal = useCallback(() => setIsOpen(true), []);
  const closeModal = useCallback(() => setIsOpen(false), []);
  const toggleModal = useCallback(() => setIsOpen((prev) => !prev), []);

  return { isOpen, openModal, closeModal, toggleModal };
};

export default useModal;
