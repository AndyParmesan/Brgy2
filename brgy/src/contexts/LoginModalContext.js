import { createContext, useContext, useState, useRef, useEffect } from 'react';

const LoginModalContext = createContext();

export const useLoginModal = () => {
  const context = useContext(LoginModalContext);
  if (!context) {
    throw new Error('useLoginModal must be used within LoginModalProvider');
  }
  return context;
};

export const LoginModalProvider = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const onLoginRef = useRef(null);

  const openModal = () => setIsOpen(true);
  const closeModal = () => setIsOpen(false);
  const setOnLogin = (callback) => {
    onLoginRef.current = callback;
  };
  const getOnLogin = () => onLoginRef.current;

  return (
    <LoginModalContext.Provider value={{ 
      isOpen, 
      openModal, 
      closeModal, 
      setOnLogin,
      getOnLogin
    }}>
      {children}
    </LoginModalContext.Provider>
  );
};

