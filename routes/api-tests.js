// ...

app.post('/likeStock', async (req, res) => {
    try {
      const { ip, likedStock, like } = req.body;
  
      // Hash the user's IP using bcrypt
      const hashedIP = await hashIP(ip);
  
      // Connect to the MongoDB database
      const db = await connectToDB();
  
      // Check if the user liked the stock before updating the database
      if (like) {
        const success = await addUserIP(db, hashedIP, likedStock);
  
        if (success) {
          res.status(200).json({ message: 'User liked the stock and added to the database.' });
        } else {
          res.status(500).json({ error: 'Failed to update the database.' });
        }
      } else {
        res.status(200).json({ message: 'User did not like the stock. Database not updated.' });
      }
    } catch (error) {
      console.error('Error in /likeStock:', error.message);
      res.status(500).json({ error: 'Internal Server Error' });
    }
  });
  
  // ...
  