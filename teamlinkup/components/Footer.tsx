
import React from 'react';
import { APP_NAME } from '../constants';

const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-700 text-white text-center p-4 mt-auto">
      <p>&copy; {new Date().getFullYear()} {APP_NAME}. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
