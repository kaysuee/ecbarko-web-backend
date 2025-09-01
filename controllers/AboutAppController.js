import AboutApp from '../models/aboutApp.js';

// GET /api/admin/aboutapp
export const getAboutAppContent = async (req, res) => {
  try {
    console.log('GET /api/admin/aboutapp - Fetching about app content');
    
    let aboutApp = await AboutApp.findOne();
    console.log('Database query result:', aboutApp);
    
    // If no document exists, create a default one
    if (!aboutApp) {
      console.log('No existing about app document found, creating default');
      aboutApp = new AboutApp({ 
        aboutText: "Welcome to our mobile app! This app provides convenient access to our transportation services." 
      });
      await aboutApp.save();
      console.log('Default about app document created:', aboutApp);
    }
    
    res.status(200).json({
      success: true,
      aboutText: aboutApp.aboutText,
      _id: aboutApp._id,
      updatedAt: aboutApp.updatedAt
    });
    
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error fetching about app content:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch about app content',
      error: error.message 
    });
  }
};

// PUT /api/admin/aboutapp
export const updateAboutAppContent = async (req, res) => {
  try {
    console.log('PUT /api/admin/aboutapp - Request body:', req.body);
    
    const { aboutText } = req.body;
    
    // Validate input
    if (!aboutText || typeof aboutText !== 'string' || !aboutText.trim()) {
      console.log('Validation failed: aboutText is required');
      return res.status(400).json({ 
        success: false,
        message: 'About text is required and cannot be empty' 
      });
    }
    
    // Trim whitespace
    const cleanAboutText = aboutText.trim();
    
    let aboutApp = await AboutApp.findOne();
    console.log('Existing document:', aboutApp);
    
    if (!aboutApp) {
      // Create new document if none exists
      console.log('Creating new about app document');
      aboutApp = new AboutApp({ aboutText: cleanAboutText });
    } else {
      // Update existing document
      console.log('Updating existing document');
      aboutApp.aboutText = cleanAboutText;
    }
    
    // Save the document
    const savedDocument = await aboutApp.save();
    console.log('Document saved successfully:', savedDocument);
    
    res.status(200).json({ 
      success: true,
      message: 'About app content updated successfully', 
      aboutApp: {
        _id: savedDocument._id,
        aboutText: savedDocument.aboutText,
        updatedAt: savedDocument.updatedAt
      }
    });
    
  } catch (error) {
    console.error('Error updating about app content:', error);
    console.error('Full error object:', JSON.stringify(error, null, 2));
    
    // Handle specific MongoDB errors
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    if (error.name === 'MongoError' || error.name === 'MongoServerError') {
      return res.status(500).json({
        success: false,
        message: 'Database error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update about app content',
      error: error.message 
    });
  }
};