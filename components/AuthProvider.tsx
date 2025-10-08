// Arquivo: components/AuthProvider.tsx

"use client"; // Esta linha é crucial

import { SessionProvider } from "next-auth/react";

type Props = {
  children?: React.ReactNode;
};

// AQUI: Garanta que 'export const' está presente
export const AuthProvider = ({ children }: Props) => {
  return <SessionProvider>{children}</SessionProvider>;
};