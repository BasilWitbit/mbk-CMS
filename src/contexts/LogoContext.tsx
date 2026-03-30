import { createContext, useContext, useState, type ReactNode } from "react";

interface LogoContextType {
  logoUrl: string;
  setLogoUrl: (url: string) => void;
}

const LogoContext = createContext<LogoContextType>({ logoUrl: "", setLogoUrl: () => {} });

export function LogoProvider({ children }: { children: ReactNode }) {
  const [logoUrl, setLogoUrl] = useState("");
  return (
    <LogoContext.Provider value={{ logoUrl, setLogoUrl }}>
      {children}
    </LogoContext.Provider>
  );
}

export function useLogo() {
  return useContext(LogoContext);
}
