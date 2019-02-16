import fetch from 'node-fetch';
import { get, sortBy, uniq, reduce } from 'lodash';

const API_URL =
  'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

const HSLFetch = (query: string) => {
  return fetch(API_URL, {
    method: 'POST',
    body: JSON.stringify({ query }),
    headers: { 'Content-Type': 'application/json' },
  })
    .then(res => res.json())
    .then(json => (json && json.data) || {})
    .catch(err => console.error(err));
};

export interface Stop {
  id: string;
  code: string;
  name: string;
  platform?: string;
}

export interface Station {
  id: string;
  name: string;
  stops: Stop[];
}

interface SearchResult {
  stops: Stop[];
  stations: Station[];
}

export interface Stops {
  [id: string]: Stop;
}

export interface TimetableRow {
  line: string;
  realtime: boolean;
  realtimeDeparture: number;
  scheduledDeparture: number;
  destination: string;
}

export interface StopData {
  stop: Stop;
  lines: string[];
  timetable: TimetableRow[];
}

const parseStop = (stop: any, stopId?: string) => {
  const id = get(stop, 'id', stopId || '');
  return {
    id,
    code: get(stop, 'code', id),
    name: get(stop, 'name', 'Pysäkki'),
    platform: get(stop, 'platform'),
  };
};

const parseStation = (station: any, stationId?: string) => {
  const id = get(station, 'id', stationId || '');
  return {
    id,
    name: get(station, 'name', 'Asema'),
    stops: get(station, 'stops', []).map((stop: any) => parseStop(stop)),
  };
};

export const fetchStopView = (
  stopId: string,
  rowLimit: number
): Promise<StopData | undefined> => {
  // Default: from one minute ago to one hour to the future
  const now = new Date();
  const start = Math.floor(now.getTime() / 1000) - 60;
  const timeRange = 3600;
  const query = `{
    stop(id: "${stopId}") {
      id:gtfsId
      name
      code
      platform:platformCode
      lines:patterns {
        details:route {
          number:shortName
        }
      }
      timetable:stoptimesWithoutPatterns(startTime: ${start}, timeRange: ${timeRange}, numberOfDepartures: ${rowLimit}) {
        scheduledDeparture
        realtime
        realtimeDeparture
        destination:headsign
        trip {
          line:pattern {
            details:route {
              number:shortName
            }
          }
        }
      }
    }
  }`;
  return HSLFetch(query).then(data => {
    const res = get(data, 'stop');
    if (!res) {
      return;
    }
    const stop: Stop = parseStop(res, stopId);
    const allLines = get(res, 'lines', []).map((lineres: any) =>
      get(lineres, 'details.number', '')
    );
    const lines: string[] = sortBy(uniq(allLines), [
      (line: string) => parseInt(line),
      (line: string) => line,
    ]);

    const timetable: TimetableRow[] = get(res, 'timetable', []).map(
      (timetableres: any): TimetableRow => ({
        realtime: get(timetableres, 'realtime', false),
        scheduledDeparture: get(timetableres, 'scheduledDeparture'),
        realtimeDeparture: get(timetableres, 'realtimeDeparture'),
        destination: get(timetableres, 'destination', ''),
        line: get(timetableres, 'trip.line.details.number', ''),
      })
    );

    return {
      stop,
      lines,
      timetable,
    };
  });
};

export const search = (name: string): Promise<SearchResult> => {
  const query = `{
    stops(name: "${name}") {
      id:gtfsId
      name
      code
      platform:platformCode
    }
    stations(name: "${name}") {
      id:gtfsId
      name
      stops {
        id:gtfsId
        name
        code
        platformCode
      }
    }
  }`;
  return HSLFetch(query).then(data => ({
    stops: get(data, 'stops', []).map((stop: any) => parseStop(stop)),
    stations: get(data, 'stations', []).map((station: any) =>
      parseStation(station)
    ),
  }));
};

export const fetchStops = (ids: string[]): Promise<Stops> => {
  const query = `{
    ${ids.map(
      (id, index) =>
        `stop${index}: stop(id: "${id}") {
        id:gtfsId
        name
        code
        platform:platformCode
      }`
    )}
  }`;
  return HSLFetch(query).then(data =>
    reduce(
      data,
      (obj: Stops, stop: any, key: string) => {
        const id = get(stop, 'id');
        if (id) {
          obj[id] = parseStop(stop, id);
        }
        return obj;
      },
      {}
    )
  );
};
