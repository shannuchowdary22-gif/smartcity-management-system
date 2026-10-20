import React, { useMemo, useState } from 'react';
import L from 'leaflet';
import {
  MapContainer,
  Marker,
  Polygon,
  Polyline,
  Popup,
  TileLayer,
  Tooltip,
  useMap,
  useMapEvents,
} from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import {
  Activity,
  AlertTriangle,
  Building2,
  Car,
  Check,
  ChevronRight,
  Clock3,
  Droplets,
  Layers,
  LocateFixed,
  MapPin,
  Radio,
  RotateCcw,
  Search,
  ShieldAlert,
  Signpost,
  Trash2,
  Wind,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import { useSmartCity } from '../context/SmartCityContext';
import type { ApiResource } from '../services/api';
import type { ProblemCategory, ProblemItem } from '../types';

const CITY_CENTER: [number, number] = [17.385, 78.4867];
const CITY_ZOOM = 11;

type AssetCategory =
  | 'traffic'
  | 'waste'
  | 'water'
  | 'pollution'
  | 'emergency'
  | 'infrastructure'
  | 'parking'
  | 'iot'
  | 'grievance'
  | 'proof';
type AssetStatus = 'critical' | 'warning' | 'normal' | 'resolved' | 'active';

interface MapAsset {
  id: string;
  name: string;
  category: AssetCategory;
  position: [number, number];
  status: AssetStatus;
  severity?: string;
  updatedAt?: string;
  reading?: string;
  department?: string;
  officer?: string;
  ticket?: string;
  demo: boolean;
  problem?: ProblemItem;
}

interface DemoAsset extends MapAsset {
  demo: true;
}

const DEMO_ASSETS: DemoAsset[] = [
  { id: 'DEMO-TRF-01', name: 'Abids Traffic Monitor', category: 'traffic', position: [17.402, 78.444], status: 'warning', severity: 'Congestion watch', department: 'Traffic Monitoring', demo: true },
  { id: 'DEMO-WST-03', name: 'Metro Gate 2 Waste Node', category: 'waste', position: [17.367, 78.489], status: 'warning', severity: 'Collection watch', department: 'Solid Waste Operations', demo: true },
  { id: 'DEMO-WTR-12', name: 'Block B Water Monitor', category: 'water', position: [17.358, 78.535], status: 'critical', severity: 'Leakage alert', department: 'Water Supply & Sewerage', demo: true },
  { id: 'DEMO-AQI-09', name: 'Industrial Air Monitor', category: 'pollution', position: [17.429, 78.53], status: 'warning', severity: 'Air-quality watch', department: 'Pollution Control', demo: true },
  { id: 'DEMO-EMS-02', name: 'Central SOS Point', category: 'emergency', position: [17.419, 78.47], status: 'active', severity: 'Emergency station', department: 'Emergency Response', demo: true },
  { id: 'DEMO-BLD-04', name: 'Civic Centre Building', category: 'infrastructure', position: [17.352, 78.455], status: 'normal', severity: 'Monitoring', department: 'Public Infrastructure', demo: true },
  { id: 'DEMO-PKG-07', name: 'Tank Bund Parking Sensor', category: 'parking', position: [17.445, 78.5], status: 'normal', severity: 'Monitoring', department: 'Parking Operations', demo: true },
  { id: 'DEMO-IOT-28', name: 'Municipal IoT Gateway 28', category: 'iot', position: [17.39, 78.546], status: 'normal', severity: 'Connected', department: 'Smart City IoT Operations', demo: true },
];

const SECTORS = [
  { name: 'Sector 1', position: [17.465, 78.4867] as [number, number] },
  { name: 'Sector 2', position: [17.445, 78.545] as [number, number] },
  { name: 'Sector 3', position: [17.385, 78.565] as [number, number] },
  { name: 'Sector 4', position: [17.325, 78.545] as [number, number] },
  { name: 'Sector 5', position: [17.305, 78.4867] as [number, number] },
  { name: 'Sector 6', position: [17.325, 78.428] as [number, number] },
  { name: 'Sector 7', position: [17.385, 78.408] as [number, number] },
  { name: 'Sector 8', position: [17.445, 78.428] as [number, number] },
  { name: 'Sector 9', position: [17.425, 78.4867] as [number, number] },
];

const BUILDING_FOOTPRINTS: [number, number][][] = [
  [[17.3922, 78.483], [17.3922, 78.48335], [17.39248, 78.48335], [17.39248, 78.483]],
  [[17.3917, 78.4831], [17.3917, 78.48348], [17.39198, 78.48348], [17.39198, 78.4831]],
  [[17.3898, 78.489], [17.3898, 78.48942], [17.39008, 78.48942], [17.39008, 78.489]],
  [[17.3874, 78.496], [17.3874, 78.49634], [17.38772, 78.49634], [17.38772, 78.496]],
  [[17.3817, 78.489], [17.3817, 78.48942], [17.382, 78.48942], [17.382, 78.489]],
  [[17.3992, 78.477], [17.3992, 78.47742], [17.3995, 78.47742], [17.3995, 78.477]],
  [[17.374, 78.5], [17.374, 78.5004], [17.3743, 78.5004], [17.3743, 78.5]],
  [[17.402, 78.502], [17.402, 78.5024], [17.40228, 78.5024], [17.40228, 78.502]],
  [[17.3842, 78.475], [17.3842, 78.4754], [17.38452, 78.4754], [17.38452, 78.475]],
  [[17.3962, 78.508], [17.3962, 78.5084], [17.39652, 78.5084], [17.39652, 78.508]],
  [[17.3693, 78.481], [17.3693, 78.48142], [17.36962, 78.48142], [17.36962, 78.481]],
  [[17.4082, 78.486], [17.4082, 78.4864], [17.4085, 78.4864], [17.4085, 78.486]],
  [[17.3931, 78.485], [17.3931, 78.48528], [17.39334, 78.48528], [17.39334, 78.485]],
  [[17.3928, 78.486], [17.3928, 78.48632], [17.39305, 78.48632], [17.39305, 78.486]],
  [[17.3912, 78.488], [17.3912, 78.48834], [17.39148, 78.48834], [17.39148, 78.488]],
  [[17.3904, 78.491], [17.3904, 78.4913], [17.39068, 78.4913], [17.39068, 78.491]],
  [[17.3884, 78.494], [17.3884, 78.49432], [17.38868, 78.49432], [17.38868, 78.494]],
  [[17.3868, 78.497], [17.3868, 78.49734], [17.38708, 78.49734], [17.38708, 78.497]],
  [[17.3848, 78.499], [17.3848, 78.4993], [17.38508, 78.4993], [17.38508, 78.499]],
  [[17.3827, 78.496], [17.3827, 78.49632], [17.38298, 78.49632], [17.38298, 78.496]],
  [[17.3802, 78.493], [17.3802, 78.4933], [17.38048, 78.4933], [17.38048, 78.493]],
  [[17.3775, 78.49], [17.3775, 78.49034], [17.37778, 78.49034], [17.37778, 78.49]],
  [[17.3751, 78.486], [17.3751, 78.4863], [17.37538, 78.4863], [17.37538, 78.486]],
  [[17.377, 78.477], [17.377, 78.47732], [17.37728, 78.47732], [17.37728, 78.477]],
  [[17.381, 78.471], [17.381, 78.4713], [17.38128, 78.4713], [17.38128, 78.471]],
  [[17.386, 78.469], [17.386, 78.46932], [17.38628, 78.46932], [17.38628, 78.469]],
  [[17.397, 78.47], [17.397, 78.47032], [17.39728, 78.47032], [17.39728, 78.47]],
  [[17.4027, 78.474], [17.4027, 78.47432], [17.40298, 78.47432], [17.40298, 78.474]],
  [[17.406, 78.481], [17.406, 78.48132], [17.40628, 78.48132], [17.40628, 78.481]],
  [[17.408, 78.493], [17.408, 78.49332], [17.40828, 78.49332], [17.40828, 78.493]],
  [[17.404, 78.501], [17.404, 78.50132], [17.40428, 78.50132], [17.40428, 78.501]],
  [[17.399, 78.514], [17.399, 78.51432], [17.39928, 78.51432], [17.39928, 78.514]],
  [[17.392, 78.516], [17.392, 78.51632], [17.39228, 78.51632], [17.39228, 78.516]],
  [[17.383, 78.51], [17.383, 78.51032], [17.38328, 78.51032], [17.38328, 78.51]],
  [[17.371, 78.506], [17.371, 78.50632], [17.37128, 78.50632], [17.37128, 78.506]],
  [[17.366, 78.494], [17.366, 78.49432], [17.36628, 78.49432], [17.36628, 78.494]],
  [[17.371, 78.471], [17.371, 78.47132], [17.37128, 78.47132], [17.37128, 78.471]],
  [[17.409, 78.503], [17.409, 78.50332], [17.40928, 78.50332], [17.40928, 78.503]],
];

const SIMULATED_ROUTES: { name: string; points: [number, number][]; color: string; dashed: boolean }[] = [
  {
    name: 'Simulated waste collection route',
    points: [[17.3857, 78.4928], [17.388, 78.489], [17.39, 78.485], [17.392, 78.48], [17.396, 78.475], [17.402, 78.468]],
    color: '#23d9ec',
    dashed: true,
  },
  {
    name: 'Simulated emergency dispatch route',
    points: [[17.3926, 78.4809], [17.389, 78.483], [17.385, 78.488], [17.38, 78.494], [17.3748, 78.5017]],
    color: '#258bff',
    dashed: false,
  },
];

const CATEGORY_META: Record<AssetCategory, { label: string; color: string }> = {
  traffic: { label: 'Traffic', color: '#f97316' },
  waste: { label: 'Waste', color: '#f59e0b' },
  water: { label: 'Water', color: '#38bdf8' },
  pollution: { label: 'Air quality', color: '#a3e635' },
  emergency: { label: 'Emergency', color: '#ef4444' },
  infrastructure: { label: 'Infrastructure', color: '#22d3ee' },
  parking: { label: 'Parking', color: '#60a5fa' },
  iot: { label: 'IoT device', color: '#22d3ee' },
  grievance: { label: 'Citizen grievance', color: '#ec4899' },
  proof: { label: 'Proof location', color: '#d946ef' },
};

const MARKER_GLYPH: Record<AssetCategory, string> = {
  traffic: '<path d="M5 17h14l1-5-2-5H6l-2 5 1 5Z"/><path d="M7 17v2m10-2v2M5 12h14M7 7l1-3h8l1 3"/>',
  waste: '<path d="M3 6h18M8 6V4h8v2m-10 0 1 15h10l1-15"/><path d="M10 10v7m4-7v7"/>',
  water: '<path d="M12 3s-6 7-6 11a6 6 0 0 0 12 0c0-4-6-11-6-11Z"/><path d="M9 15a3 3 0 0 0 3 3"/>',
  pollution: '<path d="M3 8h10a3 3 0 1 0-3-3M2 12h16a3 3 0 1 1-3 3M4 16h6a3 3 0 1 1-3 3"/>',
  emergency: '<path d="m12 3 10 18H2L12 3Z"/><path d="M12 9v5m0 3h.01"/>',
  infrastructure: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-6h6v6"/><path d="M8 9h1m6 0h1m-8 3h1m6 0h1"/>',
  parking: '<path d="M6 21V3h7a5 5 0 0 1 0 10H6"/>',
  iot: '<path d="M12 18h.01"/><path d="M8.5 14.5a5 5 0 0 1 7 0m-10-3a9 9 0 0 1 13 0m-16-3a13 13 0 0 1 19 0"/>',
  grievance: '<path d="M12 22s8-4 8-11V5l-8-3-8 3v6c0 7 8 11 8 11Z"/><path d="M12 8v4m0 4h.01"/>',
  proof: '<path d="m5 12 4 4L19 6"/><circle cx="12" cy="12" r="9"/>',
};

const STATUS_COLOR: Record<AssetStatus, string> = {
  critical: '#ef3340',
  warning: '#f59e0b',
  normal: '#10b981',
  resolved: '#10b981',
  active: '#06b6d4',
};

function telemetryReading(category: AssetCategory, telemetry: ReturnType<typeof useSmartCity>['telemetry']): string | undefined {
  switch (category) {
    case 'traffic': return `${telemetry.avgSpeed} km/h · ${telemetry.trafficCongestion} congestion`;
    case 'waste': return `${telemetry.wasteBinFillLevel}% fill · ${telemetry.wasteCollectionStatus}`;
    case 'water': return `${telemetry.waterPressure} bar · ${telemetry.waterLeakageStatus}`;
    case 'pollution': return `AQI ${telemetry.aqi} · ${telemetry.aqiStatus}`;
    case 'emergency': return `${telemetry.fireIncidents + telemetry.accidentIncidents + telemetry.medicalIncidents} active incidents (dashboard state)`;
    case 'infrastructure': return `${telemetry.overallHealth}% city infrastructure health`;
    case 'iot': return `${telemetry.activeDevices}/${telemetry.totalDevices} devices active`;
    default: return undefined;
  }
}

const CATEGORY_FILTERS: { id: AssetCategory | 'all'; label: string }[] = [
  { id: 'all', label: 'All assets' },
  { id: 'traffic', label: 'Traffic' },
  { id: 'waste', label: 'Waste' },
  { id: 'water', label: 'Water' },
  { id: 'pollution', label: 'Air quality' },
  { id: 'emergency', label: 'Emergency' },
  { id: 'infrastructure', label: 'Infrastructure' },
  { id: 'parking', label: 'Parking' },
  { id: 'iot', label: 'IoT' },
  { id: 'grievance', label: 'Grievances' },
  { id: 'proof', label: 'Proof locations' },
];

function readString(data: Record<string, unknown>, ...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = data[key];
    if (typeof value === 'string' || typeof value === 'number') return String(value);
  }
  return undefined;
}

function toCoordinate(value: unknown, limit: number): number | undefined {
  if (typeof value !== 'number' && (typeof value !== 'string' || value.trim() === '')) return undefined;
  const coordinate = Number(value);
  return Number.isFinite(coordinate) && Math.abs(coordinate) <= limit ? coordinate : undefined;
}

function toPosition(resource: ApiResource): [number, number] | undefined {
  const data = resource.data;
  const nestedLocation = data.location && typeof data.location === 'object'
    ? data.location as Record<string, unknown>
    : undefined;
  const coordinates = data.coordinates ?? nestedLocation?.coordinates;
  if (Array.isArray(coordinates) && coordinates.length >= 2) {
    const first = toCoordinate(coordinates[0], 90);
    const second = toCoordinate(coordinates[1], 180);
    if (first !== undefined && second !== undefined) {
      return [first, second];
    }
  }
  const latitude = toCoordinate(data.latitude ?? data.lat ?? nestedLocation?.latitude ?? nestedLocation?.lat, 90);
  const longitude = toCoordinate(data.longitude ?? data.lng ?? data.lon ?? nestedLocation?.longitude ?? nestedLocation?.lng ?? nestedLocation?.lon, 180);
  if (latitude !== undefined && longitude !== undefined) {
    return [latitude, longitude];
  }
  return undefined;
}

function sensorAssets(resources: ApiResource[]): MapAsset[] {
  return resources.flatMap((resource) => {
    const position = toPosition(resource);
    if (!position) return [];
    const data = resource.data;
    const statusText = (readString(data, 'status', 'health') || 'active').toLowerCase();
    const status: AssetStatus = /critical|offline|fault|error/.test(statusText)
      ? 'critical'
      : /warning|degraded|alert/.test(statusText)
        ? 'warning'
        : 'normal';
    const name = readString(data, 'name', 'label', 'sensorName', 'deviceName') || `IoT Sensor ${resource.id}`;
    const value = readString(data, 'value', 'reading', 'lastReading');
    const unit = readString(data, 'unit');
    return [{
      id: `SENSOR-${resource.id}`,
      name,
      category: 'iot' as const,
      position,
      status,
      severity: readString(data, 'severity'),
      updatedAt: resource.updatedAt,
      reading: value ? `${value}${unit ? ` ${unit}` : ''}` : undefined,
      department: readString(data, 'department'),
      demo: false,
    }];
  });
}

function buildingAssets(resources: ApiResource[]): MapAsset[] {
  return resources.flatMap((resource) => {
    const position = toPosition(resource);
    if (!position) return [];
    const data = resource.data;
    return [{
      id: `BUILDING-${resource.id}`,
      name: readString(data, 'name', 'label', 'buildingName') || `Smart Building ${resource.id}`,
      category: 'infrastructure' as const,
      position,
      status: 'normal' as const,
      updatedAt: resource.updatedAt,
      department: readString(data, 'department'),
      demo: false,
    }];
  });
}

function grievanceStatus(problem: ProblemItem): AssetStatus {
  if (problem.status === 'resolved') return 'resolved';
  if (problem.priority === 'critical') return 'critical';
  if (problem.priority === 'high') return 'warning';
  return 'active';
}

function grievanceAssets(problems: ProblemItem[]): MapAsset[] {
  return problems.flatMap((problem) => {
    const rawPosition = problem.location.coordinates;
    if (!rawPosition) return [];
    const [latitude, longitude] = rawPosition;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return [];
    const hasProof = Boolean(problem.resolutionPhotoUrl || problem.verifiedPhotoUrl || problem.proof?.afterPhotoUrl);
    const resolved = problem.status === 'resolved';
    return [{
      id: problem.id,
      name: problem.title,
      category: hasProof && resolved ? 'proof' as const : 'grievance' as const,
      position: [latitude, longitude] as [number, number],
      status: grievanceStatus(problem),
      severity: problem.priority,
      updatedAt: problem.updatedAt,
      department: problem.assignedTo?.department,
      officer: problem.assignedTo?.officerName,
      ticket: problem.id,
      demo: false,
      problem,
    }];
  });
}

function markerIcon(asset: MapAsset, selected: boolean): L.DivIcon {
  const category = CATEGORY_META[asset.category];
  const color = STATUS_COLOR[asset.status] || category.color;
  const size = selected ? 42 : 34;
  const icon = `<svg class="smartcity-marker-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${MARKER_GLYPH[asset.category]}</svg>`;
  return L.divIcon({
    className: 'smartcity-marker-shell',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<span class="smartcity-marker${selected ? ' is-selected' : ''}" style="--marker-color:${color};--marker-size:${size}px"><span class="smartcity-marker-icon">${icon}</span></span>`,
  });
}

function sectorIcon(name: string): L.DivIcon {
  return L.divIcon({
    className: 'smartcity-sector-shell',
    iconSize: [76, 20],
    iconAnchor: [38, 10],
    html: `<span class="smartcity-sector-tag">${name}</span>`,
  });
}

function clusterIcon(count: number): L.DivIcon {
  return L.divIcon({
    className: 'smartcity-cluster-shell',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
    html: `<span class="smartcity-cluster">${count}</span>`,
  });
}

interface AssetCluster {
  assets: MapAsset[];
  position: [number, number];
  pixelCenter: L.Point;
}

const MapAssetMarkers: React.FC<{
  assets: MapAsset[];
  selectedAssetId: string | null;
  onSelect: (assetId: string) => void;
}> = ({ assets, selectedAssetId, onSelect }) => {
  const map = useMap();
  const [zoom, setZoom] = useState(map.getZoom());
  useMapEvents({
    zoomend: () => setZoom(map.getZoom()),
  });

  const clusters = useMemo(() => {
    const result: AssetCluster[] = [];
    const maxScreenDistance = 44;

    assets.forEach((asset) => {
      const point = map.project(L.latLng(asset.position), zoom);
      const cluster = result.find((candidate) => candidate.pixelCenter.distanceTo(point) < maxScreenDistance);
      if (!cluster) {
        result.push({ assets: [asset], position: asset.position, pixelCenter: point });
        return;
      }

      cluster.assets.push(asset);
      const count = cluster.assets.length;
      cluster.pixelCenter = new L.Point(
        cluster.pixelCenter.x + (point.x - cluster.pixelCenter.x) / count,
        cluster.pixelCenter.y + (point.y - cluster.pixelCenter.y) / count,
      );
      const center = map.unproject(cluster.pixelCenter, zoom);
      cluster.position = [center.lat, center.lng];
    });
    return result;
  }, [assets, map, zoom]);

  return (
    <>
      {clusters.map((cluster) => {
        if (cluster.assets.length === 1) {
          const asset = cluster.assets[0];
          return (
            <Marker
              key={asset.id}
              position={asset.position}
              icon={markerIcon(asset, selectedAssetId === asset.id)}
              eventHandlers={{ click: () => onSelect(asset.id) }}
            >
              <Tooltip direction="top" offset={[0, -16]} className="smartcity-map-tooltip">
                <span className="font-semibold">{asset.name}</span>
                <span className="ml-2 text-slate-500">{CATEGORY_META[asset.category].label}</span>
              </Tooltip>
            </Marker>
          );
        }

        return (
          <Marker
            key={`cluster-${cluster.assets.map((asset) => asset.id).join('-')}`}
            position={cluster.position}
            icon={clusterIcon(cluster.assets.length)}
            eventHandlers={{
              click: () => {
                if (zoom < 19) map.flyTo(cluster.position, Math.min(19, zoom + 2), { duration: 0.5 });
              },
            }}
          >
            <Popup>
              <div className="min-w-48">
                <p className="mb-2 text-xs font-bold">{cluster.assets.length} nearby map assets</p>
                <div className="max-h-40 space-y-1 overflow-y-auto">
                  {cluster.assets.map((asset) => (
                    <button
                      key={asset.id}
                      type="button"
                      onClick={(event) => {
                        event.stopPropagation();
                        onSelect(asset.id);
                      }}
                      className="flex w-full flex-col rounded px-2 py-1 text-left text-xs hover:bg-slate-100"
                    >
                      <span className="font-semibold">{asset.name}</span>
                      <span className="font-mono text-[10px] text-slate-500">{asset.id}</span>
                    </button>
                  ))}
                </div>
              </div>
            </Popup>
          </Marker>
        );
      })}
    </>
  );
};

const IconForCategory: React.FC<{ category: AssetCategory; className?: string }> = ({ category, className = 'h-4 w-4' }) => {
  const props = { className, 'aria-hidden': true as const };
  switch (category) {
    case 'traffic': return <Car {...props} />;
    case 'waste': return <Trash2 {...props} />;
    case 'water': return <Droplets {...props} />;
    case 'pollution': return <Wind {...props} />;
    case 'emergency': return <ShieldAlert {...props} />;
    case 'infrastructure': return <Building2 {...props} />;
    case 'parking': return <MapPin {...props} />;
    case 'iot': return <Radio {...props} />;
    case 'proof': return <Check {...props} />;
    case 'grievance': return <AlertTriangle {...props} />;
  }
};

const ResetMapButton: React.FC = () => {
  const map = useMap();
  return (
    <>
      <button type="button" aria-label="Zoom in" onClick={() => map.zoomIn()} className="map-control-button top-[58px]">
        <ZoomIn className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Zoom out" onClick={() => map.zoomOut()} className="map-control-button top-[101px]">
        <ZoomOut className="h-4 w-4" />
      </button>
      <button type="button" aria-label="Reset map to Hyderabad" onClick={() => map.flyTo(CITY_CENTER, CITY_ZOOM, { duration: 0.8 })} className="map-control-button top-[144px]">
        <RotateCcw className="h-4 w-4" />
      </button>
    </>
  );
};

export const CityMapModal: React.FC = () => {
  const {
    telemetry,
    problems,
    setSelectedProblemId,
    setActiveTab,
    currentUser,
    sensors,
    buildings,
  } = useSmartCity();
  const [categoryFilter, setCategoryFilter] = useState<AssetCategory | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | AssetStatus>('all');
  const [search, setSearch] = useState('');
  const [selectedAssetId, setSelectedAssetId] = useState<string | null>(null);
  const [showSectors, setShowSectors] = useState(true);
  const [showRoutes, setShowRoutes] = useState(true);
  const [showBuildingOverlay, setShowBuildingOverlay] = useState(true);
  const [tileErrors, setTileErrors] = useState(0);

  const backendAssets = useMemo(
    () => [...sensorAssets(sensors), ...buildingAssets(buildings), ...grievanceAssets(problems)],
    [sensors, buildings, problems],
  );
  const assets = useMemo(() => [...DEMO_ASSETS, ...backendAssets], [backendAssets]);
  const filteredAssets = useMemo(() => assets.filter((asset) => {
    if (categoryFilter !== 'all' && asset.category !== categoryFilter) return false;
    if (statusFilter !== 'all' && asset.status !== statusFilter) return false;
    const query = search.trim().toLowerCase();
    if (query && !`${asset.name} ${asset.id} ${CATEGORY_META[asset.category].label} ${asset.department || ''}`.toLowerCase().includes(query)) return false;
    return true;
  }), [assets, categoryFilter, statusFilter, search]);
  const selectedAsset = assets.find((asset) => asset.id === selectedAssetId) || null;
  const locatedSensorsCount = backendAssets.filter((asset) => asset.category === 'iot').length;
  const locatedBuildingsCount = backendAssets.filter((asset) => asset.category === 'infrastructure').length;
  const locatedProblemCount = backendAssets.filter((asset) => asset.category === 'grievance' || asset.category === 'proof').length;
  const unreadableCoordinatesCount = sensors.length + buildings.length - locatedSensorsCount - locatedBuildingsCount;

  const openRelatedRecord = () => {
    if (!selectedAsset?.problem) return;
    setSelectedProblemId(selectedAsset.problem.id);
  };

  return (
    <div className="city-map-page mx-auto max-w-[1800px] space-y-4 p-4 lg:p-6">
      <style>{`
        .city-map .leaflet-container { background: #061322; font: inherit; }
        .city-map .leaflet-tile-pane { filter: invert(1) hue-rotate(180deg) brightness(.72) saturate(.8) contrast(1.1); }
        .city-map .leaflet-control-attribution { background: rgba(3, 13, 25, .82) !important; color: #94a3b8 !important; }
        .city-map .leaflet-control-attribution a { color: #67e8f9 !important; }
        .city-map .leaflet-control-zoom { display: none; }
        .smartcity-marker-shell, .smartcity-sector-shell, .smartcity-cluster-shell { background: transparent; border: 0; }
        .smartcity-marker { width: var(--marker-size); height: var(--marker-size); display:flex; align-items:center; justify-content:center; border-radius:999px; color:#f8fafc; font:700 13px/1 ui-sans-serif,system-ui; background: color-mix(in srgb, var(--marker-color) 42%, #071326); border:2px solid color-mix(in srgb, var(--marker-color) 85%, white); box-shadow:0 0 0 3px color-mix(in srgb, var(--marker-color) 17%, transparent),0 0 16px color-mix(in srgb, var(--marker-color) 72%, transparent),inset 0 0 8px color-mix(in srgb, var(--marker-color) 32%, transparent); transition:transform .16s ease,box-shadow .16s ease; }
        .smartcity-cluster { display:flex; width:42px; height:42px; align-items:center; justify-content:center; border:2px solid #67e8f9; border-radius:999px; background:rgba(6,19,34,.94); box-shadow:0 0 0 4px rgba(34,211,238,.18),0 0 18px rgba(34,211,238,.72); color:#ecfeff; font:700 12px ui-monospace,SFMono-Regular,monospace; }
        .smartcity-marker:hover,.smartcity-marker.is-selected { transform:scale(1.18); box-shadow:0 0 0 5px color-mix(in srgb, var(--marker-color) 24%, transparent),0 0 25px color-mix(in srgb, var(--marker-color) 95%, transparent),inset 0 0 10px color-mix(in srgb, var(--marker-color) 42%, transparent); }
        .smartcity-marker.is-selected { animation:mapMarkerPulse 1.7s ease-in-out infinite; }
        .smartcity-marker-svg { width:16px; height:16px; }
        .smartcity-sector-tag { display:inline-flex; align-items:center; justify-content:center; min-width:68px; height:20px; padding:0 7px; border:1px solid rgba(34,211,238,.3); border-radius:4px; background:rgba(2,10,22,.86); box-shadow:0 0 11px rgba(34,211,238,.12); color:#d8f5ff; font:600 9px ui-monospace,SFMono-Regular,monospace; white-space:nowrap; }
        .map-control-button { position:absolute; right:12px; z-index:500; display:flex; height:36px; width:36px; align-items:center; justify-content:center; border:1px solid rgba(34,211,238,.28); border-radius:9px; background:rgba(4,15,30,.94); color:#a5f3fc; box-shadow:0 3px 14px rgba(0,0,0,.36); cursor:pointer; transition:all .16s ease; }
        .map-control-button:hover { border-color:rgba(34,211,238,.75); color:#fff; box-shadow:0 0 16px rgba(34,211,238,.2); }
        @keyframes mapMarkerPulse { 0%,100% { filter:brightness(1); } 50% { filter:brightness(1.28); } }
        @media (prefers-reduced-motion: reduce) { .smartcity-marker.is-selected { animation:none; } }
      `}</style>

      <header className="flex flex-col justify-between gap-3 border-b border-cyan-950/70 pb-4 md:flex-row md:items-center">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg border border-cyan-400/30 bg-cyan-500/10 text-cyan-300">
              <Activity className="h-4 w-4" />
            </span>
            <h1 className="text-lg font-bold tracking-wide text-white">Smart City Geospatial Digital Twin</h1>
            <span className="rounded border border-amber-500/30 bg-amber-500/10 px-2 py-0.5 font-mono text-[9px] uppercase tracking-wider text-amber-300">
              Demo assets mapped
            </span>
          </div>
          <p className="mt-1 text-xs text-slate-400">
            Hyderabad, Telangana • City streets from OpenStreetMap • {locatedProblemCount} located civic reports
            <span className="ml-2 text-cyan-300">{locatedSensorsCount} located backend IoT assets</span>
            <span className="ml-2 text-sky-300">{locatedBuildingsCount} located backend buildings</span>
          </p>
        </div>
        <div className="relative w-full md:w-80">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search assets, IDs, departments..."
            aria-label="Search map assets"
            className="w-full rounded-xl border border-slate-700 bg-[#071326] py-2 pl-9 pr-3 text-xs text-white outline-none placeholder:text-slate-500 focus:border-cyan-500/70"
          />
        </div>
      </header>

      <div className="flex flex-wrap items-center gap-2">
        <span className="mr-1 flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          <Layers className="h-3.5 w-3.5" /> Layers
        </span>
        {CATEGORY_FILTERS.map((filter) => (
          <button
            key={filter.id}
            type="button"
            onClick={() => setCategoryFilter(filter.id)}
            className={`rounded-lg border px-2.5 py-1.5 text-[10px] font-semibold transition ${
              categoryFilter === filter.id
                ? 'border-cyan-400/50 bg-cyan-500/15 text-cyan-200'
                : 'border-slate-800 bg-[#091428] text-slate-400 hover:border-slate-600 hover:text-white'
            }`}
          >
            {filter.label}
          </button>
        ))}
        <span className="ml-2 hidden h-5 border-l border-slate-800 sm:block" />
        <label className="flex items-center gap-1.5 text-[10px] text-slate-400">
          Status
          <select
            value={statusFilter}
            onChange={(event) => setStatusFilter(event.target.value as typeof statusFilter)}
            className="rounded-lg border border-slate-800 bg-[#091428] px-2 py-1.5 text-[10px] text-slate-200 outline-none focus:border-cyan-500/60"
            aria-label="Filter map assets by status"
          >
            <option value="all">All</option>
            <option value="critical">Critical</option>
            <option value="warning">Warning</option>
            <option value="active">Active</option>
            <option value="normal">Normal</option>
            <option value="resolved">Resolved</option>
          </select>
        </label>
        <span className="ml-auto font-mono text-[10px] text-cyan-300">{filteredAssets.length} / {assets.length} assets</span>
      </div>

      <main className="city-map relative h-[64vh] min-h-[480px] overflow-hidden rounded-2xl border border-cyan-900/70 bg-[#061322] shadow-[0_18px_60px_rgba(0,0,0,.4),0_0_30px_rgba(8,145,178,.08)] md:h-[680px]">
        <MapContainer
          center={CITY_CENTER}
          zoom={CITY_ZOOM}
          minZoom={9}
          maxZoom={19}
          scrollWheelZoom
          zoomControl={false}
          preferCanvas
          className="h-full w-full"
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://tile.openstreetmap.org/{z}/{x}/{y}.png"
            eventHandlers={{
              tileerror: () => setTileErrors((count) => count + 1),
            }}
          />

          {showBuildingOverlay && BUILDING_FOOTPRINTS.map((footprint, index) => (
            <Polygon
              key={`footprint-${index}`}
              positions={footprint}
              pathOptions={{
                color: '#42e8e2',
                weight: 1.2,
                opacity: 0.7,
                fillColor: '#12a9b8',
                fillOpacity: 0.11,
                interactive: false,
              }}
            />
          ))}

          {showRoutes && SIMULATED_ROUTES.map((route) => (
            <React.Fragment key={route.name}>
              <Polyline
                positions={route.points}
                pathOptions={{
                  color: route.color,
                  weight: 9,
                  opacity: 0.16,
                  lineCap: 'round',
                  interactive: false,
                }}
              />
              <Polyline
                positions={route.points}
                pathOptions={{
                  color: route.color,
                  weight: 3.5,
                  opacity: 0.94,
                  dashArray: route.dashed ? '8 9' : undefined,
                  lineCap: 'round',
                  lineJoin: 'round',
                  interactive: false,
                }}
              />
            </React.Fragment>
          ))}

          {showSectors && SECTORS.map((sector) => (
            <Marker
              key={sector.name}
              position={sector.position}
              icon={sectorIcon(sector.name)}
              interactive={false}
              keyboard={false}
            />
          ))}

          <MapAssetMarkers
            assets={filteredAssets}
            selectedAssetId={selectedAssetId}
            onSelect={setSelectedAssetId}
          />

          <ResetMapButton />
        </MapContainer>

        <div className="pointer-events-none absolute inset-0 z-[400] opacity-[0.095]" style={{
          backgroundImage: 'linear-gradient(rgba(39,185,220,.35) 1px,transparent 1px),linear-gradient(90deg,rgba(39,185,220,.35) 1px,transparent 1px)',
          backgroundSize: '64px 64px',
        }} />

        <div className="absolute left-3 top-3 z-[410] flex max-w-[calc(100%-4rem)] flex-wrap gap-1.5">
          <button type="button" onClick={() => setShowSectors((visible) => !visible)} className={`map-chip ${showSectors ? 'is-on' : ''}`}>
            <Signpost className="h-3 w-3" /> Sectors
          </button>
          <button type="button" onClick={() => setShowRoutes((visible) => !visible)} className={`map-chip ${showRoutes ? 'is-on' : ''}`}>
            <ChevronRight className="h-3 w-3" /> Simulated routes
          </button>
          <button type="button" onClick={() => setShowBuildingOverlay((visible) => !visible)} className={`map-chip ${showBuildingOverlay ? 'is-on' : ''}`}>
            <Building2 className="h-3 w-3" /> Footprints
          </button>
          <span className="rounded-md border border-amber-400/30 bg-[#091426]/90 px-2 py-1 text-[9px] font-mono uppercase tracking-wide text-amber-200">
            Illustrative overlays
          </span>
        </div>

        {tileErrors > 3 && (
          <div className="absolute left-3 top-14 z-[410] max-w-xs rounded-lg border border-amber-500/40 bg-[#111a2c]/95 px-3 py-2 text-[10px] text-amber-200 shadow-xl">
            Some OpenStreetMap tiles could not load. Check your network connection; markers and controls remain usable.
          </div>
        )}

        {selectedAsset && (
          <aside className="absolute bottom-3 left-3 right-3 z-[420] max-h-[48%] overflow-y-auto rounded-2xl border border-cyan-400/30 bg-[#061326]/95 p-4 shadow-[0_12px_38px_rgba(0,0,0,.55),0_0_28px_rgba(8,145,178,.15)] backdrop-blur-xl md:bottom-auto md:left-auto md:right-3 md:top-3 md:max-h-[calc(100%-24px)] md:w-[340px]">
            <div className="flex items-start gap-3 border-b border-slate-800 pb-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border bg-slate-900/80" style={{ color: STATUS_COLOR[selectedAsset.status], borderColor: `${STATUS_COLOR[selectedAsset.status]}66` }}>
                <IconForCategory category={selectedAsset.category} />
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[10px] text-cyan-300">{selectedAsset.id}</span>
                  <span className="rounded border px-1.5 py-0.5 text-[8px] font-bold uppercase tracking-wide" style={{ color: STATUS_COLOR[selectedAsset.status], borderColor: `${STATUS_COLOR[selectedAsset.status]}66`, backgroundColor: `${STATUS_COLOR[selectedAsset.status]}14` }}>
                    {selectedAsset.status}
                  </span>
                </div>
                <h2 className="mt-1 text-sm font-bold leading-snug text-white">{selectedAsset.name}</h2>
              </div>
              <button type="button" onClick={() => setSelectedAssetId(null)} aria-label="Close asset details" className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-3 grid grid-cols-2 gap-x-3 gap-y-2 text-[10px]">
              <span className="text-slate-500">Category</span>
              <span className="text-right text-slate-200">{CATEGORY_META[selectedAsset.category].label}</span>
              <span className="text-slate-500">Coordinates</span>
              <span className="text-right font-mono text-cyan-200">{selectedAsset.position[0].toFixed(5)}, {selectedAsset.position[1].toFixed(5)}</span>
              <span className="text-slate-500">Severity</span>
              <span className="text-right text-slate-200">{selectedAsset.severity || 'Not reported'}</span>
              <span className="text-slate-500">Sensor reading</span>
              <span className="text-right text-slate-200">{selectedAsset.reading || telemetryReading(selectedAsset.category, telemetry) || 'Not available'}</span>
              <span className="text-slate-500">Last updated</span>
              <span className="text-right text-slate-200">{selectedAsset.updatedAt ? new Date(selectedAsset.updatedAt).toLocaleString() : 'Not available'}</span>
              <span className="text-slate-500">Department</span>
              <span className="text-right text-slate-200">{selectedAsset.department || 'Not assigned'}</span>
              <span className="text-slate-500">Officer</span>
              <span className="text-right text-slate-200">{selectedAsset.officer || 'Not assigned'}</span>
              <span className="text-slate-500">Ticket</span>
              <span className="text-right text-slate-200">{selectedAsset.ticket || 'None linked'}</span>
            </div>

            {selectedAsset.demo && (
              <div className="mt-3 rounded-lg border border-amber-500/30 bg-amber-500/10 px-2.5 py-2 text-[9px] leading-relaxed text-amber-200">
                Simulated map asset at an illustrative Hyderabad location. Not a live sensor or official incident.
              </div>
            )}

            {selectedAsset.problem && (
              <button type="button" onClick={openRelatedRecord} className="mt-3 flex w-full items-center justify-between rounded-lg border border-pink-500/30 bg-pink-500/10 px-3 py-2 text-[10px] font-semibold text-pink-200 transition hover:bg-pink-500/20">
                Open grievance / proof record <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}
            {currentUser.role === 'admin' && (
              <button
                type="button"
                onClick={() => {
                  const moduleByCategory: Partial<Record<AssetCategory, string>> = {
                    traffic: 'traffic',
                    waste: 'waste',
                    water: 'water',
                    pollution: 'pollution',
                    emergency: 'emergency',
                    infrastructure: 'city_map',
                    parking: 'city_map',
                    iot: 'iot_studio',
                    grievance: 'admin_queue',
                    proof: 'proof_gallery',
                  };
                  setActiveTab(moduleByCategory[selectedAsset.category] || 'city_map');
                }}
                className="mt-2 flex w-full items-center justify-between rounded-lg border border-cyan-500/25 bg-cyan-500/5 px-3 py-2 text-[10px] font-semibold text-cyan-200 transition hover:bg-cyan-500/15"
              >
                Open related municipal module <ChevronRight className="h-3.5 w-3.5" />
              </button>
            )}

            <div className="mt-3 flex items-center gap-2 text-[9px] text-slate-500">
              <Clock3 className="h-3 w-3" />
              {selectedAsset.demo
                ? 'Simulated map asset • any reading shown is dashboard simulation state'
                : 'Source: application record'}
            </div>
          </aside>
        )}

        <div className="absolute bottom-3 left-3 z-[410] hidden max-w-[calc(100%-24px)] rounded-xl border border-cyan-900/50 bg-[#061326]/90 p-2.5 shadow-lg backdrop-blur md:block">
          <div className="mb-2 flex items-center justify-between gap-4">
            <span className="text-[9px] font-bold uppercase tracking-[.16em] text-slate-300">Map legend</span>
            <span className="font-mono text-[8px] text-slate-500">HYD / 17.3850° N</span>
          </div>
          <div className="flex flex-wrap gap-x-3 gap-y-1.5">
            {[
              ['#ef3340', 'Critical / emergency'],
              ['#f59e0b', 'Warning'],
              ['#06b6d4', 'IoT / monitor'],
              ['#10b981', 'Normal / resolved'],
              ['#ec4899', 'Grievance'],
              ['#d946ef', 'Proof location'],
            ].map(([color, label]) => (
              <span key={label} className="flex items-center gap-1.5 text-[8px] text-slate-400">
                <span className="h-2 w-2 rounded-full border" style={{ backgroundColor: color, borderColor: `${color}aa`, boxShadow: `0 0 7px ${color}aa` }} />
                {label}
              </span>
            ))}
            <span className="flex items-center gap-1.5 text-[8px] text-cyan-200">
              <span className="w-5 border-t-2 border-dashed border-cyan-300" /> Simulated fleet
            </span>
            <span className="flex items-center gap-1.5 text-[8px] text-blue-200">
              <span className="w-5 border-t-2 border-blue-400" /> Simulated dispatch
            </span>
          </div>
        </div>

        {unreadableCoordinatesCount > 0 && (
          <div className="absolute bottom-3 right-3 z-[410] hidden max-w-[220px] rounded-lg border border-slate-700/70 bg-[#061326]/90 px-2.5 py-2 text-[9px] leading-relaxed text-slate-400 backdrop-blur md:block">
            {unreadableCoordinatesCount} backend sensor/building record(s) have no valid coordinates and are not plotted.
          </div>
        )}

        <div className="pointer-events-none absolute right-3 top-3 z-[405] flex items-center gap-1.5 rounded-lg border border-cyan-900/60 bg-[#061326]/85 px-2 py-1.5 text-[8px] font-mono uppercase tracking-wider text-cyan-200">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400" />
          Hyderabad city view
        </div>
      </main>

      <footer className="flex flex-col gap-2 text-[9px] text-slate-500 sm:flex-row sm:items-center sm:justify-between">
        <span>Map tiles © OpenStreetMap contributors • <a className="text-cyan-400 hover:underline" href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">Attribution & tile terms</a></span>
        <span className="flex items-center gap-1"><LocateFixed className="h-3 w-3" /> {filteredAssets.length} visible assets • simulated demo layers are labelled</span>
      </footer>

      <style>{`
        .map-chip { display:inline-flex; align-items:center; gap:5px; border:1px solid rgba(71,85,105,.6); border-radius:7px; background:rgba(6,19,38,.91); padding:5px 8px; color:#94a3b8; font:600 9px ui-sans-serif,system-ui; transition:all .15s ease; cursor:pointer; }
        .map-chip:hover { color:#e2e8f0; border-color:rgba(34,211,238,.45); }
        .map-chip.is-on { color:#a5f3fc; border-color:rgba(34,211,238,.38); background:rgba(8,82,101,.55); }
        .smartcity-map-tooltip { border:1px solid rgba(34,211,238,.32)!important; border-radius:7px!important; background:rgba(4,16,31,.96)!important; color:#e2e8f0!important; box-shadow:0 0 14px rgba(34,211,238,.15)!important; }
        .smartcity-map-tooltip:before { border-top-color:rgba(4,16,31,.96)!important; }
      `}</style>
    </div>
  );
};
