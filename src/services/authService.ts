// src/services/authService.ts
const BASE_URL = 'https://e9ce92ee0f8f.ngrok-free.app/api/property-login';

interface OTPSendResponse {
  message: string;
}

interface OTPVerifyResponse {
  message: string;
}

export const authService = {
  // Send OTP
  sendOTP: async (): Promise<OTPSendResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/otp_send`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to send OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Error sending OTP:', error);
      throw error;
    }
  },

  // Verify OTP
  verifyOTP: async (email: string, otp: string): Promise<OTPVerifyResponse> => {
    try {
      const response = await fetch(`${BASE_URL}/otp_verify?email=${encodeURIComponent(email)}&otp=${encodeURIComponent(otp)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to verify OTP');
      }

      return await response.json();
    } catch (error) {
      console.error('Error verifying OTP:', error);
      throw error;
    }
  },
};