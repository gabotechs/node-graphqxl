const https = require("https")
const zlib = require("zlib")
const path = require("path")
const fs = require("fs/promises")

const operationSystem = process.platform
const architecture = process.arch

const packageJson = require('./package.json')
const version = packageJson.version

const BIN_PATH = path.join(__dirname, "graphqxl")

const archOs2Url = {
    'darwin': {
        'x64': `https://github.com/gabotechs/graphqxl/releases/download/v${version}/graphqxl-x86_64-apple-darwin.tar.gz`,
        'arm64': `https://github.com/gabotechs/graphqxl/releases/download/v${version}/graphqxl-aarch64-apple-darwin.tar.gz`
    },
    'linux': {
        'x64': `https://github.com/gabotechs/graphqxl/releases/download/v${version}/graphqxl-x86_64-unknown-linux-gnu.tar.gz`,
        'arm64': `https://github.com/gabotechs/graphqxl/releases/download/v${version}/graphqxl-aarch64-unknown-linux-gnu.tar.gz`
    }
}

/**
 * @param {string} url
 * @returns {Promise<Buffer>}
 */
function fetch(url) {
    return new Promise((resolve, reject) => {
        https
            .get(url, (res) => {
                if (
                    (res.statusCode === 301 || res.statusCode === 302) &&
                    res.headers.location
                )
                    return fetch(res.headers.location).then(resolve, reject)
                if (res.statusCode !== 200)
                    return reject(new Error(`Server responded with ${res.statusCode}`))
                const chunks = []
                res.on("data", (chunk) => chunks.push(chunk))
                res.on("end", () => resolve(Buffer.concat(chunks)))
            })
            .on("error", reject)
    });
}

/**
 * @param {Buffer} buffer
 * @param {string} subpath
 * @returns {Buffer}
 */
function extractFileFromTarGzip(buffer, subpath) {
    try {
        buffer = zlib.unzipSync(buffer);
    } catch (err) {
        throw new Error(
            `Invalid gzip data in archive: ${(err && err.message) || err}`
        );
    }
    let str = (i, n) =>
        String.fromCharCode(...buffer.subarray(i, i + n)).replace(/\0.*$/, "");
    let offset = 0;
    while (offset < buffer.length) {
        let name = str(offset, 100);
        let size = parseInt(str(offset + 124, 12), 8);
        offset += 512;
        if (!isNaN(size)) {
            if (name === subpath) return buffer.subarray(offset, offset + size);
            offset += (size + 511) & ~511;
        }
    }
    throw new Error(`Could not find ${JSON.stringify(subpath)} in archive`);
}

async function install() {
    const releasedTarUrl = archOs2Url[operationSystem]?.[architecture]

    if (releasedTarUrl === undefined) {
        console.error(`${operationSystem}-${architecture} is not supported`)
        process.exit(1)
    }

    console.log("Downloading graphqxl release from", releasedTarUrl)
    let binBuffer = await fetch(releasedTarUrl)
    binBuffer = extractFileFromTarGzip(binBuffer, "graphqxl")
    await fs.writeFile(BIN_PATH, binBuffer)
    await fs.chmod(BIN_PATH, 0o755);

}

install().catch(err => {
    console.error(err)
    process.exit(1)
})
