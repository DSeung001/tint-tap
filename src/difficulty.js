import { linearInterpolate } from './config.js';

function findScheduleEntry(schedule, level) {
  return schedule.find((entry) => level >= entry.range[0] && level <= entry.range[1]);
}

export function deltaFor(level, config) {
  const entry = findScheduleEntry(config.deltaSchedule, level);
  if (!entry) {
    const last = config.deltaSchedule[config.deltaSchedule.length - 1];
    return last ? last.end : 30;
  }

  const [startLevel, endLevel] = entry.range;
  if (startLevel === endLevel) {
    return entry.end;
  }
  const span = endLevel - startLevel;
  const t = (level - startLevel) / span;
  return Math.round(linearInterpolate(entry.start, entry.end, t));
}

export function oddCountFor(level, config) {
  const entry = findScheduleEntry(config.oddTileSchedule, level);
  if (!entry) {
    const last = config.oddTileSchedule[config.oddTileSchedule.length - 1];
    return last ? last.count : 1;
  }
  return entry.count;
}

export function gridFor(level, config) {
  const entry = findScheduleEntry(config.gridSchedule, level);
  if (!entry) {
    const last = config.gridSchedule[config.gridSchedule.length - 1];
    return last ? { cols: last.cols, rows: last.rows } : { cols: 3, rows: 3 };
  }
  return { cols: entry.cols, rows: entry.rows };
}
