export interface StatusPayload {
  time:     string;
  wifi:     { connected: boolean; rssi: number };
  firebase: { ready: boolean };
}