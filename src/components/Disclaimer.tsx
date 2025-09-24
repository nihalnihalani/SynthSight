import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Shield, Github, ExternalLink, Zap, Database, Brain, X } from 'lucide-react';

const Disclaimer: React.FC = () => {
  const [isVisible, setIsVisible] = useState(true);
  const [isExpanded, setIsExpanded] = useState(false);

  if (!isVisible) return null;

  return (
    <div className="bg-gradient-to-r from-slate-900 via-blue-900 to-purple-900 border-b border-slate-700 shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-6">
        {/* Main Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-3">
              <div className="relative">
                <Shield className="h-8 w-8 text-blue-400" />
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse" />
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">GovGuard AI Governance Platform</h2>
                <p className="text-sm text-blue-200">Enterprise-grade AI safety and compliance</p>
              </div>
            </div>
          </div>
          
          <div className="flex items-center space-x-3">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsExpanded(!isExpanded)}
              className="text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-all duration-200 text-white border border-white/20"
            >
              {isExpanded ? 'Show Less' : 'Learn More'}
            </motion.button>
            
            <motion.a
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href="https://github.com/lochan027/govguard"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center space-x-2 text-xs bg-white/10 hover:bg-white/20 backdrop-blur-sm px-3 py-2 rounded-lg transition-all duration-200 text-white border border-white/20"
            >
              <Github className="h-4 w-4" />
              <span>GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </motion.a>
            
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => setIsVisible(false)}
              className="text-white/70 hover:text-white transition-colors p-1"
            >
              <X className="h-5 w-5" />
            </motion.button>
          </div>
        </div>

        {/* Tech Stack Icons */}
        <div className="flex items-center justify-center space-x-8 mb-4">
          <div className="flex items-center space-x-2 text-blue-300">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium">Groq Gemma 2</span>
          </div>
          <div className="flex items-center space-x-2 text-green-300">
            <Database className="h-5 w-5" />
            <span className="text-sm font-medium">Firebase</span>
          </div>
          <div className="flex items-center space-x-2 text-purple-300">
            <Brain className="h-5 w-5" />
            <span className="text-sm font-medium">Multi-Agent AI</span>
          </div>
        </div>

        {/* Expanded Content */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
              className="border-t border-white/20 pt-4 space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                    <Shield className="h-4 w-4 text-blue-400" />
                    <span>AI Safety</span>
                  </h3>
                  <p className="text-sm text-blue-100">
                    Real-time detection of PII, bias, misinformation, and harmful content using advanced multi-agent architecture.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                    <Zap className="h-4 w-4 text-green-400" />
                    <span>Ultra-Fast</span>
                  </h3>
                  <p className="text-sm text-blue-100">
                    Powered by Groq's lightning-fast inference (500+ tokens/sec) with Gemma 2 9B model for production-ready performance.
                  </p>
                </div>
                
                <div className="bg-white/5 backdrop-blur-sm rounded-lg p-4 border border-white/10">
                  <h3 className="font-semibold text-white mb-2 flex items-center space-x-2">
                    <Database className="h-4 w-4 text-purple-400" />
                    <span>Enterprise Ready</span>
                  </h3>
                  <p className="text-sm text-blue-100">
                    Complete audit trails, compliance reporting, and scalable cloud infrastructure for enterprise deployments.
                  </p>
                </div>
              </div>

              <div className="bg-white/5 backdrop-blur-sm border border-blue-400/30 rounded-lg p-4">
                <h3 className="font-semibold text-blue-200 mb-2 flex items-center space-x-2">
                  <span className="text-lg">🛡️</span>
                  <span>Regulatory Compliance Framework</span>
                </h3>
                <p className="text-sm text-amber-100">
                  Comprehensive compliance with GDPR, FISMA, EU AI Act, DSA, NIS2, ISO/IEC 42001, and IEEE Ethics Guidelines.
                  This demonstration platform showcases enterprise-grade AI governance capabilities.
                </p>
                <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                  <div className="bg-white/10 rounded px-2 py-1 text-center">
                    <span className="font-medium text-blue-200">GDPR</span>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-1 text-center">
                    <span className="font-medium text-blue-200">FISMA</span>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-1 text-center">
                    <span className="font-medium text-blue-200">EU AI Act</span>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-1 text-center">
                    <span className="font-medium text-blue-200">DSA</span>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-1 text-center">
                    <span className="font-medium text-blue-200">NIS2</span>
                  </div>
                  <div className="bg-white/10 rounded px-2 py-1 text-center">
                    <span className="font-medium text-blue-200">ISO 42001</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Footer Credits */}
        <div className="flex items-center justify-between text-sm text-blue-200 pt-6 border-t border-white/10 mt-6">
          <div className="flex items-center space-x-4">
            <span>Created by <strong className="text-white">Lochan Acharya</strong></span>
            <span className="text-white/40">•</span>
            <span>Built with React, TypeScript, Groq & Firebase</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>Made with</span>
            <motion.span
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="text-red-400"
            >
              ❤️
            </motion.span>
            <span>for AI Safety</span>
          </div>
        </div>

        {/* Hackathon Project Notice - Only in expanded view */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, delay: 0.2 }}
              className="mt-4 bg-white/5 backdrop-blur-sm border border-amber-400/30 rounded-lg p-4"
            >
              <h3 className="font-semibold text-amber-200 mb-2 flex items-center space-x-2">
                <span className="text-lg">🏆</span>
                <span>Hackathon Project</span>
              </h3>
              <p className="text-sm text-amber-100">
                This repository is currently private during the hackathon period and will be made public after the hackathon concludes. 
                The live demo showcases the full functionality of our enterprise AI governance platform.
              </p>
            </motion.div>
          )}
        </AnimatePresence>

      </div>
    </div>
  );
};

export default Disclaimer;