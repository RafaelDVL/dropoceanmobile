import { Injectable } from '@angular/core';
import { Database, ref, get, child, remove } from '@angular/fire/database';

export interface LogEntry {
  b: string; // bomba
  d: number; // dosagem
  o: string; // origem
  ts: string; // timestamp
}

@Injectable({
  providedIn: 'root',
})
export class FirebaseLogService {
  constructor(private db: Database) {}

  async getLogs(): Promise<LogEntry[]> {
    const dbRef = ref(this.db);
    const snapshot = await get(child(dbRef, 'logs'));

    if (snapshot.exists()) {
      const data = snapshot.val();
      return Object.keys(data).map((key) => ({
        b: data[key].bomba,
        d: data[key].dosagem,
        o: data[key].origem,
        ts: data[key].timestamp,
      }));
    } else {
      return [];
    }
  }

  async clearLogs() {
    const dbRef = ref(this.db, 'logs');
    await remove(dbRef);
  }
}
