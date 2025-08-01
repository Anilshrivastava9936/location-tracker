// LocationTask.js

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';

const LOCATION_TASK_NAME = 'background-location-task';

TaskManager.defineTask(LOCATION_TASK_NAME, async ({ data, error }) => {
  console.log("data",data)
  if (error) {
    console.error("Location task error:", error);
    return;
  }

  if (data) {
    const { locations } = data;
    const location = locations[0];

    if (location) {
      const { latitude, longitude } = location.coords;
      const timestamp = new Date().toISOString();

      try {
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
        console.log("New location:", locations);

      } catch (e) {
        console.error('Location save failed:', e);
      }
    }
  }
});

export const registerBackgroundTask = async () => {
  const { status: fg } = await Location.requestForegroundPermissionsAsync();
  const { status: bg } = await Location.requestBackgroundPermissionsAsync();
console.log("fg",fg)
console.log("bg",bg)
  if (fg === 'granted' && bg === 'granted') {
    await Location.startLocationUpdatesAsync(LOCATION_TASK_NAME, {
      accuracy: Location.Accuracy.High,
      timeInterval: 2 * 60 * 60 * 1000,
      // timeInterval:  1 * 60 * 1000,
      distanceInterval: 0,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
    });
  } else {
    console.log("Permissions not granted.");
  }
};
