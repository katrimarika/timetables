import fetch from 'node-fetch';
import { get, sortBy, uniq } from 'lodash';

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
    const stop: Stop = {
      id: get(res, 'id', stopId),
      code: get(res, 'code', stopId),
      name: get(res, 'name', 'Pysäkki'),
    };
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

export const searchStops = (name: string): Promise<Stop[]> => {
  const query = `{
    stops(name: "${name}") {
      id:gtfsId
      name
      code
    }
  }`;
  return HSLFetch(query).then(data =>
    get(data, 'stops', []).map((stopres: any) => ({
      id: get(stopres, 'id', ''),
      code: get(stopres, 'code', get(stopres, 'id', '')),
      name: get(stopres, 'name', 'Pysäkki'),
    }))
  );
};
