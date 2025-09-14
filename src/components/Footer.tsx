
import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-nft-dark-purple/20 py-10 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link to="/" className="flex items-center space-x-2 mb-4">
              <span className="font-bold text-2xl text-white">
                Mozaic<span className="text-nft-purple">Dot</span>
              </span>
            </Link>
            <p className="text-gray-400 max-w-xs">
              Create, mint, and trade AI-generated NFTs on the Polkadot ecosystem.
            </p>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Platform</h3>
            <ul className="space-y-2">
              <li><Link to="/gallery" className="text-gray-400 hover:text-white">Gallery</Link></li>
              <li><Link to="/create" className="text-gray-400 hover:text-white">Create</Link></li>
              <li><Link to="/categories" className="text-gray-400 hover:text-white">Categories</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Resources</h3>
            <ul className="space-y-2">
              <li><Link to="/faq" className="text-gray-400 hover:text-white">FAQ</Link></li>
              <li><Link to="/docs" className="text-gray-400 hover:text-white">Documentation</Link></li>
              <li><Link to="/guides" className="text-gray-400 hover:text-white">Guides</Link></li>
            </ul>
          </div>
          
          <div>
            <h3 className="font-semibold text-lg mb-4">Connect</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-400 hover:text-white">Twitter</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Discord</a></li>
              <li><a href="#" className="text-gray-400 hover:text-white">Telegram</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-nft-dark-purple/20 mt-10 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400">© 2025 MozaicDot. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <Link to="/terms" className="text-gray-400 hover:text-white">Terms</Link>
            <Link to="/privacy" className="text-gray-400 hover:text-white">Privacy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
