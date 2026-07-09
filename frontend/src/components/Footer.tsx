import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer className="w-full bg-transparent p-6 text-gray-400 text-sm flex justify-between items-center">
      <p>&copy; 2026 Get Solid Set. All rights reserved.</p>
      <div className="flex space-x-4">
        <Link to="/privacy" className="hover:text-gray-600 transition-colors">
          Privacy Policy
        </Link>
        <Link to="/terms" className="hover:text-gray-600 transition-colors">
          Terms of Service
        </Link>
      </div>
    </footer>
  );
}

export default Footer;
