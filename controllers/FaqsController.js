import FAQ from '../models/faqs.js';

export const getFaqs = async (req, res) => {
  try {
    console.log('GET /api/admin/faqs - Fetching all FAQs');
    
    const faqs = await FAQ.find().sort({ category: 1, order: 1 });
    console.log('Database query result:', faqs.length, 'FAQs found');
    
    res.status(200).json({
      success: true,
      faqs: faqs,
      total: faqs.length
    });
    
    console.log('Response sent successfully');
  } catch (error) {
    console.error('Error fetching FAQs:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to fetch FAQs',
      error: error.message 
    });
  }
};

export const createFaq = async (req, res) => {
  try {
    console.log('POST /api/admin/faqs - Request body:', req.body);
    
    const { question, answer, category, order, isActive } = req.body;
    
    if (!question || !answer || !category) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Question, answer, and category are required' 
      });
    }
    
    if (order) {
      const existingFaq = await FAQ.findOne({ category, order });
      if (existingFaq) {
        console.log('Order conflict detected, adjusting orders...');
        await FAQ.updateMany(
          { category, order: { $gte: order } },
          { $inc: { order: 1 } }
        );
      }
    } else {
      const maxOrder = await FAQ.findOne({ category }).sort({ order: -1 });
      req.body.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    const newFaq = new FAQ({
      question: question.trim(),
      answer: answer.trim(),
      category,
      order: req.body.order,
      isActive: isActive !== undefined ? isActive : true
    });
    
    const savedFaq = await newFaq.save();
    console.log('FAQ created successfully:', savedFaq);
    
    res.status(201).json({ 
      success: true,
      message: 'FAQ created successfully', 
      faq: savedFaq
    });
    
  } catch (error) {
    console.error('Error creating FAQ:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to create FAQ',
      error: error.message 
    });
  }
};

export const updateFaq = async (req, res) => {
  try {
    console.log('PUT /api/admin/faqs/:id - Request params:', req.params);
    console.log('PUT /api/admin/faqs/:id - Request body:', req.body);
    
    const { id } = req.params;
    const { question, answer, category, order, isActive } = req.body;
    
    if (!question || !answer || !category) {
      console.log('Validation failed: Missing required fields');
      return res.status(400).json({ 
        success: false,
        message: 'Question, answer, and category are required' 
      });
    }
    
    const existingFaq = await FAQ.findById(id);
    if (!existingFaq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    if (order && order !== existingFaq.order) {
      if (category === existingFaq.category) {
        if (order > existingFaq.order) {
          await FAQ.updateMany(
            { 
              category, 
              order: { $gt: existingFaq.order, $lte: order },
              _id: { $ne: id }
            },
            { $inc: { order: -1 } }
          );
        } else {
          await FAQ.updateMany(
            { 
              category, 
              order: { $gte: order, $lt: existingFaq.order },
              _id: { $ne: id }
            },
            { $inc: { order: 1 } }
          );
        }
      } else {
        await FAQ.updateMany(
          { category: existingFaq.category, order: { $gt: existingFaq.order } },
          { $inc: { order: -1 } }
        );
        await FAQ.updateMany(
          { category, order: { $gte: order } },
          { $inc: { order: 1 } }
        );
      }
    } else if (category !== existingFaq.category) {
      await FAQ.updateMany(
        { category: existingFaq.category, order: { $gt: existingFaq.order } },
        { $inc: { order: -1 } }
      );
      const maxOrder = await FAQ.findOne({ category }).sort({ order: -1 });
      req.body.order = maxOrder ? maxOrder.order + 1 : 1;
    }
    
    const updatedFaq = await FAQ.findByIdAndUpdate(
      id,
      {
        question: question.trim(),
        answer: answer.trim(),
        category,
        order: req.body.order || existingFaq.order,
        isActive: isActive !== undefined ? isActive : existingFaq.isActive
      },
      { new: true, runValidators: true }
    );
    
    console.log('FAQ updated successfully:', updatedFaq);
    
    res.status(200).json({ 
      success: true,
      message: 'FAQ updated successfully', 
      faq: updatedFaq
    });
    
  } catch (error) {
    console.error('Error updating FAQ:', error);
    
    if (error.name === 'ValidationError') {
      return res.status(400).json({
        success: false,
        message: 'Validation error',
        error: error.message
      });
    }
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid FAQ ID'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to update FAQ',
      error: error.message 
    });
  }
};

export const deleteFaq = async (req, res) => {
  try {
    console.log('DELETE /api/admin/faqs/:id - Request params:', req.params);
    
    const { id } = req.params;
    
    const faq = await FAQ.findById(id);
    if (!faq) {
      return res.status(404).json({
        success: false,
        message: 'FAQ not found'
      });
    }
    
    await FAQ.findByIdAndDelete(id);
    
    await FAQ.updateMany(
      { category: faq.category, order: { $gt: faq.order } },
      { $inc: { order: -1 } }
    );
    
    console.log('FAQ deleted successfully');
    
    res.status(200).json({ 
      success: true,
      message: 'FAQ deleted successfully'
    });
    
  } catch (error) {
    console.error('Error deleting FAQ:', error);
    
    if (error.name === 'CastError') {
      return res.status(400).json({
        success: false,
        message: 'Invalid FAQ ID'
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: 'Failed to delete FAQ',
      error: error.message 
    });
  }
};