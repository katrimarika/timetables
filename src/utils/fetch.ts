import fetch from 'node-fetch';

const API_URL =
  'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

interface Query {
  query: string;
}

const HSLFetch = (query: Query) => {
  return fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify(query),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .catch(err => console.error(err));
};

export const fetchTimetable = (stopId: string, rowLimit: number) => {
  // Default: from one minute ago to one hour to the future
  const now = new Date();
  const start = Math.floor(now.getTime() / 1000) - 60;
  const date = now
    .toISOString()
    .slice(0, 10)
    .replace(/[-]/g, '');
  const timeRange = 3600;
  const query = {
    query:
      'query StopPage($id_0:String!,$startTime_1:Long!) ' +
      '{stop(id:$id_0) {id,...F2}} fragment F0 on Stoptime ' +
      '{scheduledDeparture,realtime,realtimeDeparture,stopHeadsign,trip ' +
      '{pattern {route {shortName}}}} fragment F1 on Stop ' +
      '{url,_stoptimesForServiceDateyplyP:stoptimesForServiceDate(date:"' +
      date +
      '") {pattern {headsign,code,route ' +
      '{id,shortName,longName,mode,agency {id,name}},id},stoptimes ' +
      '{scheduledDeparture,serviceDay,headsign,pickupType}},id} ' +
      'fragment F2 on Stop ' +
      '{_stoptimesWithoutPatterns3xYh4D:stoptimesWithoutPatterns' +
      '(startTime:$startTime_1,timeRange:' +
      timeRange +
      ',numberOfDepartures:' +
      rowLimit +
      ') {...F0},code,name,...F1}',
    variables: { id_0: stopId, startTime_1: start },
  };
  return HSLFetch(query);
};

export const fetchStops = (name: string) => {
  const query = {
    query: '{stops(name: "' + name + '") {name gtfsId code}}',
  };
  return HSLFetch(query);
};
