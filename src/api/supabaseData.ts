import type { ManualRecord, Night, StoredManualRecord } from '../types/domain';
import { supabase } from './supabaseClient';

type NightRow = {
  id: string;
  date: string;
  weekday_label: string;
  events_count: number;
  snore_minutes: number;
  sleep_duration_hours: number;
  severity: Night['severity'];
};

type RecordRow = {
  id: string;
  created_at: string;
  payload: ManualRecord;
};

function nightRowToNight(row: NightRow): Night {
  return {
    id: row.id,
    date: row.date,
    weekdayLabel: row.weekday_label,
    eventsCount: row.events_count,
    snoreMinutes: row.snore_minutes,
    sleepDurationHours: row.sleep_duration_hours,
    severity: row.severity,
  };
}

function recordRowToRecord(row: RecordRow): StoredManualRecord {
  return {
    ...row.payload,
    id: row.id,
    createdAt: row.created_at,
  };
}

export async function fetchNights(userId: string): Promise<Night[]> {
  const { data, error } = await supabase
    .from('nights')
    .select('id, date, weekday_label, events_count, snore_minutes, sleep_duration_hours, severity')
    .eq('user_id', userId)
    .order('date', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as NightRow[]).map(nightRowToNight);
}

export async function createNight(night: Omit<Night, 'id'>, userId: string): Promise<Night> {
  const { data, error } = await supabase
    .from('nights')
    .insert({
      user_id: userId,
      date: night.date,
      weekday_label: night.weekdayLabel,
      events_count: night.eventsCount,
      snore_minutes: night.snoreMinutes,
      sleep_duration_hours: night.sleepDurationHours,
      severity: night.severity,
    })
    .select('id, date, weekday_label, events_count, snore_minutes, sleep_duration_hours, severity')
    .single();

  if (error) throw new Error(error.message);
  return nightRowToNight(data as NightRow);
}

export async function fetchRecords(userId: string): Promise<StoredManualRecord[]> {
  const { data, error } = await supabase
    .from('records')
    .select('id, created_at, payload')
    .eq('user_id', userId)
    .order('created_at', { ascending: true });

  if (error) throw new Error(error.message);
  return (data as RecordRow[]).map(recordRowToRecord);
}

export async function submitRecord(record: ManualRecord, userId: string): Promise<ManualRecord> {
  const { data, error } = await supabase
    .from('records')
    .insert({ user_id: userId, payload: record })
    .select('id, created_at, payload')
    .single();

  if (error) throw new Error(error.message);
  return recordRowToRecord(data as RecordRow);
}
