const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server.js'); // Import your Express app

chai.use(chaiHttp);

suite('Functional Tests', function() {
  test('GET /api/stock-prices/ for a single symbol without a like', function(done) {
    chai
    .request(server)
    .keepOpen()
    .get('/api/stock-prices/?stock=AAPL&like=false')
    .end((err, res) => {
      assert.equal(res.status, 200);
      assert.property(res.body, 'stockData');
      assert.property(res.body.stockData, 'stock');
      assert.property(res.body.stockData, 'price');
      assert.property(res.body.stockData, 'likes');
    done();
    });

  });

  test('GET /api/stock-prices/ for a single symbol with a like', function(done) {
    chai
    .request(server)
    .keepOpen()
    .get('/api/stock-prices/?stock=AAPL&like=true')
    .end((err, res) => {
      assert.equal(res.status, 200);
      assert.property(res.body, 'stockData');
      assert.property(res.body.stockData, 'stock');
      assert.property(res.body.stockData, 'price');
      assert.property(res.body.stockData, 'likes');
      done();
    });

  });
  test('GET /api/stock-prices for an invalid symbol', function(done) {
    chai
    .request(server)
    .keepOpen()
    .get('/api/stock-prices/?stock=FXRD&like=true')
    .end((err, res) => {
      assert.equal(res.status, 200)
      assert.property(res.body, 'stockData');
      assert.property(res.body.stockData, 'error');
      assert.property(res.body.stockData, 'likes');
      done();
    });
  });

  test('GET /api/stock-prices for two stocks with a like', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices?stock=AAPL&stock=MSFT&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
  
        for (const stock of res.body.stockData) {
          assert.property(stock, 'stock');
          assert.property(stock, 'price');
          assert.property(stock, 'rel_likes');
        }
  
        done();
      });
  });
  
  test('GET /api/stock-prices for two stocks without a like', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices/?stock=AAPL&stock=MSFT&like=false')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
  
        for (const stock of res.body.stockData) {
          assert.property(stock, 'stock');
          assert.property(stock, 'price');
          assert.property(stock, 'rel_likes');
        }
  
        done();
      });
  });

  test('GET /api/stock-prices for two stocks with one incorrect symbol and a like', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices?stock=AAPL&stock=INVALID&like=true')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
  
        // Check the first stock (valid symbol)
        const validStock = res.body.stockData[0];
        assert.property(validStock, 'stock');
        assert.property(validStock, 'price');
        assert.property(validStock, 'rel_likes');
  
        // Check the second stock (invalid symbol)
        const invalidStock = res.body.stockData[1];
        assert.property(invalidStock, 'error');
        assert.property(invalidStock, 'rel_likes');
  
        done();
      });
  });
  
  test('GET /api/stock-prices for two stocks with one incorrect symbol and without a like', function (done) {
    chai
      .request(server)
      .keepOpen()
      .get('/api/stock-prices?stock=AAPL&stock=INVALID&like=false')
      .end((err, res) => {
        assert.equal(res.status, 200);
        assert.property(res.body, 'stockData');
        assert.isArray(res.body.stockData);
        assert.equal(res.body.stockData.length, 2);
  
        // Check the first stock (valid symbol)
        const validStock = res.body.stockData[0];
        assert.property(validStock, 'stock');
        assert.property(validStock, 'price');
        assert.property(validStock, 'rel_likes');
  
        // Check the second stock (invalid symbol)
        const invalidStock = res.body.stockData[1];
        assert.property(invalidStock, 'error');
        assert.property(invalidStock, 'rel_likes');
  
      done();
      });
  });
  
  
  });

