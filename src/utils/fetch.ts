import fetch from 'node-fetch';
import { get, sortBy, uniq, reduce, startsWith } from 'lodash';

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

export interface StopsStations {
  stops: {
    [id: string]: Stop;
  };
  stations: {
    [id: string]: Station;
  };
}

export interface TimetableRow {
  line: string;
  realtime: boolean;
  realtimeDeparture: number;
  scheduledDeparture: number;
  destination: string;
  stop?: Stop;
}

export interface StopData {
  stop: Stop;
  lines: string[];
  timetable: TimetableRow[];
}

export interface StationData {
  station: Station;
  lines: string[];
  timetable: TimetableRow[];
}

const parseStop = (stop: any, stopId?: string): Stop => {
  const id = get(stop, 'id', stopId || '');
  return {
    id,
    code: get(stop, 'code', id),
    name: get(stop, 'name', 'Pysäkki'),
    platform: get(stop, 'platform'),
  };
};

const parseStation = (station: any, stationId?: string): Station => {
  const id = get(station, 'id', stationId || '');
  return {
    id,
    name: get(station, 'name', 'Asema'),
    stops: get(station, 'stops', []).map((stop: any) => parseStop(stop)),
  };
};

export const fetchTimetableView = (
  id: string,
  rowLimit: number,
  isStation?: boolean
): Promise<StopData | StationData | undefined> => {
  // Default: from one minute ago to one hour to the future
  const now = new Date();
  const start = Math.floor(now.getTime() / 1000) - 60;
  const timeRange = 3600;
  const stopQuery = `
    stop(id: "${id}") {
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
  `;
  const stationQuery = `
    station(id: "${id}") {
      id:gtfsId
      name
      stops {
        id:gtfsId
        name
        code
        platform:platformCode
        lines:patterns {
          details:route {
            number:shortName
          }
        }
      }
      timetable:stoptimesWithoutPatterns(startTime: ${start}, timeRange: ${timeRange}, numberOfDepartures: ${rowLimit}) {
        stop {
          id:gtfsId
          name
          code
          platform:platformCode
        }
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
  `;

  const query = `{
    ${isStation !== true ? stopQuery : ''}
    ${isStation !== false ? stationQuery : ''}
  }`;
  return HSLFetch(query).then(data => {
    const stopData = get(data, 'stop');
    const stationData = get(data, 'station');
    if (stopData) {
      const stop = parseStop(stopData, id);
      const allLines = get(stopData, 'lines', []).map((lineres: any) =>
        get(lineres, 'details.number', '')
      );
      const lines: string[] = sortBy(uniq(allLines), [
        (line: string) => parseInt(line),
        (line: string) => line,
      ]);
      const timetable: TimetableRow[] = get(stopData, 'timetable', []).map(
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
    } else if (stationData) {
      const station = parseStation(stationData, id);
      const allLines = get(stationData, 'stops', []).flatMap((stop: any) =>
        get(stop, 'lines', []).map((lineres: any) =>
          get(lineres, 'details.number', '')
        )
      );
      const lines: string[] = sortBy(uniq(allLines), [
        (line: string) => parseInt(line),
        (line: string) => line,
      ]);
      const timetable: TimetableRow[] = get(stationData, 'timetable', []).map(
        (timetableres: any): TimetableRow => ({
          stop: parseStop(get(timetableres, 'stop')),
          realtime: get(timetableres, 'realtime', false),
          scheduledDeparture: get(timetableres, 'scheduledDeparture'),
          realtimeDeparture: get(timetableres, 'realtimeDeparture'),
          destination: get(timetableres, 'destination', ''),
          line: get(timetableres, 'trip.line.details.number', ''),
        })
      );
      return {
        station,
        lines,
        timetable,
      };
    }
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

export const fetchDetails = (ids: string[]): Promise<StopsStations> => {
  const query = `{
    ${ids.map(
      (id, index) =>
        `stop${index}: stop(id: "${id}") {
        id:gtfsId
        name
        code
        platform:platformCode
      }
      station${index}: station(id: "${id}") {
        id:gtfsId
        name
        platform:platformCode
        stops {
          id:gtfsId
        }
      }`
    )}
  }`;
  return HSLFetch(query).then(data =>
    reduce(
      data,
      (obj: StopsStations, item: any, key: string) => {
        const id = get(item, 'id');
        const isStation = startsWith(key, 'station');
        if (id) {
          if (isStation) {
            obj.stations[id] = parseStation(item);
          } else {
            obj.stops[id] = parseStop(item, id);
          }
        }
        return obj;
      },
      { stops: {}, stations: {} }
    )
  );
};
