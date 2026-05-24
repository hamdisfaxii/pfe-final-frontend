import { normalizeCountryIsoForHr } from "./country";

export const parseTimeToMinutes = (time) => {
  if (!time || typeof time !== "string") return NaN;
  const parts = time.split(":");
  if (parts.length !== 2) return NaN;
  const hours = Number(parts[0]);
  const minutes = Number(parts[1]);
  if (!Number.isFinite(hours) || !Number.isFinite(minutes)) return NaN;
  return hours * 60 + minutes;
};

export const formatScheduleSessionLabel = ({ start, end }) => {
  if (!start || !end) return "";
  return `${start} - ${end}`;
};

export const getScheduleRowForDate = (rows, isoDate) => {
  if (!Array.isArray(rows) || !isoDate) return null;
  const date = new Date(isoDate);
  if (Number.isNaN(date.getTime())) return null;
  const dayOfWeek = date.getDay();
  return rows.find((row) => Number(row?.dayOfWeek) === dayOfWeek) || null;
};

export const getScheduleSessions = (row) => {
  if (!row || typeof row !== "object") return [];
  const sessions = [];
  if (row.firstStart && row.firstEnd) {
    sessions.push({ start: row.firstStart, end: row.firstEnd, label: "matin" });
  }
  if (row.secondStart && row.secondEnd) {
    sessions.push({
      start: row.secondStart,
      end: row.secondEnd,
      label: "après-midi",
    });
  }
  return sessions;
};

export const isTimeRangeWithinSession = (start, end, session) => {
  const startMin = parseTimeToMinutes(start);
  const endMin = parseTimeToMinutes(end);
  const sessionStart = parseTimeToMinutes(session?.start);
  const sessionEnd = parseTimeToMinutes(session?.end);
  if (!Number.isFinite(startMin) || !Number.isFinite(endMin)) return false;
  if (!Number.isFinite(sessionStart) || !Number.isFinite(sessionEnd))
    return false;
  return startMin >= sessionStart && endMin <= sessionEnd && startMin < endMin;
};

export const isTimeRangeWithinScheduleRow = (row, start, end) => {
  if (!row) return false;
  const sessions = getScheduleSessions(row);
  return sessions.some((session) =>
    isTimeRangeWithinSession(start, end, session),
  );
};

export const isTimeWithinAnyScheduleSession = (row, time) => {
  if (!row || !time) return false;
  const sessions = getScheduleSessions(row);
  const target = parseTimeToMinutes(time);
  if (!Number.isFinite(target)) return false;
  return sessions.some((session) => {
    const sessionStart = parseTimeToMinutes(session.start);
    const sessionEnd = parseTimeToMinutes(session.end);
    return (
      Number.isFinite(sessionStart) &&
      Number.isFinite(sessionEnd) &&
      target >= sessionStart &&
      target <= sessionEnd
    );
  });
};

export const isHalfDayAllowedOnRow = (row, halfDay) => {
  if (!row) return false;
  if (halfDay === "MORNING") {
    return Boolean(row.firstStart && row.firstEnd);
  }
  if (halfDay === "AFTERNOON") {
    return Boolean(row.secondStart && row.secondEnd);
  }
  return true;
};

export const scheduleRowHasAnySession = (row) => {
  if (!row) return false;
  return Boolean(
    (row.firstStart && row.firstEnd) || (row.secondStart && row.secondEnd),
  );
};

export const collectScheduleSessionLabels = (row) => {
  const sessions = getScheduleSessions(row);
  if (sessions.length === 0) return "Aucun horaire défini pour cette journée.";
  return sessions
    .map(
      ({ label, start, end }) =>
        `${label} (${formatScheduleSessionLabel({ start, end })})`,
    )
    .join(" et ");
};

export const normalizeScheduleCountry = (countryCode) =>
  normalizeCountryIsoForHr(countryCode) || "TN";
