// Function to export settings
function exportSettings() {
  try {
    // Get the current settings as JSON string
    const settings = JSON.stringify(getUserSettings());
    // Create a Blob with the settings and set its type to 'application/json'
    const blob = new Blob([settings], { type: 'application/json' });
    // Create a URL for the Blob object
    const url = window.URL.createObjectURL(blob);
    // Create an anchor element to trigger the download
    const link = document.createElement('a');
    link.href = url;
    link.download = 'settings.json';
    document.body.appendChild(link);
    link.click();
    // Clean up by removing the anchor element and revoking the object URL
    window.URL.revokeObjectURL(url);
    document.body.removeChild(link);
  } catch (error) {
    console.error('Error exporting settings:', error);
  }
}

// Function to get user settings (example implementation)
export function getUserSettings() {
  // Replace with actual logic to fetch user settings from storage or API
  return { theme: 'dark', notifications: true };
}