import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useSession } from '../../ctx';
import NetInfo from "@react-native-community/netinfo";


interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

const useLocation = () => {
  const [location, setLocation] = useState<LocationState | null>(null);
  const [placeName, setPlaceName] = useState("Cargando...");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const checkLocationPermissions = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        setError("Necesitas dar permiso para acceder a tu ubicación precisa");
        setLoading(false);
        return false;
      }

      const locationTemp = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      if (locationTemp.coords.accuracy > 100) {
        setError("Necesitas activar la ubicación precisa");
        setLoading(false);
        return false;
      }

      const coords: LocationState = {
        latitude: locationTemp.coords.latitude,
        longitude: locationTemp.coords.longitude,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      };

      setLocation(coords);

      // Verificar conectividad antes de intentar reverseGeocodeAsync
      // const netInfo = await NetInfo.fetch();
      // if (netInfo.isConnected) {
      //   try {
      //     const [reverseGeocoded] = await Location.reverseGeocodeAsync({
      //       latitude: coords.latitude,
      //       longitude: coords.longitude,
      //     });

      //     setPlaceName(
      //       `${reverseGeocoded.street || "Ubicación desconocida"}, ${reverseGeocoded.city || ""}`
      //     );
      //   } catch (err) {
      //     console.error("Error en reverseGeocodeAsync:", err);
      //     setPlaceName("Ubicación desconocida (sin conexión)");
      //   }
      // } else {
      //   setPlaceName("Ubicación desconocida (sin conexión)");
      // }

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error obteniendo ubicación");
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const initializeLocation = async () => {
      const hasPermissions = await checkLocationPermissions();
      if (!hasPermissions) return;

      // Monitorear cambios en la ubicación
      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 1000,
          distanceInterval: 1,
        },
        (updatedLocation) => {
          if (updatedLocation.coords.accuracy > 100) {
            setError("Necesitas activar la ubicación precisa");
            setLoading(false);
            return;
          }

          setLocation({
            latitude: updatedLocation.coords.latitude,
            longitude: updatedLocation.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          });
        }
      );

      setLoading(false);
    };

    initializeLocation();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(async () => {
      const hasPermissions = await checkLocationPermissions();
      if (hasPermissions) {
        setError(null);
        setLoading(false);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  return { location, placeName, error, loading };
};

export default function LoginScreen() {
  const { session, user, signOut } = useSession();
  const { location, placeName, error, loading } = useLocation();
  const [isShiftActive, setIsShiftActive] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // Monitorear el estado de la conexión
    const unsubscribe = NetInfo.addEventListener((state) => {
      setIsConnected(state.isConnected);
    });

    // Estado inicial de la conexión
    NetInfo.fetch().then((state) => setIsConnected(state.isConnected));

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const loadShiftState = async () => {
      const storedShift = await AsyncStorage.getItem("activeShift");
      setIsShiftActive(!!storedShift);
    };
    loadShiftState();
  }, []);

  const handleToggleShift = async () => {
    if (!location) {
      Alert.alert("Error", "No se pudo obtener la ubicación actual.");
      return;
    }

    try {
      const timestamp = new Date().toISOString();
      const currentLocation = `${location.latitude}, ${location.longitude}`;

      const shiftData = isShiftActive
        ? {
            end_time: timestamp,
            end_location: currentLocation,
            user_id: user?.id,
          }
        : {
            start_time: timestamp,
            start_location: currentLocation,
            user_id: user?.id,
          };

      if (isConnected) {
        // Enviar al backend
        await fetch("http://10.0.0.33:3000/api/shifts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shiftData),
        });
        console.log("Shift data sent to server:", shiftData);
      } else {
        // Guardar en AsyncStorage para sincronizar después
        const pendingShifts = JSON.parse(
          (await AsyncStorage.getItem("pendingShifts")) || "[]"
        );
        await AsyncStorage.setItem(
          "pendingShifts",
          JSON.stringify([...pendingShifts, shiftData])
        );
        console.log("Shift data saved for later sync:", pendingShifts);
      }

      if (isShiftActive) {
        await AsyncStorage.removeItem("activeShift");
      } else {
        await AsyncStorage.setItem("activeShift", JSON.stringify(shiftData));
      }

      setIsShiftActive(!isShiftActive);
    } catch (error) {
      Alert.alert("Error", "No se pudo actualizar el turno. Inténtalo nuevamente.");
    }
  };

  const syncOfflineData = async () => {
    if (!isConnected) return;

    setSyncing(true);
    try {
      const pendingShifts = JSON.parse(
        (await AsyncStorage.getItem("pendingShifts")) || "[]"
      );

      for (const shift of pendingShifts) {
        await fetch("http://10.0.0.33:3000/api/shifts", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(shift),
        });
      }

      await AsyncStorage.removeItem("pendingShifts");
      console.log("Datos offline sincronizados correctamente.");
    } catch (error) {
      console.log("Error sincronizando datos offline:", error);
    }
    setSyncing(false);
  };

  useEffect(() => {
    if (isConnected) {
      syncOfflineData();
    }
  }, [isConnected]);

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
 
      <View style={styles.content}>
        <MapView region={location || undefined} showsUserLocation={true} style={styles.mapPlaceholder}>
          {location && <Marker coordinate={location} />}
        </MapView>

        <View style={styles.welcomeCard}>
          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color="#0000ff" />
              <Text style={styles.loadingText}>Obteniendo ubicación...</Text>
            </View>
          ) : (
            location && (
              <TouchableOpacity
                style={styles.toggleButton}
                onPress={() => {
                  Alert.alert(
                    isShiftActive ? "Finalizar turno" : "Iniciar turno",
                    `¿Estás seguro de que deseas ${isShiftActive ? "finalizar" : "iniciar"} el turno?`,
                    [
                      {
                        text: "Cancelar",
                        style: "cancel",
                      },
                      {
                        text: "Sí",
                        onPress: () => {
                          handleToggleShift();
                        },
                      },
                    ]
                  );
                }
                 }
                disabled={loading || syncing}
              >
                <Text style={styles.buttonText}>
                  {isShiftActive ? "Finalizar turno" : "Iniciar turno"}
                </Text>
              </TouchableOpacity>
            )
          )}

          <Text style={styles.welcomeText}>
            Bienvenido, {user?.first_name || "Usuario"}!
          </Text>
          
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => {
              if (isShiftActive) {
                Alert.alert(
                  "No puedes cerrar sesión",
                  "Por favor termina el turno antes de cerrar sesión.",
                  [
                    {
                      text: "OK",
                      style: "default"
                    }
                  ]
                );
                return;
              }

              Alert.alert(
                "Cerrar sesión",
                "Estás seguro que quieres cerrar sesión?",
                [
                  {
                    text: "Cancelar",
                    style: "cancel"
                  },
                  {
                    text: "Si",
                    style: "destructive",
                    onPress: () => {signOut();},
                  }
                ]
              );
            }}
          >
            <Text style={[
              styles.logoutButtonText,
              isShiftActive && styles.logoutButtonTextDisabled
            ]}>
              Cerrar sesión
            </Text>
          </TouchableOpacity>

        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f3f4f6',
  },
  locationCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'white',
    marginHorizontal: 16,
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  locationInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationName: {
    color: '#4b5563',
    fontSize: 14,
    flexShrink: 1,
  },
  exactHour: {
    color: '#374151',
    fontSize: 16,
    marginLeft: 8,
  },
  content: {
    flex: 1,
    marginHorizontal: 10,
    marginTop: 0,
    justifyContent: 'space-between',
  },
  mapPlaceholder: {
    flex: 1,
    backgroundColor: '#e5e7eb',
    borderRadius: 8,
    marginBottom: 10,
  },
  welcomeCard: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  toggleButton: {
    backgroundColor: '#06b6d4',
    width: 180,
    height: 180,
    borderRadius: 100,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  welcomeText: {
    color: '#1f2937',
    fontSize: 28,
    fontWeight: '600',
    marginVertical: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 14,
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    opacity: 1,
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  logoutButtonTextDisabled: {
    opacity: 0.5,
  }
});