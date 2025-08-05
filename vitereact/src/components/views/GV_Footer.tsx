import React from 'react';
import { Link } from 'react-router-dom';

const GV_Footer: React.FC = () => {
  return (
    <>
      <footer className="bg-gray-800 text-white py-4">
        <div className="container mx-auto flex justify-between items-center">
          <div className="flex space-x-4">
            <Link to="/help" className="text-sm hover:underline focus:outline-none focus:ring">
              Help
            </Link>
            <Link to="/support" className="text-sm hover:underline focus:outline-none focus:ring">
              Support
            </Link>
          </div>
          <div className="flex space-x-4">
            <Link to="/terms" className="text-sm hover:underline focus:outline-none focus:ring">
              Terms of Service
            </Link>
            <Link to="/privacy" className="text-sm hover:underline focus:outline-none focus:ring">
              Privacy Policy
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
};

export default GV_Footer;