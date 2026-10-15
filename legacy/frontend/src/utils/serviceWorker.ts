// Service Worker registration and management utilities

export interface ServiceWorkerMessage {
  type: string;
  payload?: any;
}

class ServiceWorkerManager {
  private registration: ServiceWorkerRegistration | null = null;
  private isSupported = 'serviceWorker' in navigator;

  /**
   * Register the service worker
   */
  async register(): Promise<ServiceWorkerRegistration | null> {
    if (!this.isSupported) {
      console.log('Service Worker not supported');
      return null;
    }

    try {
      this.registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/'
      });

      console.log('Service Worker registered successfully:', this.registration);

      // Handle updates
      this.registration.addEventListener('updatefound', () => {
        const newWorker = this.registration!.installing;
        if (newWorker) {
          newWorker.addEventListener('statechange', () => {
            if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
              // New service worker is available
              this.notifyUpdateAvailable();
            }
          });
        }
      });

      return this.registration;
    } catch (error) {
      console.error('Service Worker registration failed:', error);
      return null;
    }
  }

  /**
   * Unregister the service worker
   */
  async unregister(): Promise<boolean> {
    if (!this.registration) {
      return false;
    }

    try {
      const result = await this.registration.unregister();
      console.log('Service Worker unregistered:', result);
      this.registration = null;
      return result;
    } catch (error) {
      console.error('Service Worker unregistration failed:', error);
      return false;
    }
  }

  /**
   * Check if service worker is supported
   */
  isServiceWorkerSupported(): boolean {
    return this.isSupported;
  }

  /**
   * Get the current service worker registration
   */
  getRegistration(): ServiceWorkerRegistration | null {
    return this.registration;
  }

  /**
   * Send message to service worker
   */
  async sendMessage(message: ServiceWorkerMessage): Promise<void> {
    if (!this.registration || !this.registration.active) {
      console.warn('No active service worker to send message to');
      return;
    }

    try {
      this.registration.active.postMessage(message);
    } catch (error) {
      console.error('Failed to send message to service worker:', error);
    }
  }

  /**
   * Clear all caches
   */
  async clearCache(): Promise<void> {
    await this.sendMessage({ type: 'CLEAR_CACHE' });
  }

  /**
   * Skip waiting for service worker update
   */
  async skipWaiting(): Promise<void> {
    await this.sendMessage({ type: 'SKIP_WAITING' });
  }

  /**
   * Check if app is running offline
   */
  isOffline(): boolean {
    return !navigator.onLine;
  }

  /**
   * Listen for online/offline events
   */
  onOnlineStatusChange(callback: (isOnline: boolean) => void): () => void {
    const handleOnline = () => callback(true);
    const handleOffline = () => callback(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Return cleanup function
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }

  /**
   * Get cache storage info
   */
  async getCacheInfo(): Promise<{ name: string; size: number }[]> {
    if (!this.isSupported) {
      return [];
    }

    try {
      const cacheNames = await caches.keys();
      const cacheInfo = await Promise.all(
        cacheNames.map(async (name) => {
          const cache = await caches.open(name);
          const keys = await cache.keys();
          return {
            name,
            size: keys.length
          };
        })
      );

      return cacheInfo;
    } catch (error) {
      console.error('Failed to get cache info:', error);
      return [];
    }
  }

  /**
   * Notify that an update is available
   */
  private notifyUpdateAvailable(): void {
    // Dispatch custom event for components to listen to
    window.dispatchEvent(new CustomEvent('sw-update-available', {
      detail: { registration: this.registration }
    }));
  }

  /**
   * Request background sync for journal entries
   */
  async requestBackgroundSync(): Promise<void> {
    if (!this.registration) {
      console.warn('Background sync not supported');
      return;
    }

    try {
      const sync = (this.registration as any).sync;
      if (sync && typeof sync.register === 'function') {
        await sync.register('journal-entry-sync');
      } else {
        console.warn('Background sync manager unavailable');
      }
      console.log('Background sync registered for journal entries');
    } catch (error) {
      console.error('Failed to register background sync:', error);
    }
  }
}

// Create singleton instance
export const serviceWorkerManager = new ServiceWorkerManager();

// Auto-register service worker in development
if (process.env.NODE_ENV === 'development') {
  serviceWorkerManager.register().catch(console.error);
}

// Export types and utilities
export default serviceWorkerManager;

