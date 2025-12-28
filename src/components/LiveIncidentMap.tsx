import React, { useEffect, useRef, useState, useCallback } from 'react';
import * as d3 from 'd3';
import { Incident } from '../types';
import { getTypeIcon, getSeverityColor } from '../utils/helpers';
import { IncidentWebSocket } from '../services/api';

interface LiveIncidentMapProps {
  incidents: Incident[];
  onIncidentClick?: (incident: Incident) => void;
  className?: string;
  height?: number;
  width?: number;
}

interface MapIncident extends Incident {
  x?: number;
  y?: number;
  clusterId?: string;
}

const LiveIncidentMap: React.FC<LiveIncidentMapProps> = ({
  incidents,
  onIncidentClick,
  className = '',
  height = 600,
  width = 800,
}) => {
  const svgRef = useRef<SVGSVGElement>(null);
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [webSocket, setWebSocket] = useState<IncidentWebSocket | null>(null);

  // Handle WebSocket real-time updates
  const handleWebSocketMessage = useCallback((data: any) => {
    console.log('Live map received real-time update:', data);
    if (data.type === 'incident_update' || data.type === 'new_incident') {
      // Re-render the map with updated data
      renderMap();
    }
  }, []);

  // Initialize WebSocket
  useEffect(() => {
    const ws = new IncidentWebSocket(handleWebSocketMessage);
    ws.connect();
    setWebSocket(ws);

    return () => {
      ws.disconnect();
    };
  }, [handleWebSocketMessage]);

  // Helper function to get severity color
  const getSeverityMarkerColor = (severity: string) => {
    switch (severity) {
      case 'Critical': return '#dc2626'; // red-600
      case 'High': return '#ea580c'; // orange-600
      case 'Medium': return '#ca8a04'; // yellow-600
      case 'Low': return '#16a34a'; // green-600
      default: return '#6b7280'; // gray-500
    }
  };

  // Helper function to get incident type icon
  const getIncidentTypeSymbol = (type: string) => {
    switch (type) {
      case 'Accident': return '🚗';
      case 'Medical': return '🏥';
      case 'Fire': return '🔥';
      case 'Crime': return '🚔';
      case 'Fire Emergency': return '🚒';
      case 'Flood': return '🌊';
      case 'Medical Emergency': return '⚕️';
      case 'Gas Leak': return '💨';
      case 'Traffic Accident': return '🚦';
      default: return '⚠️';
    }
  };

  // Create hierarchical clustering for incidents
  const clusterIncidents = (incidents: MapIncident[], distance: number = 20) => {
    const clustered: MapIncident[] = [];
    const clusters: { incidents: MapIncident[]; center: { x: number; y: number } }[] = [];

    incidents.forEach(incident => {
      let assigned = false;
      
      // Try to assign to existing cluster
      for (const cluster of clusters) {
        const dx = incident.x! - cluster.center.x;
        const dy = incident.y! - cluster.center.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < distance) {
          cluster.incidents.push(incident);
          // Update cluster center
          const totalIncidents = cluster.incidents.length;
          cluster.center.x = (cluster.center.x * (totalIncidents - 1) + incident.x!) / totalIncidents;
          cluster.center.y = (cluster.center.y * (totalIncidents - 1) + incident.y!) / totalIncidents;
          assigned = true;
          break;
        }
      }
      
      // Create new cluster if not assigned
      if (!assigned) {
        clusters.push({
          incidents: [incident],
          center: { x: incident.x!, y: incident.y! }
        });
      }
    });

    // Convert clusters to clustered incidents
    clusters.forEach((cluster, clusterIndex) => {
      if (cluster.incidents.length === 1) {
        // Single incident, no clustering needed
        clustered.push(cluster.incidents[0]);
      } else {
        // Multiple incidents in cluster
        const avgSeverity = cluster.incidents.reduce((acc, inc) => {
          const weights = { 'Low': 1, 'Medium': 2, 'High': 3, 'Critical': 4 };
          return acc + (weights[inc.severity as keyof typeof weights] || 2);
        }, 0) / cluster.incidents.length;
        
        const clusterIncident: MapIncident = {
          ...cluster.incidents[0],
          id: `cluster-${clusterIndex}`,
          x: cluster.center.x,
          y: cluster.center.y,
          clusterId: `cluster-${clusterIndex}`,
          // Set severity based on highest severity in cluster
          severity: avgSeverity >= 3.5 ? 'Critical' : 
                   avgSeverity >= 2.5 ? 'High' : 
                   avgSeverity >= 1.5 ? 'Medium' : 'Low'
        };
        clustered.push(clusterIncident);
      }
    });

    return clustered;
  };

  const renderMap = useCallback(() => {
    if (!svgRef.current) return;

    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    // Set up dimensions
    const margin = { top: 20, right: 20, bottom: 20, left: 20 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    // Create projection
    const projection = d3.geoNaturalEarth1()
      .scale(140)
      .translate([innerWidth / 2, innerHeight / 2]);

    const path = d3.geoPath().projection(projection);

    // Create zoom behavior
    const zoom = d3.zoom<SVGSVGElement, unknown>()
      .scaleExtent([0.5, 10])
      .on('zoom', (event) => {
        g.attr('transform', event.transform);
        setZoomLevel(event.transform.k);
      });

    // Create main group
    const g = svg.append('g');

    // Add zoom behavior
    svg.call(zoom);

    // Load world map data (simplified - using a basic world outline)
    const worldGeoJSON = {
      type: "FeatureCollection",
      features: [
        // This is a simplified world outline - in production you'd load from topojson
        {
          type: "Feature",
          properties: { name: "World" },
          geometry: {
            type: "Polygon",
            coordinates: [[
              [-180, -90], [180, -90], [180, 90], [-180, 90], [-180, -90]
            ]]
          }
        }
      ]
    };

    // Draw world background
    g.append('path')
      .datum(worldGeoJSON)
      .attr('d', path)
      .attr('fill', '#f0f9ff') // sky blue
      .attr('stroke', '#0ea5e9') // sky blue border
      .attr('stroke-width', 1);

    // Convert incidents to map coordinates
    const mapIncidents: MapIncident[] = incidents.map(incident => {
      const coords = projection([incident.location.lng, incident.location.lat]);
      return {
        ...incident,
        x: coords?.[0] || 0,
        y: coords?.[1] || 0
      };
    }).filter(incident => incident.x !== undefined && incident.y !== undefined);

    // Cluster incidents if zoomed out
    const clusteredIncidents = zoomLevel < 1.5 
      ? clusterIncidents(mapIncidents, 30)
      : mapIncidents;

    // Create incident markers
    const markers = g.selectAll('.incident-marker')
      .data(clusteredIncidents)
      .enter()
      .append('g')
      .attr('class', 'incident-marker')
      .attr('transform', d => `translate(${d.x}, ${d.y})`)
      .style('cursor', 'pointer')
      .on('click', function(event, d) {
        event.stopPropagation();
        if (d.clusterId) {
          // Cluster clicked - zoom in to cluster area
          svg.transition()
            .duration(750)
            .call(
              zoom.transform,
              d3.zoomIdentity.translate(width / 2 - d.x!, height / 2 - d.y!).scale(2)
            );
        } else {
          setSelectedIncident(d);
          onIncidentClick?.(d);
        }
      });

    // Add marker circles
    markers.append('circle')
      .attr('r', d => d.clusterId ? 12 : 8)
      .attr('fill', d => getSeverityMarkerColor(d.severity))
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 2)
      .style('filter', 'drop-shadow(0 2px 4px rgba(0,0,0,0.3))')
      .on('mouseover', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', (d.clusterId ? 12 : 8) * 1.2);
      })
      .on('mouseout', function(event, d) {
        d3.select(this)
          .transition()
          .duration(200)
          .attr('r', d.clusterId ? 12 : 8);
      });

    // Add cluster count labels
    markers.filter(d => d.clusterId)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('fill', 'white')
      .attr('font-size', '12px')
      .attr('font-weight', 'bold')
      .text(d => {
        const clusterSize = incidents.filter(inc => {
          const coords = projection([inc.location.lng, inc.location.lat]);
          return coords && Math.abs(coords[0] - d.x!) < 30 && Math.abs(coords[1] - d.y!) < 30;
        }).length;
        return clusterSize.toString();
      });

    // Add incident type icons for individual incidents
    markers.filter(d => !d.clusterId)
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('dy', '0.35em')
      .attr('font-size', '10px')
      .text(d => getIncidentTypeSymbol(d.type));

    // Add legend
    const legend = g.append('g')
      .attr('class', 'legend')
      .attr('transform', `translate(20, ${height - 100})`);

    const legendData = [
      { severity: 'Critical', color: getSeverityMarkerColor('Critical') },
      { severity: 'High', color: getSeverityMarkerColor('High') },
      { severity: 'Medium', color: getSeverityMarkerColor('Medium') },
      { severity: 'Low', color: getSeverityMarkerColor('Low') }
    ];

    const legendItems = legend.selectAll('.legend-item')
      .data(legendData)
      .enter()
      .append('g')
      .attr('class', 'legend-item')
      .attr('transform', (d, i) => `translate(0, ${i * 20})`);

    legendItems.append('circle')
      .attr('r', 6)
      .attr('fill', d => d.color)
      .attr('stroke', '#ffffff')
      .attr('stroke-width', 1);

    legendItems.append('text')
      .attr('x', 15)
      .attr('y', 0)
      .attr('dy', '0.35em')
      .attr('font-size', '12px')
      .text(d => d.severity);

    // Add zoom level indicator
    g.append('text')
      .attr('x', width - 20)
      .attr('y', 30)
      .attr('text-anchor', 'end')
      .attr('font-size', '12px')
      .attr('fill', '#666')
      .text(`Zoom: ${zoomLevel.toFixed(1)}x`);

    // Add clustering indicator
    if (zoomLevel < 1.5) {
      g.append('text')
        .attr('x', width - 20)
        .attr('y', 50)
        .attr('text-anchor', 'end')
        .attr('font-size', '12px')
        .attr('fill', '#666')
        .text('🔍 Incidents clustered');
    }

  }, [incidents, height, width, zoomLevel, onIncidentClick]);

  // Initial render and re-render on data changes
  useEffect(() => {
    renderMap();
  }, [renderMap]);

  return (
    <div className={`relative ${className}`}>
      <svg
        ref={svgRef}
        width={width}
        height={height}
        className="border rounded-lg bg-gradient-to-br from-blue-50 to-blue-100"
      />
      
      {/* Details Card */}
      {selectedIncident && !selectedIncident.clusterId && (
        <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-4 max-w-sm z-10">
          <div className="flex justify-between items-start mb-2">
            <h3 className="font-semibold text-lg">
              {getIncidentTypeSymbol(selectedIncident.type)} {selectedIncident.type}
            </h3>
            <button
              onClick={() => setSelectedIncident(null)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>
          
          <div className="space-y-2 text-sm">
            <div>
              <span className="font-medium">Severity:</span>
              <span 
                className="ml-2 px-2 py-1 rounded text-white text-xs"
                style={{ backgroundColor: getSeverityMarkerColor(selectedIncident.severity) }}
              >
                {selectedIncident.severity}
              </span>
            </div>
            
            <div>
              <span className="font-medium">Location:</span>
              <p className="text-gray-600">
                {selectedIncident.location.address || 
                 `${selectedIncident.location.lat.toFixed(4)}, ${selectedIncident.location.lng.toFixed(4)}`}
              </p>
            </div>
            
            {selectedIncident.description && (
              <div>
                <span className="font-medium">Description:</span>
                <p className="text-gray-600">{selectedIncident.description}</p>
              </div>
            )}
            
            <div>
              <span className="font-medium">Reported:</span>
              <p className="text-gray-600">
                {new Date(selectedIncident.timestamp).toLocaleString()}
              </p>
            </div>
            
            {selectedIncident.verifications && (
              <div>
                <span className="font-medium">Verifications:</span>
                <p className="text-gray-600">{selectedIncident.verifications}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Map Controls */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-2 flex gap-2">
        <button
          onClick={() => {
            const svg = d3.select(svgRef.current);
            svg.transition().duration(750).call(
              d3.zoom<SVGSVGElement, unknown>().transform,
              d3.zoomIdentity
            );
          }}
          className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 text-sm"
        >
          Reset View
        </button>
      </div>

      {/* Live indicator */}
      <div className="absolute top-4 left-4 bg-green-500 text-white px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2">
        <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>
        Live
      </div>
    </div>
  );
};

export default LiveIncidentMap;
