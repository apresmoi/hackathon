
"use client";

import { useState, useEffect, useCallback } from 'react';

// Hook
function useLocalStorage<T>(key: string, initialDefaultValue: T): [T, (value: T | ((val: T) => T)) => void] {
  // Step 1: Initialize state by reading from localStorage or using initialDefaultValue.
  // This function runs only once on initial render.
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === "undefined") {
      return initialDefaultValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Parse stored json or if none return initialDefaultValue
      return item ? JSON.parse(item) as T : initialDefaultValue;
    } catch (error) {
      // If error also return initialDefaultValue
      console.warn(`Error reading localStorage key “${key}” on initial load:`, error);
      return initialDefaultValue;
    }
  });

  // Step 2: Persist initialDefaultValue to localStorage if it was used because localStorage was empty.
  // This effect runs after initial render and if key/initialDefaultValue changes.
  // Crucially, it does NOT call setStoredValue, avoiding loops.
  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    try {
      const item = window.localStorage.getItem(key);
      // Only write to localStorage if it's currently empty for this key,
      // ensuring that we persist the initialDefaultValue if it was the one chosen by useState.
      if (item === null) {
        window.localStorage.setItem(key, JSON.stringify(initialDefaultValue));
      }
    } catch (error) { // Added opening brace here
      // Catch errors from setItem, though less common.
      console.warn(`Error writing initial localStorage value for key “${key}”:`, error);
    }
  // This effect depends on initialDefaultValue. If it's an unstable reference (e.g., a new array [] on each render),
  // this effect might run more than once. However, since it only writes if item is null,
  // it won't continuously overwrite existing values or cause state update loops.
  }, [key, initialDefaultValue]);


  // Step 3: `setValue` function to update state and persist to localStorage.
  const setValue = useCallback(
    (value: T | ((val: T) => T)) => {
      if (typeof window === "undefined") {
        console.warn(
          `Tried setting localStorage key “${key}” even though environment is not a client`
        );
        // Update state even if not in client, persistence will just not happen.
        const valueToStoreForStateOnly = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStoreForStateOnly);
        return;
      }

      try {
        // Allow value to be a function so we have same API as useState
        const valueToStore =
          value instanceof Function ? value(storedValue) : value;
        // Save state
        setStoredValue(valueToStore);
        // Save to local storage
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      } catch (error) {
        console.warn(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, storedValue] // storedValue is needed for the functional update `value(storedValue)`
  );

  return [storedValue, setValue];
}

export default useLocalStorage;
