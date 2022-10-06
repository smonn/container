/**
 * Used to identify the type of a factory.
 */
export interface Token<T = unknown> {
  /**
   * Name of the token.
   */
  name: string;

  /**
   * Type mapping for TypeScript to help with type inference.
   * @ignore
   * @private
   */
  type: T;
}

/**
 * Helper type to match any custom class.
 * @private
 * @ignore
 */
type Constructor<T = unknown> = new (...args: unknown[]) => T;

/**
 * Helper type to unwrap token type
 * @private
 * @ignore
 */
type ExtractPlainType<C> = C extends StringConstructor
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
  : C extends RegExpConstructor
  ? RegExp
  : C extends SetConstructor
  ? InstanceType<C>
  : C extends MapConstructor
  ? InstanceType<C>
  : C extends null
  ? null
  : C extends undefined
  ? undefined
  : C extends Constructor<infer T>
  ? T
  : C;

/**
 * Helper function to create a token.
 * @template Type The type of the token, can be inferred from the `type` param.
 * @param name Name of the token.
 * @param type Type of the token.
 * @returns a token
 */
export function createToken<Type = unknown>(
  name: string,
  type?: Type
): Token<ExtractPlainType<Type>> {
  if (typeof name !== "string") throw new TypeError('"name" must be a string');

  return Object.freeze({
    name,
    type: type as unknown as ExtractPlainType<Type>,
  });
}

/**
 * Checks if a value is a token.
 * @param value Value to check
 * @returns true if the value is a token
 */
export function isToken(value: unknown): value is Token {
  return (
    !!value &&
    typeof value === "object" &&
    "name" in value &&
    "type" in value &&
    typeof (value as Token).name === "string"
  );
}

/**
 * Asserts that a value is a token. Throws a TypeError if the value is not a token.
 * @param value Value to assert
 */
export function assertToken(value: unknown): asserts value is Token {
  if (!isToken(value)) throw new TypeError('"value" is not a token');
}
