import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowLeft, Camera, Image as ImageIcon, Flashlight } from "lucide-react";
import { useState } from "react";

export default function ScanQR() {
  const navigate = useNavigate();
  const [flashOn, setFlashOn] = useState(false);

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="absolute top-0 left-0 right-0 z-10 px-6 py-4">
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(-1)}
            className="p-2 bg-black/30 backdrop-blur-sm rounded-full hover:bg-black/50 transition-colors"
          >
            <ArrowLeft className="w-6 h-6 text-white" />
          </button>
          <h1 className="text-lg font-bold text-white">Scanner un QR Code</h1>
          <button
            onClick={() => setFlashOn(!flashOn)}
            className={`p-2 backdrop-blur-sm rounded-full transition-colors ${
              flashOn ? "bg-yellow-500" : "bg-black/30 hover:bg-black/50"
            }`}
          >
            <Flashlight className="w-6 h-6 text-white" />
          </button>
        </div>
      </div>

      {/* Camera View */}
      <div className="relative h-screen flex items-center justify-center">
        {/* Simulated camera view */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="absolute inset-0 opacity-20">
            <div className="w-full h-full bg-gradient-to-br from-emerald-500/20 to-purple-500/20" />
          </div>
        </div>

        {/* Scan Frame */}
        <div className="relative z-10">
          <div className="w-72 h-72 relative">
            {/* Corner borders */}
            <div className="absolute top-0 left-0 w-12 h-12 border-t-4 border-l-4 border-emerald-500 rounded-tl-2xl" />
            <div className="absolute top-0 right-0 w-12 h-12 border-t-4 border-r-4 border-emerald-500 rounded-tr-2xl" />
            <div className="absolute bottom-0 left-0 w-12 h-12 border-b-4 border-l-4 border-emerald-500 rounded-bl-2xl" />
            <div className="absolute bottom-0 right-0 w-12 h-12 border-b-4 border-r-4 border-emerald-500 rounded-br-2xl" />

            {/* Scanning line animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="w-full h-1 bg-gradient-to-r from-transparent via-emerald-500 to-transparent animate-pulse" />
            </div>
          </div>

          <p className="text-white text-center mt-8 text-sm">
            Placez le QR code dans le cadre
          </p>
        </div>
      </div>

      {/* Bottom Actions */}
      <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
        <Button
          variant="outline"
          className="w-full h-14 bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 rounded-xl"
        >
          <ImageIcon className="w-5 h-5 mr-2" />
          Choisir depuis la galerie
        </Button>

        <div className="bg-black/30 backdrop-blur-sm rounded-xl p-4">
          <p className="text-white/80 text-xs text-center">
            Vous pouvez aussi scanner un QR code depuis une photo
          </p>
        </div>
      </div>
    </div>
  );
}
