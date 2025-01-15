import { useEffect, useRef, useState } from 'react';

interface CameraPreviewProps {
  onCapture: (imageDataUrl: string) => void;
  onClose: () => void;
}

export function CameraPreview({ onCapture, onClose }: CameraPreviewProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const streamRef = useRef<MediaStream | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load available cameras
  useEffect(() => {
    async function loadCameras() {
      try {
        // First request camera access to get device labels
        const initialStream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = initialStream;

        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        
        if (videoDevices.length === 0) {
          console.error('No cameras found');
          return;
        }

        setDevices(videoDevices);
        
        // Get the previously selected camera or default to the first one
        const savedDeviceId = localStorage.getItem('preferredCamera');
        const defaultDevice = videoDevices.find(d => d.deviceId === savedDeviceId) || videoDevices[0];
        
        if (defaultDevice) {
          setSelectedDeviceId(defaultDevice.deviceId);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading cameras:', error);
        setIsLoading(false);
      }
    }
    loadCameras();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start camera stream when device is selected
  useEffect(() => {
    async function startCamera() {
      if (!selectedDeviceId) return;

      try {
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }

        const constraints: MediaStreamConstraints = {
          video: {
            deviceId: { exact: selectedDeviceId },
            width: { ideal: 1920 },
            height: { ideal: 1080 }
          }
        };

        console.log('Starting camera with constraints:', constraints);
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
          streamRef.current = stream;
          console.log('Camera stream started successfully');
        }
      } catch (error) {
        console.error('Error accessing camera:', error);
      }
    }
    startCamera();
  }, [selectedDeviceId]);

  const handleDeviceChange = (deviceId: string) => {
    console.log('Switching to camera:', deviceId);
    setSelectedDeviceId(deviceId);
    localStorage.setItem('preferredCamera', deviceId);
  };

  const handleCapture = () => {
    if (!videoRef.current || !streamRef.current) {
      console.error('Video element or stream not ready');
      return;
    }

    try {
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        console.error('Could not get canvas context');
        return;
      }

      ctx.drawImage(videoRef.current, 0, 0);
      const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
      
      // Clean up
      streamRef.current.getTracks().forEach(track => track.stop());
      onCapture(imageDataUrl);
      onClose();
    } catch (error) {
      console.error('Error capturing image:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
        <div className="rounded-lg bg-white p-4">
          <p>Loading camera...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-75">
      <div className="relative w-full max-w-lg rounded-lg bg-white p-4">
        <div className="mb-4 flex items-center justify-between">
          <select
            className="rounded border p-2"
            value={selectedDeviceId}
            onChange={(e) => handleDeviceChange(e.target.value)}
          >
            {devices.map((device) => (
              <option key={device.deviceId} value={device.deviceId}>
                {device.label || `Camera ${device.deviceId.slice(0, 4)}`}
              </option>
            ))}
          </select>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-500 hover:bg-gray-100"
          >
            <span className="sr-only">Close</span>
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-gray-100">
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="h-full w-full object-cover"
          />
        </div>

        <div className="mt-4 flex justify-center">
          <button
            onClick={handleCapture}
            className="flex items-center rounded-full bg-blue-500 px-6 py-2 text-white hover:bg-blue-600"
          >
            <svg className="mr-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Take Photo
          </button>
        </div>
      </div>
    </div>
  );
}
