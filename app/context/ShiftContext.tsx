import React, { createContext, useContext, useState, ReactNode } from "react";

interface ShiftContextProps {
  isShiftActive: boolean;
  toggleShift: () => void;
  setShiftState: (active: boolean) => void;
}

const ShiftContext = createContext<ShiftContextProps | undefined>(undefined);

export const ShiftProvider = ({ children }: { children: ReactNode }) => {
  const [isShiftActive, setIsShiftActive] = useState(false);

  const toggleShift = () => {
    setIsShiftActive((prev) => !prev);
  };

  const setShiftState = (active: boolean) => {
    setIsShiftActive(active);
  };

  return (
    <ShiftContext.Provider value={{ isShiftActive, toggleShift, setShiftState }}>
      {children}
    </ShiftContext.Provider>
  );
};

export const useShift = () => {
  const context = useContext(ShiftContext);
  if (!context) {
    throw new Error("useShift must be used within a ShiftProvider");
  }
  return context;

};

export default ShiftProvider;