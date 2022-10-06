import { expect, test } from "vitest";
import {
  createContainer,
  createToken,
  IContainer,
  isToken,
  Provider,
  Token,
} from "../src/index";

interface IFoo {
  send(): void;
}

interface IBar {
  notify(): void;
}

class Foo implements IFoo {
  send() {
    // ...
  }
}

class Bar implements IBar {
  constructor(private readonly foo: IFoo) {}

  notify() {
    this.foo.send();
  }
}

class Other {
  ping() {
    return "pong";
  }
}

const tokens = {
  foo: createToken<IFoo>("foo"),
  asyncFoo: createToken<Promise<IFoo>>("asyncFoo"),
  bar: createToken<IBar>("bar"),
  constant: createToken<string>("constant"),
  other: createToken("other", Other),
  fallbackName: createToken(Other.name),
  simple: createToken<number>("simple"),
} as const;

test("token properties", () => {
  expect(tokens.bar.name).toBe("bar");
  expect(tokens.bar.type).toBeUndefined();
  expect(tokens.other.name).toBe("other");
  expect(tokens.other.type).toBe(Other);
});

test("create createContainer", () => {
  const container = createContainer();
  expect(typeof container.clear).toBe("function");
  expect(typeof container.create).toBe("function");
  expect(typeof container.delete).toBe("function");
  expect(typeof container.get).toBe("function");
  expect(typeof container.has).toBe("function");
  expect(typeof container.register).toBe("function");
  expect(typeof container.set).toBe("function");
  expect(typeof container.size).toBe("number");
  expect(isToken(container.token)).toBeTruthy();
});

test("set factory and get value", () => {
  const container = createContainer();
  const constant = "constant";
  container.set(tokens.constant, () => constant);
  expect(container.get(tokens.constant)).toBe(constant);
});

test("always the same instance", () => {
  const container = createContainer();
  const otherToken = createToken<IFoo>("otherFoo");

  container.set(tokens.foo, () => new Foo());
  container.set(otherToken, () => new Foo());

  const a = container.get(tokens.foo);
  const b = container.get(tokens.foo);

  expect(a).toBe(b);
  expect(container.get(otherToken)).toBe(container.get(otherToken));
  expect(a).not.toBe(new Foo());
  expect(a).not.toBe(container.get(otherToken));
  expect(a).toStrictEqual(b);
  expect(container.get(tokens.foo)).not.toBe(new Foo());
});

test("always get a new instance", () => {
  const container = createContainer();
  container.set(tokens.foo, () => new Foo());

  expect(container.get(tokens.foo)).not.toBe(container.create(tokens.foo));
  expect(container.create(tokens.foo)).not.toBe(container.create(tokens.foo));
});

const provider = (container: IContainer) => {
  container.set(tokens.foo, () => new Foo());
};

test("register via provider", () => {
  const container = createContainer();
  container.register(provider);
  expect(container.get(tokens.foo)).toBeInstanceOf(Foo);
});

test("setting same token will clear previous instance", () => {
  const container = createContainer();

  container.set(tokens.foo, () => new Foo());
  const firstInstance = container.get(tokens.foo);
  container.set(tokens.foo, () => new Foo());
  const secondInstance = container.get(tokens.foo);

  expect(firstInstance).not.toBe(secondInstance);
});

test("a token can also be a string", () => {
  const container = createContainer();
  container.set(tokens.simple, 123);

  // When using a string token, it's recommended to also explicitly set the
  // type to ensure TypeScript can do its thing. Otherwise, the returned type
  // will be `unknown`.
  expect(container.get<number>(tokens.simple)).toBe(123);
});

test("configuring dependencies", () => {
  const container = createContainer();
  container
    .set(tokens.foo, () => new Foo())
    .set(tokens.bar, (c) => new Bar(c.get(tokens.foo)));

  const bar = container.get(tokens.bar);
  expect(bar).toBeInstanceOf(Bar);
});

test("throws if invalid token or provider", () => {
  const container = createContainer();
  const invalidToken = "invalid" as unknown as Token;
  const invalidProvider = "invalid" as unknown as Provider;
  expect(() => container.create(invalidToken)).toThrow();
  expect(() => container.delete(invalidToken)).toThrow();
  expect(() => container.get(invalidToken)).toThrow();
  expect(() => container.has(invalidToken)).toThrow();
  expect(() => container.set(invalidToken, 123)).toThrow();
  expect(() => container.register(invalidProvider)).toThrow();
});

test("throws if no match is found", () => {
  const container = createContainer();
  const unknownToken = createToken("unknown");
  expect(() => container.get(unknownToken)).toThrow(
    'No factory registered for key "unknown"'
  );
});

test("async factory is allowed", async () => {
  const container = createContainer();
  container.set(tokens.asyncFoo, async () => new Foo());
  const foo = await container.get(tokens.asyncFoo);
  expect(foo).toBeInstanceOf(Foo);
});

test("verify if a factory has been registered", () => {
  const container = createContainer();
  expect(container.has(tokens.foo)).toBe(false);
  container.set(tokens.foo, () => new Foo());
  expect(container.has(tokens.foo)).toBe(true);
});

test("delete factory", () => {
  const container = createContainer();
  container.set(tokens.foo, () => new Foo());
  expect(container.has(tokens.foo)).toBe(true);
  container.delete(tokens.foo);
  expect(container.has(tokens.foo)).toBe(false);
});

test("clear all factories and instances", () => {
  const container = createContainer();
  container.set(tokens.foo, () => new Foo());
  container.set(tokens.bar, (c) => new Bar(c.get(tokens.foo)));
  expect(container.has(tokens.foo)).toBe(true);
  expect(container.has(tokens.bar)).toBe(true);
  container.clear();
  expect(container.has(tokens.foo)).toBe(false);
  expect(container.has(tokens.bar)).toBe(false);
});
