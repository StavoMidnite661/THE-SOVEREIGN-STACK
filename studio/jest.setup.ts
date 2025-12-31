// Optional: configure or set up a testing framework before each test
import '@testing-library/jest-dom';
import { TextEncoder, TextDecoder } from 'util';

// @ts-ignore
global.fetch = jest.fn(() => Promise.resolve({
    json: () => Promise.resolve({}),
    text: () => Promise.resolve(""),
    ok: true,
    status: 200
}));

global.TextEncoder = TextEncoder;
// @ts-ignore
global.TextDecoder = TextDecoder;

if (typeof global.Request === 'undefined') {
    // @ts-ignore
    global.Request = class Request {
        constructor(input: any, init: any) {
            return { ...init, url: input };
        }
    }
}

if (typeof global.Response === 'undefined') {
    // @ts-ignore
    global.Response = class Response {
        constructor(body: any, init: any) {
            return { 
                ok: init?.status >= 200 && init?.status < 300, 
                status: init?.status || 200, 
                json: async () => JSON.parse(body),
                text: async () => body 
            };
        }
        static json(data: any, init: any) {
            return {
                ok: true,
                status: init?.status || 200,
                json: async () => data
            }
        }
    }
}