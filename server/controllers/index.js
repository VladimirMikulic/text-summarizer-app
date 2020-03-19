// Modules
const axios = require('axios').default;
const stripHtml = require('string-strip-html');
const extract = require('sentence-extractor').extract;
const SummarizerManager = require('node-summarizer').SummarizerManager;

// Available summary ratios for the user to select
const summaryRatios = [5, 10, 20, 30, 40, 50, 60, 70, 80];

/**
 * Generate summarized text
 * @param  {String} textToSummarize
 * @param  {Number} numOfSentences
 * @return {String} Summarized text
 */
function generateOutput(textToSummarize, numOfSentences) {
  const summarizer = new SummarizerManager(textToSummarize, numOfSentences);
  const summarizedText = summarizer.getSummaryByFrequency().summary;

  if (summarizedText instanceof Error) {
    return 'Your text already seems sufficiently summarized.';
  }

  return summarizedText;
}

/**
 * Calculate number of sentences in summary based on ratio
 * @param  {String} text Text that contains sentences
 * @param  {Number} ratio Ratio -> percentage
 * @return {Number} The number of sentences that summary should contain
 */
function getNumOfSenctences(text, ratio) {
  const totalNumOfSentences = extract(text).length;
  const numOfSentences = Math.round(
    (Number(ratio) / 100) * totalNumOfSentences
  );

  return numOfSentences;
}

/**
 * Check if URL is valid
 * @param  {String} url URL to check
 * @return {Boolean}
 */
function isValidURL(url) {
  var urlRegex = /(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})/gi;

  return url.match(urlRegex);
}

/**
 * Download data (text) from the URL
 * @param  {String} url URL to fetch text from
 * @return {String} text fetched from the URL
 */
async function getTextFromURL(url) {
  if (!isValidURL(url)) return '';

  try {
    const text = await axios.get(url, { responseType: 'text' });
    return text.data;
  } catch (error) {
    return '';
  }
}

/**
 * Controller for GET /
 * @param {Object} req Data about request
 * @param {Object} res Methods to handle the request
 */
exports.getIndex = (req, res) => {
  res.render('index', { summaryRatios, output: null });
};

/**
 * Controller for POST /
 * @param {Object} req Data about request
 * @param {Object} res Methods to handle the request
 */
exports.postIndex = async (req, res) => {
  let textToSummarize = stripHtml(req.body.text).trim();
  const summaryRatio = req.body['summary-ratio'].trim();

  // If URL is entered
  if (textToSummarize.startsWith('http')) {
    const url = textToSummarize;
    textToSummarize = await getTextFromURL(url);
  }

  // If the user has submitted the empty form
  if (!textToSummarize) return res.redirect('/');

  const numOfSentences = getNumOfSenctences(textToSummarize, summaryRatio);

  const output = generateOutput(textToSummarize, numOfSentences);

  res.render('index', {
    summaryRatios,
    output
  });
};
