// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, Button, Alert } from 'react-native';
import * as Location from 'expo-location';
import { registerBackgroundTask } from './LocationTask';

export default function App() {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    registerBackgroundTask();
    fetchHistory();
    const interval = setInterval(() => {
      fetchHistory();
    }, 60 * 1000); // every 60 seconds

    return () => clearInterval(interval);

  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch('http://192.168.91.57:5000/api/location/history');
      const data = await res.json();
      setHistory(data);
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };

  const addCurrentLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    console.log("status", status)
    if (status !== 'granted') {
      Alert.alert("Permission Denied", "Location permission is required.");
      return;
    }

    try {
      const location = await Location.getCurrentPositionAsync({});
      // console.log("location",location)
      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString();
      console.log("latitude", latitude)
      console.log("longitute", longitude)

      const res = await Location.reverseGeocodeAsync({ latitude, longitude });
      // const address = res[0]?.name + ', ' + res[0]?.city + ', ' + res[0]?.region;
      const details = res[0];
      const address = `${details.street || details.name || ''}, ${details.district || ''}, ${details.city || ''}, ${details.region || ''}, ${details.postalCode || ''}, ${details.country || ''}`;


      await fetch('http://192.168.91.57:5000/api/location', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          latitude,
          longitude,
          address,
          timestamp,
        }),
      });

      Alert.alert("Success", "Location logged manually!");
      fetchHistory(); // refresh the list
    } catch (err) {
      console.error("Manual location fetch failed:", err);
      Alert.alert("Error", "Failed to log location hii.");
    }
  };

  return (
    <View style={{ padding: 20, marginTop: 50 }}>
      <Text style={{ fontSize: 20, fontWeight: 'bold' }}>Location History - Anil</Text>





      <Button title="➕ Add Current Location" style={{ color: '#fff', fontWeight: 'bold' }} onPress={addCurrentLocation} />

      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={{ marginVertical: 5 }}>
            <Text>{item.address}</Text>
            <Text>{new Date(item.timestamp).toLocaleString()}</Text>
          </View>
        )}
      />
    </View>
  );
}
