import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Image,
  ImageBackground,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
export default function LoginScreen() {
  const router = useRouter();
  const [username, setUsername] = useState<string>('');
  const [password, setPassword] = useState<string>('');

  const handleLogin = (): void => {
    if (username && password) {
      router.replace('/');
    } else {
      Alert.alert('Error', 'Por favor, ingresa tus credenciales.');
    }
  };

  return (
    <ImageBackground
      source={require('../assets/images/bgLogin.jpg')}
      style={styles.background}
      blurRadius={8}
    >
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          <View style={styles.card}>
            <Image
              source={require('../assets/images/react-logo.png')} // Cambia a loginLogo.svg si usas un paquete compatible con SVG.
              style={styles.logo}
            />
            <Text style={styles.title}>Iniciar Sesión</Text>
            <Text style={styles.label}>Inicia sesión con tu número de nómina</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="No. Nómina"
                style={styles.input}
                value={username}
                onChangeText={setUsername}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
              />
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                style={styles.input}
                value={password}
                onChangeText={setPassword}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="default"
              />
            </View>
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>

            <TouchableOpacity>
              <Text 
                style={styles.forgotPassword}
                onPress={() => 
                  Alert.alert(
                    "Para recuperación de contraseña, favor de comunicarse con Recursos Humanos",
                  )
                }
                >
                ¿Olvidaste tu contraseña?</Text>
            </TouchableOpacity>
            
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  background: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    padding: 20,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 20,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  label: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
  inputContainer: {
    width: '100%',
    marginBottom: 15,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
    color: '#333',
    width: '100%',
    backgroundColor: '#f9f9f9',
  },
  button: {
    backgroundColor: '#007BFF',
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  forgotPassword: {
    marginTop: 15,
    fontSize: 14,
    color: '#007BFF',
    textAlign: 'center',
  },
});
