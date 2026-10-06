"use client";

import React, { useEffect, useRef } from "react";
import { BusTelemetry, TransitRoute, TransitStop } from "@/lib/api";

interface LiveMapProps {
  buses: BusTelemetry[];
  routes: TransitRoute[];
  stops: TransitStop[];
  selectedBusId?: number | null;
  onSelectBus?: (bus: BusTelemetry) => void;
  onSelectStop?: (stop: TransitStop) => void;
}

export default function LiveMap({
  buses,
  routes,
  stops,
  selectedBusId,
  onSelectBus,
  onSelectStop,
}: LiveMapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const busMarkersRef = useRef<{ [id: number]: any }>({});

  useEffect(() => {
    if (typeof window === "undefined" || !mapContainerRef.current) return;

    // Dynamically require Leaflet to prevent SSR issues
    const L = require("leaflet");

    // Initialize Map if not already created
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        center: [33.665, 73.045],
        zoom: 12,
        zoomControl: false,
      });

      // Apple / CartoDB Voyager clean light tile layer
      L.tileLayer(
        "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png",
        {
          attribution: '&copy; <a href="https://carto.com/">CARTO</a> & OpenStreetMap',
          subdomains: "abcd",
          maxZoom: 19,
        }
      ).addTo(map);

      // Add Zoom Control to bottom-right
      L.control.zoom({ position: "bottomright" }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Draw Route Polylines
    routes.forEach((route, idx) => {
      if (route.polyline_coordinates && route.polyline_coordinates.length > 0) {
        const color = idx === 0 ? "#0F52BA" : "#1A6DD4";
        L.polyline(route.polyline_coordinates, {
          color: color,
          weight: 4,
          opacity: 0.85,
          smoothFactor: 1,
          dashArray: idx === 1 ? "6, 6" : undefined,
        })
          .addTo(map)
          .bindPopup(`<b style="color: #000926; font-family: Outfit, sans-serif;">${route.name}</b><br/><span style="color: #3D5A80; font-size: 11px;">Distance: ${route.total_distance_km} km</span>`);
      }
    });

    // Draw Stop Markers
    stops.forEach((stop) => {
      const stopHtml = `
        <div style="background: #FFFFFF; border: 2.5px solid #0F52BA; border-radius: 50%; width: 14px; height: 14px; box-shadow: 0 2px 6px rgba(15, 82, 186, 0.35);"></div>
      `;
      const stopIcon = L.divIcon({
        html: stopHtml,
        className: "custom-stop-marker",
        iconSize: [14, 14],
        iconAnchor: [7, 7],
      });

      const marker = L.marker([stop.latitude, stop.longitude], { icon: stopIcon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #000926;">
          <strong style="color: #0F52BA; font-family: Outfit, sans-serif; font-size: 13px;">${stop.name}</strong><br/>
          <span style="font-size: 10px; color: #6B8CAE; font-family: monospace;">Code: ${stop.code}</span><br/>
          <span style="font-size: 11px; color: #3D5A80;">${stop.address}</span>
        </div>
      `);
      marker.on("click", () => onSelectStop && onSelectStop(stop));
    });

    // Draw/Update Bus Markers
    buses.forEach((bus) => {
      const isEnRoute = bus.status === "EN_ROUTE";
      const isDelayed = bus.status === "DELAYED";
      const statusColor = isEnRoute ? "#10B981" : isDelayed ? "#F59E0B" : "#6B8CAE";

      const busHtml = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: ${statusColor}; opacity: 0.25; animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="background: #000926; border: 2px solid ${statusColor}; border-radius: 8px; padding: 3px 6px; box-shadow: 0 4px 12px rgba(0, 9, 38, 0.25); display: flex; align-items: center; gap: 4px;">
            <span style="font-size: 10px; font-weight: bold; color: #FFFFFF; font-family: monospace;">${bus.bus_number}</span>
            <span style="width: 6px; height: 6px; border-radius: 50%; background: ${statusColor};"></span>
          </div>
        </div>
      `;

      const busIcon = L.divIcon({
        html: busHtml,
        className: "custom-bus-marker",
        iconSize: [60, 30],
        iconAnchor: [30, 15],
      });

      if (busMarkersRef.current[bus.id]) {
        busMarkersRef.current[bus.id].setLatLng([bus.current_latitude, bus.current_longitude]);
        busMarkersRef.current[bus.id].setIcon(busIcon);
      } else {
        const marker = L.marker([bus.current_latitude, bus.current_longitude], { icon: busIcon }).addTo(map);
        marker.on("click", () => onSelectBus && onSelectBus(bus));
        busMarkersRef.current[bus.id] = marker;
      }

      busMarkersRef.current[bus.id].bindPopup(`
        <div style="font-family: Inter, sans-serif; font-size: 12px; color: #000926; min-width: 150px;">
          <strong style="color: #0F52BA; font-family: Outfit, sans-serif; font-size: 14px;">${bus.bus_number}</strong> (${bus.registration_plate})<br/>
          <span style="font-size: 11px; color: #3D5A80;">${bus.model_name}</span><br/>
          <div style="margin-top: 6px; padding-top: 6px; border-top: 1px solid #D6E6F3; font-family: monospace; font-size: 11px;">
            <div>Speed: <span style="color: #0F52BA; font-weight: bold;">${bus.current_speed} km/h</span></div>
            <div>Occupancy: <span style="color: #10B981; font-weight: bold;">${bus.current_occupancy}/${bus.capacity}</span></div>
            <div>Status: <span style="color: ${statusColor}; font-weight: bold;">${bus.status}</span></div>
          </div>
        </div>
      `);
    });
  }, [buses, routes, stops, onSelectBus, onSelectStop]);

  return (
    <div className="relative h-full w-full overflow-hidden rounded-2xl border border-[var(--powder-blue)] shadow-md bg-white">
      <div ref={mapContainerRef} className="h-full w-full min-h-[420px]" />
      
      {/* Floating Map Overlay Legend */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-3 rounded-xl border border-[var(--powder-blue)] bg-white/90 p-2.5 backdrop-blur-md text-[11px] font-mono shadow-sm">
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
          <span className="text-[var(--navy)] font-semibold">En Route</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shadow-sm shadow-amber-500/50"></span>
          <span className="text-[var(--navy)] font-semibold">Delayed</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-slate-400"></span>
          <span className="text-[var(--navy)] font-semibold">Inactive</span>
        </div>
      </div>
    </div>
  );
}
