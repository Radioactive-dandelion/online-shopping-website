const DEVICE_ID_KEY = "mimi_device_id";


// src/utils/deviceId.js
export function getDeviceId() {
  const KEY = "mimi_device_id";

  let existing = window.localStorage.getItem(KEY);
  if (existing) return existing;

  const newId = "device-" + Math.random().toString(36).slice(2);
  window.localStorage.setItem(KEY, newId);
  return newId;
}

