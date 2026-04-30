import React, { useEffect, useRef } from 'react';
import { DISTRICT_COORDINATES } from '../constants';
import * as Cesium from 'cesium';
import 'cesium/Build/Cesium/Widgets/widgets.css';

// Suppress Cesium default token warning
Cesium.Ion.defaultAccessToken = '';

interface MapComponentProps {
  from: string;
  to: string;
  via?: string[];
  modeTitle?: string; // e.g., "By Bus + Ship", "By Air + Road + Ship"
  userLocation?: { lat: number; lng: number } | null;
}

declare global {
  interface Window {
    L: any;
  }
}

// Icon dictionary
const MODE_ICONS: { [key: string]: string } = {
  'Bus': '🚌',
  'বাস': '🚌',
  'Train': '🚂',
  'ট্রেন': '🚂',
  'Air': '✈️',
  'বিমান': '✈️',
  'Flight': '✈️',
  'Plane': '✈️',
  'Ship': '🚢',
  'জাহাজ': '🚢',
  'Launch': '🚢',
  'লঞ্চ': '🚢',
  'Ferry': '🚢',
  'ফেরি': '🚢',
  'Car': '🚗',
  'কার': '🚗',
  'Taxi': '🚕',
  'ট্যাক্সি': '🚕',
  'Road': '🚗',
  'সড়ক': '🚗',
  'Default': '📍'
};

const BENGALI_TO_ENGLISH_NAMES: { [key: string]: string } = {
  "ঢাকা": "Dhaka", "চট্টগ্রাম": "Chattogram", "রাজশাহী": "Rajshahi", "খুলনা": "Khulna",
  "বরিশাল": "Barishal", "সিলেট": "Sylhet", "রংপুর": "Rangpur", "ময়মনসিংহ": "Mymensingh",
  "কক্সবাজার": "Cox's Bazar", "সেন্টমার্টিন": "Saint Martin's Island", "টেকনাফ": "Teknaf",
  "কুমিল্লা": "Cumilla", "নোয়াখালী": "Noakhali", "ফেনী": "Feni", "বগুড়া": "Bogura",
  "সিরাজগঞ্জ": "Sirajganj", "টাঙ্গাইল": "Tangail", "গাজীপুর": "Gazipur", "সাভার": "Savar",
  "মাদারীপুর": "Madaripur", "শরীয়তপুর": "Shariatpur", "গোপালগঞ্জ": "Gopalganj",
  "ফরিদপুর": "Faridpur", "মুন্সীগঞ্জ": "Munshiganj", "নারায়ণগঞ্জ": "Narayanganj",
  "নরসিংদী": "Narsingdi", "কিশোরগঞ্জ": "Kishoreganj", "ব্রাহ্মণবাড়িয়া": "Brahmanbaria",
  "চাঁদপুর": "Chandpur", "লক্ষ্মীপুর": "Lakshmipur", "রাঙ্গামাটি": "Rangamati",
  "বান্দরবান": "Bandarban", "খাগড়াছড়ি": "Khagrachari", "নাটোর": "Natore",
  "পাবনা": "Pabna", "নওগাঁ": "Naogaon", "চাঁপাইনবাবগঞ্জ": "Chapainawabganj",
  "জয়পুরহাট": "Joypurhat", "কুষ্টিয়া": "Kushtia", "যশোর": "Jashore", "ঝিনাইদহ": "Jhenaidah",
  "মাগুরা": "Magura", "নড়াইল": "Narail", "বাগেরহাট": "Bagerhat", "সাতক্ষীরা": "Satkhira",
  "মেহেরপুর": "Meherpur", "চুয়াডাঙ্গা": "Chuadanga", "ভোলা": "Bhola", "পটুয়াখালী": "Patuakhali",
  "বরগুনা": "Barguna", "ঝালকাঠি": "Jhalokati", "পিরোজপুর": "Pirojpur", "হবিগঞ্জ": "Habiganj",
  "মৌলভীবাজার": "Moulvibazar", "সুনামগঞ্জ": "Sunamganj", "দিনাজপুর": "Dinajpur",
  "কুড়িগ্রাম": "Kurigram", "লালমনিরহাট": "Lalmonirhat", "নীলফামারী": "Nilphamari",
  "পঞ্চগড়": "Panchagarh", "ঠাকুরগাঁও": "Thakurgaon", "গাইবান্ধা": "Gaibandha",
  "শেরপুর": "Sherpur", "জামালপুর": "Jamalpur", "নেত্রকোনা": "Netrokona",
  "সাজেক": "Sajek Valley", "কুয়াকাটা": "Kuakata", "শ্রীমঙ্গল": "Sreemangal",
  "মাওয়া": "Mawa", "আরিচা": "Aricha", "পাটুরিয়া": "Paturia", "দৌলতদিয়া": "Daulatdia"
};

const MapComponent: React.FC<MapComponentProps> = ({ from, to, via = [], modeTitle = '', userLocation }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<any>(null);
  const layerGroup = useRef<any>(null);
  const animationRef = useRef<number | null>(null);
  const [is3D, setIs3D] = React.useState(false);
  const cesiumContainerRef = useRef<HTMLDivElement>(null);
  const cesiumViewerRef = useRef<Cesium.Viewer | null>(null);

  useEffect(() => {
    if (!window.L || !mapRef.current) return;

    // Initialize Map only once
    if (!mapInstance.current) {
      mapInstance.current = window.L.map(mapRef.current).setView([23.8103, 90.4125], 7);

      window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(mapInstance.current);

      layerGroup.current = window.L.layerGroup().addTo(mapInstance.current);
    }

    const layers = layerGroup.current;
    layers.clearLayers();
    if (animationRef.current) cancelAnimationFrame(animationRef.current);

    // Helper to get coords
    const getCoords = (name: string): [number, number] | null => {
      if (!name) return null;
      // 1. Try direct match or Bengali mapping
      let searchName = name;
      const bnMatch = Object.keys(BENGALI_TO_ENGLISH_NAMES).find(bn => name && name.includes(bn));
      if (bnMatch) {
        searchName = BENGALI_TO_ENGLISH_NAMES[bnMatch];
      }

      // 2. Find in coordinates map
      const key = Object.keys(DISTRICT_COORDINATES).find(k => {
        const sName = (searchName || '').toLowerCase();
        const kName = k.toLowerCase();
        return sName.includes(kName) || kName.includes(sName);
      });
      return key ? DISTRICT_COORDINATES[key] : null;
    };

    const startCoords = getCoords(from);
    const endCoords = getCoords(to);

    if (!startCoords || !endCoords) return;

    // --- 1. Intelligent Route Ordering (Geometric Sorting) ---
    // This fixes "Zig-Zag" issues by sorting Via points based on distance from Start.

    let sortedVia = [...via];

    // Get coords for sorting
    const viaWithCoords = sortedVia
      .map(v => ({ name: v, coords: getCoords(v) }))
      .filter(v => v.coords !== null) as { name: string, coords: [number, number] }[];

    // Heuristic: Sort by distance from start coordinate
    viaWithCoords.sort((a, b) => {
      const distA = mapInstance.current.distance(startCoords, a.coords);
      const distB = mapInstance.current.distance(startCoords, b.coords);
      return distA - distB;
    });

    const routePoints: [number, number][] = [startCoords];
    viaWithCoords.forEach(v => routePoints.push(v.coords));
    routePoints.push(endCoords);

    // --- 2. Determine Transport Modes per Segment ---
    const cleanTitle = modeTitle.replace('By ', '').replace(/\*\*/g, '');
    const modes = cleanTitle.split('+').map(m => m.trim());

    const segments: { p1: [number, number], p2: [number, number], mode: string, dist: number }[] = [];

    for (let i = 0; i < routePoints.length - 1; i++) {
      const p1 = routePoints[i];
      const p2 = routePoints[i + 1];
      const dist = mapInstance.current.distance(p1, p2);

      let segmentMode = 'Default';

      if (modes.length === 1) {
        segmentMode = modes[0];
      } else {
        const hasShip = modes.some(m => m.includes('Ship') || m.includes('Launch') || m.includes('জাহাজ') || m.includes('লঞ্চ'));
        const hasAir = modes.some(m => m.includes('Air') || m.includes('Flight') || m.includes('বিমান'));
        const hasBus = modes.some(m => m.includes('Bus') || m.includes('Road') || m.includes('Car') || m.includes('বাস') || m.includes('সড়ক'));
        const hasTrain = modes.some(m => m.includes('Train') || m.includes('ট্রেন'));

        if (i === routePoints.length - 2 && hasShip) {
          segmentMode = 'Ship';
        } else if (i === 0 && hasAir) {
          segmentMode = 'Air';
        } else if (hasBus) {
          segmentMode = 'Bus';
          if (hasTrain && !hasAir) segmentMode = 'Train';
        } else {
          segmentMode = modes[i % modes.length];
        }
      }

      segments.push({ p1, p2, mode: segmentMode, dist });
    }

    // --- 3. Draw Elements ---

    const addMarker = (coords: [number, number], label: string, color: string, isStartOrEnd = false) => {
      const iconHtml = `
        <div class="relative flex items-center justify-center">
          ${isStartOrEnd ? `<div class="absolute w-8 h-8 bg-${color === '#22c55e' ? 'green' : 'red'}-400/30 rounded-full animate-ping"></div>` : ''}
          <div style="
            background-color: ${color};
            width: ${isStartOrEnd ? '16px' : '12px'};
            height: ${isStartOrEnd ? '16px' : '12px'};
            border-radius: 50%;
            border: 2px solid white;
            box-shadow: 0 2px 8px rgba(0,0,0,0.3);
          "></div>
        </div>
      `;
      const icon = window.L.divIcon({
        className: 'custom-div-icon',
        html: iconHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16]
      });
      window.L.marker(coords, { icon }).bindPopup(`
        <div class="p-2 font-sans">
          <p class="font-bold text-slate-800">${label}</p>
        </div>
      `).addTo(layers);
    };

    addMarker(startCoords, `Start: ${from}`, '#22c55e', true); // Green
    viaWithCoords.forEach((v, idx) => addMarker(v.coords, `${idx + 1}. ${v.name}`, '#3b82f6')); // Blue
    addMarker(endCoords, `Destination: ${to}`, '#ef4444', true); // Red

    // Fetch road-following route from OSRM, fall back to straight lines
    const drawRoute = async () => {
      let roadPoints: [number, number][] = routePoints;
      try {
        const coordStr = routePoints.map(p => `${p[1]},${p[0]}`).join(';');
        const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson`;
        const resp = await fetch(osrmUrl, { signal: AbortSignal.timeout(6000) });
        if (resp.ok) {
          const data = await resp.json() as { routes?: { geometry?: { coordinates?: [number, number][] } }[] };
          const coords = data?.routes?.[0]?.geometry?.coordinates;
          if (coords && coords.length > 1) {
            roadPoints = coords.map(c => [c[1], c[0]] as [number, number]);
          }
        }
      } catch { /* use straight lines if OSRM unavailable */ }

      // 1. Shadow/Glow Layer
      window.L.polyline(roadPoints, {
        color: '#2563eb',
        weight: 12,
        opacity: 0.15,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layers);

      // 2. Main Line
      const mainLine = window.L.polyline(roadPoints, {
        color: '#2563eb',
        weight: 5,
        opacity: 1,
        lineCap: 'round',
        lineJoin: 'round'
      }).addTo(layers);

      // 3. Flow Layer (Animated)
      window.L.polyline(roadPoints, {
        color: '#ffffff',
        weight: 2,
        opacity: 0.6,
        dashArray: '10, 20',
        lineCap: 'round',
        className: 'route-line-flow'
      }).addTo(layers);

      mapInstance.current.fitBounds(mainLine.getBounds(), { padding: [80, 80] });

      setTimeout(() => {
        if (mapInstance.current) {
          mapInstance.current.invalidateSize();
          mapInstance.current.fitBounds(mainLine.getBounds(), { padding: [80, 80] });
        }
      }, 400);
    };

    drawRoute();

    // --- 4. Animation ---
    const vehicleIconDiv = window.L.divIcon({
      className: 'vehicle-anim-icon',
      html: '',
      iconSize: [30, 30],
      iconAnchor: [15, 15]
    });
    const vehicleMarker = window.L.marker(startCoords, { icon: vehicleIconDiv, zIndexOffset: 1000 }).addTo(layers);

    const totalDist = segments.reduce((acc, s) => acc + s.dist, 0);
    // Slowed down animation: 12 seconds
    const duration = 12000;
    let startTime: number | null = null;

    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;
      const progress = (elapsed % duration) / duration;

      const currentDist = progress * totalDist;
      let accumulatedDist = 0;
      let currentSegment = segments[0];

      for (const seg of segments) {
        if (accumulatedDist + seg.dist >= currentDist) {
          currentSegment = seg;
          break;
        }
        accumulatedDist += seg.dist;
      }

      const segmentProgress = (currentDist - accumulatedDist) / currentSegment.dist;

      const lat = currentSegment.p1[0] + (currentSegment.p2[0] - currentSegment.p1[0]) * segmentProgress;
      const lng = currentSegment.p1[1] + (currentSegment.p2[1] - currentSegment.p1[1]) * segmentProgress;

      const rawMode = currentSegment.mode || '';
      let iconChar = '📍';
      for (const key of Object.keys(MODE_ICONS)) {
        if (rawMode.includes(key)) {
          iconChar = MODE_ICONS[key];
          break;
        }
      }

      const iconHtml = `<div style="font-size: 28px; line-height: 1; transform: translate(-50%, -50%); filter: drop-shadow(0 4px 6px rgba(0,0,0,0.3)); transition: all 0.2s;">${iconChar}</div>`;

      const newIcon = window.L.divIcon({
        className: 'vehicle-anim-icon',
        html: iconHtml,
        iconSize: [30, 30],
        iconAnchor: [15, 15]
      });
      vehicleMarker.setIcon(newIcon);
      vehicleMarker.setLatLng([lat, lng]);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };

  }, [from, to, via, modeTitle, is3D]);

  // Cesium 3D Globe Logic
  useEffect(() => {
    if (!is3D || !cesiumContainerRef.current) {
      if (cesiumViewerRef.current) {
        cesiumViewerRef.current.destroy();
        cesiumViewerRef.current = null;
      }
      return;
    }

    const initCesium = async () => {
      if (!cesiumContainerRef.current) return;
      
      try {
        const viewer = new Cesium.Viewer(cesiumContainerRef.current, {
          terrain: Cesium.Terrain.fromWorldTerrain(),
          animation: false,
          timeline: false,
          baseLayerPicker: false,
          geocoder: false,
          homeButton: false,
          infoBox: false,
          sceneModePicker: false,
          selectionIndicator: false,
          navigationHelpButton: false,
          navigationInstructionsInitiallyVisible: false,
          fullscreenButton: false,
          skyAtmosphere: new Cesium.SkyAtmosphere(),
          msaaSamples: 4,
        });

        // High-end visuals
        viewer.scene.fog.enabled = true;
        viewer.scene.fog.density = 0.0001;
        viewer.scene.light = new Cesium.DirectionalLight({
          direction: new Cesium.Cartesian3(0.5, -0.2, -1.0),
          intensity: 2.0
        });

        // Add 3D Buildings
        const buildingTileset = await Cesium.createOsmBuildingsAsync({
          defaultColor: Cesium.Color.fromCssColorString('#f1f5f9'),
        });
        viewer.scene.primitives.add(buildingTileset);

        // Draw routes in 3D
        const getCoords = (name: string): [number, number] | null => {
          if (!name) return null;
          let searchName = name;
          const bnMatch = Object.keys(BENGALI_TO_ENGLISH_NAMES).find(bn => name && name.includes(bn));
          if (bnMatch) searchName = BENGALI_TO_ENGLISH_NAMES[bnMatch];
          const key = Object.keys(DISTRICT_COORDINATES).find(k => {
            const sName = (searchName || '').toLowerCase();
            const kName = k.toLowerCase();
            return sName.includes(kName) || kName.includes(sName);
          });
          return key ? DISTRICT_COORDINATES[key] : null;
        };

        const start = getCoords(from);
        const end = getCoords(to);

        if (start && end) {
          // Route line
          viewer.entities.add({
            polyline: {
              positions: [
                Cesium.Cartesian3.fromDegrees(start[1], start[0]),
                Cesium.Cartesian3.fromDegrees(end[1], end[0])
              ],
              width: 8,
              material: Cesium.Color.fromCssColorString('#2563eb'),
              clampToGround: true
            }
          });

          // Destination marker
          viewer.entities.add({
            position: Cesium.Cartesian3.fromDegrees(end[1], end[0]),
            point: { pixelSize: 15, color: Cesium.Color.RED, outlineColor: Cesium.Color.WHITE, outlineWidth: 3, disableDepthTestDistance: Number.POSITIVE_INFINITY },
            label: {
              text: to,
              font: 'bold 14px sans-serif',
              verticalOrigin: Cesium.VerticalOrigin.BOTTOM,
              pixelOffset: new Cesium.Cartesian2(0, -15),
              fillColor: Cesium.Color.WHITE,
              outlineColor: Cesium.Color.BLACK,
              outlineWidth: 2,
              showBackground: true,
              backgroundColor: Cesium.Color.fromCssColorString('rgba(0,0,0,0.5)'),
              disableDepthTestDistance: Number.POSITIVE_INFINITY
            }
          });
          
          if (userLocation) {
            viewer.camera.flyTo({
              destination: Cesium.Cartesian3.fromDegrees(userLocation.lng, userLocation.lat, 500000), // Regional view
              duration: 3
            });
          } else {
            viewer.zoomTo(viewer.entities);
          }
        }

        cesiumViewerRef.current = viewer;
      } catch (e) {
        console.error('Cesium init error:', e);
      }
    };

    initCesium();

    return () => {
      if (cesiumViewerRef.current) {
        cesiumViewerRef.current.destroy();
        cesiumViewerRef.current = null;
      }
    };
  }, [is3D, from, to]);

  return (
    <div className="w-full h-full relative z-0">
      {/* 2D Leaflet Map */}
      <div 
        className={`w-full h-full transition-opacity duration-500 ${is3D ? 'opacity-0 pointer-events-none' : 'opacity-100'}`} 
      >
        <div ref={mapRef} className="w-full h-full bg-slate-100" />
      </div>

      {/* 3D Cesium Globe */}
      {is3D && (
        <div 
          ref={cesiumContainerRef} 
          className="absolute inset-0 z-[10] animate-in fade-in duration-700" 
        />
      )}

      {/* 3D Toggle */}
      <button
        onClick={() => setIs3D(!is3D)}
        className="absolute bottom-14 right-4 z-[500] flex items-center gap-2 px-3 py-2 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 hover:scale-105 transition-all"
      >
        <span className="text-[10px] font-black uppercase tracking-widest bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
          {is3D ? '2D Map' : '3D Globe'}
        </span>
        <div className={`w-2 h-2 rounded-full ${is3D ? 'bg-blue-600' : 'bg-emerald-500'} animate-pulse`} />
      </button>
    </div>
  );
};

export default MapComponent;