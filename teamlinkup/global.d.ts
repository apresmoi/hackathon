// global.d.ts

declare global {
  namespace google {
    namespace maps {
      // Define a type for location data, often LatLng or LatLngLiteral
      interface LatLngLiteral {
        lat: number;
        lng: number;
      }

      interface GeocoderResult {
        geometry: {
          location: LatLngLiteral;
        };
        // Other properties like formatted_address, place_id etc., if needed.
      }

      // The status returned by the Geocoder.
      type GeocoderStatus =
        | 'OK'
        | 'ZERO_RESULTS'
        | 'OVER_QUERY_LIMIT'
        | 'REQUEST_DENIED'
        | 'INVALID_REQUEST'
        | 'UNKNOWN_ERROR';

      class Geocoder {
        constructor();
        geocode(
          request: { address: string },
          callback: (results: GeocoderResult[] | null, status: GeocoderStatus) => void
        ): void;
      }

      interface MapOptions {
        center: LatLngLiteral;
        zoom: number;
        // Other map options if used
      }

      class Map {
        constructor(mapDiv: HTMLElement, opts?: MapOptions);
        // Methods like setCenter, setZoom etc., if needed
      }

      interface MarkerOptions {
        map: Map; // A marker is typically associated with a map.
        position: LatLngLiteral;
        // Other marker options like title, icon, etc. if needed
      }

      class Marker {
        constructor(opts?: MarkerOptions);
        // Methods like setMap, setPosition etc., if needed
      }
    }
  }

  interface Window {
    // This makes window.google have the type of the global 'google' namespace declared above.
    google: typeof google;
  }
}

// This export ensures the file is treated as a module.
// It's important for global augmentations declared with `declare global`.
export {};
