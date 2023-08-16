// ChartDisplay/index.js
import React from 'react';
import TokenChart from './ChartComponent/TokenChart';
import BetOnIdeasChart from './ChartComponent/BetOnIdeasChart';
import ActionCountChart from './ChartComponent/ActionCountChart';
import { HStack } from "@chakra-ui/react";

function ChartDisplay() {
    return (
        <div>
            <HStack spacing="24px">
                <TokenChart />
                <ActionCountChart />
            </HStack>
            <BetOnIdeasChart />
        </div>
    );
}

export default ChartDisplay;
