const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const pg = require('../../lib/pg.js');
const initDb = require('../../bin/init-db.js');

describe('bin/init-db.js', () => {
  let originalQuery, queries, dir;

  beforeEach(() => {
    originalQuery = pg.query;
    queries = [];
    pg.query = async (sql) => queries.push(sql);
    dir = fs.mkdtempSync(path.join(os.tmpdir(), 'init-db-'));
  });

  afterEach(() => {
    pg.query = originalQuery;
    fs.rmSync(dir, { recursive: true, force: true });
  });

  it('applies .sql files in filename order', async () => {
    fs.writeFileSync(path.join(dir, '004-b.sql'), 'select 4;');
    fs.writeFileSync(path.join(dir, '003-a.sql'), 'select 3;');
    fs.writeFileSync(path.join(dir, 'notes.txt'), 'ignored');

    let files = await initDb({ initDir: dir });

    assert.deepEqual(files, ['003-a.sql', '004-b.sql']);
    assert.deepEqual(queries, ['select 3;', 'select 4;']);
  });

  it('throws when there are no .sql files', async () => {
    await assert.rejects(() => initDb({ initDir: dir }), /No .sql files/);
  });

  it('defaults to the bundled init/postgres files', async () => {
    let files = await initDb();
    assert.ok(files.includes('004-app-config-edits.sql'));
  });
});
