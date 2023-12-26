'use strict';
const { connectToDB, addUserIP, getStockLikes, hashIP } = require('../connector.js');
const requestIp = require('request-ip');
module.exports = function (app) {
  app.use(requestIp.mw());
  app.get('/api/stock-prices/test', async (req, res) => {
    try {
      let userSymbols = req.query.stock;
      const like = req.query.like;
      let likes = 0;
  
      // Check if it's an array or a single string
      if (!Array.isArray(userSymbols)) {
        // If it's a single string, convert it to an array
        userSymbols = [userSymbols];
      }
  
      // Check if it's a single symbol or two symbols
      if (userSymbols.length === 1) {
        // Single stock symbol
        const userSymbol = userSymbols[0];
        const externalApiUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${userSymbol}/quote`;
  
        const externalApiResponse = await fetch(externalApiUrl);
        const externalApiData = await externalApiResponse.json();
        if (externalApiData.symbol !== undefined) {
          // Process the data as usual
        
          if (like === true) {
            likes += 1;
          }
        
          const processedData = {
            stockData: {
              stock: userSymbol.toUpperCase(),
              price: externalApiData.latestPrice,
              likes: likes
            }
          };
        
          res.json(processedData);
        } else {
          // Handle the case where the symbol is invalid
          const processedData = {
            stockData: {
              error: "Invalid symbol",
              likes: likes
            }
          };
        
          res.json(processedData);
        }
      } else if (userSymbols.length === 2) {
        // Two stock symbols
        const companyOne = userSymbols[0].toLowerCase();
        const companyTwo = userSymbols[1].toLowerCase();
  
        const externalApiUrl_1 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${companyOne}/quote`;
        const externalApiUrl_2 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${companyTwo}/quote`;
  
        const [externalApiResponse_1, externalApiResponse_2] = await Promise.all([
          fetch(externalApiUrl_1),
          fetch(externalApiUrl_2)
        ]);
  
        const [externalApiData_1, externalApiData_2] = await Promise.all([
          externalApiResponse_1.json(),
          externalApiResponse_2.json()
        ]);
  
        if (like === true) {
          likes += 1;
        }
  
        let processedData;
        if (externalApiData_1.symbol === undefined) {
          processedData = {
            stockData: [
              {
                error: "invalid symbol",
                rel_likes: likes
              },
              {
                stock: externalApiData_2.symbol,
                price: externalApiData_2.latestPrice,
                rel_likes: likes,
              }
            ]
          }
        } else if (externalApiData_2.symbol === undefined) {
          processedData = {
            stockData: [
              {
                stock: externalApiData_1.symbol,
                price: externalApiData_1.latestPrice,
                rel_likes: likes,
              },
              {
                error: "invalid symbol",
                rel_likes: likes,
              }
            ]
          }
        } else {
          processedData = {
            stockData: [
              {
                stock: externalApiData_1.symbol,
                price: externalApiData_1.latestPrice,
                rel_likes: likes,
              },
              {
                stock: externalApiData_2.symbol,
                price: externalApiData_2.latestPrice,
                rel_likes: likes,
              }
            ]
          };
        }
        res.json(processedData);
      } else {
        // Handle other cases or provide an error response
        res.status(400).json({ error: 'Invalid number of stock symbols' });
      }
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  app.get('/api/stock-prices/', async (req, res) => {
    try {
      let userSymbols = req.query.stock;
      const like = req.query.like;
      const db = await connectToDB();
      let ip = req.clientIp;
      const hashedIP = await hashIP(ip);
  
      // Check if it's an array or a single string
      if (!Array.isArray(userSymbols)) {
        // If it's a single string, convert it to an array
        userSymbols = [userSymbols];
      }
  
      // Check if it's a single symbol or two symbols
      if (userSymbols.length === 1) {
        // Single stock symbol
        const userSymbol = userSymbols[0];
        const externalApiUrl = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${userSymbol}/quote`;
  
        const externalApiResponse = await fetch(externalApiUrl);
        const externalApiData = await externalApiResponse.json();
        if (externalApiData.symbol !== undefined) {
          let likes = await getStockLikes(db, userSymbols);
          // Process the data as usual
          if (like) {
            const hashedIP = await hashIP(ip);
            const success = await addUserIP(db, hashedIP, userSymbols);
            likes = likes + 1;
          }
          const processedData = {
            stockData: {
              stock: userSymbol.toUpperCase(),
              price: externalApiData.latestPrice,
              likes: likes
            }
          };
        
          res.json(processedData);
        } else {
          // Handle the case where the symbol is invalid
          const processedData = {
            stockData: {
              error: "Invalid symbol",
              likes: 0
            }
          };
        
          res.json(processedData);
        }
      } else if (userSymbols.length === 2) {
        // Two stock symbols
        const companyOne = userSymbols[0].toLowerCase();
        const companyTwo = userSymbols[1].toLowerCase();
  
        const externalApiUrl_1 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${companyOne}/quote`;
        const externalApiUrl_2 = `https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${companyTwo}/quote`;
  
        const [externalApiResponse_1, externalApiResponse_2] = await Promise.all([
          fetch(externalApiUrl_1),
          fetch(externalApiUrl_2)
        ]);
  
        const [externalApiData_1, externalApiData_2] = await Promise.all([
          externalApiResponse_1.json(),
          externalApiResponse_2.json()
        ]);
        let likes_1 = await getStockLikes(db, companyOne);
        let likes_2 = await getStockLikes(db, companyTwo);
  
        if (like === true) {
          const hashedIP = await hashIP(ip);
          let success = await addUserIP(ip, hashedIP, [companyOne, companyTwo]);
          likes_1++;
          likes_2++;
        }
  
        let processedData;
        if (externalApiData_1.symbol === undefined) {
          processedData = {
            stockData: [
              {
                error: "invalid symbol",
                rel_likes: likes_1 - likes_2
              },
              {
                stock: externalApiData_2.symbol,
                price: externalApiData_2.latestPrice,
                rel_likes: likes_2 - likes_1,
              }
            ]
          }
        } else if (externalApiData_2.symbol === undefined) {
          processedData = {
            stockData: [
              {
                stock: externalApiData_1.symbol,
                price: externalApiData_1.latestPrice,
                rel_likes: likes_1 - likes_2,
              },
              {
                error: "invalid symbol",
                rel_likes: likes_2 - likes_1,
              }
            ]
          }
        } else {
          processedData = {
            stockData: [
              {
                stock: externalApiData_1.symbol,
                price: externalApiData_1.latestPrice,
                rel_likes: likes_1 - likes_2,
              },
              {
                stock: externalApiData_2.symbol,
                price: externalApiData_2.latestPrice,
                rel_likes: likes_1 - likes_2,
              }
            ]
          };
        }
        res.json(processedData);
      } else {
        // Handle other cases or provide an error response
        res.status(400).json({ error: 'Invalid number of stock symbols' });
      }
    } catch (error) {
      console.error("Error:", error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
    
};
