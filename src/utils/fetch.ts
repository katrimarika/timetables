import axios from 'axios';
import get from 'lodash/get';
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

export type Stop = {
  id: string;
  code: string;
  name: string;
  platform?: string;
};

export type Station = {
  id: string;
  name: string;
  stops: Stop[];
};

export type BikeStation = {
  id: string;
  name: string;
};

type SearchResult = {
  stops: Stop[];
  stations: Station[];
};

export type StopsStations = {
  stops: {
    [id: string]: Stop;
  };
  stations: {
    [id: string]: Station;
  };
  bikeStations: {
    [id: string]: BikeStation;
  };
};

export type TimetableRow = {
  line: string;
  realtime: boolean;
  realtimeDeparture: number;
  scheduledDeparture: number;
  destination: string;
  stop?: Stop;
  arriving?: boolean;
};

export type StopData = {
  stop: Stop;
  lines: string[];
  timetable: TimetableRow[];
};

export type StationData = {
  station: Station;
  lines: string[];
  timetable: TimetableRow[];
};

export type BikeStationData = {
  bikeStation: BikeStation;
  bikesAvailable?: number;
  spacesAvailable?: number;
};

const getStringValue = (data: unknown, path: string): string | undefined => {
  const value: unknown = get(data, path);
  if (value && typeof value === 'string') {
    return value;
  }
  return undefined;
};

const getNumberValue = (data: unknown, path: string): number => {
  const value: unknown = get(data, path);
  if (typeof value === 'number') {
    return value;
  }
  return NaN;
};

const getBooleanValue = (data: unknown, path: string): boolean | undefined => {
  const value: unknown = get(data, path);
  if (typeof value === 'boolean') {
    return value;
  }
  return undefined;
};

const getArrayValue = (data: unknown, path: string): unknown[] => {
  const value: unknown = get(data, path);
  if (value && Array.isArray(value)) {
    return value;
  }
  return [];
};

const getRecordValue = (
  data: unknown,
  path: string
): Record<string, unknown> | undefined => {
  const value: unknown = get(data, path);
  if (
    value &&
    typeof value === 'object' &&
    !Object.keys(value).some((key) => typeof key !== 'string')
  ) {
    return value as Record<string, unknown>;
  }
  return undefined;
};

const parseStop = (stop: unknown, stopId?: string): Stop => {
  const id = getStringValue(stop, 'id') || stopId || '';
  return {
    id,
    code: getStringValue(stop, 'code') || id,
    name: getStringValue(stop, 'name') || 'Pysäkki',
    platform: getStringValue(stop, 'platform'),
  };
};

const parseStation = (station: unknown, stationId?: string): Station => {
  const id = getStringValue(station, 'id') || stationId || '';
  return {
    id,
    name: getStringValue(station, 'name') || 'Asema',
    stops: getArrayValue(station, 'stops').map((stop) => parseStop(stop)),
  };
};

const parseBikeStation = (
  bikeStation: unknown,
  bikeStationId?: string
): BikeStation => {
  const id = getStringValue(bikeStation, 'stationId') || bikeStationId || '';
  return {
    id,
    name: getStringValue(bikeStation, 'name') || 'Pyöräasema',
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
    const stopData = getRecordValue(data, 'stop');
    const stationData = getRecordValue(data, 'station');
    if (stopData) {
      const stop = parseStop(stopData, id);
      const allLines = getArrayValue(stopData, 'lines').map(
        (lineres) => getStringValue(lineres, 'details.number') || ''
      );
      const lines: string[] = sortBy(uniq(allLines), [
        (line: string) => parseInt(line),
        (line: string) => line,
      ]);
      const timetable: TimetableRow[] = getArrayValue(
        stopData,
        'timetable'
      ).map(
        (timetableres): TimetableRow => ({
          realtime: getBooleanValue(timetableres, 'realtime') || false,
          scheduledDeparture: getNumberValue(
            timetableres,
            'scheduledDeparture'
          ),
          realtimeDeparture: getNumberValue(timetableres, 'realtimeDeparture'),
          destination:
            getStringValue(timetableres, 'destination') ||
            getStringValue(timetableres, 'trip.line.destination') ||
            '',
          line: getStringValue(timetableres, 'trip.line.details.number') || '',
        })
      );
      return {
        stop,
        lines,
        timetable,
      };
    } else if (stationData) {
      const station = parseStation(stationData, id);
      const allLines = getArrayValue(stationData, 'stops').flatMap((stop) =>
        getArrayValue(stop, 'lines').map(
          (lineres) => getStringValue(lineres, 'details.number') || ''
        )
      );
      const lines: string[] = sortBy(uniq(allLines), [
        (line: string) => parseInt(line),
        (line: string) => line,
      ]);
      const timetable: TimetableRow[] = getArrayValue(
        stationData,
        'timetable'
      ).map((timetableres): TimetableRow => {
        const stop = parseStop(getRecordValue(timetableres, 'stop'));
        const destination =
          getStringValue(timetableres, 'destination') ||
          getStringValue(timetableres, 'trip.line.destination') ||
          '';
        return {
          stop,
          realtime: getBooleanValue(timetableres, 'realtime') || false,
          scheduledDeparture: getNumberValue(
            timetableres,
            'scheduledDeparture'
          ),
          realtimeDeparture: getNumberValue(timetableres, 'realtimeDeparture'),
          destination,
          line: getStringValue(timetableres, 'trip.line.details.number') || '',
          arriving: destination === stop?.name,
        };
      });
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
    stops: getArrayValue(data, 'stops').map((stop) => parseStop(stop)),
    stations: getArrayValue(data, 'stations').map((station) =>
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
    getArrayValue(data, 'bikeRentalStations').map((bike) =>
      parseBikeStation(bike)
    )
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
    const details = getRecordValue(data, 'bikeRentalStation');
    const bikeStation = parseBikeStation(details);

    return {
      bikeStation,
      bikesAvailable: getNumberValue(details, 'bikesAvailable'),
      spacesAvailable: getNumberValue(details, 'spacesAvailable'),
    };
  });
};

export const fetchDetails = (ids: string[]): Promise<StopsStations> => {
  if (!ids.length) {
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
      (obj: StopsStations, item: unknown, key: string) => {
        const id = getStringValue(item, 'id');
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
