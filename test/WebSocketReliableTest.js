/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */

import { WebSocketReliable, tests } from '../dist/web-utils.js';

export const SERVER_PORT = 8088;

// WebSocket states
const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

async function UnknowHost(assert, error, done) {
    const ws = new WebSocketReliable();
    await new Promise(resolve => {
        ws.onClose = error => {
            resolve(true);
        };
        ws.open('ws://localhost:65535');
    });
    assert(() => ws.closed);
}

async function Message(assert, error, done) {
    const ws = new WebSocketReliable();

    ws.open('ws://localhost:' + SERVER_PORT);
    assert(() => ws.url === 'ws://localhost:' + SERVER_PORT + '/');
    assert(() => ws.readyState === WebSocketStates.CONNECTING);
    ws.onMessage = buf => {
        assert(() => buf === 'Hello Ceeblue!');
        ws.send(new Uint8Array(0xffff));
        ws.close();
        done();
    };
    return 1000; // let the time to connect and exchange the message
}

async function Connections(assert, error, done) {
    const ws = new WebSocketReliable();

    ws.open('ws://localhost:' + SERVER_PORT);
    assert(() => ws.url === 'ws://localhost:' + SERVER_PORT + '/');
    assert(() => ws.readyState === WebSocketStates.CONNECTING);
    await new Promise(resolve =>
        ws.on('open', () => {
            resolve(true);
        })
    );
    assert(() => ws.readyState);

    await new Promise(resolve => {
        ws.on('close', () => {
            resolve(true);
        });
        ws.close();
    });
    assert(() => ws.closed);

    ws.open('ws://localhost:' + SERVER_PORT);
    await new Promise(resolve =>
        ws.on('open', () => {
            resolve(true);
        })
    );
    assert(() => ws.readyState === WebSocketStates.OPEN);

    await new Promise(resolve => {
        ws.on('close', () => {
            resolve(true);
        });
        ws.close();
    });
    assert(() => ws.closed);
}

tests.create('WebSocketReliable', UnknowHost, Message, Connections);
