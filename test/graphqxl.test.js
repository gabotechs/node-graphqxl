const path = require('path')
const childProcess = require('child_process')
const fs = require('fs/promises')
const {expect} = require("chai");

const BIN = path.join(__dirname, "..", "bin", "graphqxl")
const TEST_FILE = path.join(__dirname, "test.graphqxl")
const EXPECTED_FILE = path.join(__dirname, "expected.graphql")
const RESULT_FILE = path.join(__dirname, "result.graphql")

describe('GraphQXL', function () {
    it('should compile to graphql', async function () {
        const p = childProcess.spawn('node', [BIN, TEST_FILE, '--output', RESULT_FILE], { stdio: "inherit" })
        await new Promise((resolve, reject) => {
            p.on('exit', (code) => {
                if (code === 0) {
                    resolve()
                } else {
                    reject(new Error(`Received code ${code ?? 'unknown'}`))
                }
            })
            p.on('error', reject)
        })
        const result = await fs.readFile(RESULT_FILE)
        const expected = await fs.readFile(EXPECTED_FILE)
        expect(result.toString()).equal(expected.toString())
    });
});
