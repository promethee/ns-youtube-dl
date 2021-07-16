const { config } = require('../package.json');
const fs = require('fs');
const { send } = require('micro');
const ytdl = require('ytdl-core');

const { save_directory = './files' } = config;

module.exports.GET = async (req, res) => {
  let result = { statusCode: 202, message: '' };
  const { params } = req;
  const { id = '' } = params;
  if (id.length === 0) result = { statusCode: 404, message: 'missing video id' };

  const url = `http://www.youtube.com/watch?v=${id}`;
  const info = id.length ? await ytdl.getBasicInfo(url) : {};
  const { videoDetails = { title: '', keywords: [] } } = info;
  const { title = '', keywords = [] } = videoDetails;
  if (title.length === 0) result = { statusCode: 424, message: 'video has no title' };

  const filePrefix = `${save_directory}/${title.split(' ').join('_')}`;
  const videoFilename = `${filePrefix}/video.mp4`;
  const keywordsFilename = `${filePrefix}/keywords.json`;
  if (!fs.existsSync(filePrefix)) fs.mkdirSync(filePrefix);

  const videoExists = fs.existsSync(videoFilename);
  const keywordsExists = fs.existsSync(keywordsFilename);
  const alreadyDownloaded = [videoExists, keywordsExists].every((assertion) => assertion === true);
  const partiallyDownloaded = !alreadyDownloaded && (videoExists || keywordsExists);
  if (alreadyDownloaded) result = { statusCode: 204, message: 'video has already been downloaded' };
  result.statusCode = partiallyDownloaded ? 206 : 202;
  // @ts-ignore
  result.message = videoDetails;

  ytdl(url).pipe(fs.createWriteStream(videoFilename));
  fs.writeFileSync(keywordsFilename, JSON.stringify(keywords), 'utf8');
  send(res, result.statusCode, result.message);
};
