// BetOnIdeasChart.js
import React, { useEffect, useRef } from 'react';
import Chart from 'chart.js/auto';
import { useGlobalData } from '../GlobalDataContext';
import { Box } from "@chakra-ui/react";

function BetOnIdeasChart() {
    const { data: log_all } = useGlobalData();
    const chartRefA = useRef(null);
    const chartRefB = useRef(null);
    const chartRefC = useRef(null);
    const ideas = ['A', 'B', 'C'];
    const chartInstances = useRef({});
    console.log(log_all)

    useEffect(() => {
        // Object.values(chartInstances.current).forEach(instance => instance.destroy());
        Object.values(chartInstances.current).forEach(instance => {
            if(instance) instance.destroy();
        });

        if (log_all && log_all.length) {
            const betOnIdeasByAgent = {};
            ideas.forEach(idea => {
                betOnIdeasByAgent[idea] = {};
            });

            log_all.forEach(logEntry => {
                const agentId = logEntry.agent;
                ideas.forEach(idea => {
                    if (!betOnIdeasByAgent[idea][agentId]) {
                        betOnIdeasByAgent[idea][agentId] = [];
                    }
                    betOnIdeasByAgent[idea][agentId].push(logEntry['bet_on_ideas'][idea]);
                });
            });

            const max_value = Math.max(...log_all.map(entry => Math.max(...Object.values(entry.bet_on_ideas))));

            ideas.forEach((idea, index) => {
                const datasets = Object.entries(betOnIdeasByAgent[idea]).map(([agentId, bets]) => {
                    return {
                        label: `Agent ${agentId}`,
                        data: bets,
                        borderColor: `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() * 255})`,
                        borderWidth: 1,
                        fill: false
                    };
                });

                const ref = idea === 'A' ? chartRefA : idea === 'B' ? chartRefB : chartRefC;

                if(chartInstances.current[idea]) {
                    chartInstances.current[idea].destroy();
                }

                chartInstances.current[idea] = new Chart(ref.current, {
                    type: 'line',
                    data: {
                        labels: Array.from({ length: datasets[0].data.length }, (_, i) => i),
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
                                    text: `Bet on Idea ${idea}`
                                },
                                min: 0,
                                max: max_value
                            }
                        },
                        plugins: {
                            legend: {
                                position: 'right'
                            }
                        }
                    }
                });
            });
        }
        return () => {
                Object.values(chartInstances.current).forEach(instance => {
                    if(instance) instance.destroy();
                });
            };
    }, [log_all]);

    return (
        <Box width="800px" height="200px" display="flex" justifyContent="space-between">
            <canvas ref={chartRefA}></canvas>
            <canvas ref={chartRefB}></canvas>
            <canvas ref={chartRefC}></canvas>
        </Box>
    );
}

export default BetOnIdeasChart;
