/**
 * Utility functions for handling media devices
 */

/**
 * Get a user-friendly label for a camera device
 * @param device - MediaDeviceInfo object
 * @param index - Index of the device in the list
 * @returns User-friendly label
 */
export function getFriendlyCameraLabel(device: MediaDeviceInfo, index: number): string {
  const label = device.label?.toLowerCase() || '';
  
  // Check for common patterns in device labels
  if (label.includes('front') || label.includes('user')) {
    return 'Front Camera';
  }
  if (label.includes('back') || label.includes('rear') || label.includes('environment')) {
    return 'Rear Camera';
  }
  if (label.includes('external') || label.includes('usb')) {
    return `External Camera ${index + 1}`;
  }
  if (label.includes('webcam')) {
    return `Webcam ${index + 1}`;
  }
  
  // If device has a label, use it
  if (device.label && device.label.trim() !== '') {
    return device.label;
  }
  
  // Default fallback based on index
  if (index === 0) {
    return 'Default Camera';
  }
  
  return `Camera ${index + 1}`;
}

/**
 * Get a user-friendly label for a microphone device
 * @param device - MediaDeviceInfo object
 * @param index - Index of the device in the list
 * @returns User-friendly label
 */
export function getFriendlyMicrophoneLabel(device: MediaDeviceInfo, index: number): string {
  const label = device.label?.toLowerCase() || '';
  
  // Check for common patterns in device labels
  if (label.includes('built-in') || label.includes('internal')) {
    return 'Built-in Microphone';
  }
  if (label.includes('external') || label.includes('usb')) {
    return `External Microphone ${index + 1}`;
  }
  if (label.includes('bluetooth') || label.includes('wireless')) {
    return `Bluetooth Microphone ${index + 1}`;
  }
  if (label.includes('headset') || label.includes('headphone')) {
    return `Headset Microphone ${index + 1}`;
  }
  if (label.includes('array')) {
    return 'Microphone Array';
  }
  
  // If device has a label, use it
  if (device.label && device.label.trim() !== '') {
    return device.label;
  }
  
  // Default fallback
  if (index === 0) {
    return 'Default Microphone';
  }
  
  return `Microphone ${index + 1}`;
}

/**
 * Get a user-friendly label for a speaker device
 * @param device - MediaDeviceInfo object
 * @param index - Index of the device in the list
 * @returns User-friendly label
 */
export function getFriendlySpeakerLabel(device: MediaDeviceInfo, index: number): string {
  const label = device.label?.toLowerCase() || '';
  
  // Check for common patterns in device labels
  if (label.includes('built-in') || label.includes('internal')) {
    return 'Built-in Speaker';
  }
  if (label.includes('external') || label.includes('usb')) {
    return `External Speaker ${index + 1}`;
  }
  if (label.includes('bluetooth') || label.includes('wireless')) {
    return `Bluetooth Speaker ${index + 1}`;
  }
  if (label.includes('headset') || label.includes('headphone')) {
    return `Headset Speaker ${index + 1}`;
  }
  
  // If device has a label, use it
  if (device.label && device.label.trim() !== '') {
    return device.label;
  }
  
  // Default fallback
  if (index === 0) {
    return 'Default Speaker';
  }
  
  return `Speaker ${index + 1}`;
}

/**
 * Check if the current device is likely a mobile device
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false;
  
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if the current device is likely a desktop
 */
export function isDesktopDevice(): boolean {
  return !isMobileDevice();
}

/**
 * Check if screen sharing is supported on this device
 */
export function isScreenShareSupported(): boolean {
  if (typeof navigator === 'undefined') return false;
  
  // Screen sharing is only available on desktop browsers
  return isDesktopDevice() && 'mediaDevices' in navigator && 'getDisplayMedia' in navigator.mediaDevices;
}
