import React from 'react';
import { router } from 'expo-router';
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
import { useFormik } from 'formik';
import * as Yup from 'yup';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useState } from 'react';
import { useSession } from '../ctx';

const LoginScreen = () => {
  
   const { signIn } = useSession();

  // Configuración de useFormik
  const formik = useFormik({
    initialValues: {
      payroll_number: '',
      password: '',
    },
    validationSchema: Yup.object({
      payroll_number: Yup.string()
        .required('El número de nómina es obligatorio.')
        .matches(/^\d{4,4}$/, 'El número de nómina debe de ser de 4 digitos.'),
      password: Yup.string()
        .required('La contraseña es obligatoria.')
        .min(6, 'La contraseña debe tener al menos 6 caracteres.'),
    }),
    onSubmit: async (values) => {
        try {
          await signIn( values);
          // Navigate after signing in. Ensure sign-in is successful before navigating.
          router.replace('/');
        } catch (error) {
          console.error('Failed to sign in:', error)
          Alert.alert('Error', 'Hubo un problema al iniciar sesión. Por favor, verifica tus datos.');
          // Handle sign-in error (e.g., show an error message to the user)
        }
    },
  });

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
              source={require('../assets/images/loginLogo.png')}
              style={styles.logo}
            />
            <Text style={styles.title}>Iniciar Sesión</Text>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="No. Nómina"
                style={styles.input}
                onChangeText={formik.handleChange('payroll_number')}
                onBlur={formik.handleBlur('payroll_number')}
                value={formik.values.payroll_number}
                autoCapitalize="none"
                keyboardType="numeric"
              />
              {formik.touched.payroll_number && formik.errors.payroll_number && (
                <Text style={styles.errorText}>{formik.errors.payroll_number}</Text>
              )}
            </View>
            <View style={styles.inputContainer}>
              <TextInput
                placeholder="Contraseña"
                secureTextEntry
                style={styles.input}
                onChangeText={formik.handleChange('password')}
                onBlur={formik.handleBlur('password')}
                value={formik.values.password}
                autoCapitalize="none"
              />
              {formik.touched.password && formik.errors.password && (
                <Text style={styles.errorText}>{formik.errors.password}</Text>
              )}
            </View>
            <TouchableOpacity style={styles.button} onPress={formik.handleSubmit}>
              <Text style={styles.buttonText}>Iniciar sesión</Text>
            </TouchableOpacity>
            <TouchableOpacity>
              <Text
                style={styles.forgotPassword}
                onPress={() =>
                  Alert.alert(
                    'Para recuperación de contraseña, favor de comunicarse con Recursos Humanos'
                  )
                }
              >
                ¿Olvidaste tu contraseña?
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </ImageBackground>
  );
};

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
    width: 300,
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
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
  errorText: {
    color: 'red',
    fontSize: 12,
    marginTop: 5,
  },
});

export default LoginScreen;
