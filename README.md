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
import { Container } from '@smonn/container';

class Greeter {
  // Note that this tag does not need to live with the class.
  // Also note that the 'Greeter' part is optional due to how symbols work,
  // but it's recommended to include it to help debug misconfigurations.
  static tag: Symbol('Greeter');

  sayHello(name: string): string {
    return `Hello, ${name}!`;
  }
}

class Shouter {
  static tag: Symbol('Shouter');

  constructor(private readonly greeter: Greeter) {}

  shout(name: string): string {
    return this.greeter.sayHello(name).toUpperCase();
  }
}

function provideModule(container: Container) {
  // Group together related classes in a single function to avoid a single
  // massive function defining hundreds of dependencies.
  container.set(Greeter.tag, () => new Greeter());
  container.set(Shouter.tag, (c) => new Shouter(c.get<Greeter>(Greeter.tag)));
}

const container = new Container();
container.register(provideModule)

const shouter = container.get<Shouter>(Shouter.tag);
console.log(shouter.shout('Joy')); // logs 'HELLO, JOY!'

console.log(
  'always get the same instance',
  Object.is(
    container.get<Shouter>(Shouter.tag),
    container.get<Shouter>(Shouter.tag)
  ) === true
);

console.log(
  'always get a new instance',
  Object.is(
    container.create<Shouter>(Shouter.tag),
    container.create<Shouter>(Shouter.tag)
  ) === false
);
```
