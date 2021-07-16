const { config } = require('./package.json');
const fs = require('fs');
const { send } = require('micro');
let match = require('fs-router')(__dirname + '/routes');

const { save_directory = 'files' } = config;

const mkSaveDirectory = (current, next, _) => {
  const directory = `${current}/${next}`;
  if (current.length > 1 && !fs.existsSync(current)) fs.mkdirSync(`${current}`);
  if (!fs.existsSync(directory)) fs.mkdirSync(directory);
  console.info(`existing or created: "${directory}"`);
  return directory;
};

const _directory = save_directory.includes('./') ? save_directory : `./${save_directory}`;
const directory_chunks = _directory.split('/');
const cleaned_chunks = directory_chunks.filter((directory) => directory.length);
cleaned_chunks.reduce(mkSaveDirectory);

module.exports = async (req, res) => {
  let matched = match(req);
  if (matched) return await matched(req, res);
  send(res, 404, { error: 'Not found' });
};
