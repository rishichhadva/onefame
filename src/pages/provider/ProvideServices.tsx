import React, { useState } from 'react';

const ProvideServices = () => {
  const [offering, setOffering] = useState('');
  const [desc, setDesc] = useState('');
  const [category, setCategory] = useState('');
  const [price, setPrice] = useState('');
  const [location, setLocation] = useState('');
  const [contactInfo, setContactInfo] = useState('');
  const [popup, setPopup] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPopup('');
    // TODO: Connect to backend API to save offering
    setPopup('Offering posted!');
    setOffering('');
    setDesc('');
    setCategory('');
    setPrice('');
    setLocation('');
    setContactInfo('');
  };

  return (
    <div className="max-w-xl mx-auto mt-10 p-6 bg-white rounded-xl shadow">
      <h2 className="text-3xl font-bold mb-6 text-blue-700">Post a New Offering</h2>
      <form className="space-y-4" onSubmit={handleSubmit}>
        <input type="text" value={offering} onChange={e => setOffering(e.target.value)} placeholder="Offering Title" className="w-full px-6 py-4 border-2 border-blue-200 rounded-2xl focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 text-lg transition-all" />
        <textarea value={desc} onChange={e => setDesc(e.target.value)} placeholder="Offering Description" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" rows={4} />
        <input type="text" value={category} onChange={e => setCategory(e.target.value)} placeholder="Category" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
        <input type="number" value={price} onChange={e => setPrice(e.target.value)} placeholder="Price" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
        <input type="text" value={location} onChange={e => setLocation(e.target.value)} placeholder="Location" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
        <input type="text" value={contactInfo} onChange={e => setContactInfo(e.target.value)} placeholder="Contact Info" className="w-full px-4 py-2 border-2 border-pink-200 rounded-xl focus:outline-none focus:border-pink-500" />
        <button type="submit" className="w-full py-2 bg-pink-600 text-white rounded-full font-bold shadow hover:bg-pink-700 transition">Post Offering</button>
        {popup && <div className="mt-2 text-center px-4 py-2 rounded-xl bg-green-100 text-green-700">{popup}</div>}
      </form>
    </div>
  );
};

export default ProvideServices;
