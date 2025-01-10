import { Stack } from "expo-router";
import { Alert, Button } from "react-native";
import { useRouter } from 'expo-router';
import { useEffect } from "react";

export default function RootLayout() {
  const router = useRouter();

  useEffect(() => {
    // Verificar si el usuario esta autenticado
    const isAuthenticated = false; // Cambiar esto por la lógica de autenticación

    if (!isAuthenticated) {
      router.replace('/login');
    }
  }, []);

  return (
    <Stack 
      screenOptions={({ route }) => ({
        headerShown: route.name === 'index',
        headerTitle: route.name === 'index' ? 'Shiftlog' : '',
        headerStyle: {
          backgroundColor: "#00BCD4",
        },
        headerTintColor: "#fff",
        headerTitleStyle: {
          fontWeight: "bold",
        },
        headerRight: () => (
          route.name === 'index' ? 

          <Button 
            title="Cerrar sesion" 
            onPress={() => 
              Alert.alert(
                "Cerrar sesión",
                "¿Estás seguro de que quieres cerrar sesión?",
                [
                  {
                    text: "Cancelar",
                    onPress: () => console.log("Cancel Pressed"),
                    style: "cancel",
                  },
                  {
                    text: "Cerrar sesión",
                    onPress: () => router.replace('/login'),
                    style: "destructive",
                  },
                ]
              )
            } 
            color="#fff"></Button> : null
        ),
      })}
    />
  );
}