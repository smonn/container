# @smonn/container

Easy to use dependency injection container. This is a simplified version to avoid fixed dependencies via decorators. It also always returns the same instance unless you explicitly ask for a new instance. Instances are lazily created, meaning nothing is created until you request an instance. TypeScript optional.

## Install

```sh
npm install @smonn/container
```

```sh
yarn add @smonn/container
```

## Usage

Basic example usage. See more examples in the test file.

```ts
import { Container, createToken } from '@smonn/container';

// Interfaces are optional, but can help to ensure you depend on abstractions only.
interface IGreeter {
  sayHello(): string;
}
interface IShouter {
  shoutHello(): string;
}

class Other {
  ping() {
    return 'pong';
  }
}

// It's recommended to assemble all tokens in one place for easier management.
// Use the createToken utility to assist with typings.
const Tokens = {
  greeter: createToken<IGreeter>('greeter'),
  shouter: createToken<IShouter>('shouter'),
  name: createToken<string>('name'),

  // You can also rely on the class's name when creating a token. But be careful
  // when using this method if you minify your code. Also note that this means
  // you will depend on the class directly instead of an interface.
  other: createToken(Other),

  // Tokens can also be strings if you prefer.
  simple: 'simple',
} as const;

class Greeter implements IGreeter {
  constructor(private readonly name: string) {}

  sayHello(): string {
    return `Hello, ${this.name}!`;
  }
}
class Shouter implements IShouter {
  constructor(private readonly greeter: IGreeter) {}

  shoutHello(): string {
    return this.greeter.sayHello().toUpperCase();
  }
}

// Group together related classes in a single function to avoid a single
// massive function defining hundreds of dependencies. Also note that thanks to
// the token spec, explicitly declaring the generic type is not required.
function provideModule(container: Container) {
  // Literal/basic values are allowed
  container.set(Tokens.name, 'Joy');
  container.set(Tokens.greeter, (c) => new Greeter(c.get(Tokens.name)));
  container.set(Tokens.shouter, (c) => new Shouter(c.get(Tokens.greeter)));
  container.set(Tokens.other, () => new Other());
  container.set(Tokens.simple, 123);
}

const container = new Container();
container.register(provideModule);

// Here shouter will have the correct type (the Shouter interface)
const shouter = container.get(Tokens.shouter);
console.log(shouter.shoutHello()); // logs 'HELLO, JOY!'

console.log(
  'always get the same instance',
  Object.is(container.get(Tokens.shouter), container.get(Tokens.shouter)) ===
    true
);

console.log(
  'always get a new instance',
  Object.is(
    container.create(Tokens.shouter),
    container.create(Tokens.shouter)
  ) === false
);

console.log('ping', container.get(Tokens.other).ping());

// Since the `simple` token is just a string, the default inferred type is
// `any`. Therefore, you need to set the type explicitly, if desired.
console.log('one-two-three', container.get<number>(Tokens.simple));
```
