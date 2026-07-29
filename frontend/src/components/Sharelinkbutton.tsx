import { useState } from "react";
import { generateShareLink, revokeShareLink } from "../services/shareApi";

interface Props {
  mealPlanId: number;
}

export default function ShareLinkButton({ mealPlanId }: Props) {
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [showPanel, setShowPanel] = useState(false);

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const token = await generateShareLink(mealPlanId);
      const url = `${window.location.origin}/share/${token}`;
      setShareUrl(url);
      setShowPanel(true);
    } catch {
      alert("Failed to generate share link. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    if (!shareUrl) return;
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRevoke = async () => {
    if (!confirm("Revoke this link? Anyone with the link will lose access."))
      return;
    setLoading(true);
    try {
      await revokeShareLink(mealPlanId);
      setShareUrl(null);
      setShowPanel(false);
    } catch {
      alert("Failed to revoke link.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={showPanel ? () => setShowPanel(false) : handleGenerate}
        disabled={loading}
        className="flex items-center gap-2 bg-gray-200"
      >
        {/* Link icon */}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101
                   m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        {loading ? "Generating…" : "Share"}
      </button>

      {showPanel && shareUrl && (
        <div className="absolute right-0 mt-2 w-96 bg-white border border-gray-200 rounded-lg shadow-lg p-4 z-50">
          <p className="text-sm font-semibold text-gray-700 mb-2">
            Read-only share link
          </p>

          {/* URL display + copy */}
          <div className="flex items-center gap-2 mb-3">
            <input
              readOnly
              value={shareUrl}
              className="flex-1 border border-gray-300 rounded px-2 py-1.5 bg-gray-50 truncate"
            />
            <button
              onClick={handleCopy}
              className="shrink-0 bg-blue-600 text-white text-xs px-3 py-1.5 rounded hover:bg-blue-700"
            >
              {copied ? "Copied!" : "Copy"}
            </button>
          </div>

          <p className="text-xs text-gray-500 mb-3">
            Anyone with this link can view and download a PDF of the meal plan.
            No login required.
          </p>

          <button
            onClick={handleRevoke}
            className="text-xs text-red-600 hover:text-red-800 underline"
          >
            Revoke link
          </button>
        </div>
      )}
    </div>
  );
}
