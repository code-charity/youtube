/*--------------------------------------------------------------
>>> CORE:
----------------------------------------------------------------
1.0 Retrieving data from local storage
2.0 Activating themes for Popup
3.0 Creating first menu
--------------------------------------------------------------*/

// Retrieving data from local storage
chrome.storage.local.get(function(data) {
    storage = data;
    locale = {};

    loadLocale((storage.improvedtube_language || 'en'), function(self, response) {
        if (response === false) {
            loadLocale(('en'), function(self, response) {
                locale = JSON.parse(response);

                // Activating themes for Popup
                themes();

                // Creating first menu
                createList();

                if (document.querySelector('.beta-note div'))
                    document.querySelector('.beta-note div').getMessage('foundABug', true);
            });

            return false;
        }

        locale = JSON.parse(response);

        // Activating themes for Popup
        themes();

        // Creating first menu
        createList();

        if (document.querySelector('.beta-note div'))
            document.querySelector('.beta-note div').getMessage('foundABug', true);
    });
});