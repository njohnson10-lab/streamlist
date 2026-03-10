import React, { useState } from 'react';

// The Form Component utilizing props
function StreamListForm({ placeholderText, buttonText }) {
  const [inputValue, setInputValue] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("StreamList Entry Added:", inputValue);
    setInputValue(''); // Clears the input field after logging
  };

  return (
    <form onSubmit={handleSubmit} className="stream-form">
      <input
        type="text"
        value={inputValue}
        onChange={(e) => setInputValue(e.target.value)}
        placeholder={placeholderText}
        required
      />
      <button type="submit">
        <span className="material-symbols-outlined">add_circle</span> {buttonText}
      </button>
    </form>
  );
}

// The Main Home Component
export default function Home() {
  return (
    <div className="page">
      <h1>My StreamList</h1>
      <p>Enter a movie or program you want to watch to add it to your cloud list.</p>
      <StreamListForm placeholderText="Type a movie title..." buttonText="Add to List" />
    </div>
  );
}