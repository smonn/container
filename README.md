# @smonn/container

Dependency injection container. Attempts to avoid fixed dependencies via decorators. It also always returns the same instance unless you explicitly ask for a new instance. Instances are lazily created, meaning nothing is created until you request an instance. TypeScript optional, but attempts to infer types as much as possible.

## Install

```sh
npm install @smonn/container
```

```sh
yarn add @smonn/container
```

## Usage

Example usage. See more examples in the test files.

```ts
import { Container, createToken } from "@smonn/container";

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

// Or define token types in a central location to help avoid circular imports.
const Tokens = {
  // Token type can also be inferred from the function signature.
  name: createToken("name", String),
} as const;

// Group together related classes in a single function to avoid a single
// massive function defining hundreds of dependencies. Also note that thanks to
// the token spec, explicitly declaring the generic type is not required.
function provideModule(container: Container) {
  // Literal/basic values are allowed
  container.set(Tokens.name, () => "Joy");
  container.set(Greeter.token, (c) => new Greeter(c.get(Tokens.name)));
  container.set(Shouter.token, (c) => new Shouter(c.get(Greeter.token)));
}

const container = new Container();
container.register(provideModule);

// Here shouter will have the correct type (the Shouter interface)
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
```
