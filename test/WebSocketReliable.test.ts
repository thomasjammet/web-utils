/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */

import { test, expect, afterAll, beforeAll, describe } from '@jest/globals';
import WebSocket, { WebSocketServer } from 'ws';
import { WebSocketReliable } from '../index';

let wss: WebSocketServer;

// Polyfill WebSocket in global
class WebSocketPolyfill extends WebSocket {
    constructor(url: string) {
        super(url, { rejectUnauthorized: false }); // allow unprocted servers
        // Node.js does not handle the event 'error' like the browser
        // if not handled the error will throw an exception in a thread and stop the process
        this.onerror = error => {
            console.log('WebSocket error :', error.message);
        };
    }
}
Object.defineProperty(global, 'WebSocket', { value: WebSocketPolyfill });

// Start a WebSocket server
beforeAll(async () => {
    wss = new WebSocketServer({ port: 8900 });
    wss.on('connection', (ws, request) => {
        ws.on('message', message => {
            ws.send(message);
        });
    });
    return new Promise(resolve =>
        wss.on('listening', () => {
            console.log('WebSocket server started');
            resolve(true);
        })
    );
});

// Close the WebSocket server
afterAll(async () => {
    return new Promise(resolve =>
        wss.close(() => {
            console.log('WebSocket server closed');
            resolve(true);
        })
    );
});

// WebSocket states
const WebSocketStates = {
    CONNECTING: 0,
    OPEN: 1,
    CLOSING: 2,
    CLOSED: 3
};

test('Unknown host', async () => {
    const ws = new WebSocketReliable();
    await new Promise(resolve => {
        ws.onClose = (error?: string) => {
            resolve(true);
        };
        ws.open('ws://localhost:65535');
    });
    expect(ws.closed).toBeTruthy();
});

describe('Connections', () => {
    const ws = new WebSocketReliable();

    test('Simple connection', async () => {
        expect(ws.url).toBe('');
        expect(ws.readyState).toBe(WebSocketStates.CLOSED);

        ws.open('ws://localhost:8900');
        expect(ws.url).toBe('ws://localhost:8900/');
        expect(ws.readyState).toBe(WebSocketStates.CONNECTING);
        await new Promise(resolve =>
            ws.on('open', () => {
                resolve(true);
            })
        );
        expect(ws.readyState).toBe(WebSocketStates.OPEN);

        await new Promise(resolve => {
            ws.on('close', () => {
                resolve(true);
            });
            ws.close();
        });
        expect(ws.closed).toBeTruthy();
    });

    test('Reconnection', async () => {
        ws.open('ws://localhost:8900');
        await new Promise(resolve =>
            ws.on('open', () => {
                resolve(true);
            })
        );
        expect(ws.readyState).toBe(WebSocketStates.OPEN);

        ws.close();
        expect(ws.closed).toBeTruthy();
    });
});
