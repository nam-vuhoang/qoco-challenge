import { Box, Heading, HStack, Icon } from '@chakra-ui/react';
import React, { useState } from 'react';
import FlightSearchForm from '../components/FlightSearchForm';
import FlightTable from '../components/FlightTable';
import { Flight, FlightFilter } from '../models';
import { FlightService } from '../services';
import { AppStatus, AppStatusPanel } from '../components/utils';
import { MdDashboard } from 'react-icons/md'; // Change the icon to MdDashboard

const DashboardPage: React.FC = () => {
  const [flights, setFlights] = useState<Flight[] | undefined>(undefined);
  const [status, setStatus] = useState<AppStatus | null>(null);

  const handleSearch = async (filter: FlightFilter) => {
    try {
      setStatus({ info: 'Fetching flights...' });
      const response = await FlightService.searchFlights(filter);
      setFlights(response);
      setStatus(null);
    } catch (error: any) {
      setStatus({ error });
    }
  };

  return (
    <Box p={5}>
      <HStack mb={12}>
        <Heading className="chakra-page-heading">
          <Icon as={MdDashboard} w={8} h={8} mr={2} /> {/* Use the MdDashboard icon */}
          Dashboard
        </Heading>
      </HStack>

      <Box className="chakra-panel">
        <Heading as="h1" size="lg" mb={4}>
          Search flights
        </Heading>
        <FlightSearchForm onSearch={handleSearch} />
      </Box>

      {flights && (
        <Box className="chakra-panel" mt={4}>
          <Heading as="h1" size="lg" mb={4}>
            Flights
          </Heading>
          <FlightTable flights={flights} />
        </Box>
      )}

      {status && (
        <Box mt={4}>
          <AppStatusPanel status={status} />
        </Box>
      )}
    </Box>
  );
};

export default DashboardPage;
