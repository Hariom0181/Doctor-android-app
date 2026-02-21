export const sendTestNotification = async (authToken, userType) => {
    try {
      const endpoint = userType === 'patient'
        ? 'http://192.168.137.1:5000/api/patients/send-test-notification'
        : 'http://192.168.137.1:5000/api/doctors/save-push-token'; // Change to same endpoint
  
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${authToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: 'Test Notification',
          body: 'This is a test push notification'
        }),
      });
  
      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error sending test notification:', error);
      throw error;
    }
  };