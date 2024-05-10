#!/usr/bin/env node

/**
 * Copyright 2024 Ceeblue B.V.
 * This file is part of https://github.com/CeeblueTV/web-utils which is released under GNU Affero General Public License.
 * See file LICENSE or go to https://spdx.org/licenses/AGPL-3.0-or-later.html for full license details.
 */

// eslint-disable-next-line headers/header-format
import path from 'path';
import http from 'http';
import fs from 'fs';
import { WebSocketServer } from 'ws';
import yargs from 'yargs';

import {} from './polyfills.js';
import {} from './UtilTest.js';
import { SERVER_PORT } from './WebSocketReliableTest.js';
import { tests } from '../dist/web-utils.js';

const arg = process.argv.slice(2);

// Read arguments
let argv = yargs(arg)
    .usage('\nUsage : $0 [options]')
    .example(
        '$0 test/unit-tests.js --web=true --run=UtilTest --loop=2',
        'Publish a stream with SCTE35 events every 12 seconds'
    )
    .string('run')
    .describe('run', 'The test to run, it can be the index or the name of the test')
    .default('run', 'all', 'run all tests')
    .number('loop')
    .describe('loop', 'The additional number of times to run the tests')
    .default('loop', 0)
    .boolean('web')
    .describe('web', 'Run the tests in a browser')
    .default('web', false)
    .help('h')
    .alias('h', 'help')
    .strictOptions(true)
    .wrap(null).argv;

const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.png': 'image/png',
    '.jpg': 'image/jpg'
};

console.log(path.basename(process.argv[1]), 'Running tests ...');

// Run the tests
async function runTests() {
    console.info('Starting test ' + argv.run + ' ' + (argv.loop + 1) + ' times');

    // Else run at start (loop+1 times)
    for (let test = 0; test <= argv.loop; ++test) {
        if (argv.run.toUpperCase() === 'ALL') {
            console.log('Running all tests!');
            for (const test of tests) {
                await test();
            }
        } else {
            let index = parseInt(argv.run);
            if (!isNaN(index)) {
                // search by index
                if (index < tests.length) {
                    await tests[index]();
                } else {
                    console.error('Unable to find test ' + index);
                }
            } else {
                // search by name
                for (index = 0; index < tests.length; ++index) {
                    if (tests[index].name === argv.run) {
                        await tests[index]();
                        break;
                    }
                }
                if (index === tests.length) {
                    console.error('Unable to find test ' + argv.run);
                }
            }
        }
    }
}

// Start an HTTPS server to run the tests inside a browser
async function startHTTPServer() {
    const server = http.createServer((req, res) => {
        // Remove the first / from the url
        const file = req.url.substring(1);
        fs.readFile(file, (err, data) => {
            if (err) {
                res.writeHead(404);
                res.end(JSON.stringify(err));
                return;
            }
            res.writeHead(200, { 'Content-Type': mimeTypes[path.extname(file)] || 'application/octet-stream' });
            res.end(data);
        });
    });

    // Add websocket support to run WebSocketReliableTest from web and Node.js
    const wsServer = new WebSocketServer({ server });
    wsServer.on('error', err => {
        console.error('WebSocketServer error:', err);
    });
    wsServer.on('connection', socket => {
        socket.send('Hello Ceeblue!'); // Send a message to the client
    });

    await new Promise(resolve => {
        wsServer.on('listening', () => {
            console.log('WebSocketServer listening on port', server.address().port);
            resolve();
        });
        server.on('listening', () => {
            console.log('HTTPServer listening on port', server.address().port);
            if (argv.web) {
                console.info('Open your browser at http://localhost:' + server.address().port + '/test/unit.html');
            }
        });

        server.listen(SERVER_PORT);
    });

    // Listen to signals
    process.on('SIGINT', () => {
        console.log('Shutting down server ...');
        server.close();
        process.exit(0);
    });
}

// Main function
async function main() {
    await startHTTPServer();

    if (!argv.web) {
        await runTests();
        console.info('End of the tests!');
        process.exit(0);
    }
}

main();
