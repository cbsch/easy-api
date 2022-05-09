/// <reference types="node" />
import * as https from 'https';
import * as http from 'http';
export default function createSocketServer(httpServer: https.Server | http.Server): void;
