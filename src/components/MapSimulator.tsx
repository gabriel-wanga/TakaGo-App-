import { useState, useEffect } from 'react';
import { MapPin, Navigation, Home, Recycle, RefreshCw, Car } from 'lucide-react';
import { PickupStatus } from '../types';

interface MapSimulatorProps {
  status: PickupStatus;
  customerName: string;
  collectorName?: string;
  onSimulationStep?: (newStatus: PickupStatus) => void;
}

// Fixed coordinate paths in SVG 100x100 grid
// Path from Depot (0, 90) -> Collector's initial stand (10, 50) -> Customer (45, 30) -> Recycle Plant (90, 20)
const ROUTE_POINTS = [
  { x: 10, y: 75, label: 'Collector Depot' },
  { x: 22, y: 60, label: 'Westlands Circle' },
  { x: 35, y: 48, label: 'Ngong Road Link' },
  { x: 45, y: 30, label: 'Customer Residence' }, // Customer point
  { x: 62, y: 28, label: 'Valley Highway' },
  { x: 78, y: 24, label: 'Eco-Waste Interchange' },
  { x: 90, y: 20, label: 'TakaGo Clean Recycling Plant' } // Plant point
];

export default function MapSimulator({
  status,
  customerName,
  collectorName = 'Collector Juma',
  onSimulationStep
}: MapSimulatorProps) {
  const [stepIndex, setStepIndex] = useState(0);
  const [isAutomated, setIsAutomated] = useState(false);

  // Set initial position based on status
  useEffect(() => {
    if (status === 'pending') {
      setStepIndex(0); // At depot/start
    } else if (status === 'accepted') {
      setStepIndex(1); // Accept, start traveling
    } else if (status === 'on_the_way') {
      // If of became on the way, make sure it is near the customer
      setStepIndex(2);
    } else if (status === 'collected') {
      setStepIndex(4); // Moving towards recycling plant
    } else if (status === 'completed') {
      setStepIndex(6); // At recycling plant
    }
  }, [status]);

  // Automated step simulation ticker
  useEffect(() => {
    let timer: any;
    if (isAutomated) {
      timer = setInterval(() => {
        setStepIndex((prev) => {
          const next = prev + 1;
          if (next >= ROUTE_POINTS.length) {
            setIsAutomated(false);
            return prev;
          }

          // Trigger state transition when crossing milestone points
          if (next === 3 && onSimulationStep) {
            // Arrived at Customer! Tell the app to change status to 'collected'
            onSimulationStep('collected');
          } else if (next === 6 && onSimulationStep) {
            // Arrived at Recycle Plant! Completed
            onSimulationStep('completed');
          }

          return next;
        });
      }, 2500); // Step every 2.5 seconds
    }
    return () => clearInterval(timer);
  }, [isAutomated, onSimulationStep]);

  const currentPos = ROUTE_POINTS[stepIndex] || ROUTE_POINTS[0];

  // Helper labels depending on step position
  let statusMessage = '';
  if (status === 'pending') {
    statusMessage = 'Awaiting waste collector allocation...';
  } else if (stepIndex < 3) {
    statusMessage = `Waste collector is on the way! Estimated arrival: ${3 - stepIndex} mins`;
  } else if (stepIndex === 3) {
    statusMessage = 'Waste collector arrived! Separating waste items...';
  } else if (stepIndex > 3 && stepIndex < 6) {
    statusMessage = 'Taka loaded! En-route to regional Eco-Plant...';
  } else {
    statusMessage = 'Successfully processed at TakaGo Recycling Hub!';
  }

  const handleManualStep = () => {
    const next = (stepIndex + 1) % ROUTE_POINTS.length;
    setStepIndex(next);

    if (next === 3 && onSimulationStep) {
      onSimulationStep('collected');
    } else if (next === 6 && onSimulationStep) {
      onSimulationStep('completed');
    } else if (next === 1 && onSimulationStep) {
      onSimulationStep('on_the_way');
    }
  };

  return (
    <div className="bg-emerald-50/70 border border-emerald-100 rounded-2xl p-4 flex flex-col space-y-3" id="map-simulator-panel">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-emerald-900 flex items-center">
            <Navigation className="w-4 h-4 mr-1.5 text-emerald-600 animate-spin-pulse" />
            Live GPS Tracking Simulator
          </h3>
          <p className="text-xs text-emerald-700/80 mt-0.5">{statusMessage}</p>
        </div>
        <div className="flex space-x-1.5">
          <button
            onClick={() => setIsAutomated(!isAutomated)}
            className={`px-2.5 py-1 text-[11px] rounded-lg font-medium transition-colors cursor-pointer flex items-center space-x-1 ${
              isAutomated 
                ? 'bg-yellow-500 hover:bg-yellow-600 text-white animate-pulse' 
                : 'bg-emerald-600 hover:bg-emerald-700 text-white'
            }`}
            id="map-btn-autoplay"
          >
            <RefreshCw className={`w-3 h-3 ${isAutomated ? 'animate-spin' : ''}`} />
            <span>{isAutomated ? 'Pause GPS' : 'Auto-Drive'}</span>
          </button>
          
          <button
            onClick={handleManualStep}
            className="px-2.5 py-1 text-[11px] bg-white border border-emerald-200 text-emerald-800 rounded-lg font-medium hover:bg-emerald-100 transition-colors cursor-pointer"
            id="map-btn-step"
          >
            Manual Step ➔
          </button>
        </div>
      </div>

      {/* SVG Map Container */}
      <div className="relative aspect-video w-full bg-slate-100 rounded-xl overflow-hidden border border-emerald-200/50 shadow-inner" id="map-canvas-container">
        {/* Simple grid lines representing streets */}
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 50" preserveAspectRatio="none">
          {/* Street blocks */}
          <rect x="5" y="5" width="20" height="15" rx="3" fill="#e2ebd5" />
          <rect x="30" y="5" width="30" height="15" rx="3" fill="#e2ebd5" />
          <rect x="65" y="5" width="30" height="15" rx="3" fill="#e2ebd5" />
          
          <rect x="5" y="25" width="20" height="20" rx="3" fill="#e3eed6" />
          <rect x="30" y="25" width="10" height="20" rx="3" fill="#cbdcc0" /> {/* Park */}
          <rect x="45" y="25" width="15" height="20" rx="3" fill="#e2ebd5" />
          <rect x="65" y="25" width="30" height="20" rx="3" fill="#e3eed6" />

          {/* Grid lines (Roads) */}
          <line x1="0" y1="22.5" x2="100" y2="22.5" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="27" y1="0" x2="27" y2="50" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="62.5" y1="0" x2="62.5" y2="50" stroke="#ffffff" strokeWidth="1.2" />
          <line x1="42.5" y1="22.5" x2="42.5" y2="50" stroke="#ffffff" strokeWidth="1.2" />

          {/* Dotted Navigation Route */}
          <polyline
            points={ROUTE_POINTS.map(p => `${p.x},${p.y * 0.5}`).join(' ')} // scalable y
            fill="none"
            stroke="#10b981"
            strokeWidth="0.8"
            strokeDasharray="1.5 1"
          />
        </svg>

        {/* Customer Location PIN */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-5"
          style={{ left: '45%', top: `${30}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="bg-sky-500 hover:bg-sky-600 p-1.5 rounded-full border border-white text-white shadow-md cursor-pointer group relative">
              <Home className="w-3.5 h-3.5" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                {customerName}
              </div>
            </div>
            <div className="w-1.5 h-3 bg-sky-500/80 rounded-full -mt-0.5 animate-bounce"></div>
          </div>
        </div>

        {/* ECO Recycle Plant PIN */}
        <div 
          className="absolute transform -translate-x-1/2 -translate-y-5"
          style={{ left: '90%', top: `${20}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="bg-emerald-600 hover:bg-emerald-700 p-1.5 rounded-full border border-white text-white shadow-md cursor-pointer group relative">
              <Recycle className="w-3.5 h-3.5 animate-spin-pulse" />
              <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-1 hidden group-hover:block bg-slate-800 text-white text-[10px] py-1 px-2 rounded whitespace-nowrap z-10">
                TakaGo Plant
              </div>
            </div>
            <div className="w-1.5 h-3 bg-emerald-600/80 rounded-full -mt-0.5"></div>
          </div>
        </div>

        {/* Waste Collector Icon moving live */}
        <div
          className="absolute transform -translate-x-1/2 -translate-y-1/2 transition-all duration-1000 ease-in-out"
          style={{ left: `${currentPos.x}%`, top: `${currentPos.y}%` }}
        >
          <div className="flex flex-col items-center">
            <div className="bg-white p-1 rounded-full border-2 border-emerald-500 text-emerald-600 shadow-lg animate-bounce flex items-center justify-center">
              <Car className="w-4 h-4 fill-emerald-100" />
            </div>
            <span className="bg-slate-900/90 text-white font-mono text-[9px] px-1.5 py-0.5 rounded shadow mt-0.5 font-semibold">
              {collectorName}
            </span>
          </div>
        </div>
      </div>

      {/* Footer Info details */}
      <div className="grid grid-cols-3 gap-2 text-center" id="map-details-grid">
        <div className="bg-white px-2 py-1.5 rounded-lg border border-emerald-100/50">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Coordinates</p>
          <p className="text-xs font-mono font-medium text-emerald-800">
            {currentPos.x.toFixed(1)}°E, {(currentPos.y).toFixed(1)}°S
          </p>
        </div>
        <div className="bg-white px-2 py-1.5 rounded-lg border border-emerald-100/50">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Current Segment</p>
          <p className="text-xs font-medium text-emerald-800 truncate" title={currentPos.label}>
            {currentPos.label}
          </p>
        </div>
        <div className="bg-white px-2 py-1.5 rounded-lg border border-emerald-100/50">
          <p className="text-[10px] text-gray-400 uppercase font-bold tracking-wider">Engine status</p>
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-medium leading-none ${
            isAutomated ? 'bg-yellow-100 text-yellow-800' : 'bg-gray-100 text-gray-800'
          }`}>
            <span className={`w-1.5 h-1.5 rounded-full mr-1 ${isAutomated ? 'bg-yellow-500 animate-ping' : 'bg-gray-400'}`}></span>
            {isAutomated ? 'Simulating' : 'Manual'}
          </span>
        </div>
      </div>
    </div>
  );
}
