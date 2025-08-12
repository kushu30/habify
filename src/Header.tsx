import React from 'react';

export const Header = () => {
  return (
    <header className="p-4 bg-white dark:bg-dark-surface shadow-md">
      <div className="container mx-auto flex justify-between items-center">
        <h1 className="text-2xl font-bold text-primary">Habify</h1>
        {React.createElement('w3m-button')}
      </div>
    </header>
  );
};