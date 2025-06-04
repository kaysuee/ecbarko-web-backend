import mongoose from "mongoose";

const HomeSchema = new mongoose.Schema({

  homeTestimonial: {
    type: [
      {
        image: { type: String, default: '' },
        name: { type: String, default: 'Name' },
        testimonial: { type: String, default: 'Comment' }
      }
    ],
    default: [
      { image: '', name: 'Name 1', testimonial: 'Comment' },
      { image: '', name: 'Name 2', testimonial: 'Comment' },
      { image: '', name: 'Name 3', testimonial: 'Comment' },
      { image: '', name: 'Name 3', testimonial: 'Comment' },
      { image: '', name: 'Name 4', testimonial: 'Comment' }
    ]
  },

  homeFAQs: {
    type: [
      {
        question: { type: String, default: 'Question' },
        answer: { type: String, default: 'Answer' }
      }
    ],
    default: [
      { question: 'Question 1', answer: 'This is the answer to question 1.' },
      { question: 'Question 2', answer: 'Here is some info for question 2.' },
      { question: 'Question 3', answer: 'Answer for question 3 goes here.' },
      { question: 'Question 4', answer: 'This is the answer for question 4.' }
    ]
  }
  
});

export default mongoose.model("Home", HomeSchema);
