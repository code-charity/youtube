const isLiveStreamOrShortSpam = (userRequests) => {
  const liveStreamsCount = userRequests.filter(request => request === 'live stream').length;
  const shortsCount = userRequests.filter(request => request === 'shorts').length;
  return liveStreamsCount + shortsCount > 5;
};

const handleUserRequest = (userRequests) => {
  if (isLiveStreamOrShortSpam(userRequests)) {
    console.log('Deal-breaker detected: Live streams and shorts spam.');
    // Implement a way to block or warn the user
  }
};
