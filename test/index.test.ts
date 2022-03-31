import { test } from 'uvu';
import * as assert from 'uvu/assert';
import { Container } from '../src';

class Foo {
  static tag = Symbol('Foo');

  send() {
    // ...
  }
}

class Bar {
  static tag = Symbol('Bar');

  constructor(private readonly foo: Foo) {}

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

test('set factory and get value', () => {
  const container = new Container();
  const key = Symbol();
  const constant = 'constant';
  container.set(key, () => constant);
  assert.equal(container.get(key), constant);
});

test('always the same instance', () => {
  const container = new Container();
  const otherKey = Symbol('foo');

  container.set(Foo.tag, () => new Foo());
  container.set(otherKey, () => new Foo());

  assert.ok(Object.is(container.get(Foo.tag), container.get(Foo.tag)));
  assert.ok(Object.is(container.get(otherKey), container.get(otherKey)));
  assert.ok(!Object.is(container.get(Foo.tag), new Foo()));
  assert.ok(!Object.is(container.get(Foo.tag), container.get(otherKey)));
  assert.ok(container.get(Foo.tag) === container.get(Foo.tag));
  assert.ok(container.get(Foo.tag) !== new Foo());
});

test('always get a new instance', () => {
  const container = new Container();
  const key = Symbol('foo');
  container.set(key, () => new Foo());

  assert.ok(!Object.is(container.get(key), container.create(key)));
  assert.ok(!Object.is(container.create(key), container.create(key)));
});

const provider = (container: Container) => {
  container.set(Foo.tag, () => new Foo());
};

test('register via provider', () => {
  const container = new Container();
  container.register(provider);
  assert.ok(container.get(Foo.tag) instanceof Foo);
});

test('setting same key will clear previous instance', () => {
  const container = new Container();

  container.set(Foo.tag, () => new Foo());
  const firstInstance = container.get<Foo>(Foo.tag);
  container.set(Foo.tag, () => new Foo());
  const secondInstance = container.get<Foo>(Foo.tag);

  assert.ok(!Object.is(firstInstance, secondInstance));
});

test('configuring dependencies', () => {
  const container = new Container();
  container
    .set(Foo.tag, () => new Foo())
    .set(Bar.tag, (c) => new Bar(c.get(Foo.tag)));

  const bar = container.get<Bar>(Bar.tag);
  assert.ok(bar instanceof Bar);
});

test('throws if no match is found', () => {
  const container = new Container();
  assert.throws(() => container.get(Symbol()));
});

test('async factory is allowed', async () => {
  const container = new Container();
  container.set(Foo.tag, () => Promise.resolve(new Foo()));
  const foo = await container.get<Promise<Foo>>(Foo.tag);
  assert.ok(foo instanceof Foo);
});

test('verify if a factory has been registered', () => {
  const container = new Container();
  assert.ok(!container.has(Foo.tag));
  container.set(Foo.tag, () => new Foo());
  assert.ok(container.has(Foo.tag));
});

test('delete factory', () => {
  const container = new Container();
  container.set(Foo.tag, () => new Foo());
  assert.ok(container.has(Foo.tag));
  container.delete(Foo.tag);
  assert.ok(!container.has(Foo.tag));
});

test('clear all factories and instances', () => {
  const container = new Container();
  container.set(Foo.tag, () => new Foo());
  container.set(Bar.tag, (c) => new Bar(c.get(Foo.tag)));
  assert.ok(container.has(Foo.tag));
  assert.ok(container.has(Bar.tag));
  container.clear();
  assert.ok(!container.has(Foo.tag));
  assert.ok(!container.has(Bar.tag));
});

test.run();
