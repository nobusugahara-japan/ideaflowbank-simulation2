import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useGlobalData } from '../GlobalDataContext';
import { Box } from "@chakra-ui/react";


function ActionCountChart() {
    const { data: log_all } = useGlobalData();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    useEffect(() => {
        // データの有無を確認
        if (!log_all || log_all.length === 0) {
            return null;  // データがない場合に何もレンダリングしない
        }
        
        const actionsCountByIteration = {};

        log_all.forEach(logEntry => {
            const iteration = logEntry.iteration;
            const action = logEntry.action;

            if (!actionsCountByIteration[iteration]) {
                actionsCountByIteration[iteration] = { job: 0, vote: 0 };
            }

            if (actionsCountByIteration[iteration][action] !== undefined) {
                actionsCountByIteration[iteration][action] += 1;
            }
        });

        const iterations = Object.keys(actionsCountByIteration);
        const jobCounts = iterations.map(i => actionsCountByIteration[i].job);
        const voteCounts = iterations.map(i => actionsCountByIteration[i].vote);

        if (chartInstanceRef.current) {
            chartInstanceRef.current.destroy();
        }

        chartInstanceRef.current = new Chart(chartRef.current, {
            type: 'line',
            data: {
                labels: iterations,
                datasets: [
                    {
                        label: 'Job',
                        data: jobCounts,
                        borderColor: 'blue',
                        borderWidth: 1,
                        fill: false
                    },
                    {
                        label: 'Vote',
                        data: voteCounts,
                        borderColor: 'red',
                        borderWidth: 1,
                        fill: false
                    }
                ]
            },
        });

        return () => {
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }
        };
    }, [log_all]);

    return (
        <Box width="800px" height="300px">
            <canvas ref={chartRef}></canvas>
        </Box>
    )
}

export default ActionCountChart;
