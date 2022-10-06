import { assertToken, createToken, Token } from "./token";

export interface IContainer {
  /**
   * Containers own token.
   */
  readonly token: Token<IContainer>;

  /**
   * Get the number of factories registered.
   */
  readonly size: number;

  /**
   * Set a factory for a key.
   * @param token Unique identifier for the factory.
   * @param factory Factory function that returns a value.
   * @returns Returns the container instance.
   */
  set<T, F extends T>(token: Token<T>, factory: Factory<F>): IContainer;

  /**
   * Convenience method to register one or more factories.
   * @param provider Provider function to register one or more factories.
   * @returns Returns the container instance.
   */
  register(provider: Provider): IContainer;

  /**
   * Delete a factory for a key. Also deletes the instance if it exists.
   * @param token Unique identifier for the instance.
   * @returns True if a factory was deleted, false otherwise.
   */
  delete<T>(token: Token<T>): boolean;

  /**
   * Get an instance of a key. Always returns the same instance.
   * Will create a new instance if one does not exist.
   * @param token Unique identifier for the instance.
   * @returns Returns the same instance.
   */
  get<T>(token: Token<T>): T;

  /**
   * Get a instance of a key. Always returns a new instance.
   * @param token Unique identifier for the instance.
   * @returns Returns a new instance.
   */
  create<T>(token: Token<T>): T;

  /**
   * Verifies if a factory has been registered for a given key.
   * @param token Unique identifier for the instance.
   * @returns True if a factory has been registered, false otherwise.
   */
  has<T>(token: Token<T>): boolean;

  /**
   * Clear all factories and instances.
   */
  clear(): void;
}

/**
 * A factory for return a value of `T` type. Does not need to be an instance of
 * a class, can be primitive values too.
 */
export type Factory<T = unknown> = T | ((container: IContainer) => T);

/**
 * A provider can be used to register one or more factories.
 */
export type Provider = (container: IContainer) => void;

/**
 * The container class.
 */
export function createContainer(): IContainer {
  const factories = new Map<Token, Factory>();
  const instances = new Map<Token, unknown>();

  const container: IContainer = Object.freeze({
    token: createToken<IContainer>("@smonn/container"),
    get size() {
      return factories.size;
    },
    set<T, F extends T>(token: Token<T>, factory: Factory<F>) {
      assertToken(token);
      instances.delete(token);
      factories.set(token, factory);
      return container;
    },
    register(provider: Provider): IContainer {
      if (typeof provider !== "function")
        throw new TypeError('"provider" must be a function');
      provider(container);
      return container;
    },
    has<T>(token: Token<T>): boolean {
      assertToken(token);
      return factories.has(token);
    },
    get<T>(token: Token<T>): T {
      assertToken(token);
      if (instances.has(token)) {
        return instances.get(token) as T;
      }

      const instance = container.create(token);
      instances.set(token, instance);
      return instance;
    },
    create<T>(token: Token<T>): T {
      assertToken(token);
      const factory = factories.get(token);

      if (!factory) {
        throw new Error(`token "${token.name}" has no factory`);
      }

      if (typeof factory !== "function") return factory as T;

      const instance = factory(container);
      return instance as T;
    },
    delete<T>(token: Token<T>): boolean {
      assertToken(token);
      return factories.delete(token) || instances.delete(token);
    },
    clear(): void {
      instances.clear();
      factories.clear();
    },
  });

  return container;
}
