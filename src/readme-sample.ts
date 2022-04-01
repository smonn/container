import { Container, createToken } from './index';

// Interfaces are optional, but can help to ensure you depend on abstractions only.
interface Greeter {
  sayHello(): string;
}
interface Shouter {
  shoutHello(): string;
}

// It's recommended to assemble all tokens in one place for easier management.
// Use the createToken utility to assist with typings.
const Tokens = {
  greeter: createToken<Greeter>('greeter'),
  shouter: createToken<Shouter>('shouter'),
  name: createToken<string>('name'),
} as const;

class Greeter implements Greeter {
  constructor(private readonly name: string) {}

  sayHello(): string {
    return `Hello, ${this.name}!`;
  }
}
class Shouter implements Shouter {
  constructor(private readonly greeter: Greeter) {}

  shoutHello(): string {
    return this.greeter.sayHello().toUpperCase();
  }
}

// Group together related classes in a single function to avoid a single
// massive function defining hundreds of dependencies. Also note that thanks to
// the token spec, explicitly declaring the generic type is not required.
function provideModule(container: Container) {
  // Literal/basic values are allowed
  container.set(Tokens.name, () => 'Joy');
  container.set(Tokens.greeter, (c) => new Greeter(c.get(Tokens.name)));
  container.set(Tokens.shouter, (c) => new Shouter(c.get(Tokens.greeter)));
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
