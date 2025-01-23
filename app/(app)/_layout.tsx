import { Button, Text, View } from 'react-native';
import { Redirect, Stack } from 'expo-router';
import { Alert } from 'react-native';
import { useSession } from '../../ctx';
import React, { useEffect, useState } from "react";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { signOut } = useSession();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }

  return (
    <Stack
    screenOptions={{
      headerStyle: {
        backgroundColor: '#00BCD4',
      },
      // headerRight: () => (
      //   <Button
      //     onPress={() => {
      //       Alert.alert(
      //         'Cerrar sesión',
      //         '¿Estás seguro de que quieres cerrar sesión?',
      //         [
      //           {
      //             text: 'Cancelar',
      //             style: 'cancel',
      //           },
      //           {
      //             text: 'Cerrar sesión',
      //             style: 'destructive',
      //             onPress: () => {
      //               signOut();
      //             },
      //           },
      //         ],
      //         { cancelable: false }
      //       );
      //     }}
      //     title="Cerrar sesión"
      //     color="#fff"
      //   />
      // ),
      headerTintColor: '#fff',
      headerTitleStyle: {
        fontWeight: 'bold',
      },
    }}>
    {/* Optionally configure static options outside the route.*/}
    <Stack.Screen name="index" options={{
      title: 'Registro',
    }} />
  </Stack>
  )
}
