const shortcuts = {
  init: function() {
    window.addEventListener('keydown', this.handleKeydown.bind(this));
  },

  isInternetUnstable: false,

  handleKeydown: function(event) {
    if (this.isInternetUnstable) {
      console.warn('Shortcuts are disabled due to unstable internet connection.');
      return;
    }
    // Existing keydown handling logic here
  },

  handleConnectivityChange: function() {
    const connection = navigator.connection || navigator.mozConnection || navigator.webkitConnection;

    if (connection) {
      connection.addEventListener('change', () => {
        this.isInternetUnstable = connection.downlink < 0.5 || connection.rtt > 300;
        if (this.isInternetUnstable) {
          console.warn('Internet connection seems unstable. Keyboard shortcuts disabled.');
        } else {
          console.log('Internet connection is stable. Keyboard shortcuts enabled.');
        }
      });
    }
  }
};

shortcuts.init();
shortcuts.handleConnectivityChange();

export default shortcuts;