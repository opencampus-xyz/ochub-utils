/**
 * Analytics Module - Google Tag Manager Integration
 * Frontend-safe tracking using GTM container without exposing secrets
 */

interface GTMConfig {
  containerId: string;
}

interface TrackingParams {
  [key: string]: any;
}

declare global {
  interface Window {
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
  }
}

/**
 * OCAnalytics - Singleton class for sending custom events via Google Tag Manager
 * GTM is the recommended approach for frontend tracking as it doesn't expose API secrets
 */
class OCAnalytics {
  private static instance: OCAnalytics | null = null;
  private containerId: string;
  private appName: string;

  private constructor(appName: string, config: GTMConfig) {
    this.appName = appName;
    this.containerId = config.containerId;
    this.initializeGTM();
  }

  /**
   * Initialize the singleton instance with GTM configuration
   */
  public static initialize(appName: string, config: GTMConfig): OCAnalytics {
    if (!OCAnalytics.instance) {
      OCAnalytics.instance = new OCAnalytics(appName, config);
    }
    return OCAnalytics.instance;
  }

  /**
   * Get the singleton instance
   */
  public static getInstance(): OCAnalytics {
    if (!OCAnalytics.instance) {
      throw new Error(
        "OCAnalytics has not been initialized. Call OCAnalytics.initialize(config) first.",
      );
    }
    return OCAnalytics.instance;
  }

  /**
   * Track a custom event
   * @param eventName - Name of the event
   * @param params - Event parameters including required 'appName' and any custom parameters
   */
  public trackEvent(eventName: string, params: TrackingParams): void {
    if (typeof window === "undefined") {
      console.warn(
        "OCAnalytics.trackEvent can only be called in browser environment",
      );
      return;
    }

    // console.log(`Tracking event: ${eventName}`, params);

    if (typeof window !== "undefined" && typeof window.gtag === "function") {
      console.log("sending to gtag:", {
        event: "appEvents",
        app_name: this.appName,
        event_name: eventName,
        event_payload: params,
      });
      window.gtag("event", eventName, {
        app_name: this.appName,
        ...params,
      });
    } else {
      console.warn(`Analytics: gtag not found for event "${eventName}"`);
    }
  }

  /**
   * Set user ID for user tracking
   */
  public setUserId(userId: string): void {
    if (typeof window === "undefined") {
      console.warn(
        "OCAnalytics.setUserId can only be called in browser environment",
      );
      return;
    }

    // Push user ID to GTM data layer
    if (window.dataLayer) {
      window.dataLayer.push({
        event: "user_identified",
        user_id: userId,
        timestamp: new Date().toISOString(),
      });
    } else {
      console.warn("GTM data layer not available");
    }
  }

  /**
   * Initialize Google Tag Manager script
   */
  private initializeGTM(): void {
    if (typeof window === "undefined") {
      return;
    }

    // Initialize data layer
    if (!window.dataLayer) {
      window.dataLayer = [];
    }

    // Load GTM script
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${this.containerId}`;
    document.head.appendChild(script);

    // Initialize gtag function
    window.gtag = function () {
      (window.dataLayer as any).push(arguments);
    };
    window.gtag("js", new Date());
    window.gtag("config", this.containerId);
  }
}

export { OCAnalytics };
