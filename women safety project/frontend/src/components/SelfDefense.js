import React, { useState } from 'react';
import '../styles/SelfDefense.css';

function SelfDefense() {
  const [selectedVideo, setSelectedVideo] = useState(null);

  const videos = [
    {
      id: 1,
      title: 'Basic Self Defense Techniques for Women',
      videoId: 'KVpxP3ZZtAc',
      description: 'Learn essential self-defense moves that every woman should know'
    },
    {
      id: 2,
      title: 'How to Escape Common Attacks',
      videoId: 'T7aNSRoDCmg',
      description: 'Practical techniques to escape from dangerous situations'
    },
    {
      id: 3,
      title: 'Self Defense Against Grabs and Holds',
      videoId: 'Kt_JI7pRHYg',
      description: 'Effective ways to break free from grabs and holds'
    },
    {
      id: 4,
      title: 'Street Safety and Awareness Tips',
      videoId: 'guWfMYJ2Wz8',
      description: 'Stay safe with these awareness and prevention strategies'
    },
    {
      id: 5,
      title: 'Pepper Spray Training and Usage',
      videoId: 'Hs_4RnNJ8Dw',
      description: 'How to properly use pepper spray for self-defense'
    },
    {
      id: 6,
      title: 'Krav Maga for Women - Basic Moves',
      videoId: 'z2fJ1GcJV_4',
      description: 'Learn powerful Krav Maga techniques for self-protection'
    }
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const closeVideo = () => {
    setSelectedVideo(null);
  };

  return (
    <div className="self-defense-container">
      <div className="self-defense-header">
        <h2>🥋 Self Defense Training</h2>
        <p className="subtitle">Learn essential self-defense techniques to protect yourself</p>
      </div>

      <div className="video-grid">
        {videos.map((video) => (
          <div
            key={video.id}
            className="video-card"
            onClick={() => handleVideoClick(video)}
          >
            <div className="video-thumbnail">
              <img
                src={`https://img.youtube.com/vi/${video.videoId}/maxresdefault.jpg`}
                alt={video.title}
                onError={(e) => {
                  e.target.src = `https://img.youtube.com/vi/${video.videoId}/hqdefault.jpg`;
                }}
              />
              <div className="play-overlay">
                <div className="play-button">▶</div>
              </div>
            </div>
            <div className="video-info">
              <h3>{video.title}</h3>
              <p>{video.description}</p>
            </div>
          </div>
        ))}
      </div>

      {selectedVideo && (
        <div className="video-modal-overlay" onClick={closeVideo}>
          <div className="video-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-button" onClick={closeVideo}>✕</button>
            <h3>{selectedVideo.title}</h3>
            <div className="video-wrapper">
              <iframe
                src={`https://www.youtube.com/embed/${selectedVideo.videoId}?autoplay=1`}
                title={selectedVideo.title}
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              ></iframe>
            </div>
            <p className="video-description">{selectedVideo.description}</p>
          </div>
        </div>
      )}

      <div className="safety-tips">
        <h3>💡 Important Safety Tips</h3>
        <ul>
          <li>Always be aware of your surroundings</li>
          <li>Trust your instincts - if something feels wrong, it probably is</li>
          <li>Keep your phone charged and easily accessible</li>
          <li>Walk confidently and avoid looking distracted</li>
          <li>Practice these techniques regularly to build muscle memory</li>
          <li>Consider taking a formal self-defense class in your area</li>
        </ul>
      </div>
    </div>
  );
}

export default SelfDefense;
