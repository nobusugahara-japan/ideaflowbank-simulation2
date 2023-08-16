import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useGlobalData } from '../GlobalDataContext';
import { Box } from "@chakra-ui/react";

function TokenChart() {
    const { data: log_all } = useGlobalData();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);  // 追加：Chartインスタンスを保持するためのref

    useEffect(() => {
        if (log_all && log_all.length) {
            const tokenDataByAgent = {};

            log_all.forEach(logEntry => {
                const agentId = logEntry.agent;

                if (!tokenDataByAgent[agentId]) {
                    tokenDataByAgent[agentId] = [];
                }

                tokenDataByAgent[agentId].push(logEntry.token);
            });

            const datasets = Object.entries(tokenDataByAgent).map(([agentId, tokens]) => {
                return {
                    label: `Agent ${agentId}`,
                    data: tokens,
                    borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
                    borderWidth: 1,
                    fill: false
                };
            });

            // 追加：古いChartインスタンスが存在する場合は破棄する
            if (chartInstanceRef.current) {
                chartInstanceRef.current.destroy();
            }

            // ここで新しいChartインスタンスを作成して、refに保存する
            chartInstanceRef.current = new Chart(chartRef.current, {
                type: 'line',
                data: {
                    labels: Array.from({ length: Math.max(...Object.values(tokenDataByAgent).map(arr => arr.length)) }, (_, i) => i),
                    datasets: datasets
                },
                options: {
                    scales: {
                        x: {
                            title: {
                                display: true,
                                text: 'Iterations'
                            }
                        },
                        y: {
                            title: {
                                display: true,
                                text: 'Token Value'
                            },
                            beginAtZero: true
                        }
                    },
                    plugins: {
                        legend: {
                            position: 'right'
                        }
                    }
                }
            });
        }

        // 追加：コンポーネントのクリーンアップ時にChartインスタンスを破棄する
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

export default TokenChart;

