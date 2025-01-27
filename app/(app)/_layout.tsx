import { Button, Text, View } from "react-native";
import { Redirect, Stack } from "expo-router";
import { Alert } from "react-native";
import { useSession } from "../../ctx";
import React, { useEffect, useState } from "react";
import { useShift } from "../context/ShiftContext";

export default function AppLayout() {
  const { session, isLoading } = useSession();
  const { signOut } = useSession();
  const { isShiftActive } = useShift();

  if (isLoading) {
    return <Text>Loading...</Text>;
  }

  if (!session) {
    return <Redirect href="/sign-in" />;
  }
  const handleSignOut = () => {
    if (isShiftActive) {
      Alert.alert(
        "Turno Activo",
        "No puedes cerrar sesión mientras tienes un turno activo.",
        [{ text: "OK" }]
      );
    } else {
      Alert.alert("Cerrar Sesión", "¿Estás seguro de que quieres cerrar sesión?", [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Cerrar Sesión",
          style: "destructive",
          onPress: () => {
            signOut();
          },
        },
      ]);
    }
  };

  return (
      <Stack
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: "#00BCD4",
          },
          headerRight: () => (
            <Button
              onPress={handleSignOut}
              title="Cerrar Sesión"
              color = {isShiftActive ? "#d1d5db" : "white"}

            />
          ),
          headerTintColor: "#fff",
          headerTitleStyle: {
            fontWeight: "bold",
          },
        }}
      >
        {/* Optionally configure static options outside the route.*/}
        <Stack.Screen
          name="index"
          options={{
            title: "Registro",
          }}
        />
      </Stack>
  );
}
