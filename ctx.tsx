import { useContext, createContext, type PropsWithChildren, useState, useEffect } from 'react';
import { useStorageState } from './useStorageState';
import { Alert } from 'react-native';

// Función para decodificar JWT
function decodeJWT(token: string) {
  try {
    const arrayToken = token.split('.');
    const payload = JSON.parse(atob(arrayToken[1]));
    return payload;
  } catch (error) {
    console.error('Error decoding JWT:', error);
    return null;
  }
}

const AuthContext = createContext<{
  signIn: (credentials: { payroll_number: string; password: string }) => Promise<void>;
  signOut: () => void;
  session?: string | null;
  user?: { id: string; first_name: string } | null; // Información del usuario extraída del JWT
  isLoading: boolean;
}>({
  signIn: async () => null,
  signOut: () => null,
  session: null,
  user: null,
  isLoading: false,
});

export function useSession() {
  const value = useContext(AuthContext);
  if (process.env.NODE_ENV !== 'production') {
    if (!value) {
      throw new Error('useSession must be wrapped in a <SessionProvider />');
    }
  }
  return value;
}

export function SessionProvider({ children }: PropsWithChildren) {
  const [[isLoading, session], setSession] = useStorageState('session');
  const [user, setUser] = useState<{ id: string; first_name: string } | null>(null);

  useEffect(() => {
    if (session) {
      const decodedToken = decodeJWT(session);
      if (decodedToken) {
        setUser({ id: decodedToken.id, first_name: decodedToken.first_name });
      }
    } else {
      setUser(null);
    }
  }, [session]);

  const signIn = async (credentials: { payroll_number: string; password: string }) => {
    try {
      const response = await fetch('http://192.168.137.1:3000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await response.json();

      if (response.ok) {
        const token = data.token;
        setSession(token);

        const decodedToken = decodeJWT(token);
        if (decodedToken) {
          setUser({ id: decodedToken.id, name: decodedToken.name });
        }
      } else {
        Alert.alert('Error', data.message || 'Error al iniciar sesión.');
      }
    } catch (error) {
      console.error('Error:', error);
      Alert.alert('Error', 'Hubo un problema con la conexión al servidor.');
    }
  };

  const signOut = () => {
    setSession(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signOut,
        session,
        user,
        isLoading,
      }}>
      {children}
    </AuthContext.Provider>
  );
}
