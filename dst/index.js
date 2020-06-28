"use strict";
var _a;
Object.defineProperty(exports, "__esModule", { value: true });
var cfData = require("@crossfoam/data");
var cfTwitter = require("@crossfoam/service-twitter");
var services = (_a = {},
    _a[cfTwitter.config.service_key] = cfTwitter,
    _a);
exports.services = services;
var identifyService = function (url) {
    var found = null;
    Object.keys(services).forEach(function (service) {
        var match = url.match(services[service].config.regex);
        if (match !== null) {
            var excludeMatch = url.match(services[service].config.regex_exclude);
            if (excludeMatch === null) {
                found = [service, match[1]];
            }
        }
    });
    return found;
};
exports.identifyService = identifyService;
var getScrapes = function () {
    return Promise.all(Object.keys(services).map(function (service) { return cfData.get("s--" + service + "--u", []); }))
        .then(function (screenNamesList) {
        return Promise.all(screenNamesList.map(function (screenNames, i) { return Promise.all(screenNames.map(function (screenName) { return cfData.get("s--" + Object.keys(services)[i] + "--nw--" + screenName, {}); })); }))
            .then(function (networkDatas) {
            var scrapes = [];
            networkDatas.forEach(function (networkData, serviceID) {
                networkData.forEach(function (screenNameNetworkData, screenNameID) {
                    Object.keys(screenNameNetworkData).forEach(function (scrapeID) {
                        scrapes.push({
                            callCount: screenNameNetworkData[scrapeID].callCount,
                            completeCount: screenNameNetworkData[scrapeID].completeCount,
                            completed: screenNameNetworkData[scrapeID].completed,
                            date: screenNameNetworkData[scrapeID].date,
                            nUuid: scrapeID,
                            nodeCount: screenNameNetworkData[scrapeID].nodeCount,
                            screenName: screenNamesList[serviceID][screenNameID],
                            service: Object.keys(services)[serviceID],
                            state: screenNameNetworkData[scrapeID].state,
                        });
                    });
                });
            });
            return scrapes;
        });
    });
};
exports.getScrapes = getScrapes;
//# sourceMappingURL=index.js.map