import React, { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import clsx from "clsx";
import { X } from "lucide-react";
import Button from "./Button";

const Modal = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "md",
  showCloseButton = true,
  className,
  ...props
}) => {
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

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
            aria-hidden="true"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-md"
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            <div
              className={clsx(
                "w-full bg-white rounded-2xl shadow-2xl overflow-hidden",
                sizes[size],
                className
              )}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {(title || showCloseButton) && (
                <div className="flex items-start justify-between p-md border-b border-neutral-200">
                  <div className="flex-1">
                    {title && <h2 className="text-lg font-semibold text-neutral-900">{title}</h2>}
                    {description && <p className="mt-1 text-sm text-neutral-600">{description}</p>}
                  </div>
                  {showCloseButton && (
                    <button
                      onClick={onClose}
                      className="ml-md rounded-lg p-xs hover:bg-neutral-100 text-neutral-600 transition-colors"
                      aria-label="Close modal"
                    >
                      <X size={20} />
                    </button>
                  )}
                </div>
              )}

              {/* Content */}
              <div className="p-md">{children}</div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};

export const ModalHeader = ({ children, className }) => (
  <div className={clsx("mb-md", className)}>{children}</div>
);

export const ModalBody = ({ children, className }) => (
  <div className={clsx("", className)}>{children}</div>
);

export const ModalFooter = ({ children, className, align = "right" }) => (
  <div
    className={clsx(
      "mt-md flex gap-2",
      align === "right" && "justify-end",
      align === "left" && "justify-start",
      align === "center" && "justify-center",
      className
    )}
  >
    {children}
  </div>
);

// Confirmation modal helper
export const useConfirmModal = () => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [config, setConfig] = React.useState({
    title: "Confirmer",
    description: "",
    confirmText: "Confirmer",
    cancelText: "Annuler",
    onConfirm: () => {},
    onCancel: () => {},
  });

  const openConfirm = (options) => {
    setConfig({ ...config, ...options });
    setIsOpen(true);
  };

  const closeConfirm = () => setIsOpen(false);

  const handleConfirm = () => {
    config.onConfirm();
    closeConfirm();
  };

  const handleCancel = () => {
    config.onCancel?.();
    closeConfirm();
  };

  return {
    isOpen,
    openConfirm,
    closeConfirm,
    config,
    handleConfirm,
    handleCancel,
  };
};

export default Modal;
