import React, { useState } from 'react';
import { Box, Table, Thead, Tbody, Tr, Th, Td, Input, Button, InputGroup, InputLeftAddon, HStack,
    FormControl, FormLabel,Flex, Spacer,Text} from '@chakra-ui/react';
import { useGlobalData } from './GlobalDataContext';

function Parameters() {
    const initialParams = {
        jobValues: {'A': 0.06, 'B': 0.04, 'C': 0.09},
        expectation: {'A': 1, 'B': 1.5, 'C': 1.2},
        jobCosts: {'A': 0.1, 'B': 0.12, 'C': 0.09}
    };

    const [agents, setAgents] = useState(new Array(5).fill(initialParams));
    const [randomRanges, setRandomRanges] = useState({});
    const [mainParams, setMainParams] = useState({
        update_factor: 0.1,
        token_update_rate: 0.1,
        vote_discount_rate: 0.8,
        vote_minimum: 0.01
    });
    const [apiConfirmForAgent, setApiConfirmForAgent] = useState();
    const [apiConfirmForParameter, setApiConfirmForParameter] = useState();

    const { data, setData } = useGlobalData();

    const handleInputChange = (e, agentIndex, category, type) => {
        const newAgents = [...agents];
        newAgents[agentIndex][category][type] = parseFloat(e.target.value);
        setAgents(newAgents);
    };

    const handleRandomRangeChange = (e, category, type, rangeType) => {
        const newRandomRanges = {...randomRanges};
        if (!newRandomRanges[category]) {
            newRandomRanges[category] = {};
        }
        if (!newRandomRanges[category][type]) {
            newRandomRanges[category][type] = {};
        }
        newRandomRanges[category][type][rangeType] = e.target.value;
        console.log(newRandomRanges);
        setRandomRanges(newRandomRanges);
    };

    function getRandomValue(min, max) {
        return (Math.random() * (max - min) + min).toFixed(2);
      }
      
      const handleRandomize = (category, type) => {
          const min = parseFloat(randomRanges[category][type].min);
          const max = parseFloat(randomRanges[category][type].max);
          
          let newAgents = agents.map(agent => ({
              ...agent,
              [category]: {
                  ...agent[category],
                  [type]: getRandomValue(min, max)
              }
          }));
      
          setAgents(newAgents);
      }
      

    console.log("agents",agents)

    const handleSubmitAgentsToAPI = async () => {
        const transformedAgents = agents.map((agent, index) => ({
            agent_id: index,
            job_values: transformAndConvert(agent.jobValues),
            job_costs: transformAndConvert(agent.jobCosts),
            expectation_coefficients: transformAndConvert(agent.expectation)
        }));
    
        try {
            const response = await fetch("http://127.0.0.1:8000/initialize_agents/", {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ agents: transformedAgents })
            });
    
            const data = await response.json();
            console.log(data, data.agent_ids.length);
            setApiConfirmForAgent(`success - No of Data: ${data.agent_ids.length}`);
        } catch (error) {
            console.error("Error sending data to API:", error);
        }
    };
    
    const transformAndConvert = (data) => {
        const transformed = {};
        for (let key in data) {
            transformed[key.toLowerCase()] = parseFloat(data[key]);
        }
        return transformed;
    };
    
    const handleParamChange = (param, value) => {
        setMainParams(prev => ({ ...prev, [param]: parseFloat(value) }));
    };

    const handleSubmitParameterToAPI = async () => {
        const data = {
            update_factor: mainParams.update_factor,
            token_update_rate: mainParams.token_update_rate,
            vote_discount_rate: mainParams.vote_discount_rate,
            vote_minimum: mainParams.vote_minimum
        };
    
        try {
            const response = await fetch('http://127.0.0.1:8000/run_simulation/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });
    
            if (!response.ok) {
                throw new Error('Network response was not ok');
            }
    
            const responseData = await response.json();
            console.log("✅",responseData);
    
            setData(responseData.log)
            // setData(prevData => ({ ...prevData, log: responseData.log }));
    
        } catch (error) {
            console.error('There was a problem with the fetch operation:', error.message);
            // エラーメッセージの表示などの処理
        }
    };

    return (
        <Box p={5}>
            <Table variant="simple">
                <Thead>
                    <Tr>
                        <Th>Parameter</Th>
                        {new Array(5).fill(0).map((_, i) => (
                            <Th key={i}>Agent {i}</Th>
                        ))}
                        <Th>Random Range</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {Object.entries(initialParams).map(([category, types]) => (
                        Object.entries(types).map(([type, value]) => (
                            <Tr key={`${category}-${type}`}>
                                <Td>{category} {type}</Td>
                                {agents.map((agent, agentIndex) => (
                                    <Td key={agentIndex}>
                                        <Input width="80px" type="number" step="0.01" value={agent[category][type]} onChange={e => handleInputChange(e, agentIndex, category, type)} />
                                    </Td>
                                ))}
                                <Td>
                                  <HStack spacing={3}>
                                    <InputGroup size="sm" mb={2}>
                                        <InputLeftAddon children="Min"/>
                                        <Input width="60px" type="number" step="0.01" value={randomRanges[category]?.[type]?.min || ''} onChange={e => handleRandomRangeChange(e, category, type, 'min')} />
                                    </InputGroup>
                                    <InputGroup size="sm" mb={2}>
                                        <InputLeftAddon children="Max"/>
                                        <Input width="60px" type="number" step="0.01" value={randomRanges[category]?.[type]?.max || ''} onChange={e => handleRandomRangeChange(e, category, type, 'max')} />
                                    </InputGroup>
                                    <Button fontSize="sm" padding={5} colorScheme="blue" onClick={() => handleRandomize(category, type)}>Random</Button>
                                  </HStack>
                                </Td>
                            </Tr>
                        ))
                    ))}
                </Tbody>
            </Table>
        <Flex mt={4}>
         <Spacer/>
         <Button colorScheme="blue" mt={4} onClick={handleSubmitAgentsToAPI}>Send Agents</Button>
         <Text padding={5}>{apiConfirmForAgent}</Text>
        </Flex>

        <Flex wrap="wrap" justify="space-between">
            <FormControl id="update_factor" mb={4} flex="1" mr={2}>
                <FormLabel>Update Factor</FormLabel>
                <Input
                    type="number"
                    value={mainParams.update_factor}
                    onChange={e => handleParamChange('update_factor', e.target.value)}
                />
            </FormControl>

            <FormControl id="token_update_rate" mb={4} flex="1" mr={2}>
                <FormLabel>Token Update Rate</FormLabel>
                <Input
                    type="number"
                    value={mainParams.token_update_rate}
                    onChange={e => handleParamChange('token_update_rate', e.target.value)}
                />
            </FormControl>

            <FormControl id="vote_discount_rate" mb={4} flex="1" mr={2}>
                <FormLabel>Vote Discount Rate</FormLabel>
                <Input
                    type="number"
                    value={mainParams.vote_discount_rate}
                    onChange={e => handleParamChange('vote_discount_rate', e.target.value)}
                />
            </FormControl>

            <FormControl id="vote_minimum" mb={4} flex="1">
                <FormLabel>Vote Minimum</FormLabel>
                <Input
                    type="number"
                    value={mainParams.vote_minimum}
                    onChange={e => handleParamChange('vote_minimum', e.target.value)}
                />
            </FormControl>
        </Flex>
            <Flex mt={4}>
                <Spacer />  {/* これにより、続く要素（Button）がFlexコンテナの右端に押し出されます */}
                <Button colorScheme="blue" onClick={handleSubmitParameterToAPI}>Start Simulation</Button>
            </Flex>
    </Box>
        
    );
}

export default Parameters;



