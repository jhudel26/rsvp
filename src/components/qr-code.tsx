"use client";

import { QRCodeSVG } from "qrcode.react";
import { Download, Share2 } from "lucide-react";
import { useState } from "react";

interface QRCodeProps {
  value: string;
  size?: number;
  eventName?: string;
}

export function QRCode({ value, size = 200, eventName }: QRCodeProps) {
  const [showDownload, setShowDownload] = useState(false);

  const downloadQR = () => {
    const svg = document.getElementById("qr-code-svg");
    if (!svg) return;

    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    const img = new Image();

    img.onload = () => {
      canvas.width = size;
      canvas.height = size;
      ctx?.drawImage(img, 0, 0);
      const pngFile = canvas.toDataURL("image/png");
      const downloadLink = document.createElement("a");
      downloadLink.download = `${eventName || "qr-code"}.png`;
      downloadLink.href = pngFile;
      downloadLink.click();
    };

    img.src = "data:image/svg+xml;base64," + btoa(svgData);
  };

  const shareQR = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: eventName || "Event RSVP",
          text: `RSVP for ${eventName || "this event"}`,
          url: value,
        });
      } catch (err) {
        console.log("Share failed:", err);
      }
    } else {
      navigator.clipboard.writeText(value);
      alert("Link copied to clipboard!");
    }
  };

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="p-4 bg-white rounded-lg shadow-sm">
        <QRCodeSVG id="qr-code-svg" value={value} size={size} level="H" includeMargin />
      </div>

      <div className="flex gap-2">
        <button
          onClick={downloadQR}
          className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>

        <button
          onClick={shareQR}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors"
        >
          <Share2 className="w-4 h-4" />
          Share
        </button>
      </div>
    </div>
  );
}
