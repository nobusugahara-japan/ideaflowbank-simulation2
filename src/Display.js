import React, { useState } from 'react';
import { useGlobalData } from './GlobalDataContext';
import * as d3 from 'd3';

const Display = () => {
    const { data } = useGlobalData();
    const [agentFilter, setAgentFilter] = useState(null);

    const filteredData = agentFilter !== null ? data.filter(item => item.agent === agentFilter) : data;

    return (
        <div>
            <div>
                <label>Filter by Agent:</label>
                <select value={agentFilter || ''} onChange={e => setAgentFilter(e.target.value === '' ? null : +e.target.value)}>
                    <option value=''>All</option>
                    {[...new Set(data.map(d => d.agent))].map(agent => (
                        <option key={agent} value={agent}>Agent {agent}</option>
                    ))}
                </select>
            </div>
            <table>
                <thead>
                    <tr>
                        <th>Iteration</th>
                        <th>Agent</th>
                        <th>A Expect</th>
                        <th>A Cost</th>
                        <th>B Expect</th>
                        <th>B Cost</th>
                        <th>C Expect</th>
                        <th>C Cost</th>
                        <th>Action</th>
                        <th>Idea</th>
                        <th>Job Total A</th>
                        <th>Job Total B</th>
                        <th>Job Total C</th>
                        <th>Vote Total A</th>
                        <th>Vote Total B</th>
                        <th>Vote Total C</th>
                        <th>Token</th>
                    </tr>
                </thead>
                <tbody>
                    {filteredData.map((item, idx) => (
                        <tr key={idx}>
                            <td style={{textAlign: "center"}}>{item.iteration}</td>
                            <td style={{textAlign: "center"}}>{item.agent}</td>
                            <td style={{textAlign: "center"}}>{renderCircle(item.expected_values_for_jobs.A,"Value")}</td>
                            <td style={{textAlign: "center"}}>{renderCircle(item.job_costs.A,"Cost")}</td>
                            <td style={{textAlign: "center"}}>{renderCircle(item.expected_values_for_jobs.B,"Value")}</td>
                            <td style={{textAlign: "center"}}>{renderCircle(item.job_costs.B,"Cost")}</td>
                            <td style={{textAlign: "center"}}>{renderCircle(item.expected_values_for_jobs.C,"Value")}</td>
                            <td style={{textAlign: "center"}}>{renderCircle(item.job_costs.C,"Cost")}</td>
                            <td style={{textAlign: "center"}}>{item.action}</td>
                            <td style={{textAlign: "center"}}>{item.idea}</td>
                            <td style={{textAlign: "center"}}>{Number(item.jobs_total.A).toFixed(2)}</td>
                            <td style={{textAlign: "center"}}>{Number(item.jobs_total.B).toFixed(2)}</td>
                            <td style={{textAlign: "center"}}>{Number(item.jobs_total.C).toFixed(2)}</td>
                            <td style={{textAlign: "center"}}>{Number(item.votes_total.A).toFixed(2)}</td>
                            <td style={{textAlign: "center"}}>{Number(item.votes_total.B).toFixed(2)}</td>
                            <td style={{textAlign: "center"}}>{Number(item.votes_total.C).toFixed(2)}</td>
                            <td style={{textAlign: "center"}}>{Number(item.token).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const renderCircle = (value,type) => {
    const svgSize = 30; // SVGのビューボックスのサイズ
    const maxRadius = svgSize / 2 - 5; // SVGの半分の大きさより少し小さい値
    const scale = d3.scaleLinear().domain([0, 0.2]).range([5, maxRadius]); // Adjust the domain based on your data
    const radius = scale(value);

      // type（Value または Cost）に基づいて色を選択
      let color;
      if (type === "Value") {
          color = "#ff8c00";
      } else if (type === "Cost") {
          color = "#4169e1";
      } else {
          color = "gray"; // 未知のタイプのデフォルトの色
      }
    
    return (
        <svg width={20} height={20}>
            <circle cx={10} cy={10} r={radius} fill= {color} />
        </svg>
    );
}

export default Display;


