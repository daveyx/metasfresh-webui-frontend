import React, { Component } from 'react';
import * as d3 from 'd3';
import { getSvg } from './svg';

class PieChartComponent extends Component {
    svg;

    constructor(props) {
        super(props);

        this.state = {
            prevData: []
        };
    }

    componentDidMount() {
        const {data, responsive, colors} = this.props;

        const color = d3.scaleOrdinal()
            .range(colors);

        const dimensions = this.setDimensions();

        this.setSvg(
            dimensions.width,
            dimensions.height,
            dimensions.wrapperWidth
        );

        dimensions && this.drawChart(
            dimensions.wrapperWidth, dimensions.width, dimensions.height,
            dimensions.pie, dimensions.arc, data, color
        );

        if(responsive){
            this.addResponsive(data, color);
        }

    }

    shouldComponentUpdate(nextProps){
        return !(this.props.reRender && !nextProps.reRender)

    }

    componentDidUpdate(prevProps) {
        const {data, colors, chartClass} = this.props;

        const chartWrapp =
            document.getElementsByClassName(chartClass + '-wrapper')[0];
        const color = d3.scaleOrdinal()
            .range(colors);
        const dimensions =
                chartWrapp && this.setDimensions(chartWrapp.offsetWidth);

        if(this.props.reRender) {

            this.setSvg(
                dimensions.width,
                dimensions.height,
                dimensions.wrapperWidth
            );

            this.clearChart();
            dimensions && this.drawChart(
                dimensions.wrapperWidth, dimensions.width, dimensions.height,
                dimensions.pie, dimensions.arc, data, color
            );
        } else if((JSON.stringify(prevProps) !== JSON.stringify(this.props))){

            this.clearChart();
            dimensions && this.updateChart(
                dimensions.wrapperWidth, dimensions.width, dimensions.height,
                dimensions.pie, dimensions.arc, data, color
            );
        }
    }

    setSvg(width, height, wrapperWidth){
        const {chartClass} = this.props;
        this.svg = getSvg(chartClass, width, height, wrapperWidth);
    }

    setDimensions = (width = 400) => {
        const {chartClass, responsive, fields, height} = this.props;
        let wrapperWidth = 0;
        let chartWidth = width;
        let chartHeight = height;

        const chartWrapper =
            document.getElementsByClassName(chartClass + '-wrapper')[0];

        if(responsive) {
            wrapperWidth = chartWrapper && chartWrapper.offsetWidth - 10;
            chartWidth = wrapperWidth;
        }
        const radius = Math.min(chartWidth, 0.66*chartHeight) / 2;
        const arc =
            d3.arc().outerRadius(radius * 0.8).innerRadius(radius * 0.4);
        const pie = d3.pie()
            .sort(null)
            .value( d => {
                return d[fields[0].fieldName];
            });

        return {
                wrapperWidth: wrapperWidth,
                width: chartWidth,
                height: chartHeight,
                radius: radius,
                arc: arc,
                pie: pie
            };
    }
    drawChart = (wrapperWidth, width, height, pie, arc, data, color) => {
        const {fields} = this.props;
        const {prevData} = this.state;

        const slice = this.svg.select('.slices').selectAll('.pie-path')
            .data(pie(data), function(d) {
                return d;
            })

            slice.enter().append('path')
            .attr('class', 'pie-path')
            .style('fill', d => color(d.data[fields[0].fieldName]))
            .transition().duration(1500)
            .attrTween('d', (d, i) => {
                const interpolate = d3.interpolate(
                    {startAngle: 0, endAngle: 0}, d);
                prevData[i] = d;
                this.setState({
                    prevData: prevData
                })
                return function(t) {
                    return arc(interpolate(t));
                }
            })
            slice.exit().remove();

            this.drawLegend(this.svg, width, height, color);
    };

    updateChart = (wrapperWidth, width, height, pie, arc, data, color) => {
        const {fields} = this.props;
        const {prevData} = this.state;

        const slice = this.svg.select('.slices').selectAll('.pie-path')
            .data(pie(data), function(d) {
                return d;
            });

        slice.enter().append('path')
            .attr('class', 'pie-path')
            .style('fill', d => color(d.data[fields[0].fieldName]))
            .transition().duration(1500)
            .attrTween('d', (d, i)=>{
                const current = prevData[i];
                const interpolate = d3.interpolate(current, d);

                prevData[i] = interpolate(0);
                this.setState({
                    prevData: prevData
                })

                return function(t) {
                    return arc(interpolate(t));
                }
            })

        slice.exit().remove();

        this.drawLegend(this.svg, width, height, color);

    }

    drawLegend = (svg, width, height, color) => {
        const {groupBy, data} = this.props;

        const legend = svg
            .attr('width', width)
            .attr('height', 0.30*height)
            .append('g')
            .attr('class', 'legends')
            .attr('transform', 'translate(' + 20 + ',' + 20 + ')');

        const legendRectSize = 18;
        const legendSpacing = 4;

        const legendItem = legend.selectAll('.legend')
        .data(color.domain())
        .enter()
        .append('g')
        .attr('class', 'legend')
        .attr('transform', function(d, i) {
            const height = legendRectSize + legendSpacing;
            const vert = i * height;
            return 'translate(' + 0 + ',' + vert + ')';
        });

        legendItem.append('rect')
        .attr('width', legendRectSize)
        .attr('height', legendRectSize)
        .style('fill', color)
        .style('stroke', color);

        legendItem.append('text')
        .attr('x', legendRectSize + legendSpacing)
        .attr('y', legendRectSize - legendSpacing)
        .attr('font-size', 12)
        .text(function(d, i) {
            return data[i][groupBy.fieldName] + (
                groupBy.unit ? ' [' + groupBy.unit + ']' : ''
            );
        });

        legend.exit().remove();
    };

    addResponsive = (data, color) => {
        const {chartClass} = this.props;
        const chartWrap =
            document.getElementsByClassName(chartClass+'-wrapper')[0];

        d3.select(window)
            .on('resize.'+chartClass, () => {
                this.clearChart();
                const dimensions =
                    chartWrap && this.setDimensions(chartWrap.offsetWidth);
                this.setSvg(
                    dimensions.width,
                    dimensions.height,
                    dimensions.wrapperWidth
                );
                dimensions && this.drawChart(
                    dimensions.wrapperWidth, dimensions.width,
                    dimensions.height, dimensions.pie, dimensions.arc, data,
                    color
                );

            });
    };

    clearChart = () => {
        this.svg.select('.slices').selectAll('path').remove();
        this.svg.selectAll('.legends').remove();
    };

    render() {
        const {chartClass} = this.props;
        return (
            <div className={chartClass+'-wrapper' + ' chart-wrapper'}>
                <svg className={chartClass} />
            </div>
        );
    }
}

export default PieChartComponent;
