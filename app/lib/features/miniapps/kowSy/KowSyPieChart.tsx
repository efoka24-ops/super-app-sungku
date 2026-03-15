import React from "react";

interface PieChartProps {
  data: { label: string; value: number; color: string }[];
}

// Simple pie chart SVG (statique, pour démo)
export default function KowSyPieChart({ data }: PieChartProps) {
  const total = data.reduce((sum, d) => sum + d.value, 0);
  let startAngle = 0;
  const radius = 40;
  const cx = 50;
  const cy = 50;

  function getPath(value: number) {
    const angle = (value / total) * 360;
    const endAngle = startAngle + angle;
    const largeArc = angle > 180 ? 1 : 0;
    const x1 = cx + radius * Math.cos((Math.PI * startAngle) / 180);
    const y1 = cy + radius * Math.sin((Math.PI * startAngle) / 180);
    const x2 = cx + radius * Math.cos((Math.PI * endAngle) / 180);
    const y2 = cy + radius * Math.sin((Math.PI * endAngle) / 180);
    const path = `M${cx},${cy} L${x1},${y1} A${radius},${radius} 0 ${largeArc} 1 ${x2},${y2} Z`;
    startAngle = endAngle;
    return path;
  }

  if (total === 0) {
    return <div className="text-gray-400 text-sm">Aucune dépense à afficher</div>;
  }

  return (
    <svg width={100} height={100} viewBox="0 0 100 100">
      {data.map((d, i) => (
        <path key={i} d={getPath(d.value)} fill={d.color} />
      ))}
    </svg>
  );
}
