
import { Injectable } from '@angular/core';
import { AndroidPermissions } from '@awesome-cordova-plugins/android-permissions/ngx';
import { Geolocation } from '@capacitor/geolocation';

@Injectable({
  providedIn: 'root' // ✅ Tornando-o globalmente injetável
})
export class PermissionService {
  constructor(private androidPermissions: AndroidPermissions) {}

  async checkAndRequestPermissions(): Promise<boolean> {
    const permissions = [
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.BLUETOOTH_SCAN',
      'android.permission.BLUETOOTH_CONNECT',
    ];

    try {
      for (const permission of permissions) {
        const result = await this.androidPermissions.checkPermission(permission);
        if (!result.hasPermission) {
          const request = await this.androidPermissions.requestPermission(permission);
          if (!request.hasPermission) {
            console.warn(`❌ Permissão negada: ${permission}`);
            return false;
          }
        }
      }
      return true;
    } catch (error) {
      console.error('❌ Erro ao verificar permissões:', error);
      return false;
    }
  }

  async isGpsEnabled(): Promise<boolean> {
    try {
      const pos = await Geolocation.getCurrentPosition(); // vai lançar erro se GPS estiver desativado
      return !!pos;
    } catch (error) {
      console.warn('⚠️ GPS desativado ou sem permissão:', error);
      return false;
    }
  }
}
