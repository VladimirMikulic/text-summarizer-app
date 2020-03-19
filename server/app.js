// Modules
const path = require('path');
const helmet = require('helmet');
const express = require('express');
const compression = require('compression');
const expressSanitizer = require('express-sanitizer');
const { getIndex, postIndex } = require('./controllers/index');

const app = express();
const PORT = process.env.PORT || 3000;

// Set view configs
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Compress all routes (enable GZIP)
app.use(compression());

// Set HTTP security headers
app.use(helmet());

// Sanitize request's body (prevent XSS attack...)
app.use(expressSanitizer());

// Make our assets from public folder available on /
app.use(express.static(path.join(__dirname, 'public')));

// Parse data from incoming requests (form submission)
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', getIndex);
app.post('/', postIndex);

// Start the server
app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
