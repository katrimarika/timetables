import axios from 'axios';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import uniq from 'lodash/uniq';

const API_URL =
  'https://api.digitransit.fi/routing/v1/routers/hsl/index/graphql';

const HSLFetch = (query: string) => {
  return axios
    .request({
      url: API_URL,
      method: 'POST',
      data: { query },
      headers: { 'Content-Type': 'application/json' },
    })
    .then((res) => res.data.data || {})
    .catch((err) => console.error(err));
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

export interface BikeStation {
  id: string;
  name: string;
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
  bikeStations: {
    [id: string]: BikeStation;
  };
}

export interface TimetableRow {
  line: string;
  realtime: boolean;
  realtimeDeparture: number;
  scheduledDeparture: number;
  destination: string;
  stop?: Stop;
  arriving?: boolean;
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

export interface BikeStationData {
  bikeStation: BikeStation;
  bikesAvailable?: number;
  spacesAvailable?: number;
}

const parseStop = (stop: any, stopId?: string): Stop => {
  const id = get(stop, 'id') || stopId || '';
  return {
    id,
    code: get(stop, 'code') || id,
    name: get(stop, 'name') || 'Pysäkki',
    platform: get(stop, 'platform'),
  };
};

const parseStation = (station: any, stationId?: string): Station => {
  const id = get(station, 'id') || stationId || '';
  return {
    id,
    name: get(station, 'name') || 'Asema',
    stops: map(get(station, 'stops'), (stop: any) => parseStop(stop)),
  };
};

const parseBikeStation = (
  bikeStation: unknown,
  bikeStationId?: string
): BikeStation => {
  const id = get(bikeStation, 'stationId') || bikeStationId || '';
  return {
    id,
    name: get(bikeStation, 'name') || 'Pyöräasema',
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
            destination:headsign
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
            destination:headsign
          }
        }
      }
    }
  `;

  const query = `{
    ${isStation !== true ? stopQuery : ''}
    ${isStation !== false ? stationQuery : ''}
  }`;
  return HSLFetch(query).then((data) => {
    const stopData = get(data, 'stop');
    const stationData = get(data, 'station');
    if (stopData) {
      const stop = parseStop(stopData, id);
      const allLines = (get(stopData, 'lines') || []).map(
        (lineres: any) => get(lineres, 'details.number') || ''
      );
      const lines: string[] = sortBy(uniq(allLines), [
        (line: string) => parseInt(line),
        (line: string) => line,
      ]);
      const timetable: TimetableRow[] = map(
        get(stopData, 'timetable'),
        (timetableres: any): TimetableRow => ({
          realtime: get(timetableres, 'realtime') || false,
          scheduledDeparture: get(timetableres, 'scheduledDeparture'),
          realtimeDeparture: get(timetableres, 'realtimeDeparture'),
          destination:
            get(timetableres, 'destination') ||
            get(timetableres, 'trip.line.destination') ||
            '',
          line: get(timetableres, 'trip.line.details.number') || '',
        })
      );
      return {
        stop,
        lines,
        timetable,
      };
    } else if (stationData) {
      const station = parseStation(stationData, id);
      const allLines = (get(stationData, 'stops') || []).flatMap((stop: any) =>
        map(
          get(stop, 'lines'),
          (lineres: any) => get(lineres, 'details.number') || ''
        )
      );
      const lines: string[] = sortBy(uniq(allLines), [
        (line: string) => parseInt(line),
        (line: string) => line,
      ]);
      const timetable: TimetableRow[] = map(
        get(stationData, 'timetable'),
        (timetableres: any): TimetableRow => {
          const stop = parseStop(get(timetableres, 'stop'));
          const destination =
            get(timetableres, 'destination') ||
            get(timetableres, 'trip.line.destination') ||
            '';
          return {
            stop,
            realtime: get(timetableres, 'realtime') || false,
            scheduledDeparture: get(timetableres, 'scheduledDeparture'),
            realtimeDeparture: get(timetableres, 'realtimeDeparture'),
            destination,
            line: get(timetableres, 'trip.line.details.number') || '',
            arriving: destination === stop?.name,
          };
        }
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
  return HSLFetch(query).then((data) => ({
    stops: map(get(data, 'stops'), (stop: any) => parseStop(stop)),
    stations: map(get(data, 'stations'), (station: any) =>
      parseStation(station)
    ),
  }));
};

export const fetchBikeStationList = (): Promise<BikeStation[]> => {
  const query = `{
    bikeRentalStations {
      name
      stationId
    }
  }`;
  return HSLFetch(query).then((data) =>
    map(get(data, 'bikeRentalStations'), parseBikeStation)
  );
};

export const fetchBikeStationData = (id: string): Promise<BikeStationData> => {
  const query = `{
    bikeRentalStation(id: "${id}") {
      name
      stationId
      bikesAvailable
      spacesAvailable
    }
  }`;
  return HSLFetch(query).then((data) => {
    const details = get(data, 'bikeRentalStation');
    const bikeStation = parseBikeStation(details);

    return {
      bikeStation,
      bikesAvailable: get(details, 'bikesAvailable'),
      spacesAvailable: get(details, 'spacesAvailable'),
    };
  });
};

export const fetchDetails = (ids: string[]): Promise<StopsStations> => {
  if (isEmpty(ids)) {
    return new Promise(() => ({ stops: {}, stations: {}, bikeStations: {} }));
  }
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
      }
      bikeRentalStation${index}: bikeRentalStation(id: "${id}") {
        name
        stationId
      }`
    )}
  }`;
  return HSLFetch(query).then((data) =>
    data.reduce(
      (obj: StopsStations, item: any, key: string) => {
        const id = get(item, 'id');
        const isBike = key.startsWith('bike');
        const isStation = key.startsWith('station');
        if (id) {
          if (isBike) {
            obj.bikeStations[id] = parseBikeStation(item, id);
          } else if (isStation) {
            obj.stations[id] = parseStation(item, id);
          } else {
            obj.stops[id] = parseStop(item, id);
          }
        }
        return obj;
      },
      { stops: {}, stations: {}, bikeStations: {} }
    )
  );
};
