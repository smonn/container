/**
 * A factory for return a value of `T` type. Does not need to be an instance of
 * a class, can be primitive values too.
 */
export type Factory<T = unknown> = T | ((container: Container) => T);

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
  name: string | symbol;

  /**
   * Type mapping for TypeScript to help with type inference.
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
  #name: string | symbol;
  #type: T;

  constructor(name: string | symbol, type?: T) {
    this.#name = name;
    this.#type = type as T;
  }

  get name() {
    return this.#name;
  }

  get type() {
    return this.#type;
  }
}

/**
 * Helper type to match any custom class.
 * @private
 * @ignore
 */
type Class<T> = new (...args: unknown[]) => T;

/**
 * Helper type to unwrap token type
 * @private
 * @ignore
 */
type TokenType<C> = C extends StringConstructor
  ? string
  : C extends NumberConstructor
  ? number
  : C extends BooleanConstructor
  ? boolean
  : C extends ArrayConstructor
  ? unknown[]
  : C extends BigIntConstructor
  ? bigint
  : C extends SymbolConstructor
  ? symbol
  : C extends null
  ? null
  : C extends undefined
  ? undefined
  : C extends Class<infer T>
  ? T
  : C;

/**
 * Helper function to create a token.
 * @generic Type The type of the token, can be inferred from the `type` param.
 * @param name Name of the token.
 * @param type Optional type of the token.
 */
export function createToken<
  Type extends
    | unknown
    | Class<unknown>
    | BigIntConstructor
    | SymbolConstructor
    | null
    | undefined
>(name: string | symbol | Type, type?: Type): Token<TokenType<Type>> {
  return new TokenImpl<TokenType<Type>>(
    typeof name === "string"
      ? name
      : typeof name === "symbol"
      ? name
      : typeof name === "function" && "name" in (name as Class<unknown>)
      ? (name as Class<unknown>).name
      : String(name),
    (type ?? name) as unknown as TokenType<Type>
  );
}

/**
 * Alias for `createToken`
 * @see createToken
 */
export const t = createToken;

/**
 * The container class.
 */
export class Container {
  /**
   * Token for the container itself.
   */
  static token = t(Symbol("@smonn/container"), this);

  #factories = new Map<string | symbol | Token, Factory>();
  #instances = new Map<string | symbol | Token, unknown>();

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
   * @returns Returns the container instance.
   */
  set<T, F extends T>(
    token: string | symbol | Token<T>,
    factory: Factory<F>
  ): this {
    this.#instances.delete(token);
    this.#factories.set(token, factory);
    return this;
  }

  /**
   * Convenience method to register one or more factories.
   * @param provider Provider function to register one or more factories.
   * @returns Returns the container instance.
   */
  register(provider: Provider): this {
    provider(this);
    return this;
  }

  /**
   * Verifies if a factory has been registered for a given key.
   * @param token Unique identifier for the instance.
   * @returns True if a factory has been registered, false otherwise.
   */
  has<T>(token: string | symbol | Token<T>): boolean {
    return this.#factories.has(token);
  }

  /**
   * Get an instance of a key. Always returns the same instance.
   * Will create a new instance if one does not exist.
   * @param token Unique identifier for the instance.
   * @returns Returns the same instance.
   */
  get<T>(token: string | symbol | Token<T>): T {
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
   * @returns Returns a new instance.
   */
  create<T>(token: string | symbol | Token<T>): T {
    const factory = this.#factories.get(token);

    if (!factory) {
      throw new Error(`No factory registered for key ${String(token)}`);
    }

    if (typeof factory !== "function") return factory as T;

    const instance = factory(this);
    return instance as T;
  }

  /**
   * Delete a factory for a key. Also deletes the instance if it exists.
   * @param token Unique identifier for the instance.
   * @returns True if a factory was deleted, false otherwise.
   */
  delete<T>(token: string | symbol | Token<T>): boolean {
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
