rm -rf dist &&
tsc ||
cp src/vis/template.html dist/vis/ &&
cp src/vis/plotly-min.js dist/vis/ &&
cp src/creds.json dist &&
cp src/gdax-creds.json dist
