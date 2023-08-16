import { Box, Flex, Link as ChakraLink, Spacer, Heading } from "@chakra-ui/react";
import { Link, BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Admin from "./Admin";
import Display from "./Display";
import Parameters from "./Parameters";
import ChartDisplay from "./ChartDisplay";

function App() {
    return (
        <Router>
            <Flex as="nav" bg="blue.600" color="white" padding="1.5rem" align="center">
                <Heading as="h1" size="lg" letterSpacing={"tighter"}>
                    Idea Flow Bank Simulation
                </Heading>
                <Spacer />
                <Box>
                    <ChakraLink as={Link} to="/" marginRight="20px" _hover={{ textDecoration: 'none' }}>
                        Display
                    </ChakraLink>
                    <ChakraLink as={Link} to="/admin" marginRight="20px" _hover={{ textDecoration: 'none' }}>
                        Admin
                    </ChakraLink>
                    <ChakraLink as={Link} to="/parameters" marginRight="20px" _hover={{ textDecoration: 'none' }}>
                        Parameters
                    </ChakraLink>
                    <ChakraLink as={Link} to="/chartdisplay" _hover={{ textDecoration: 'none' }}>
                        Chart Display
                    </ChakraLink>
                </Box>
            </Flex>

            <Box padding="2rem">
                <Routes>
                    <Route path="/admin" element={<Admin />} />
                    <Route path="/" element={<Display />} />
                    <Route path="/parameters" element={<Parameters />} />
                    <Route path="/chartdisplay" element={<ChartDisplay />} />
                </Routes>
            </Box>
        </Router>
    );
}

export default App;


