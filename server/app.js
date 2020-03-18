const SummarizerManager = require('node-summarizer').SummarizerManager;
const { getIndex, postIndex } = require('./controllers/index');
const expressSanitizer = require('express-sanitizer');
const helmet = require('helmet');
const compression = require('compression');
const extract = require('sentence-extractor').extract;
const express = require('express');
const path = require('path');
const summaryRatios = [5, 10, 20, 30, 40, 50, 60, 70, 80];

const app = express();

const PORT = process.env.PORT || 3000;

// Set view configs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

//Compress all routes
app.use(compression());

// Set HTTP security headers
app.use(helmet());

// Sanitize request's body (prevent XSS attack...)
app.use(expressSanitizer());

// Make our assets from public folder available
app.use(express.static(path.join(__dirname, 'public')));

// Parse data from incoming request (form submission)
app.use(express.urlencoded({ extended: true }));

app.get('/', getIndex);

app.post('/', (req, res) => {
  const textToSummarize = req.body.text.trim();
  const summaryRatio = req.body['summary-ratio'].trim();
  // const outputType = req.body.output.trim();

  console.log(req.body);
  if (!textToSummarize) return res.redirect('/');

  const numOfSentences = getNumOfSenctencesInSummary(
    textToSummarize,
    summaryRatio
  );

  let output = generateOutput(textToSummarize, numOfSentences);

  res.render('index', {
    summaryRatios,
    output
  });
});

function generateOutput(textToSummarize, numOfSentences) {
  const summarizer = new SummarizerManager(textToSummarize, numOfSentences);

  const {
    summary: summarizedText
    // weighted_map: keywords
  } = summarizer.getSummaryByFrequency();

  if (summarizedText instanceof Error) {
    return 'Your text already seems sufficiently summarized.';
  }

  return summarizedText;
}

function getNumOfSenctencesInSummary(text, ratio) {
  const totalNumOfSentences = extract(text).length;
  const numOfSentencesInSummary = Math.floor(
    (Number(ratio) / 100) * totalNumOfSentences
  );

  return numOfSentencesInSummary;
}

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
