/**
 * Account Module - User and Account Management
 * Wraps OCID Connect SDK with singleton pattern for state management
 */

import { OCAuthLive, OCAuthSandbox } from "@opencampus/ocid-connect-js";

type AuthStateSubscriber = (authState: AuthState) => void;

interface AccountConfig {
  opts?: Record<string, any>;
  sandboxMode?: boolean;
}

interface AuthState {
  OCId?: string;
  ethAddress?: string;
  [key: string]: any;
}

/**
 * OCAccount - Singleton class for OCID Connect SDK management
 * Handles authentication state and provides subscription mechanism
 */
class OCAccount {
  private ocAuth: any = null;
  private authState: AuthState = {};
  private isInitialized = false;
  private sandboxMode = false;
  private subscribers: Set<AuthStateSubscriber> = new Set();

  // Allow module-level getInstance to create instances
  public constructor(config?: AccountConfig) {
    this.sandboxMode = config?.sandboxMode ?? false;
    this._init(config);
  }

  /**
   * Internal initialization - instantiate SDK based on sandbox mode
   */
  private _init(config?: AccountConfig): void {
    try {
      // Instantiate appropriate auth SDK
      const AuthClass = this.sandboxMode ? OCAuthSandbox : OCAuthLive;
      const opts = Object.assign(config?.opts || {}, {
        storageType: "cookie",
        sameSite: false,
      });
      this.ocAuth = new AuthClass(opts);
      // Get initial auth state
      const initialAuthState = this.ocAuth.getAuthState?.();
      if (initialAuthState) {
        this._updateAuthState(initialAuthState);
      }

      // Subscribe to auth state changes
      if (this.ocAuth.authInfoManager) {
        this.ocAuth.authInfoManager.subscribe((newAuthState: AuthState) => {
          this._updateAuthState(newAuthState);
        });
      }

      this.isInitialized = true;
    } catch (error) {
      console.error("Failed to initialize OCAccount:", error);
      throw error;
    }
  }

  /**
   * Internal method to update auth state and notify subscribers
   */
  private _updateAuthState(newAuthState: AuthState): void {
    this.authState = newAuthState;
    this._notifySubscribers(newAuthState);
  }

  /**
   * Notify all subscribers of auth state change
   */
  private _notifySubscribers(authState: AuthState): void {
    this.subscribers.forEach((subscriber) => {
      try {
        subscriber(authState);
      } catch (error) {
        console.error("Error in auth state subscriber:", error);
      }
    });
  }

  /**
   * Subscribe to auth state changes
   * Returns unsubscribe function
   */
  public subscribe(callback: AuthStateSubscriber): () => void {
    this.subscribers.add(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers.delete(callback);
    };
  }

  /**
   * Get current auth state
   */
  public getAuthState(): AuthState {
    return { ...this.authState };
  }

  /**
   * Get OpenCampus ID
   */
  public getOCId(): string | undefined {
    return this.authState.OCId;
  }

  /**
   * Get Ethereum address
   */
  public getEthAddress(): string | undefined {
    return this.authState.ethAddress;
  }

  /**
   * Check if user is authenticated
   */
  public isAuthenticated(): boolean {
    return !!this.authState.OCId;
  }

  /**
   * Check if SDK is initialized
   */
  public isSDKInitialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get the underlying OCID auth SDK instance
   * (for advanced use cases)
   */
  public getSDKInstance(): any {
    return this.ocAuth;
  }

  /**
   * Get the ID token (JWT)
   * Returns the raw ID token string or undefined if not authenticated
   */
  public getIdToken(): string | undefined {
    return this.ocAuth?.getIdToken?.();
  }

  /**
   * Get the access token (JWT)
   * Returns the raw access token string or undefined if not authenticated
   */
  public getAccessToken(): string | undefined {
    return this.ocAuth?.getAccessToken?.();
  }
}

/**
 * Module-level singleton instance
 */
let ocAccountInstance: OCAccount | null = null;

/**
 * Get the module-level OCAccount singleton instance
 * Instantiates only once with the provided configuration
 *
 * @param config Configuration for account management (only used on first instantiation)
 * @returns The OCAccount singleton instance
 */
export function getInstance(config?: AccountConfig): OCAccount {
  if (!ocAccountInstance) {
    ocAccountInstance = new OCAccount(config);
  }
  return ocAccountInstance;
}

export { OCAccount };
export type { AuthState, AccountConfig, AuthStateSubscriber };
