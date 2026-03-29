import React from 'react';
import { Star } from 'lucide-react';

const RatingStars = ({ rating, maxRating = 5, size = 20, interactive = false, onRatingChange = null }) => {
  const [hoverRating, setHoverRating] = React.useState(0);
  const [selectedRating, setSelectedRating] = React.useState(rating || 0);

  const handleClick = (value) => {
    if (interactive) {
      setSelectedRating(value);
      if (onRatingChange) {
        onRatingChange(value);
      }
    }
  };

  const handleMouseEnter = (value) => {
    if (interactive) {
      setHoverRating(value);
    }
  };

  const handleMouseLeave = () => {
    if (interactive) {
      setHoverRating(0);
    }
  };

  const displayRating = interactive ? (hoverRating || selectedRating) : rating;

  return (
    <div className="flex items-center gap-1">
      {[...Array(maxRating)].map((_, index) => {
        const value = index + 1;
        const isFilled = value <= displayRating;
        
        return (
          <Star
            key={index}
            size={size}
            className={`${
              isFilled ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            } ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : ''}`}
            onClick={() => handleClick(value)}
            onMouseEnter={() => handleMouseEnter(value)}
            onMouseLeave={handleMouseLeave}
          />
        );
      })}
      {!interactive && rating && (
        <span className="text-sm font-bold text-gray-700 ml-1">
          {rating.toFixed(1)}
        </span>
      )}
    </div>
  );
};

export default RatingStars;
