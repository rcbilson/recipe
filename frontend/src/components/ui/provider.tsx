"use client"

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import {
  ColorModeProvider,
  type ColorModeProviderProps,
} from "./color-mode"
import { AuthContext } from './auth-context';
import { useState } from 'react';

export function Provider(props: ColorModeProviderProps) {
  const [token, setToken] = useState<string | null>(null);

  const resetAuth = () => {
    // Clear OAuth2-Proxy session by redirecting to sign_out
    window.location.href = '/oauth2/sign_out?rd=/';
  }

  return (
    <AuthContext.Provider value={{ token, setToken, resetAuth }}>
      <ChakraProvider value={defaultSystem}>
        <ColorModeProvider {...props} />
      </ChakraProvider>
    </AuthContext.Provider>
  )
}
