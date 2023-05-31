const { RtcTokenBuilder, RtmTokenBuilder, RtcRole, RtmRole } = require('agora-access-token');

const createToken = (channel, uid, role) => {
  try {
    const appID = process.env.AGORA_APP_ID
    const appCertificate = process.env.AGORA_APP_SECRET
    const channelName = channel;
    let rtcRole;
    if(role == true) {
      rtcRole = RtcRole.PUBLISHER
    } else if (role == false ) {
      rtcRole = RtcRole.SUBSCRIBER
    }
  
    if(!rtcRole) {
      throw new Error('No role provided !')
    }
    // Build token with user account
    const rtcToken = RtcTokenBuilder.buildTokenWithAccount(
        appID,
        appCertificate,
        channelName,
        uid,
        RtcRole.PUBLISHER,
        (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60)
    );
    
    const rtmToken = RtmTokenBuilder.buildToken(
        appID,
        appCertificate,
        uid,
        RtmRole.Rtm_User,
        (Math.floor(Date.now() / 1000) + 30 * 24 * 60 * 60)
    );
    return { rtcToken, rtmToken, appID };
  }
  catch ( error ) {
    throw error;
  }
};

module.exports = {
  createToken
}