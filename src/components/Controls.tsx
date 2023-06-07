import { observer } from 'mobx-react';

import React from 'react';
import 'chartjs-plugin-dragdata';
import 'chartjs-plugin-annotation';
import { Line } from 'react-chartjs-2';
import 'chart.js/auto'; // ADD THIS
import { useStore } from '../store';
import { ChartData } from 'chart.js/auto';

export const Controls: React.FC = observer(() => {
	const store = useStore();

	const colorTemperatureData = React.useMemo(
		() =>
			({
				labels: ['0:00', 'sunrise', '9:00', '12:00', '15:00', 'sunset', '24:00'],
				datasets: [
					{
						cubicInterpolationMode: 'monotone',
						data: store.colorTemperatureControlPoints,
						fill: true,
						borderWidth: 1,
						pointHitRadius: 25, // for improved touch support
					},
				],
			} as ChartData<'line', number[]>),
		[]
	);

	const brightnessData = React.useMemo(
		() =>
			({
				labels: ['0:00', 'sunrise', '9:00', '12:00', '15:00', 'sunset', '24:00'],
				datasets: [
					{
						cubicInterpolationMode: 'monotone',
						data: store.brightnessControlPoints,
						fill: true,
						borderWidth: 1,
						pointHitRadius: 25, // for improved touch support
					},
				],
			} as ChartData<'line', number[]>),
		[]
	);

	return (
		<div>
			<h1 className="text-l font-medium">Brightness</h1>
			<Line
				data={brightnessData}
				options={
					{
						plugins: {
							legend: {
								display: false,
							},
							dragData: {
								round: 1,
								onDrag: function (_e: Event, _datasetIndex: number, index: number, value: number) {
									store.updateBrightnessControlPoint(index, value);
								},
								onDragEnd: function () {
									store.updateGroup();
								},
							},
						},
						scales: {
							y: {
								min: 0,
								max: 100,
							},
						},
					} as any
				}
			/>
			<h1 className="text-l font-medium">Temperature</h1>
			<Line
				data={colorTemperatureData}
				options={
					{
						plugins: {
							legend: {
								display: false,
							},
							dragData: {
								round: 1,
								onDrag: function (_e: Event, _datasetIndex: number, index: number, value: number) {
									store.updateLightTemperatureControlPoint(index, value);
								},
								onDragEnd: function () {
									store.updateGroup();
								},
							},
						},
						scales: {
							y: {
								min: 2200,
								max: 5000,
								// dragData: false // disables datapoint dragging for the entire axis
							},
						},
					} as any
				}
			/>
		</div>
	);
});
