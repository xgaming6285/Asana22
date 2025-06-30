const signalService = {
  /**
   * Send a Signal message using CallMeBot API
   * @param {string} phoneNumber - Phone number with country code (e.g., +1234567890)
   * @param {string} message - Message to send
   * @param {string} apiKey - CallMeBot API key for the recipient
   * @returns {Promise<boolean>} - Success status
   */
  async sendMessage(phoneNumber, message, apiKey) {
    try {
      // Encode the message for URL
      const encodedMessage = encodeURIComponent(message);
      
      // CallMeBot Signal API endpoint
      const url = `https://signal.callmebot.com/signal/send.php?phone=${encodeURIComponent(phoneNumber)}&apikey=${apiKey}&text=${encodedMessage}`;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.ok) {
        console.log('Signal message sent successfully');
        return true;
      } else {
        console.error('Failed to send Signal message:', response.status, response.statusText);
        return false;
      }
    } catch (error) {
      console.error('Error sending Signal message:', error);
      return false;
    }
  },

  /**
   * Send a test message to verify Signal integration
   * @param {string} phoneNumber - Phone number with country code
   * @param {string} apiKey - CallMeBot API key
   * @returns {Promise<boolean>} - Success status
   */
  async sendTestMessage(phoneNumber, apiKey) {
    const testMessage = `🚀 Test message from Project Management App!\n\nThis is a test to verify Signal integration is working correctly.\n\nTime: ${new Date().toLocaleString()}`;
    return await this.sendMessage(phoneNumber, testMessage, apiKey);
  },

  /**
   * Send project invitation via Signal
   * @param {string} phoneNumber - Phone number with country code
   * @param {string} apiKey - CallMeBot API key
   * @param {Object} invitationData - Invitation details
   * @returns {Promise<boolean>} - Success status
   */
  async sendProjectInvitation(phoneNumber, apiKey, invitationData) {
    const { projectName, inviterName, inviteLink } = invitationData;
    
    const message = `📋 Project Invitation\n\nHi there!\n\n${inviterName} has invited you to collaborate on the project "${projectName}" using Project Management.\n\n🔗 Join Project: ${inviteLink}\n\nIf you weren't expecting this invitation, you can ignore this message.\n\nBest regards,\nThe Project Management Team`;
    
    return await this.sendMessage(phoneNumber, message, apiKey);
  }
};

export default signalService; 