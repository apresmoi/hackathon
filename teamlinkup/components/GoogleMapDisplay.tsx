
import React, { useEffect, useRef } from 'react';

interface GoogleMapDisplayProps {
  address: string;
}

const GoogleMapDisplay: React.FC<GoogleMapDisplayProps> = ({ address }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [mapReady, setMapReady] = React.useState(false);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (window.google && window.google.maps) {
      setMapReady(true);
    } else {
      // Poll for API, in case it loads after component mount
      const intervalId = setInterval(() => {
        if (window.google && window.google.maps) {
          setMapReady(true);
          clearInterval(intervalId);
        }
      }, 500);
      return () => clearInterval(intervalId);
    }
  }, []);

  useEffect(() => {
    if (mapReady && mapRef.current && address && window.google && window.google.maps) {
      const geocoder = new window.google.maps.Geocoder();
      geocoder.geocode({ address: address }, (results, status) => {
        if (status === 'OK' && results && results[0]) {
          const map = new window.google.maps.Map(mapRef.current!, {
            center: results[0].geometry.location,
            zoom: 15,
          });
          new window.google.maps.Marker({
            map: map,
            position: results[0].geometry.location,
          });
        } else {
          console.error('Geocode was not successful for the following reason: ' + status);
          if (mapRef.current) {
            mapRef.current.innerHTML = `<p class="text-red-500">Could not display map for "${address}". Geocoding failed: ${status}</p>`;
          }
        }
      });
    }
  }, [address, mapReady]);

  if (!mapReady && !(typeof window.google !== 'undefined' && window.google.maps)) { // Check again in case of race condition
    return (
      <div className="p-4 text-center text-gray-600 bg-gray-200 rounded">
        <p>Loading Google Maps API...</p>
        <p className="text-sm">If this message persists, ensure the Google Maps API key is correctly configured in index.html and the API is enabled in your Google Cloud Console.</p>
      </div>
    );
  }
  
  if (!address) {
    return <p className="text-gray-500">No address provided for map display.</p>;
  }

  return <div ref={mapRef} style={{ height: '300px', width: '100%' }} className="rounded shadow" />;
};

export default GoogleMapDisplay;
