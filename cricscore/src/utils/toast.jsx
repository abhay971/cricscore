import { createRoot } from 'react-dom/client';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Toast Notification System
 * Global toast notifications for errors, success, info, warning
 */

let toastContainer = null;
let toastRoot = null;

const ToastContainer = ({ toasts, removeToast }) => {
  return (
    <div className="fixed top-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300 }}
            transition={{ duration: 0.3 }}
            className="mb-3 pointer-events-auto"
          >
            <div
              className={`rounded-lg shadow-lg p-4 min-w-[300px] max-w-md backdrop-blur-sm
                ${toast.type === 'success' ? 'bg-green-500 text-white' : ''}
                ${toast.type === 'error' ? 'bg-red-500 text-white' : ''}
                ${toast.type === 'warning' ? 'bg-orange-500 text-white' : ''}
                ${toast.type === 'info' ? 'bg-blue-500 text-white' : ''}`}
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0">
                  {toast.type === 'success' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                  {toast.type === 'error' && (
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  )}
                </div>
                <div className="flex-1">
                  {toast.title && <p className="font-bold mb-1">{toast.title}</p>}
                  <p className="text-sm">{toast.message}</p>
                </div>
                <button onClick={() => removeToast(toast.id)} className="flex-shrink-0 hover:opacity-70 transition-opacity">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

class ToastManager {
  constructor() {
    this.toasts = [];
    this.render = this.render.bind(this);
  }

  init() {
    if (!toastContainer) {
      toastContainer = document.createElement('div');
      document.body.appendChild(toastContainer);
      toastRoot = createRoot(toastContainer);
    }
  }

  render() {
    this.init();
    toastRoot.render(<ToastContainer toasts={this.toasts} removeToast={this.removeToast.bind(this)} />);
  }

  show(type, message, title = null, duration = 5000) {
    const id = Date.now() + Math.random();
    const toast = { id, type, message, title };
    this.toasts = [...this.toasts, toast];
    this.render();
    if (duration > 0) {
      setTimeout(() => this.removeToast(id), duration);
    }
    return id;
  }

  removeToast(id) {
    this.toasts = this.toasts.filter(toast => toast.id !== id);
    this.render();
  }

  success(message, title = 'Success') {
    return this.show('success', message, title);
  }

  error(message, title = 'Error') {
    return this.show('error', message, title);
  }

  warning(message, title = 'Warning') {
    return this.show('warning', message, title);
  }

  info(message, title = 'Info') {
    return this.show('info', message, title);
  }

  clear() {
    this.toasts = [];
    this.render();
  }
}

const toast = new ToastManager();
export default toast;
