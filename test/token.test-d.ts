import { expectNotType, expectType } from "tsd";
import { createToken, Token } from "../src/index";

class Type {}

const t2 = createToken("type", Type);

expectType<Token<Type>>(t2);
expectNotType<Token<unknown>>(t2);
expectType<Token<string>>(createToken("token", String));
expectType<Token<unknown>>(createToken("unknown"));
expectType<Token<Type>>(createToken<Type>("type"));
expectType<Token<Type>>(createToken<Type>("type"));
expectType<Token<Type>>(createToken<Type>("type"));
expectType<Token<Type>>(createToken("type", Type));
expectType<Token<number>>(createToken("number", 0));
expectType<Token<bigint>>(createToken("bigint", 0n));
expectType<Token<number>>(createToken("number", Number));
expectType<Token<boolean>>(createToken("boolean", Boolean));
expectType<Token<symbol>>(createToken("symbol", Symbol));
expectType<Token<Date>>(createToken("date", Date));
expectType<Token<RegExp>>(createToken("regexp", RegExp));
expectType<Token<Type>>(createToken("type", Type));
expectType<Token<Map<string, string>>>(createToken("map", Map<string, string>));
expectType<Token<Set<string>>>(createToken("set", Set<string>));
