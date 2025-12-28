import { useRef, useEffect, useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/Card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/Select";
import { Button } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { geoPath, geoMercator } from 'd3-geo';
import { select } from 'd3-selection';
import { scaleThreshold } from 'd3-scale';
import { interpolateReds } from 'd3-scale-chromatic';
import { json } from 'd3-fetch';
import { ZoomIn, RotateCcw, Map as MapIcon, Loader2, AlertTriangle, ShieldCheck } from 'lucide-react';

// Use same color scale for incidents
const COLOR_SCALE = interpolateReds;

// Types
type IncidentType = 'Flood' | 'Fire' | 'Earthquake' | 'Medical' | 'Road Accident' | 'Other';
type Severity = 'High' | 'Medium' | 'Low';

interface Incident {
    id: number;
    type: IncidentType;
    state: string;
    severity: Severity;
    count: number;
}

// Mock Data
const MOCK_INCIDENT_DATA: Incident[] = [
    { id: 1, type: 'Flood', state: 'Kerala', severity: 'High', count: 12 },
    { id: 2, type: 'Fire', state: 'Maharashtra', severity: 'Critical', count: 8 },
    { id: 3, type: 'Earthquake', state: 'Gujarat', severity: 'High', count: 5 },
    { id: 4, type: 'Medical', state: 'Delhi', severity: 'Medium', count: 25 },
    { id: 5, type: 'Road Accident', state: 'Uttar Pradesh', severity: 'High', count: 15 },
    { id: 6, type: 'Flood', state: 'Assam', severity: 'High', count: 18 },
    { id: 7, type: 'Other', state: 'Karnataka', severity: 'Low', count: 10 },
    { id: 8, type: 'Fire', state: 'Tamil Nadu', severity: 'Medium', count: 7 },
    { id: 9, type: 'Medical', state: 'West Bengal', severity: 'High', count: 12 },
    { id: 10, type: 'Flood', state: 'Bihar', severity: 'High', count: 20 },
    { id: 11, type: 'Road Accident', state: 'Rajasthan', severity: 'Medium', count: 9 },
    { id: 12, type: 'Other', state: 'Madhya Pradesh', severity: 'Low', count: 6 },
    { id: 13, type: 'Fire', state: 'Punjab', severity: 'High', count: 4 },
    { id: 14, type: 'Medical', state: 'Telangana', severity: 'Medium', count: 11 },
    { id: 15, type: 'Flood', state: 'Odisha', severity: 'High', count: 14 },
];

const STATE_NAMES: { [key: string]: string } = {
    'Andaman & Nicobar Island': 'Andaman and Nicobar',
    'Andhra Pradesh': 'Andhra Pradesh',
    'Arunanchal Pradesh': 'Arunachal Pradesh',
    'Assam': 'Assam',
    'Bihar': 'Bihar',
    'Chandigarh': 'Chandigarh',
    'Chhattisgarh': 'Chhattisgarh',
    'Dadara & Nagar Havelli': 'Dadra and Nagar Haveli',
    'Daman & Diu': 'Daman and Diu',
    'Delhi': 'Delhi',
    'Goa': 'Goa',
    'Gujarat': 'Gujarat',
    'Haryana': 'Haryana',
    'Himachal Pradesh': 'Himachal Pradesh',
    'Jammu & Kashmir': 'Jammu and Kashmir',
    'Jharkhand': 'Jharkhand',
    'Karnataka': 'Karnataka',
    'Kerala': 'Kerala',
    'Lakshadweep': 'Lakshadweep',
    'Madhya Pradesh': 'Madhya Pradesh',
    'Maharashtra': 'Maharashtra',
    'Manipur': 'Manipur',
    'Meghalaya': 'Meghalaya',
    'Mizoram': 'Mizoram',
    'Nagaland': 'Nagaland',
    'Odisha': 'Odisha',
    'Puducherry': 'Puducherry',
    'Punjab': 'Punjab',
    'Rajasthan': 'Rajasthan',
    'Sikkim': 'Sikkim',
    'Tamil Nadu': 'Tamil Nadu',
    'Telangana': 'Telangana',
    'Tripura': 'Tripura',
    'Uttar Pradesh': 'Uttar Pradesh',
    'Uttarakhand': 'Uttarakhand',
    'West Bengal': 'West Bengal',
};

export function IncidentMap({ className, isAdmin = false }: { className?: string, isAdmin?: boolean }) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [hoveredState, setHoveredState] = useState<{ name: string; count: number } | null>(null);
    const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const [zoomedState, setZoomedState] = useState<string | null>(null);
    const [filterType, setFilterType] = useState<string>('all');
    const [geoDataCache, setGeoDataCache] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);

    const resetView = useCallback(() => {
        setZoomedState(null);
    }, []);

    const getIncidentCount = useCallback((stateName: string) => {
        const standardizedName = STATE_NAMES[stateName] || stateName;
        return MOCK_INCIDENT_DATA
            .filter(i => {
                const matchesState = i.state.toLowerCase() === standardizedName.toLowerCase();
                const matchesFilter = filterType === 'all' || i.type === filterType;
                return matchesState && matchesFilter;
            })
            .reduce((sum, item) => sum + item.count, 0);
    }, [filterType]);

    useEffect(() => {
        if (!svgRef.current) return;

        const width = 600;
        const height = 650;

        const svg = select(svgRef.current);
        svg.selectAll('*').remove();

        const projection = geoMercator()
            .center([78.9, 22.5])
            .scale(zoomedState ? 2000 : 1000)
            .translate([width / 2, height / 2]);

        const path = geoPath().projection(projection);

        if (zoomedState && geoDataCache) {
            const selectedFeature = geoDataCache.features.find(
                (f: any) => f.properties.ST_NM === zoomedState
            );
            if (selectedFeature) {
                const bounds = path.bounds(selectedFeature);
                const [[x0, y0], [x1, y1]] = bounds;
                const centerX = (x0 + x1) / 2;
                const centerY = (y0 + y1) / 2;
                // Adjust for desired center
                projection.center(projection.invert([centerX, centerY]) || [78.9, 22.5]);
                projection.translate([width / 2, height / 2]);
            }
        }

        // Color scale 0-50 incidents
        const colorScale = scaleThreshold<number, string>()
            .domain([5, 10, 20, 40])
            .range([
                COLOR_SCALE(0.1),
                COLOR_SCALE(0.3),
                COLOR_SCALE(0.5),
                COLOR_SCALE(0.7),
                COLOR_SCALE(0.9),
            ]);

        const loadData = async () => {
            try {
                let topology = geoDataCache;
                if (!topology) {
                    topology = await json('https://gist.githubusercontent.com/jbrobst/56c13bbbf9d97d187fea01ca62ea5112/raw/e388c4cae20aa53cb5090210a42ebb9b765c0a36/india_states.geojson');
                    setGeoDataCache(topology);
                }
                setIsLoading(false);

                const states = zoomedState
                    ? topology.features.filter((f: any) => f.properties.ST_NM === zoomedState)
                    : topology.features;

                const stateGroups = svg
                    .selectAll('g.state')
                    .data(states)
                    .enter()
                    .append('g')
                    .attr('class', 'state');

                stateGroups
                    .append('path')
                    .attr('d', path as any)
                    .attr('fill', (d: any) => {
                        const count = getIncidentCount(d.properties.ST_NM);
                        return count > 0 ? colorScale(count) : '#f1f5f9'; // slate-100
                    })
                    .attr('stroke', '#cbd5e1') // slate-300
                    .attr('stroke-width', zoomedState ? 2 : 1)
                    .style('cursor', 'pointer')
                    .style('transition', 'all 0.2s ease')
                    .on('mouseenter', function (event: any, d: any) {
                        const count = getIncidentCount(d.properties.ST_NM);
                        select(this)
                            .attr('stroke', '#64748b')
                            .attr('stroke-width', 2);

                        if (count > 0) {
                            setHoveredState({
                                name: d.properties.ST_NM,
                                count
                            });
                            setMousePos({ x: event.pageX, y: event.pageY });
                        }
                    })
                    .on('mousemove', (event: any) => {
                        setMousePos({ x: event.pageX, y: event.pageY });
                    })
                    .on('mouseleave', function (event: any, d: any) {
                        select(this)
                            .attr('stroke', '#cbd5e1')
                            .attr('stroke-width', zoomedState ? 2 : 1);
                        setHoveredState(null);
                    })
                    .on('dblclick', (event: any, d: any) => {
                        event.stopPropagation();
                        setZoomedState(zoomedState === d.properties.ST_NM ? null : d.properties.ST_NM);
                    });

            } catch (error) {
                console.error("Error loading map data", error);
                setIsLoading(false);
            }
        };

        loadData();

    }, [zoomedState, filterType, geoDataCache, getIncidentCount]);

    return (
        <div className={cn("grid grid-cols-1 lg:grid-cols-3 gap-6", className)}>
            {/* Map Section */}
            <Card className="lg:col-span-2 border-slate-200 dark:border-slate-800 shadow-lg overflow-hidden relative">
                <CardHeader className="flex flex-row items-center justify-between pb-2 bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-800">
                    <div>
                        <CardTitle className="flex items-center gap-2">
                            <MapIcon className="w-5 h-5 text-primary" />
                            India Incident Map
                        </CardTitle>
                        <CardDescription>
                            Real-time visualization of reported incidents across states
                        </CardDescription>
                    </div>

                    <div className="flex items-center gap-2">
                        <Select value={filterType} onValueChange={setFilterType}>
                            <SelectTrigger className="w-[140px] h-9 text-sm">
                                <SelectValue placeholder="Filter Type" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Incidents</SelectItem>
                                <SelectItem value="Flood">Floods</SelectItem>
                                <SelectItem value="Fire">Fires</SelectItem>
                                <SelectItem value="Medical">Medical</SelectItem>
                                <SelectItem value="Road Accident">Accidents</SelectItem>
                            </SelectContent>
                        </Select>
                        {zoomedState && (
                            <Button variant="outline" size="sm" onClick={resetView} className="h-9">
                                <RotateCcw className="w-3 h-3 mr-1" /> Reset
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="p-0 relative min-h-[500px] flex items-center justify-center bg-slate-50 dark:bg-slate-950/30">
                    {isLoading && (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/50 backdrop-blur-sm z-10 transition-opacity">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                                <span className="text-sm font-medium text-muted-foreground">Loading Map Data...</span>
                            </div>
                        </div>
                    )}

                    <svg
                        ref={svgRef}
                        viewBox="0 0 600 650"
                        className="w-full h-full max-h-[600px] animate-in fade-in duration-700"
                    />

                    {/* Tooltip */}
                    {hoveredState && (
                        <div
                            className="fixed bg-slate-900/90 text-white px-4 py-2 rounded-lg shadow-xl z-50 pointer-events-none border border-slate-700 backdrop-blur-md text-sm"
                            style={{
                                left: `${mousePos.x + 15}px`,
                                top: `${mousePos.y - 40}px`,
                            }}
                        >
                            <div className="font-bold">{hoveredState.name}</div>
                            <div className="flex items-center gap-2 mt-1">
                                <AlertTriangle className="w-3 h-3 text-red-500" />
                                <span className="font-mono">{hoveredState.count} Incidents</span>
                            </div>
                        </div>
                    )}

                    {/* Legend */}
                    <div className="absolute bottom-4 left-4 p-3 bg-white/90 dark:bg-slate-900/90 backdrop-blur rounded-lg border border-slate-200 dark:border-slate-800 shadow-lg text-xs">
                        <p className="font-semibold mb-2">Incident Intensity</p>
                        <div className="flex items-center gap-1">
                            <span className="w-8 h-2 rounded-[1px]" style={{ background: COLOR_SCALE(0.1) }}></span>
                            <span className="w-8 h-2 rounded-[1px]" style={{ background: COLOR_SCALE(0.3) }}></span>
                            <span className="w-8 h-2 rounded-[1px]" style={{ background: COLOR_SCALE(0.5) }}></span>
                            <span className="w-8 h-2 rounded-[1px]" style={{ background: COLOR_SCALE(0.7) }}></span>
                            <span className="w-8 h-2 rounded-[1px]" style={{ background: COLOR_SCALE(0.9) }}></span>
                        </div>
                        <div className="flex justify-between mt-1 text-slate-500">
                            <span>Low</span>
                            <span>High</span>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Sidebar Stats */}
            <div className="space-y-6">
                <Card className="shadow-md">
                    <CardHeader>
                        <CardTitle>Regional Summary</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-900/50">
                            <h4 className="text-sm font-medium text-red-800 dark:text-red-300 mb-1">Total Active Incidents</h4>
                            <p className="text-3xl font-bold text-red-600 dark:text-red-400">145</p>
                            <p className="text-xs text-red-600/70 mt-1">+12% from yesterday</p>
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between text-sm font-medium">
                                <span>Top Affected States</span>
                                <span>Count</span>
                            </div>
                            {MOCK_INCIDENT_DATA.sort((a, b) => b.count - a.count).slice(0, 5).map((state, i) => (
                                <div key={i} className="flex items-center justify-between p-2 rounded hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-default text-sm">
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-red-500" />
                                        {state.state}
                                    </div>
                                    <span className="font-mono font-semibold">{state.count}</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {isAdmin && (
                    <Card className="shadow-md border-orange-200 dark:border-orange-900/50">
                        <CardHeader className="pb-2">
                            <CardTitle className="text-lg flex items-center gap-2">
                                <ShieldCheck className="w-5 h-5 text-orange-500" />
                                Admin Controls
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-sm text-muted-foreground mb-4">
                                Select a region on the map to deploy resources or broadcast alerts.
                            </p>
                            <Button className="w-full bg-orange-600 hover:bg-orange-700 text-white">
                                Deploy to Current View
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}
