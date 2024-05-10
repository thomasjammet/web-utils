/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */

import { test, expect } from '@jest/globals';

import { Util } from '../index';

test('Util test', async () => {
    expect(Util.stringify({ a: 1 })).toEqual('{ a:1.00 }');
    expect(Util.stringify({ a: 1 }, { decimal: 0 })).toEqual('{ a:1 }');
    expect(Util.stringify({ a: 1 }, { space: '  ' })).toEqual('{  a:1.00  }');

    const complexObject = { a: 1, b: { c: 2 } };
    expect(Util.stringify(complexObject)).toEqual('{ a:1.00, b:[object Object] }');
    expect(Util.stringify(complexObject, { recursion: 2 })).toEqual('{ a:1.00, b:{ c:2.00 } }');
    const binary = new Uint8Array([60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70]);
    expect(Util.stringify(binary)).toEqual('<=>?@ABCDEF');
    expect(Util.stringify(binary, { noBin: true })).toEqual('[11#bytes]');
});
