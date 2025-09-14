import React from 'react';

const Navbar = () => {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="flex items-center justify-between">
        {/* App Name */}
        <h1 className="text-2xl font-bold text-gray-900">MyTeerthYatra</h1>

        {/* Empty Right Section (kept for layout balance) */}
        <div></div>
      </div>
    </header>
  );
};

export default Navbar;
