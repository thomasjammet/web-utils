/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */
import WebSocket from 'ws';

// To support self-signed servers
class WebSocketPolyfill extends WebSocket {
    constructor(url) {
        super(url, { rejectUnauthorized: false }); // allow unprocted servers
        // Node.js does not handle the event 'error' like the browser
        // if not handled the error will throw an exception in a thread and stop the process
        this.onerror = error => {
            console.error(error.message);
        };
    }
}

// Import WebSocket globally for WebSocketReliable to run in node.js
global.WebSocket = WebSocketPolyfill;
