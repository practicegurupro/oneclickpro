import auth from '@react-native-firebase/auth';

interface RequestOptions extends RequestInit {
  headers?: Record<string, string>;
}

const makeAuthenticatedRequest = async (url: string, options: RequestOptions = {}): Promise<any> => {
  try {
    // Refresh the idToken
    const idToken = await auth().currentUser?.getIdToken(true);
    console.log('Retrieved ID token:', idToken); // Add this line for debugging

    if (!idToken) {
      throw new Error('Failed to retrieve ID token');
    }

    // Add the token to the request headers
    const headers = {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${idToken}`,
      ...options.headers,
    };

    // Make the API request with the refreshed token
    const response = await fetch(url, {
      ...options,
      headers,
    });

    // Check if the response is okay and parse the JSON
    if (response.ok) {
      return await response.json();
    } else {
      throw new Error(`Request failed with status ${response.status}`);
    }
  } catch (error) {
    console.error('Error making authenticated request:', error);
    throw error;
  }
};

export default makeAuthenticatedRequest;
