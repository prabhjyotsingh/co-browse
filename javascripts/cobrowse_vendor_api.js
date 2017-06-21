/**
 * @author dhruv.sharma
 */

var CobrowseVendor = {};

CobrowseVendor.Events = {
    COBROWSE_INITIALIZED        : "INITIALIZED",
    COBROWSE_STARTED            : "STARTED",
    COBROWSE_PARTICIPANT_JOINED : "JOINED",
    COBROWSE_PARTICIPANT_LEFT   : "LEFT",
    COBROWSE_ENDED              : "ENDED"
};

CobrowseVendor.API = function() {
    console.log("CobrowseVendor.API constructor");
};

CobrowseVendor.API.prototype.getCobrowseVendorId = function() {
    console.log("getCobrowseVendorId not implemented");
};

CobrowseVendor.API.prototype.addCobrowseTag = function() {
    console.log("addCobrowseTag not implemented");
};

CobrowseVendor.API.prototype.startSession = function(apiInitData) {
    console.log("startSession not implemented");
};

CobrowseVendor.API.prototype.endSession = function() {
    console.log("endSession not implemented");
};

CobrowseVendor.API.prototype.registerCallbackHandler = function(event, callback) {
    console.log("registerCallbackHandler not implemented");
};

CobrowseVendor.API.prototype.continueSession = function(data) {
    console.log("continueSession not implemented");
};

if(typeof window.fireflyAPI === 'undefined') {
    window.fireflyAPI = {};
}

if(typeof window.coBrowse247API === 'undefined') {
    window.coBrowse247API = {};
}

CobrowseVendor.FireFlyAPI = function() {
    CobrowseVendor.API.call(this);
    this.VENDOR_ID = 'FireFly';
    this.fireflyAPI = window.fireflyAPI;
    this.eventListeners = {};
};

CobrowseVendor.CoBrowse247API = function() {
    CobrowseVendor.API.call(this);
    this.VENDOR_ID = 'CoBrowse247API';
    this.coBrowse247API = window.coBrowse247API;
    this.eventListeners = {};
};

CobrowseVendor.FireFlyAPI.prototype = new CobrowseVendor.API();
CobrowseVendor.FireFlyAPI.prototype.constructor = CobrowseVendor.FireFlyAPI;

CobrowseVendor.FireFlyAPI.prototype.getCobrowseVendorId = function() {
    return this.VENDOR_ID;
};

CobrowseVendor.CoBrowse247API.prototype = new CobrowseVendor.API();
CobrowseVendor.CoBrowse247API.prototype.constructor = CobrowseVendor.CoBrowse247API;

CobrowseVendor.CoBrowse247API.prototype.getCobrowseVendorId = function() {
    return this.VENDOR_ID;
};

CobrowseVendor.FireFlyAPI.prototype.addCobrowseTag =
    function(apiToken, apiScriptSource, async, allowCookies, sessionTimeout, environment) {
        this.fireflyAPI.token = apiToken;
        if(allowCookies != null)
            this.fireflyAPI.noCookies = !allowCookies; else
            this.fireflyAPI.noCookies = true;

        if(sessionTimeout != null)
            this.fireflyAPI.timeout = sessionTimeout;
        if(environment && environment != "") {
            this.fireflyAPI.environment = environment;
        }
        this.fireflyAPI.partner = "247";
        this.fireflyAPI.cacheSettings = {
            enabled         : true,
            theme           : "black",
            whitelabel      : true,
            message         : "Waiting for your support representative.",
            initiation_type : "api",
            force           : true
        };
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = apiScriptSource;
        if(async != null)
            script.async = async; else
            script.async = true;
        var headElement = document.getElementsByTagName("head")[0];
        headElement.appendChild(script);
    };

CobrowseVendor.CoBrowse247API.prototype.addCobrowseTag =
    function(apiToken, apiScriptSource, async, allowCookies, sessionTimeout, environment) {
        this.coBrowse247API.token = apiToken;
        var script = document.createElement("script");
        script.type = "text/javascript";
        script.src = apiScriptSource;
        var headElement = document.getElementsByTagName("head")[0];
        headElement.appendChild(script);
    };

function startSessionAsync(apiObject, apiInitData, currentCount) {
    if(apiObject.fireflyAPI.startAPI != null) {
        console.log("found firefly started...");

        apiKey = apiInitData.apiKey;
        cobrowseMode = apiInitData.cobrowseMode;
        fieldMaskingConfig = apiInitData.fieldMaskingConfig;
        try {
            var cobrowseInitializedCallback = apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_INITIALIZED];
            var sessionStartedCallback = apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_STARTED];
            var sessionUpdatedCallback = apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_SESSION_UPDATED];
            var sessionEndedCallback = apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_ENDED];
            var participantJoinedCallback = apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_PARTICIPANT_JOINED];

            apiObject.fireflyAPI.on("cobrowsingRequested", sessionStartedCallback);
            apiObject.fireflyAPI.on("sessionDataUpdated", sessionUpdatedCallback);
            apiObject.fireflyAPI.on('cobrowsingEnded', sessionEndedCallback);
            apiObject.fireflyAPI.on('cobrowsingStarted', participantJoinedCallback);

            if(fieldMaskingConfig)
                apiObject.fireflyAPI.set('masking', JSON.parse(fieldMaskingConfig));

            // {secureUrl: false}
            if(apiInitData.secureUrl != null)
                apiObject.fireflyAPI.set('secureUrl', apiInitData.secureUrl);

            apiObject.fireflyAPI.startAPI(apiKey, cobrowseInitializedCallback);
        } catch(e) {
            console.error(e);
        }
    } else if(currentCount == 0) {
        // console.log("counter expired...");
        // console.log("currentCount = " + currentCount);
        return;
    } else {
        // console.log("startAPI not found. Setting timeout again...");
        setTimeout(function() {
            startSessionAsync(apiObject, apiInitData, --currentCount);
        }, 1000);
    }
}

CobrowseVendor.FireFlyAPI.prototype.startSession = function(apiInitData) {
    apiObj = this;
    startSessionAsync(apiObj, apiInitData, 10);
};

CobrowseVendor.CoBrowse247API.prototype.startSession = function(apiInitData) {
    apiObject = this;
    if(apiInitData.cobrowseMode == 'CO_BROWSE') {
        CreateSession('cobrowse', apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_INITIALIZED],
            apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_STARTED], Cobrowse.Session.cobrowseId);
    } else {
        CreateSession('coview', apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_INITIALIZED],
            apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_STARTED], Cobrowse.Session.cobrowseId);
    }
};

CobrowseVendor.FireFlyAPI.prototype.endSession = function() {
    if(typeof this.fireflyAPI.endSession === 'function') {
        this.fireflyAPI.endSession();
    }
};

CobrowseVendor.CoBrowse247API.prototype.endSession = function() {
    disconnect();
    apiObject.eventListeners[CobrowseVendor.Events.COBROWSE_ENDED]();
};

CobrowseVendor.FireFlyAPI.prototype.registerCallbackHandler = function(event, callback) {
    this.eventListeners[event] = callback;
};

CobrowseVendor.CoBrowse247API.prototype.registerCallbackHandler = function(event, callback) {
    this.eventListeners[event] = callback;
};

function continueSessionAsync(fireflyAPIObj, data, currentCount) {
    if(fireflyAPIObj.continueSession != null) {
        // console.log("found continueSession..");
        fireflyAPIObj.continueSession(data);
    } else if(currentCount == 0) {
        // console.log("currentCount = " + currentCount);
        return;
    } else {
        // console.log("NOT found continueSession.. : count : " + currentCount);
        setTimeout(function() {
            continueSessionAsync(fireflyAPIObj, data, --currentCount);
        }, 1000);
    }
}

CobrowseVendor.FireFlyAPI.prototype.continueSession = function(data) {
    fireflyAPIObj = this.fireflyAPI;
    continueSessionAsync(fireflyAPIObj, data, 10); // tries 10 times for 1
    // second each
};

CobrowseVendor.CoBrowse247API.prototype.continueSession = function(data) {
    // fireflyAPIObj = this.fireflyAPI;
    // continueSessionAsync(fireflyAPIObj, data, 10); // tries 10 times for 1
    // second each
    // alert("aaaa"+JSON.stringify(data));
    // ContinueSession(data);
};

// simulation
CobrowseVendor.FireFlyAPI.prototype.participantLeft = function() {
    var callback = this.eventListeners[CobrowseVendor.Events.COBROWSE_PARTICIPANT_LEFT];
    callback();
};

CobrowseVendor.CoBrowse247API.prototype.participantLeft = function() {
    var callback = this.eventListeners[CobrowseVendor.Events.COBROWSE_PARTICIPANT_LEFT];
    callback();
};
