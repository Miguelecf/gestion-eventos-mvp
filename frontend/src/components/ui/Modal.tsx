import { useRef, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface ModalProps {
  /** Controla si el modal está visible */
  isOpen: boolean;
  /** Callback cuando se cierra el modal */
  onClose: () => void;
  /** Clases CSS adicionales para el contenedor del modal */
  className?: string;
  /** Contenido del modal */
  children: React.ReactNode;
  /** Mostrar botón de cierre (X) - default: true */
  showCloseButton?: boolean;
  /** Modo pantalla completa - default: false */
  isFullscreen?: boolean;
}

/**
 * Componente Modal
 * 
 * @example
 * ```tsx
 * const { isOpen, openModal, closeModal } = useModal();
 * 
 * return (
 *   <>
 *     <button onClick={openModal}>Abrir Modal</button>
 *     <Modal isOpen={isOpen} onClose={closeModal}>
 *       <h2>Título del Modal</h2>
 *       <p>Contenido del modal...</p>
 *     </Modal>
 *   </>
 * );
 * ```
 */
export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  children,
  className,
  showCloseButton = true,
  isFullscreen = false,
}) => {
  const modalRef = useRef<HTMLDivElement>(null);

  // Manejar cierre con tecla ESC
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen, onClose]);

  // Prevenir scroll del body cuando el modal está abierto
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const contentClasses = isFullscreen
    ? "w-full h-full"
    : "relative w-full rounded-3xl bg-white dark:bg-gray-900";

  return (
    <div className="fixed inset-0 flex items-center justify-center overflow-y-auto modal z-[9999]">
      {/* Backdrop */}
      {!isFullscreen && (
        <div
          className="fixed inset-0 h-full w-full bg-gray-400/50 dark:bg-gray-900/80 backdrop-blur-sm"
          onClick={onClose}
          aria-hidden="true"
        />
      )}
      
      {/* Modal Content */}
      <div
        ref={modalRef}
        className={cn(contentClasses, className)}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
      >
        {/* Close Button */}
        {showCloseButton && (
          <button
            onClick={onClose}
            className={cn(
              "absolute right-3 top-3 z-[10000] flex h-9.5 w-9.5 items-center justify-center",
              "rounded-full bg-gray-100 text-gray-400 transition-colors",
              "hover:bg-gray-200 hover:text-gray-700",
              "dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white",
              "sm:right-6 sm:top-6 sm:h-11 sm:w-11",
              "focus:outline-none focus:ring-2 focus:ring-gray-300 dark:focus:ring-gray-600"
            )}
            aria-label="Cerrar modal"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M6.04289 16.5413C5.65237 16.9318 5.65237 17.565 6.04289 17.9555C6.43342 18.346 7.06658 18.346 7.45711 17.9555L11.9987 13.4139L16.5408 17.956C16.9313 18.3466 17.5645 18.3466 17.955 17.956C18.3455 17.5655 18.3455 16.9323 17.955 16.5418L13.4129 11.9997L17.955 7.4576C18.3455 7.06707 18.3455 6.43391 17.955 6.04338C17.5645 5.65286 16.9313 5.65286 16.5408 6.04338L11.9987 10.5855L7.45711 6.0439C7.06658 5.65338 6.43342 5.65338 6.04289 6.0439C5.65237 6.43442 5.65237 7.06759 6.04289 7.45811L10.5845 11.9997L6.04289 16.5413Z"
                fill="currentColor"
              />
            </svg>
          </button>
        )}
        
        {/* Children Content */}
        <div>{children}</div>
      </div>
    </div>
  );
};

export default Modal;
