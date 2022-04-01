/**
 * A factory for return a value of `T` type. Does not need to be an instance of
 * a class, can be primitive values too.
 */
export type Factory<T = unknown> = (container: Container) => T;

/**
 * A provider can be used to register one or more factories.
 */
export type Provider = (container: Container) => void;

/**
 * Used to identify the type of a factory.
 */
export interface Token<T = unknown> {
  /**
   * Name of the token.
   */
  name: string;

  /**
   * Type mapping for TypeScript to circumvent unused variable error.
   * Do not access this property directly, it is always undefined.
   * @ignore
   * @private
   */
  type: T;
}

/**
 * Private implementation of the `Token` interface.
 * @private
 * @ignore
 */
class TokenImpl<T = unknown> implements Token<T> {
  #name: string;
  #type: T;

  constructor(name: string) {
    this.#name = name;
    this.#type = void 0 as unknown as T;
  }

  get name() {
    return this.#name;
  }

  get type() {
    return this.#type;
  }
}

/**
 * Helper function to create a token.
 * @param name Name of the token.
 */
export function createToken<T = unknown>(name: string): Token<T> {
  return new TokenImpl<T>(name);
}

/**
 * The container class.
 */
export class Container {
  #factories = new Map<Token, Factory>();
  #instances = new Map<Token, unknown>();

  /**
   * Get the number of factories registered.
   */
  get size() {
    return this.#factories.size;
  }

  /**
   * Set a factory for a key.
   * @param token Unique identifier for the factory.
   * @param factory Factory function that returns a value.
   * @returns
   */
  set<T, F extends T>(token: Token<T>, factory: Factory<F>): Container {
    this.#instances.delete(token);
    this.#factories.set(token, factory);
    return this;
  }

  /**
   * Convenience method to register one or more factories.
   * @param provider Provider function to register one or more factories.
   * @returns
   */
  register(provider: Provider): Container {
    provider(this);
    return this;
  }

  /**
   * Verifies if a factory has been registered for a given key.
   * @param token Unique identifier for the instance.
   * @returns
   */
  has<T>(token: Token<T>): boolean {
    return this.#factories.has(token);
  }

  /**
   * Get an instance of a key. Always returns the same instance.
   * Will create a new instance if one does not exist.
   * @param token Unique identifier for the instance.
   * @returns
   */
  get<T>(token: Token<T>): T {
    if (this.#instances.has(token)) {
      return this.#instances.get(token) as T;
    }

    const instance = this.create(token);
    this.#instances.set(token, instance);
    return instance;
  }

  /**
   * Get a instance of a key. Always returns a new instance.
   * @param token Unique identifier for the instance.
   * @returns
   */
  create<T>(token: Token<T>): T {
    const factory = this.#factories.get(token);

    if (!factory)
      throw new Error(`No factory registered for key ${String(token)}`);

    const instance = factory(this);
    return instance as T;
  }

  /**
   * Delete a factory for a key. Also deletes the instance if it exists.
   * @param token Unique identifier for the instance.
   */
  delete<T>(token: Token<T>): boolean {
    this.#instances.delete(token);
    return this.#factories.delete(token);
  }

  /**
   * Clear all factories and instances.
   */
  clear(): void {
    this.#instances.clear();
    this.#factories.clear();
  }
}
