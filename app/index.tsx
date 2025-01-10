import React, { useEffect, useState } from 'react';
import { useRouter } from 'expo-router';
import {
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  Button,
  Alert,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from "expo-location";

export default function LoginScreen() {
  const router = useRouter();
  const [placeName, setPlaceName] = useState("Cargando...");
  const [currentTime, setCurrentTime] = useState('');

  const [location, setLocation] = useState({
    latitude: 0.001,
    longitude: 0.001,
    latitudeDelta: 0.001,
    longitudeDelta: 0.001,
  });

  useEffect(() => {
    let subscription;

    (async () => {
      const { status } = await Location.requestForegroundPermissionsAsync();

      if (status !== "granted") {
        Alert.alert("Permiso denegado", "Necesitas dar permiso para acceder a tu ubicación");
        return;
      }

      const locationTemp = await Location.getCurrentPositionAsync({});
      const coords = {
        latitude: locationTemp.coords.latitude,
        longitude: locationTemp.coords.longitude,
      };

      setLocation({
        ...coords,
        latitudeDelta: 0.001,
        longitudeDelta: 0.001,
      });

      // Get place name
      const [reverseGeocoded] = await Location.reverseGeocodeAsync(coords);
      setPlaceName(
        `${reverseGeocoded.street || "Ubicación desconocida"}, ${reverseGeocoded.city || ""}`
      );

      // Changes in location in real time
      subscription = await Location.watchPositionAsync(
        { accuracy: Location.Accuracy.High, timeInterval: 1000, distanceInterval: 1 },
        (updatedLocation) => {
          const updatedCoords = {
            latitude: updatedLocation.coords.latitude,
            longitude: updatedLocation.coords.longitude,
            latitudeDelta: 0.005,
            longitudeDelta: 0.005,
          };
          setLocation(updatedCoords);
        }
      );
    })();

    const interval = setInterval(() => {
      const now = new Date();
      const hours = String(now.getHours()).padStart(2, '0');
      const minutes = String(now.getMinutes()).padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
    }, 1000);

    return () => {
      if (subscription) subscription.remove();
    };
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* Location Info */}
      <View style={styles.locationCard}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationIcon}>📍</Text>
          <Text style={styles.locationName}>{placeName}</Text>
        </View>
        <Text style={styles.exactHour}>{currentTime}</Text>
      </View>

      {/* Map Placeholder */}
      <MapView
        region={location}
        showsUserLocation={true}
        style={styles.mapPlaceholder}
      >
        <Marker coordinate={location} />
      </MapView>

      {/* Welcome Card */}
      <View style={styles.welcomeCard}>
        <TouchableOpacity 
          style={styles.toggleButton} 
          onPress={() => 
            Alert.alert("Iniciar turno", "¿Estás seguro de que quieres iniciar tu turno?", [
              {
                text: "Cancelar",
                style: "cancel",
              },
              {
                text: "Iniciar turno",
                onPress: () => console.log(location),
                style: "default",
              },
            ])
            
          }
        >
          <Text style={styles.buttonText}>Iniciar turno</Text>
        </TouchableOpacity>
        <Text style={styles.welcomeText}>Bienvenido, [Nombre del usuario]</Text>
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
  },
  locationIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  locationName: {
    color: '#4b5563',
    fontSize: 14,
  },
  exactHour: {
    color: '#374151',
    fontSize: 16,
  },
  mapPlaceholder: {
    height: 250,
    backgroundColor: '#e5e7eb',
    marginHorizontal: 16,
    borderRadius: 8,
    marginTop: 16,
  },
  welcomeCard: {
    backgroundColor: 'white',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    marginHorizontal: 16,
    marginTop: 15,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    height: 300,
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
  },
});
