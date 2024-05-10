/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */

import { Util, tests } from '../dist/web-utils.js';

function Stringify(assert, error, done) {
    assert(() => Util.stringify({ a: 1 }) === '{ a:1.00 }');

    assert(() => Util.stringify({ a: 1 }, { decimal: 0 }) === '{ a:1 }');

    assert(() => Util.stringify({ a: 1 }, { space: '  ' }) === '{  a:1.00  }');

    const complexObject = { a: 1, b: { c: 2 } };
    assert(() => Util.stringify(complexObject) === '{ a:1.00, b:[object Object] }');
    assert(() => Util.stringify(complexObject, { recursive: 2 }) === '{ a:1.00, b:{ c:2.00 } }');

    const binary = new Uint8Array([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]);
    assert(() => Util.stringify(binary) === '<=>?@ABCDEF');
    assert(() => Util.stringify(binary, { noBin: true }) === '[11#bytes]');
}

tests.create('Util', Stringify);
