exports.getIndex = (req, res) => {
  const summaryRatios = [5, 10, 20, 30, 40, 50, 60, 70, 80];
  res.render('index', { summaryRatios, output: null });
};

exports.postIndex = (req, res) => {};
