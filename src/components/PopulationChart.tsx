import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { BarChart } from 'lucide-react';

interface PopulationData {
  country: string;
  population: number;
}

export default function PopulationChart() {
  const svgRef = useRef<SVGSVGElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(
          'https://api.worldbank.org/v2/country/all/indicator/SP.POP.TOTL?format=json&date=2022&per_page=20'
        );
        const [metadata, data] = await response.json();
        
        const populationData: PopulationData[] = data
          .filter((d: any) => d.value != null)
          .sort((a: any, b: any) => b.value - a.value)
          .slice(0, 10)
          .map((d: any) => ({
            country: d.country.value,
            population: d.value
          }));

        createChart(populationData);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, []);

  const createChart = (data: PopulationData[]) => {
    if (!svgRef.current) return;

    // Clear previous chart
    d3.select(svgRef.current).selectAll('*').remove();

    const margin = { top: 40, right: 30, bottom: 60, left: 80 };
    const width = 800 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const svg = d3
      .select(svgRef.current)
      .attr('width', width + margin.left + margin.right)
      .attr('height', height + margin.top + margin.bottom)
      .append('g')
      .attr('transform', `translate(${margin.left},${margin.top})`);

    // Scales
    const x = d3
      .scaleBand()
      .range([0, width])
      .domain(data.map((d) => d.country))
      .padding(0.2);

    const y = d3
      .scaleLinear()
      .range([height, 0])
      .domain([0, d3.max(data, (d) => d.population) || 0]);

    // Color scale
    const color = d3
      .scaleSequential()
      .domain([0, data.length])
      .interpolator(d3.interpolateBlues);

    // Add axes
    svg
      .append('g')
      .attr('transform', `translate(0,${height})`)
      .call(d3.axisBottom(x))
      .selectAll('text')
      .attr('transform', 'rotate(-45)')
      .style('text-anchor', 'end');

    svg.append('g').call(d3.axisLeft(y).ticks(5).tickFormat(d3.format('.2s')));

    // Add title
    svg
      .append('text')
      .attr('x', width / 2)
      .attr('y', -margin.top / 2)
      .attr('text-anchor', 'middle')
      .style('font-size', '16px')
      .style('font-weight', 'bold')
      .text('Population by Country (2022)');

    // Add bars
    svg
      .selectAll('rect')
      .data(data)
      .join('rect')
      .attr('x', (d) => x(d.country) || 0)
      .attr('width', x.bandwidth())
      .attr('y', height)
      .attr('height', 0)
      .attr('fill', (_, i) => color(i))
      .transition()
      .duration(800)
      .attr('y', (d) => y(d.population))
      .attr('height', (d) => height - y(d.population));

    // Add hover effects and tooltip
    const tooltip = d3
      .select(tooltipRef.current)
      .style('opacity', 0)
      .attr('class', 'absolute bg-white p-2 rounded shadow-lg text-sm');

    svg
      .selectAll('rect')
      .on('mouseover', (event, d) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', '#4a90e2');

        tooltip
          .style('opacity', 1)
          .html(
            `${d.country}<br/>Population: ${d3.format(',')(d.population)}`
          )
          .style('left', `${event.pageX + 10}px`)
          .style('top', `${event.pageY - 28}px`);
      })
      .on('mouseout', (event) => {
        d3.select(event.currentTarget)
          .transition()
          .duration(200)
          .attr('fill', (_, i) => color(i));

        tooltip.style('opacity', 0);
      });
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-2 mb-4">
        <BarChart className="w-6 h-6 text-blue-600" />
        <h2 className="text-xl font-semibold">World Population Visualization</h2>
      </div>
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <svg ref={svgRef} className="max-w-full"></svg>
        <div ref={tooltipRef} className="pointer-events-none"></div>
      </div>
    </div>
  );
}