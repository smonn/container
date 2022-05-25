import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Container, createToken } from '../src';

interface IFoo {
  send(): void;
}

interface IBar {
  notify(): void;
}

class Other {
  ping() {
    return 'pong';
  }
}

const Tokens = {
  foo: createToken<IFoo>('foo'),
  asyncFoo: createToken<Promise<IFoo>>('asyncFoo'),
  bar: createToken<IBar>('bar'),
  constant: createToken<string>('constant'),
  other: createToken(Other),
  simple: 'simple',
} as const;

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

test('create new container', () => {
  const container = new Container();
  assert.instance(container, Container);
  assert.type(container.get, 'function');
  assert.type(container.create, 'function');
  assert.type(container.set, 'function');
  assert.type(container.register, 'function');
  assert.type(container.clear, 'function');
  assert.type(container.delete, 'function');
  assert.type(container.has, 'function');
  assert.type(container.size, 'number');
});

test('set factory and get literal value', () => {
  const container = new Container();
  const constant = 'constant';
  container.set(Tokens.constant, constant);
  assert.equal(container.get(Tokens.constant), constant);
});

test('always the same instance', () => {
  const container = new Container();
  const otherToken = createToken<Foo>('otherFoo');

  container.set(Tokens.foo, () => new Foo());
  container.set(otherToken, () => new Foo());

  assert.ok(Object.is(container.get(Tokens.foo), container.get(Tokens.foo)));
  assert.ok(Object.is(container.get(otherToken), container.get(otherToken)));
  assert.ok(!Object.is(container.get(Tokens.foo), new Foo()));
  assert.ok(!Object.is(container.get(Tokens.foo), container.get(otherToken)));
  assert.ok(container.get(Tokens.foo) === container.get(Tokens.foo));
  assert.ok(container.get(Tokens.foo) !== new Foo());
});

test('token can be created from a class', () => {
  const container = new Container();
  container.set(Tokens.other, () => new Other());

  assert.ok(container.get(Tokens.other) instanceof Other);
  assert.is(container.get(Tokens.other).ping(), 'pong');
});

test('token has a name and type', () => {
  assert.ok(Tokens.bar.name === 'bar');

  // Type is not meant to be accessed
  assert.throws(() => Tokens.bar.type);
});

test('a token can also be a string', () => {
  const container = new Container();
  container.set(Tokens.simple, 123);

  // When using a string token, it's recommended to also explicitly set the
  // type to ensure TypeScript can do its thing. Otherwise, the returned type
  // will be `any`.
  assert.is(container.get<number>(Tokens.simple), 123);
});

test('always get a new instance', () => {
  const container = new Container();
  container.set(Tokens.foo, () => new Foo());

  assert.ok(
    !Object.is(container.get(Tokens.foo), container.create(Tokens.foo))
  );

  assert.ok(
    !Object.is(container.create(Tokens.foo), container.create(Tokens.foo))
  );
});

const provider = (container: Container) => {
  container.set(Tokens.foo, () => new Foo());
};

test('register via provider', () => {
  const container = new Container();
  container.register(provider);
  assert.ok(container.get(Tokens.foo) instanceof Foo);
});

test('setting same token will clear previous instance', () => {
  const container = new Container();

  container.set(Tokens.foo, () => new Foo());
  const firstInstance = container.get(Tokens.foo);
  container.set(Tokens.foo, () => new Foo());
  const secondInstance = container.get(Tokens.foo);

  assert.ok(!Object.is(firstInstance, secondInstance));
});

test('configuring dependencies', () => {
  const container = new Container();
  container
    .set(Tokens.foo, () => new Foo())
    .set(Tokens.bar, (c) => new Bar(c.get(Tokens.foo)));

  const bar = container.get(Tokens.bar);
  assert.ok(bar instanceof Bar);
});

test('throws if no match is found', () => {
  const container = new Container();
  const unknownToken = createToken('unknown');
  assert.throws(() => container.get(unknownToken));
});

test('async factory is allowed', async () => {
  const container = new Container();
  container.set(Tokens.asyncFoo, () => Promise.resolve(new Foo()));
  const foo = await container.get(Tokens.asyncFoo);
  assert.ok(foo instanceof Foo);
});

test('verify if a factory has been registered', () => {
  const container = new Container();
  assert.ok(!container.has(Tokens.foo));
  container.set(Tokens.foo, () => new Foo());
  assert.ok(container.has(Tokens.foo));
});

test('delete factory', () => {
  const container = new Container();
  container.set(Tokens.foo, () => new Foo());
  assert.ok(container.has(Tokens.foo));
  container.delete(Tokens.foo);
  assert.ok(!container.has(Tokens.foo));
});

test('clear all factories and instances', () => {
  const container = new Container();
  container.set(Tokens.foo, () => new Foo());
  container.set(Tokens.bar, (c) => new Bar(c.get(Tokens.foo)));
  assert.ok(container.has(Tokens.foo));
  assert.ok(container.has(Tokens.bar));
  container.clear();
  assert.ok(!container.has(Tokens.foo));
  assert.ok(!container.has(Tokens.bar));
});

test.run();
