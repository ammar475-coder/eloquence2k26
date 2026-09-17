import { useState, useMemo, useRef } from 'react';
import { 
  FaCode, 
  FaGamepad, 
  FaCheckCircle, 
  FaRupeeSign, 
  FaUsers, 
  FaFilter, 
  FaChartPie, 
  FaArrowRight,
  FaGlobe,
  FaCashRegister,
  FaCube,
  FaCompass
} from 'react-icons/fa';

// Color Shading Helper for 3D Volumetric Lighting
function adjustColor(hex, percent) {
  try {
    const cleanHex = hex.replace('#', '');
    const num = parseInt(cleanHex.length === 3 ? cleanHex.split('').map(c => c + c).join('') : cleanHex, 16);
    let r = (num >> 16) + Math.round(255 * (percent / 100));
    let g = ((num >> 8) & 0x00FF) + Math.round(255 * (percent / 100));
    let b = (num & 0x0000FF) + Math.round(255 * (percent / 100));
    r = Math.min(255, Math.max(0, r));
    g = Math.min(255, Math.max(0, g));
    b = Math.min(255, Math.max(0, b));
    return `#${((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)}`;
  } catch (e) {
    return hex;
  }
}

// Curated Vibrant 3D Color Palettes
const TECH_COLORS = [
  '#3b82f6', // Electric Blue (Slide Craft / PPT)
  '#10b981', // Emerald Green (Crack the Code)
  '#8b5cf6', // Violet (Tech Battle / Quiz)
  '#06b6d4', // Cyan (Web / Prompt)
  '#f59e0b', // Amber (UI/UX)
  '#ec4899', // Pink Fuchsia
  '#6366f1', // Indigo
  '#14b8a6', // Teal
];

const NON_TECH_COLORS = [
  '#f43f5e', // Rose Coral (Snap & Reel)
  '#a855f7', // Purple (Link Up)
  '#eab308', // Gold Yellow (Hunt Zone)
  '#10b981', // Emerald (Henna Heist)
  '#ef4444', // Red (Battle of Champions / Esports)
  '#3b82f6', // Blue (64 Squares / Chess)
  '#f97316', // Orange (Battleworld Bidding)
  '#06b6d4', // Light Cyan
];

// 3D Isometric Projection Helper
function polarToCartesian(cx, cy, rx, ry, angleInDegrees) {
  const rad = ((angleInDegrees - 90) * Math.PI) / 180;
  return {
    x: cx + rx * Math.cos(rad),
    y: cy + ry * Math.sin(rad),
    rad
  };
}

export default function EventRegistrationCharts({
  registrationsList = [],
  eventsList = [],
  isDark = true,
  onSelectEvent
}) {
  const [hoveredTechId, setHoveredTechId] = useState(null);
  const [hoveredNonTechId, setHoveredNonTechId] = useState(null);
  const [activeViewMode, setActiveViewMode] = useState('all'); // 'all' | 'verified' | 'online' | 'offline'
  
  // Interactive 3D Cursor Tilt States
  const [techTilt, setTechTilt] = useState({ x: 0, y: 0 });
  const [nonTechTilt, setNonTechTilt] = useState({ x: 0, y: 0 });

  // Verification & Online helpers
  const isVerified = (r) => Boolean(
    r.is_verified === true ||
    r.isVerified === true ||
    r.verification_status === 'verified' ||
    r.verificationStatus === 'verified' ||
    r.attendance_status === 'verified'
  );
  const isOnline = (r) => (r.payment_method || r.paymentMethod) !== 'ON_SITE_DESK';
  const getFee = (r) => Number(r.total_fee || r.totalAmount || r.total_amount || 0);

  // 1. Separate Events by Category
  const { techEvents, nonTechEvents } = useMemo(() => {
    const tech = [];
    const nonTech = [];

    (eventsList || []).forEach(evt => {
      const cat = String(evt.category || '').toLowerCase();
      const id = String(evt.id || '').toLowerCase();
      if (cat === 'technical' || id.startsWith('tech')) {
        tech.push(evt);
      } else {
        nonTech.push(evt);
      }
    });

    return { techEvents: tech, nonTechEvents: nonTech };
  }, [eventsList]);

  // 2. Aggregate Registrations per Event
  const aggregateData = (events, colors) => {
    return events.map((evt, idx) => {
      const color = colors[idx % colors.length];
      
      const eventRegs = registrationsList.filter(r => {
        const rId = String(r.event_id || r.eventId || '').toLowerCase();
        if (rId && rId === String(evt.id).toLowerCase()) return true;

        const rName = String(r.eventName || r.event_name || '').toLowerCase();
        const eName = String(evt.name || '').toLowerCase();
        const eAlias = String(evt.alias || '').toLowerCase();

        return (rName && (rName === eName || rName === eAlias));
      });

      const totalCount = eventRegs.length;
      const verifiedCount = eventRegs.filter(isVerified).length;
      const onlineCount = eventRegs.filter(isOnline).length;
      const offlineCount = eventRegs.filter(r => !isOnline(r)).length;
      const totalRevenue = eventRegs.filter(isVerified).reduce((sum, r) => sum + getFee(r), 0);

      let activeCount = totalCount;
      if (activeViewMode === 'verified') activeCount = verifiedCount;
      if (activeViewMode === 'online') activeCount = onlineCount;
      if (activeViewMode === 'offline') activeCount = offlineCount;

      return {
        id: evt.id,
        name: evt.alias || evt.name,
        fullName: evt.name,
        number: evt.number || String(idx + 1).padStart(2, '0'),
        color,
        count: totalCount,
        verifiedCount,
        onlineCount,
        offlineCount,
        totalRevenue,
        activeCount
      };
    });
  };

  const techData = useMemo(() => aggregateData(techEvents, TECH_COLORS), [techEvents, registrationsList, activeViewMode]);
  const nonTechData = useMemo(() => aggregateData(nonTechEvents, NON_TECH_COLORS), [nonTechEvents, registrationsList, activeViewMode]);

  const totalTechRegistrations = useMemo(() => techData.reduce((sum, d) => sum + d.activeCount, 0), [techData]);
  const totalNonTechRegistrations = useMemo(() => nonTechData.reduce((sum, d) => sum + d.activeCount, 0), [nonTechData]);
  const grandTotal = totalTechRegistrations + totalNonTechRegistrations;

  // Interactive mouse move handler for physical 3D tilt
  const handleMouseMove = (e, setTilt) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left - rect.width / 2;
    const y = e.clientY - rect.top - rect.height / 2;
    const tiltX = -(y / (rect.height / 2)) * 7;
    const tiltY = (x / (rect.width / 2)) * 9;
    setTilt({ x: tiltX, y: tiltY });
  };

  const handleMouseLeave = (setTilt) => {
    setTilt({ x: 0, y: 0 });
  };

  // 3. Volumetric 3D Model Donut Pie Chart Generator
  const render3DModelPieChart = (dataItems, total, hoveredId, setHoveredId, label, tilt) => {
    const viewBoxWidth = 340;
    const viewBoxHeight = 270;
    const cx = 170;
    const cy = 135;
    const rx = 120; // Horizontal radius
    const ry = 68;  // Foreshortened vertical radius for 3D angle
    const depth = 24; // 3D Extrusion height (thickness in px)
    const innerRatio = 0.48; // Donut hole ratio
    const rix = rx * innerRatio;
    const riy = ry * innerRatio;

    const activeItems = dataItems.filter(item => item.activeCount > 0);
    const hoveredItem = dataItems.find(item => item.id === hoveredId);

    // Empty state 3D cylinder
    if (total === 0 || activeItems.length === 0) {
      return (
        <div style={{
          position: 'relative',
          width: '100%',
          maxWidth: '340px',
          height: '270px',
          margin: '0 auto',
          perspective: '1000px'
        }}>
          <svg width="100%" height="100%" viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}>
            {/* Ambient floor shadow */}
            <ellipse cx={cx} cy={cy + depth + 14} rx={rx + 15} ry={ry + 8} fill="rgba(0,0,0,0.3)" filter="blur(8px)" />
            
            {/* Empty 3D cylinder wall */}
            <path
              d={`M ${cx - rx} ${cy} A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy} L ${cx + rx} ${cy + depth} A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy + depth} Z`}
              fill={isDark ? '#1a2234' : '#e2e8f0'}
              stroke={isDark ? '#2a354c' : '#cbd5e1'}
              strokeWidth="1"
            />
            {/* Empty 3D top face */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rx}
              ry={ry}
              fill={isDark ? '#131b2c' : '#f1f5f9'}
              stroke={isDark ? '#2a354c' : '#cbd5e1'}
              strokeWidth="1.5"
              strokeDasharray="6 6"
            />
            {/* Empty inner hole */}
            <ellipse
              cx={cx}
              cy={cy}
              rx={rix}
              ry={riy}
              fill={isDark ? '#0f172a' : '#ffffff'}
              stroke={isDark ? '#2a354c' : '#cbd5e1'}
              strokeWidth="1"
            />
          </svg>
          <div style={{
            position: 'absolute',
            inset: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            pointerEvents: 'none'
          }}>
            <FaCube size={26} style={{ color: isDark ? '#475569' : '#94a3b8', marginBottom: '6px' }} />
            <span style={{ fontSize: '1.4rem', fontWeight: '800', color: isDark ? '#64748b' : '#94a3b8' }}>0</span>
            <span style={{ fontSize: '0.72rem', fontWeight: '700', color: isDark ? '#475569' : '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              No Registrations
            </span>
          </div>
        </div>
      );
    }

    // Compute angular slices
    let currentAngle = 0;
    const slices = activeItems.map((item) => {
      const sliceAngle = (item.activeCount / total) * 360;
      const startAngle = currentAngle;
      const endAngle = currentAngle + sliceAngle;
      currentAngle = endAngle;

      const midAngle = (startAngle + endAngle) / 2;
      // Radian for Y-ordering (Painter's Algorithm depth sorting)
      const midRad = ((midAngle - 90) * Math.PI) / 180;
      const sortY = Math.sin(midRad);

      return {
        ...item,
        startAngle,
        endAngle,
        sliceAngle,
        midAngle,
        midRad,
        sortY
      };
    });

    // Sort slices so that back slices (sin < 0) are rendered first, front slices (sin > 0) are rendered in front
    const sortedSlices = [...slices].sort((a, b) => a.sortY - b.sortY);

    return (
      <div style={{
        position: 'relative',
        width: '100%',
        maxWidth: '340px',
        height: '270px',
        margin: '0 auto',
        transformStyle: 'preserve-3d',
        transform: `perspective(900px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        transition: 'transform 0.25s cubic-bezier(0.2, 0, 0, 1)'
      }}>
        <svg 
          width="100%" 
          height="100%" 
          viewBox={`0 0 ${viewBoxWidth} ${viewBoxHeight}`}
          style={{ overflow: 'visible', filter: 'drop-shadow(0 12px 24px rgba(0,0,0,0.35))' }}
        >
          <defs>
            {/* Ambient Floor Glow */}
            <radialGradient id={`floor-shadow-${label}`} cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="rgba(0,0,0,0.55)" />
              <stop offset="60%" stopColor="rgba(0,0,0,0.25)" />
              <stop offset="100%" stopColor="rgba(0,0,0,0)" />
            </radialGradient>

            {/* Specular Top Shading Gradients for Each Slice */}
            {slices.map((slice) => (
              <linearGradient key={`top-grad-${slice.id}`} id={`top-grad-${slice.id}`} x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor={adjustColor(slice.color, 24)} />
                <stop offset="60%" stopColor={slice.color} />
                <stop offset="100%" stopColor={adjustColor(slice.color, -10)} />
              </linearGradient>
            ))}

            {/* Front Extrusion Depth Gradients for Slices */}
            {slices.map((slice) => (
              <linearGradient key={`side-grad-${slice.id}`} id={`side-grad-${slice.id}`} x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stopColor={adjustColor(slice.color, -15)} />
                <stop offset="100%" stopColor={adjustColor(slice.color, -50)} />
              </linearGradient>
            ))}
          </defs>

          {/* 1. Floor Ambient Ground Shadow */}
          <ellipse
            cx={cx}
            cy={cy + depth + 14}
            rx={rx + 18}
            ry={ry + 10}
            fill={`url(#floor-shadow-${label})`}
          />

          {/* Inner hole depth wall */}
          <path
            d={`M ${cx - rix} ${cy} A ${rix} ${riy} 0 0 1 ${cx + rix} ${cy} L ${cx + rix} ${cy + depth * 0.7} A ${rix} ${riy} 0 0 0 ${cx - rix} ${cy + depth * 0.7} Z`}
            fill={isDark ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.18)'}
          />

          {/* 2. 3D Extruded Slices (Sorted Back-to-Front for Flawless Depth) */}
          {sortedSlices.map((slice) => {
            const isHovered = hoveredId === slice.id;
            
            // Pop-out radial vector when hovered
            const popDistance = isHovered ? 14 : 0;
            const popX = Math.cos(slice.midRad) * popDistance;
            const popY = Math.sin(slice.midRad) * (popDistance * 0.6);

            const startOuter = polarToCartesian(cx, cy, rx, ry, slice.startAngle);
            const endOuter = polarToCartesian(cx, cy, rx, ry, slice.endAngle);
            const startInner = polarToCartesian(cx, cy, rix, riy, slice.startAngle);
            const endInner = polarToCartesian(cx, cy, rix, riy, slice.endAngle);

            const largeArc = slice.sliceAngle > 180 ? 1 : 0;

            // Geometry Paths
            // A. Top Cap Donut Wedge (handles both multi-slice and full-circle 360)
            let topCapPath = '';
            let outerWallPath = '';
            if (slice.sliceAngle >= 359.9) {
              const midOuter = polarToCartesian(cx, cy, rx, ry, slice.startAngle + 180);
              const midInner = polarToCartesian(cx, cy, rix, riy, slice.startAngle + 180);
              topCapPath = [
                `M ${startOuter.x} ${startOuter.y}`,
                `A ${rx} ${ry} 0 1 1 ${midOuter.x} ${midOuter.y}`,
                `A ${rx} ${ry} 0 1 1 ${startOuter.x} ${startOuter.y}`,
                `M ${startInner.x} ${startInner.y}`,
                `A ${rix} ${riy} 0 1 0 ${midInner.x} ${midInner.y}`,
                `A ${rix} ${riy} 0 1 0 ${startInner.x} ${startInner.y}`,
                'Z'
              ].join(' ');
              outerWallPath = [
                `M ${cx - rx} ${cy}`,
                `A ${rx} ${ry} 0 0 0 ${cx + rx} ${cy}`,
                `L ${cx + rx} ${cy + depth}`,
                `A ${rx} ${ry} 0 0 1 ${cx - rx} ${cy + depth}`,
                'Z'
              ].join(' ');
            } else {
              topCapPath = [
                `M ${startInner.x} ${startInner.y}`,
                `L ${startOuter.x} ${startOuter.y}`,
                `A ${rx} ${ry} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
                `L ${endInner.x} ${endInner.y}`,
                `A ${rix} ${riy} 0 ${largeArc} 0 ${startInner.x} ${startInner.y}`,
                'Z'
              ].join(' ');
              outerWallPath = [
                `M ${startOuter.x} ${startOuter.y}`,
                `A ${rx} ${ry} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`,
                `L ${endOuter.x} ${endOuter.y + depth}`,
                `A ${rx} ${ry} 0 ${largeArc} 0 ${startOuter.x} ${startOuter.y + depth}`,
                'Z'
              ].join(' ');
            }

            // C. Radial Start Cut Wall (visible if facing right/forward)
            const startWallPath = [
              `M ${startInner.x} ${startInner.y}`,
              `L ${startOuter.x} ${startOuter.y}`,
              `L ${startOuter.x} ${startOuter.y + depth}`,
              `L ${startInner.x} ${startInner.y + depth}`,
              'Z'
            ].join(' ');

            // D. Radial End Cut Wall
            const endWallPath = [
              `M ${endInner.x} ${endInner.y}`,
              `L ${endOuter.x} ${endOuter.y}`,
              `L ${endOuter.x} ${endOuter.y + depth}`,
              `L ${endInner.x} ${endInner.y + depth}`,
              'Z'
            ].join(' ');

            // Determine if cut walls face the viewer
            const startFacesViewer = Math.cos(slice.startAngle * Math.PI / 180) > -0.2;
            const endFacesViewer = Math.cos(slice.endAngle * Math.PI / 180) < 0.2;

            return (
              <g
                key={slice.id}
                transform={`translate(${popX}, ${popY})`}
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.25s cubic-bezier(0.2, 0, 0, 1)',
                  filter: isHovered 
                    ? `drop-shadow(0 0 16px ${slice.color}) brightness(1.15)` 
                    : (hoveredId !== null ? 'opacity(0.4)' : 'none')
                }}
                onMouseEnter={() => setHoveredId(slice.id)}
                onMouseLeave={() => setHoveredId(null)}
                onClick={() => onSelectEvent && onSelectEvent(slice.id)}
              >
                {/* 1. Start Radial Cut Wall */}
                {startFacesViewer && (
                  <path
                    d={startWallPath}
                    fill={adjustColor(slice.color, -30)}
                    stroke={adjustColor(slice.color, -40)}
                    strokeWidth="0.5"
                  />
                )}

                {/* 2. End Radial Cut Wall */}
                {endFacesViewer && (
                  <path
                    d={endWallPath}
                    fill={adjustColor(slice.color, -35)}
                    stroke={adjustColor(slice.color, -45)}
                    strokeWidth="0.5"
                  />
                )}

                {/* 3. Outer Cylindrical Wall */}
                <path
                  d={outerWallPath}
                  fill={`url(#side-grad-${slice.id})`}
                  stroke={adjustColor(slice.color, -45)}
                  strokeWidth="0.5"
                />

                {/* 4. Top Cap Surface with Specular Sheen */}
                <path
                  d={topCapPath}
                  fill={`url(#top-grad-${slice.id})`}
                  stroke="rgba(255, 255, 255, 0.45)"
                  strokeWidth={isHovered ? '2' : '0.8'}
                />

                {/* 5. Rim Specular Highlight Accent */}
                <path
                  d={`M ${startOuter.x} ${startOuter.y} A ${rx} ${ry} 0 ${largeArc} 1 ${endOuter.x} ${endOuter.y}`}
                  fill="none"
                  stroke="rgba(255, 255, 255, 0.6)"
                  strokeWidth={isHovered ? '2' : '1'}
                />
              </g>
            );
          })}
        </svg>

        {/* 3. Floating 3D Holographic Center Core Display */}
        <div style={{
          position: 'absolute',
          top: `${cy - 28}px`,
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '120px',
          padding: '0.45rem 0.5rem',
          background: isDark ? 'rgba(15, 23, 42, 0.88)' : 'rgba(255, 255, 255, 0.92)',
          backdropFilter: 'blur(10px)',
          WebkitBackdropFilter: 'blur(10px)',
          border: hoveredItem 
            ? `1.5px solid ${hoveredItem.color}` 
            : (isDark ? '1px solid rgba(255,255,255,0.12)' : '1px solid #cbd5e1'),
          borderRadius: '12px',
          boxShadow: hoveredItem 
            ? `0 8px 24px rgba(0,0,0,0.6), 0 0 16px ${hoveredItem.color}40` 
            : '0 8px 20px rgba(0,0,0,0.4)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
          pointerEvents: 'none',
          userSelect: 'none',
          zIndex: 10,
          transition: 'all 0.25s ease'
        }}>
          {hoveredItem ? (
            <>
              <span style={{
                fontSize: '0.66rem',
                fontWeight: '800',
                color: hoveredItem.color,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                maxWidth: '110px',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {hoveredItem.name}
              </span>
              <span style={{
                fontSize: '1.45rem',
                fontWeight: '900',
                lineHeight: '1.1',
                color: isDark ? '#ffffff' : '#0f172a'
              }}>
                {hoveredItem.activeCount}
              </span>
              <span style={{
                fontSize: '0.68rem',
                fontWeight: '800',
                color: hoveredItem.color
              }}>
                {total > 0 ? ((hoveredItem.activeCount / total) * 100).toFixed(1) : 0}% &bull; ₹{hoveredItem.totalRevenue}
              </span>
            </>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#10b981', fontSize: '0.65rem', fontWeight: '800' }}>
                <FaCube size={10} />
                <span>3D {label}</span>
              </div>
              <span style={{
                fontSize: '1.65rem',
                fontWeight: '900',
                lineHeight: '1.1',
                color: isDark ? '#ffffff' : '#0f172a',
                marginTop: '1px'
              }}>
                {total}
              </span>
              <span style={{
                fontSize: '0.65rem',
                fontWeight: '800',
                color: isDark ? '#9ca3af' : '#64748b',
                letterSpacing: '0.04em'
              }}>
                REGISTRATIONS
              </span>
            </>
          )}
        </div>
      </div>
    );
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '1.25rem',
      marginBottom: '1.5rem'
    }}>
      {/* SECTION TITLE & VIEW MODE FILTER TABS */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '0.75rem',
        padding: '0.5rem 0.25rem'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: isDark ? '#1e3a8a' : '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.15rem',
            boxShadow: '0 0 12px rgba(37, 99, 235, 0.3)'
          }}>
            <FaCube />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{
                margin: 0,
                fontSize: '1.2rem',
                fontWeight: '800',
                color: isDark ? '#f9fafb' : '#0f172a',
                letterSpacing: '-0.01em'
              }}>
                3D Event-Wise Registration Analytics
              </h3>
              <span style={{
                padding: '0.15rem 0.5rem',
                borderRadius: '999px',
                fontSize: '0.68rem',
                fontWeight: '800',
                letterSpacing: '0.06em',
                background: 'linear-gradient(135deg, #2563eb 0%, #10b981 100%)',
                color: '#ffffff',
                textTransform: 'uppercase'
              }}>
                3D Model
              </span>
            </div>
            <p style={{
              margin: '2px 0 0',
              fontSize: '0.8rem',
              color: isDark ? '#9ca3af' : '#64748b'
            }}>
              Volumetric 3D model pie charts with real-time perspective, depth extrusion, and interactive event shares
            </p>
          </div>
        </div>

        {/* View Mode Filter Buttons */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          background: isDark ? '#1f2937' : '#f1f5f9',
          padding: '4px',
          borderRadius: '10px',
          border: isDark ? '1px solid #374151' : '1px solid #e2e8f0'
        }}>
          {[
            { id: 'all', label: 'All Registrations' },
            { id: 'verified', label: 'Verified Only' },
            { id: 'online', label: 'Online UPI' },
            { id: 'offline', label: 'Offline Desk' }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveViewMode(tab.id)}
              style={{
                padding: '0.35rem 0.75rem',
                borderRadius: '7px',
                fontSize: '0.75rem',
                fontWeight: activeViewMode === tab.id ? '700' : '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                background: activeViewMode === tab.id
                  ? (isDark ? '#2563eb' : '#ffffff')
                  : 'transparent',
                color: activeViewMode === tab.id
                  ? (isDark ? '#ffffff' : '#2563eb')
                  : (isDark ? '#9ca3af' : '#64748b'),
                boxShadow: activeViewMode === tab.id
                  ? (isDark ? '0 2px 6px rgba(0,0,0,0.3)' : '0 2px 4px rgba(0,0,0,0.06)')
                  : 'none'
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* RATIO COMPARISON BAR */}
      <div style={{
        background: isDark ? '#111827' : '#ffffff',
        border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
        borderRadius: '12px',
        padding: '0.85rem 1.25rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
        boxShadow: '0 2px 5px rgba(0,0,0,0.03)'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.82rem', fontWeight: '700' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6' }}>
            <FaCode size={13} />
            <span>Technical Events: {totalTechRegistrations} ({grandTotal > 0 ? ((totalTechRegistrations / grandTotal) * 100).toFixed(1) : 0}%)</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#f43f5e' }}>
            <span>Non-Technical Events: {totalNonTechRegistrations} ({grandTotal > 0 ? ((totalNonTechRegistrations / grandTotal) * 100).toFixed(1) : 0}%)</span>
            <FaGamepad size={13} />
          </div>
        </div>
        <div style={{
          width: '100%',
          height: '8px',
          borderRadius: '999px',
          background: isDark ? '#1f2937' : '#e2e8f0',
          overflow: 'hidden',
          display: 'flex'
        }}>
          <div style={{
            width: `${grandTotal > 0 ? (totalTechRegistrations / grandTotal) * 100 : 50}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #2563eb, #3b82f6)',
            transition: 'width 0.5s ease'
          }} />
          <div style={{
            width: `${grandTotal > 0 ? (totalNonTechRegistrations / grandTotal) * 100 : 50}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #f43f5e, #e11d48)',
            transition: 'width 0.5s ease'
          }} />
        </div>
      </div>

      {/* TWO 3D MODEL PIE CHARTS (TECHNICAL & NON-TECHNICAL) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))',
        gap: '1.5rem'
      }}>
        {/* ======================================================== */}
        {/* 1. TECHNICAL EVENTS 3D PIE CHART & DETAILS               */}
        {/* ======================================================== */}
        <div 
          style={{
            background: isDark ? '#111827' : '#ffffff',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
          onMouseMove={(e) => handleMouseMove(e, setTechTilt)}
          onMouseLeave={() => handleMouseLeave(setTechTilt)}
        >
          {/* Card Header */}
          <div style={{
            padding: '1.15rem 1.5rem',
            borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9',
            background: isDark ? 'linear-gradient(90deg, #162032 0%, #111827 100%)' : 'linear-gradient(90deg, #eff6ff 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: isDark ? '#1e3a8a' : '#dbeafe',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem'
              }}>
                <FaCode />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Technical Events (3D Model)
                </h4>
                <span style={{ fontSize: '0.74rem', color: isDark ? '#93c5fd' : '#2563eb', fontWeight: '600' }}>
                  {techEvents.length} Competitions &bull; Hover slice to pop out
                </span>
              </div>
            </div>
            <div style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: isDark ? 'rgba(59, 130, 246, 0.18)' : '#eff6ff',
              border: isDark ? '1px solid rgba(59, 130, 246, 0.4)' : '1px solid #bfdbfe',
              color: '#3b82f6',
              fontWeight: '800',
              fontSize: '0.78rem'
            }}>
              {totalTechRegistrations} Total
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 3D Model Donut Pie Chart */}
            <div style={{ padding: '0.5rem 0' }}>
              {render3DModelPieChart(techData, totalTechRegistrations, hoveredTechId, setHoveredTechId, 'TECH', techTilt)}
            </div>

            {/* Event Details Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: isDark ? '#6b7280' : '#94a3b8',
                padding: '0 0.5rem 0.25rem'
              }}>
                <span>Technical Event</span>
                <span>Registrations &bull; Share</span>
              </div>

              {techData.map(item => {
                const percentage = totalTechRegistrations > 0 
                  ? ((item.activeCount / totalTechRegistrations) * 100).toFixed(1) 
                  : '0.0';
                const isHovered = hoveredTechId === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredTechId(item.id)}
                    onMouseLeave={() => setHoveredTechId(null)}
                    onClick={() => onSelectEvent && onSelectEvent(item.id, 'technical')}
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: '10px',
                      background: isHovered
                        ? (isDark ? 'rgba(59, 130, 246, 0.15)' : '#f0f7ff')
                        : (isDark ? '#1a2234' : '#f8fafc'),
                      border: isHovered
                        ? `1.5px solid ${item.color}`
                        : (isDark ? '1px solid #243048' : '1px solid #e2e8f0'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      cursor: onSelectEvent ? 'pointer' : 'default',
                      transform: isHovered ? 'translateY(-2px)' : 'none',
                      boxShadow: isHovered ? `0 6px 16px rgba(0,0,0,0.15), 0 0 12px ${item.color}30` : 'none'
                    }}
                  >
                    {/* Left: 3D Color Cube Indicator + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '3px',
                        backgroundColor: item.color,
                        boxShadow: `0 2px 6px ${item.color}80, inset 0 1px 2px rgba(255,255,255,0.6)`,
                        flexShrink: 0
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.86rem',
                            fontWeight: '700',
                            color: isDark ? '#ffffff' : '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.name}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            color: isDark ? '#9ca3af' : '#64748b',
                            fontWeight: '600'
                          }}>
                            #{item.number}
                          </span>
                        </div>
                        {/* Sub details */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.72rem',
                          color: isDark ? '#9ca3af' : '#64748b',
                          marginTop: '2px'
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: '600' }}>
                            <FaCheckCircle size={10} /> {item.verifiedCount} verified
                          </span>
                          <span>&bull;</span>
                          <span>₹{item.totalRevenue} rev</span>
                          <span>&bull;</span>
                          <span>{item.onlineCount} online / {item.offlineCount} desk</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Count & Percentage */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.98rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>
                          {item.activeCount}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: item.color }}>
                          {percentage}%
                        </div>
                      </div>
                      {onSelectEvent && (
                        <FaArrowRight size={11} style={{ color: isDark ? '#6b7280' : '#94a3b8', marginLeft: '2px' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* ======================================================== */}
        {/* 2. NON-TECHNICAL EVENTS 3D PIE CHART & DETAILS           */}
        {/* ======================================================== */}
        <div 
          style={{
            background: isDark ? '#111827' : '#ffffff',
            border: isDark ? '1px solid #1f2937' : '1px solid #e2e8f0',
            borderRadius: '16px',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column',
            boxShadow: '0 4px 6px -1px rgba(0,0,0,0.03)'
          }}
          onMouseMove={(e) => handleMouseMove(e, setNonTechTilt)}
          onMouseLeave={() => handleMouseLeave(setNonTechTilt)}
        >
          {/* Card Header */}
          <div style={{
            padding: '1.15rem 1.5rem',
            borderBottom: isDark ? '1px solid #1f2937' : '1px solid #f1f5f9',
            background: isDark ? 'linear-gradient(90deg, #2a1622 0%, #111827 100%)' : 'linear-gradient(90deg, #fff1f2 0%, #ffffff 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '34px',
                height: '34px',
                borderRadius: '8px',
                background: isDark ? '#831843' : '#ffe4e6',
                color: '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '0.95rem'
              }}>
                <FaGamepad />
              </div>
              <div>
                <h4 style={{ margin: 0, fontSize: '1rem', fontWeight: '800', color: isDark ? '#ffffff' : '#0f172a' }}>
                  Non-Technical Events (3D Model)
                </h4>
                <span style={{ fontSize: '0.74rem', color: isDark ? '#fda4af' : '#e11d48', fontWeight: '600' }}>
                  {nonTechEvents.length} Competitions &bull; Hover slice to pop out
                </span>
              </div>
            </div>
            <div style={{
              padding: '0.3rem 0.75rem',
              borderRadius: '999px',
              background: isDark ? 'rgba(244, 63, 94, 0.18)' : '#fff1f2',
              border: isDark ? '1px solid rgba(244, 63, 94, 0.4)' : '1px solid #fecdd3',
              color: '#f43f5e',
              fontWeight: '800',
              fontSize: '0.78rem'
            }}>
              {totalNonTechRegistrations} Total
            </div>
          </div>

          {/* Card Body */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* 3D Model Donut Pie Chart */}
            <div style={{ padding: '0.5rem 0' }}>
              {render3DModelPieChart(nonTechData, totalNonTechRegistrations, hoveredNonTechId, setHoveredNonTechId, 'NON-TECH', nonTechTilt)}
            </div>

            {/* Event Details Breakdown List */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                fontSize: '0.72rem',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.06em',
                color: isDark ? '#6b7280' : '#94a3b8',
                padding: '0 0.5rem 0.25rem'
              }}>
                <span>Non-Technical Event</span>
                <span>Registrations &bull; Share</span>
              </div>

              {nonTechData.map(item => {
                const percentage = totalNonTechRegistrations > 0 
                  ? ((item.activeCount / totalNonTechRegistrations) * 100).toFixed(1) 
                  : '0.0';
                const isHovered = hoveredNonTechId === item.id;

                return (
                  <div
                    key={item.id}
                    onMouseEnter={() => setHoveredNonTechId(item.id)}
                    onMouseLeave={() => setHoveredNonTechId(null)}
                    onClick={() => onSelectEvent && onSelectEvent(item.id, 'non-technical')}
                    style={{
                      padding: '0.75rem 0.95rem',
                      borderRadius: '10px',
                      background: isHovered
                        ? (isDark ? 'rgba(244, 63, 94, 0.15)' : '#fff1f2')
                        : (isDark ? '#1a2234' : '#f8fafc'),
                      border: isHovered
                        ? `1.5px solid ${item.color}`
                        : (isDark ? '1px solid #243048' : '1px solid #e2e8f0'),
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      transition: 'all 0.2s ease',
                      cursor: onSelectEvent ? 'pointer' : 'default',
                      transform: isHovered ? 'translateY(-2px)' : 'none',
                      boxShadow: isHovered ? `0 6px 16px rgba(0,0,0,0.15), 0 0 12px ${item.color}30` : 'none'
                    }}
                  >
                    {/* Left: 3D Color Cube Indicator + Name */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0 }}>
                      <span style={{
                        width: '13px',
                        height: '13px',
                        borderRadius: '3px',
                        backgroundColor: item.color,
                        boxShadow: `0 2px 6px ${item.color}80, inset 0 1px 2px rgba(255,255,255,0.6)`,
                        flexShrink: 0
                      }} />
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{
                            fontSize: '0.86rem',
                            fontWeight: '700',
                            color: isDark ? '#ffffff' : '#0f172a',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis'
                          }}>
                            {item.name}
                          </span>
                          <span style={{
                            fontSize: '0.68rem',
                            color: isDark ? '#9ca3af' : '#64748b',
                            fontWeight: '600'
                          }}>
                            #{item.number}
                          </span>
                        </div>
                        {/* Sub details */}
                        <div style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.72rem',
                          color: isDark ? '#9ca3af' : '#64748b',
                          marginTop: '2px'
                        }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', color: '#10b981', fontWeight: '600' }}>
                            <FaCheckCircle size={10} /> {item.verifiedCount} verified
                          </span>
                          <span>&bull;</span>
                          <span>₹{item.totalRevenue} rev</span>
                          <span>&bull;</span>
                          <span>{item.onlineCount} online / {item.offlineCount} desk</span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Count & Percentage */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '0.98rem', fontWeight: '800', color: isDark ? '#f9fafb' : '#0f172a' }}>
                          {item.activeCount}
                        </div>
                        <div style={{ fontSize: '0.72rem', fontWeight: '700', color: item.color }}>
                          {percentage}%
                        </div>
                      </div>
                      {onSelectEvent && (
                        <FaArrowRight size={11} style={{ color: isDark ? '#6b7280' : '#94a3b8', marginLeft: '2px' }} />
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
