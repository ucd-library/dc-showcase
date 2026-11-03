const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const cask = require('../../lib/cask.js');
const initCask = require('../../bin/init-cask.js');

describe('bin/init-cask.js', () => {
  let originalExists, originalWrite, existing, writes, dir;

  beforeEach(() => {
    originalExists = cask.exists;
    originalWrite = cask.write;
    existing = new Set();
    writes = [];
    cask.exists = async (filePath) => existing.has(filePath);
    cask.write = async (filePath, body, opts) => writes.push({ filePath, body, opts });

    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-cask-'));
    fs.mkdirSync(path.join(dir, 'hero-banner'));
    fs.writeFileSync(path.join(dir, 'hero-banner.json'), '[]');
    fs.writeFileSync(path.join(dir, 'hero-banner', 'a.jpg'), 'jpg');
    fs.writeFileSync(path.join(dir, '.DS_Store'), 'ignored');
  });

  afterEach(() => {
    cask.exists = originalExists;
    cask.write = originalWrite;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('copies files to the same relative path in the gold project', async () => {
    let result = await initCask({ initDir: dir, goldBasePath: '/gold/digital-test' });

    assert.deepEqual(result.added, ['/gold/digital-test/hero-banner.json', '/gold/digital-test/hero-banner/a.jpg']);
    assert.deepEqual(result.skipped, []);
    assert.deepEqual(writes.map(w => w.opts.mimeType), ['application/json', 'image/jpeg']);
    assert.equal(writes[1].body.toString(), 'jpg');
  });

  it('skips files already in CaskFS', async () => {
    existing.add('/gold/digital-test/hero-banner.json');

    let result = await initCask({ initDir: dir, goldBasePath: '/gold/digital-test' });

    assert.deepEqual(result.skipped, ['/gold/digital-test/hero-banner.json']);
    assert.deepEqual(writes.map(w => w.filePath), ['/gold/digital-test/hero-banner/a.jpg']);
  });

  it('throws when there are no files', async () => {
    let empty = fs.mkdtempSync(path.join(os.tmpdir(), 'init-cask-empty-'));
    try {
      await assert.rejects(() => initCask({ initDir: empty }), /No files/);
    } finally {
      fs.rmSync(empty, { recursive: true, force: true });
    }
  });
});
