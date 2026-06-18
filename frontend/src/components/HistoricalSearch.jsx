import React from 'react';
import SearchCity from './SearchCity';

const HistoricalSearch = ({ onSelectCity }) => {
  return (
    <div className="w-full">
      <SearchCity onSelectCity={onSelectCity} />
    </div>
  );
};

export default HistoricalSearch;
