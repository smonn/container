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
 * The container class.
 */
export class Container {
  #factories: Map<symbol, Factory> = new Map();
  #instances: Map<symbol, unknown> = new Map();

  /**
   * Get the number of factories registered.
   */
  get size() {
    return this.#factories.size;
  }

  /**
   * Set a factory for a key.
   * @param key Unique identifier for the factory.
   * @param factory Factory function that returns a value.
   * @returns
   */
  set<T>(key: symbol, factory: Factory<T>): Container {
    this.#instances.delete(key);
    this.#factories.set(key, factory);
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
   * @param key Unique identifier for the instance.
   * @returns
   */
  has(key: symbol): boolean {
    return this.#factories.has(key);
  }

  /**
   * Get an instance of a key. Always returns the same instance.
   * Will create a new instance if one does not exist.
   * @param key Unique identifier for the instance.
   * @returns
   */
  get<T>(key: symbol): T {
    if (this.#instances.has(key)) {
      return this.#instances.get(key) as T;
    }

    const instance = this.create<T>(key);
    this.#instances.set(key, instance);
    return instance;
  }

  /**
   * Get a instance of a key. Always returns a new instance.
   * @param key Unique identifier for the instance.
   * @returns
   */
  create<T>(key: symbol): T {
    const factory = this.#factories.get(key);

    if (!factory)
      throw new Error(`No factory registered for key ${String(key)}`);

    const instance = factory(this);
    return instance as T;
  }

  /**
   * Delete a factory for a key. Also deletes the instance if it exists.
   * @param key Unique identifier for the instance.
   */
  delete(key: symbol): boolean {
    this.#instances.delete(key);
    return this.#factories.delete(key);
  }

  /**
   * Clear all factories and instances.
   */
  clear(): void {
    this.#instances.clear();
    this.#factories.clear();
  }
}
