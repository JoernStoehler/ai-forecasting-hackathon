/**
 * ShareButton - Upload game state and share via link or Twitter
 */
import React, { useState } from 'react';
import type { EngineEvent } from '@/engine';
import { uploadShare, generateTweetText, openTwitterShare } from '@/services/shareService';
import { Icon } from './icons';

interface ShareButtonProps {
  events: EngineEvent[];
  isGameOver: boolean;
  className?: string;
}

type ShareState = 'idle' | 'uploading' | 'success' | 'error';

export const ShareButton: React.FC<ShareButtonProps> = ({ events, isGameOver, className = '' }) => {
  const [state, setState] = useState<ShareState>('idle');
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [showPopup, setShowPopup] = useState(false);

  const handleShare = async () => {
    setState('uploading');
    setError(null);

    try {
      const result = await uploadShare(events);
      setShareUrl(result.url);
      setState('success');
      setShowPopup(true);
    } catch (err) {
      setState('error');
      setError(err instanceof Error ? err.message : 'Failed to share');
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleTweet = () => {
    if (!shareUrl) return;
    const text = generateTweetText(shareUrl, isGameOver);
    openTwitterShare(text);
  };

  const handleClose = () => {
    setShowPopup(false);
    setState('idle');
  };

  return (
    <div className="relative">
      <button
        onClick={handleShare}
        disabled={state === 'uploading'}
        className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-colors
          ${state === 'uploading'
            ? 'bg-stone-300 dark:bg-stone-600 cursor-wait'
            : 'bg-blue-600 hover:bg-blue-700 text-white'}
          ${className}`}
      >
        {state === 'uploading' ? (
          <>
            <Icon name="Loader2" className="w-4 h-4 animate-spin" />
            Sharing...
          </>
        ) : (
          <>
            <Icon name="Share2" className="w-4 h-4" />
            Share
          </>
        )}
      </button>

      {/* Error toast */}
      {state === 'error' && error && (
        <div className="absolute top-full mt-2 left-0 right-0 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 text-red-800 dark:text-red-200 px-3 py-2 rounded-lg text-sm">
          {error}
        </div>
      )}

      {/* Success popup */}
      {showPopup && shareUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-stone-800 rounded-xl shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-stone-900 dark:text-stone-100">
                Share your game
              </h3>
              <button
                onClick={handleClose}
                className="text-stone-400 hover:text-stone-600 dark:hover:text-stone-300"
              >
                <Icon name="X" className="w-5 h-5" />
              </button>
            </div>

            {/* URL display */}
            <div className="bg-stone-100 dark:bg-stone-700 rounded-lg p-3 mb-4">
              <p className="text-sm text-stone-600 dark:text-stone-300 break-all font-mono">
                {shareUrl}
              </p>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleCopy}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-stone-200 dark:bg-stone-600 hover:bg-stone-300 dark:hover:bg-stone-500 text-stone-800 dark:text-stone-100 rounded-lg font-medium transition-colors"
              >
                <Icon name={copied ? 'Check' : 'Copy'} className="w-4 h-4" />
                {copied ? 'Copied!' : 'Copy link'}
              </button>
              <button
                onClick={handleTweet}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-sky-500 hover:bg-sky-600 text-white rounded-lg font-medium transition-colors"
              >
                <Icon name="ExternalLink" className="w-4 h-4" />
                Tweet
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
