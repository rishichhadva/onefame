
import React from 'react';

const ReviewsPage = () => {
  const [reviews, setReviews] = React.useState([]);
  const [form, setForm] = React.useState({ reviewer: '', reviewee: '', rating: '', comment: '' });

  React.useEffect(() => {
    const fetchReviews = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/reviews');
        setReviews(await res.json());
      } catch {
        setReviews([]);
      }
    };
    fetchReviews();
  }, []);

  const handleChange = e => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    try {
      await fetch('http://localhost:4000/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      });
      setForm({ reviewer: '', reviewee: '', rating: '', comment: '' });
      const res = await fetch('http://localhost:4000/api/reviews');
      setReviews(await res.json());
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-100 p-8 relative">
      <h1 className="text-5xl font-extrabold text-blue-700 mb-12 text-center">Reviews & Ratings</h1>
      <div className="bg-white p-8 rounded-2xl shadow-lg mb-8 max-w-2xl mx-auto">
        <h2 className="text-3xl font-bold text-blue-600 mb-6">Review Submission Form</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input name="reviewer" value={form.reviewer} onChange={handleChange} placeholder="Your Name" className="w-full px-4 py-2 border rounded" required />
          <input name="reviewee" value={form.reviewee} onChange={handleChange} placeholder="Reviewee Name" className="w-full px-4 py-2 border rounded" required />
          <input name="rating" value={form.rating} onChange={handleChange} placeholder="Rating (1-5)" className="w-full px-4 py-2 border rounded" required />
          <textarea name="comment" value={form.comment} onChange={handleChange} placeholder="Comment" className="w-full px-4 py-2 border rounded" required />
          <button type="submit" className="px-8 py-4 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-2xl font-bold shadow-lg hover:from-blue-700 hover:to-cyan-700 transform hover:scale-105 transition-all text-lg">Submit Review</button>
        </form>
      </div>
      <div className="bg-white p-8 rounded-2xl shadow-lg max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-pink-600 mb-4">Display Reviews</h2>
        <div className="space-y-4">
          {reviews.map((r, i) => (
            <div key={i} className="border-b pb-4">
              <div className="font-bold text-pink-700">{r.reviewer} → {r.reviewee}</div>
              <div className="text-yellow-500">Rating: {r.rating} ★</div>
              <div className="text-gray-700">{r.comment}</div>
            </div>
          ))}
        </div>
      </div>
      <a href="/" className="absolute top-6 left-6 text-pink-600 hover:text-pink-800">
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-8 h-8">
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </a>
    </div>
  );
};

export default ReviewsPage;
