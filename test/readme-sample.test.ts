import { expect, test } from "vitest";
import { createContainer, createToken, IContainer } from "../src/index";

// Interfaces are optional, but can help to ensure you depend on abstractions only.
interface IGreeter {
  sayHello(): string;
}
interface IShouter {
  shoutHello(): string;
}

class Greeter implements IGreeter {
  // Can either define tokens along with the class implementation...
  static token = createToken<IGreeter>("greeter");

  constructor(private readonly name: string) {}

  sayHello(): string {
    return `Hello, ${this.name}!`;
  }
}

class Shouter implements IShouter {
  static token = createToken<IShouter>("shouter");

  constructor(private readonly greeter: IGreeter) {}

  shoutHello(): string {
    return this.greeter.sayHello().toUpperCase();
  }
}

class Other {
  ping() {
    return "pong";
  }
}

// Or define token types in a central location to help avoid circular imports.
const Tokens = {
  // Token type can also be inferred from the function signature
  name: createToken("name", String),

  // Or use explicit type and infer name from class
  other: createToken("other", Other),
} as const;

// Group together related classes in a single function to avoid a single
// massive function defining hundreds of dependencies. Also note that thanks to
// the token spec, explicitly declaring the generic type is not required.
function provideModule(container: IContainer) {
  // Literal/basic values are allowed
  container.set(Tokens.name, "Joy");
  container.set(Tokens.other, new Other());

  // Use factory functions to help resolve dependencies
  container.set(Greeter.token, (c) => new Greeter(c.get(Tokens.name)));
  container.set(Shouter.token, (c) => new Shouter(c.get(Greeter.token)));
}

const container = createContainer();
container.register(provideModule);

// Here shouter will have the correct type (the IShouter interface)
const shouter = container.get(Shouter.token);

test('returns "HELLO, JOY!"', () => {
  expect(shouter.shoutHello()).toBe("HELLO, JOY!");
});

test("always get the same instance", () => {
  expect(container.get(Shouter.token)).toBe(container.get(Shouter.token));
});

test("always get a new instance", () => {
  expect(container.create(Shouter.token)).not.toBe(
    container.create(Shouter.token)
  );
});

test("other will never create a new instance", () => {
  expect(container.create(Tokens.other)).toBe(container.create(Tokens.other));
});
