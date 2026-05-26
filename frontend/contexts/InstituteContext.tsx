"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { authService } from "@/services/authService";

interface InstituteContextValue {
  instituteName: string;
  loading: boolean;
}

const InstituteContext = createContext<InstituteContextValue>({
  instituteName: "",
  loading: true,
});

export function InstituteProvider({ children }: { children: ReactNode }) {
  const [instituteName, setInstituteName] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    authService
      .me()
      .then((user) => {
        if (active) setInstituteName(user.institute_name ?? "");
      })
      .catch(() => {
        if (active) setInstituteName("");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  return (
    <InstituteContext.Provider value={{ instituteName, loading }}>
      {children}
    </InstituteContext.Provider>
  );
}

export function useInstitute() {
  return useContext(InstituteContext);
}
