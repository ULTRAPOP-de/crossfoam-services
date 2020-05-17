import * as cfData from "@crossfoam/data";
import * as cfTwitter from "@crossfoam/service-twitter";

const services = {
  [cfTwitter.config.service_key]: cfTwitter,
};

const identifyService = (url: string): [string, string] => {
  let found = null;

  Object.keys(services).forEach((service) => {
    const match = url.match(services[service].config.regex);
    if (match !== null) {
      const excludeMatch = url.match(services[service].config.regex_exclude);
      if (excludeMatch === null) {
        found = [service, match[1]];
      }
    }
  });

  return found;
};

const getScrapes = (): Promise<any> => {
  return Promise.all(
    Object.keys(services).map(
      (service) => cfData.get(`s--${service}--u`, []),
    ),
  )
  .then((screenNamesList) => {
    return Promise.all(
      screenNamesList.map(
        (screenNames, i) => Promise.all(
          screenNames.map(
            (screenName) => cfData.get(`s--${Object.keys(services)[i]}--nw--${screenName}`, {}),
          ),
        ),
      ),
    )
    .then((networkDatas) => {

      const scrapes = [];

      networkDatas.forEach((networkData, serviceID) => {
        networkData.forEach((screenNameNetworkData, screenNameID) => {
          Object.keys(screenNameNetworkData).forEach((scrapeID) => {
            scrapes.push({
              callCount: screenNameNetworkData[scrapeID].callCount,
              completeCount: screenNameNetworkData[scrapeID].completeCount,
              completed: screenNameNetworkData[scrapeID].completed,
              date: screenNameNetworkData[scrapeID].date,
              nUuid: scrapeID,
              screenName: screenNamesList[serviceID][screenNameID],
              service: Object.keys(services)[serviceID],
            });
          });
        });
      });

      return scrapes;

    });
  });
};

export { services, identifyService, getScrapes };
