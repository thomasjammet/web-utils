/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */
import * as Util from './Util.js';

export class Tests extends Array {
    static instance: Tests | undefined = undefined;

    constructor() {
        super();
    }

    create(name: string, ...tests: Function[]) {
        const testHandler = async function (onFail: Function | undefined = undefined) {
            const exception = new Function(`
				return class ${name}Error extends Error {
					constructor(error) {
						super(error);
					}
				}
			`)();

            let timer: NodeJS.Timeout;
            function error(...params: string[]) {
                clearTimeout(timer);
                const error = params.join(' ');
                if (onFail) {
                    onFail(error);
                }
                throw new exception(error);
            }
            function assert(condition: Function) {
                if (condition()) {
                    return;
                }
                let expression = condition.toString().trimStart().trimEnd();
                if (expression[0] === '{') {
                    expression = expression.substring(1, expression.length - 2); // remove last '}'
                } else {
                    const header = expression.indexOf('=>');
                    if (header > 0) {
                        expression = expression.substring(header + 2).trimStart();
                    }
                }
                error(expression);
            }

            async function run(test: Function) {
                // eslint-disable-next-line no-async-promise-executor
                return new Promise(async resolve => {
                    let called = false;
                    const done = (warn = undefined) => {
                        if (!done) {
                            return;
                        }
                        called = true;
                        clearTimeout(timer);
                        if (warn) {
                            console.warn('\t' + test.name, 'NOK,', warn);
                            resolve(false);
                        } else {
                            resolve(true);
                        }
                    };
                    const result = await test(
                        assert,
                        (...params: string[]) => {
                            if (!done) {
                                return;
                            }
                            error(...params);
                        },
                        done
                    );
                    // if test==null it means done() has already been called! no timeout need!
                    if (called) {
                        return;
                    }
                    if (result && !isNaN(result)) {
                        timer = setTimeout(() => error(name + '::' + test.name, 'timeout'), result);
                        return;
                    }
                    done();
                });
            }

            console.info('Test ' + name + ' running...');

            const begin = Util.time();
            if (tests.length > 1) {
                const test = tests.find(t => t.name.charAt(0) === '_');
                if (test) {
                    Object.defineProperty(test, 'name', { value: test.name.substr(1) });
                    tests = [test];
                }
                let skip;
                for (const currentTest of tests) {
                    const start = Util.time();
                    if (skip && currentTest.name.startsWith(skip)) {
                        continue;
                    }
                    if (await run(currentTest)) {
                        console.info('\t' + currentTest.name, 'OK (elapsed :', Util.time() - start, 'milliseconds)');
                    } else {
                        skip = currentTest.name;
                    }
                }
            } else {
                await run(tests[0]);
            }

            console.info('Test ' + name + ' OK! (elapsed :', Util.time() - begin, 'milliseconds)');
        };
        Object.defineProperty(testHandler, 'name', { value: name, writable: false });
        this.push(testHandler);
    }
}

export const tests = Tests.instance || (Tests.instance = new Tests());
