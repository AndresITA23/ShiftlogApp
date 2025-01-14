import React, { useEffect, useState, useMemo, useCallback } from 'react';
import { useRouter } from 'expo-router';
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

// Types for better type safety
interface LocationState {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
}

// Custom hook for location handling
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

      // Reverse geocoding
      const [reverseGeocoded] = await Location.reverseGeocodeAsync({
        latitude: coords.latitude,
        longitude: coords.longitude,
      });

      setPlaceName(
        `${reverseGeocoded.street || "Ubicación desconocida"}, ${reverseGeocoded.city || ""}`
      );

      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error getting location");
      setLoading(false);
      return false;
    }
  };

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const initializeLocation = async () => {
      const hasPermissions = await checkLocationPermissions();
      if (!hasPermissions) return;

      // Watch position
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
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return { location, placeName, error, loading };
};

export default function LoginScreen() {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState('');
  const { location, placeName, error, loading } = useLocation();

  // Memoize the time update function
  const updateTime = useCallback(() => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    setCurrentTime(`${hours}:${minutes}`);
  }, []);

  useEffect(() => {
    updateTime(); // Initial time set
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, [updateTime]);

  // Memoize the alert handler
  const handleStartShift = useCallback(() => {
    Alert.alert(
      "Iniciar turno",
      "¿Estás seguro de que quieres iniciar tu turno?",
      [
        {
          text: "Cancelar",
          style: "cancel",
        },
        {
          text: "Iniciar turno",
          onPress: () => console.log(location),
          style: "default",
        },
      ]
    );
  }, [location]);

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
      <View style={styles.locationCard}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationName} numberOfLines={1} ellipsizeMode="tail">{placeName}</Text>
        </View>
        <Text style={styles.exactHour}>{currentTime}</Text>
      </View>

      <View style={styles.content}>
        <MapView
          region={location || undefined}
          showsUserLocation={true}
          style={styles.mapPlaceholder}
        >
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
                onPress={handleStartShift}
                accessibilityLabel="Iniciar turno"
                accessibilityHint="Presiona para comenzar tu turno"
              >
                <Text style={styles.buttonText}>Iniciar turno</Text>
              </TouchableOpacity>
            )
          )}

          <Text style={styles.welcomeText}>
            Bienvenido, [Nombre del usuario]
          </Text>
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
    marginHorizontal: 16,
    marginTop: 16,
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
    width: 150,
    height: 150,
    borderRadius: 80,
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
    fontSize: 18,
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
});