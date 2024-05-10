/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */

export { BinaryReader } from './src/BinaryReader';
export { BinaryWriter } from './src/BinaryWriter';
export { BitReader } from './src/BitReader';
export { ByteRate } from './src/ByteRate';
export * as Connect from './src/Connect';
export { EventEmitter } from './src/EventEmitter';
export { FixMap } from './src/FixMap';
export { ILog } from './src/ILog';
export { NetAddress } from './src/NetAddress';
export { Numbers } from './src/Numbers';
export { Queue } from './src//Queue';
export { SDP } from './src/SDP';
export { tests } from './src/Tests';
export * as Util from './src/Util';
export { WebSocketReliable } from './src/WebSocketReliable';

const __lib__version__ = '?'; // will be replaced on building by project version

export const VERSION: string = __lib__version__;
