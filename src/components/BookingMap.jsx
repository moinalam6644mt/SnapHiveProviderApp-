import React, { useEffect, useState } from "react";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import MapView, { Marker } from "react-native-maps";
import Geocoder from "../services/Geocoder";

const BookingMap = ({ lat, lng, address,landmark  }) => {
  const [location, setLocation] = useState(null);

  const buildAddress = () => {
    
    
  if (landmark) {
    return `${landmark},India`;
  }

//   if (address) return `${address}, Kolkata, West Bengal, India`;

  return "India";
};
const searchAddress = buildAddress();

  useEffect(() => {
    resolveLocation();
  }, [lat, lng, address,landmark ]);

  const resolveLocation = async () => {

  if (lat && lng) {
    setLocation({
      latitude: parseFloat(lat),
      longitude: parseFloat(lng),
    });
    return;
  }

  try {

    const searchAddress = buildAddress();

    const res = await Geocoder.from(searchAddress);

    if (res.results.length > 0) {

      const loc = res.results[0].geometry.location;

      setLocation({
        latitude: loc.lat,
        longitude: loc.lng,
      });

    }

  } catch (error) {

    console.warn("Geocode error:", error);

    // fallback location
    setLocation({
      latitude: 22.5726,
      longitude: 88.3639,
    });

  }
};

  if (!location) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="small" color="#ED6E0A" />
      </View>
    );
  }

  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: location.latitude,
        longitude: location.longitude,
        latitudeDelta: 0.01,
        longitudeDelta: 0.01,
      }}
    >
      <Marker coordinate={location} />
    </MapView>
  );
};

export default BookingMap;

const styles = StyleSheet.create({
  map: {
    flex: 1,
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});