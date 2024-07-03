import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Flight } from './flight.entity';
import { FlightFilter } from './flight-filter.dto';

@Injectable()
export class FlightService {
  constructor(
    @InjectRepository(Flight)
    private readonly flightRepository: Repository<Flight>,
  ) {}

  create(flight: Flight): Promise<Flight> {
    return this.flightRepository.save(flight);
  }

  findAll(): Promise<Flight[]> {
    return this.flightRepository.find();
  }

  async findOne(id: string): Promise<Flight> {
    const flight = await this.flightRepository.findOne({ where: { id } });
    if (!flight) {
      throw new NotFoundException(`Flight with ID ${id} not found`);
    }
    return flight;
  }

  async update(id: string, flight: Flight): Promise<Flight> {
    await this.flightRepository.update(id, flight);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.flightRepository.delete(id);
  }

  async search(filter: FlightFilter): Promise<Flight[]> {
    const query = this.flightRepository.createQueryBuilder('flight');

    if (filter.startTime) {
      query.andWhere(
        'COALESCE(flight.actualDepartureTime, flight.estimatedDepartureTime, flight.scheduledDepartureTime) >= :startTime',
        { startTime: filter.startTime },
      );
    }

    if (filter.endTime) {
      query.andWhere(
        'COALESCE(flight.actualArrivalTime, flight.estimatedArrivalTime, flight.scheduledArrivalTime) <= :endTime',
        { endTime: filter.endTime },
      );
    }

    if (filter.flightNumbers && filter.flightNumbers.length > 0) {
      query.andWhere('flight.flightNumber IN (:...flightNumbers)', {
        flightNumbers: filter.flightNumbers,
      });
    }

    if (filter.airlines && filter.airlines.length > 0) {
      query.andWhere('flight.airline IN (:...airlines)', {
        airlines: filter.airlines,
      });
    }

    if (filter.registrations && filter.registrations.length > 0) {
      query.andWhere('flight.registration IN (:...registrations)', {
        registrations: filter.registrations,
      });
    }

    if (filter.aircraftTypes && filter.aircraftTypes.length > 0) {
      query.andWhere('flight.aircraftType IN (:...aircraftTypes)', {
        aircraftTypes: filter.aircraftTypes,
      });
    }

    if (filter.departureStations && filter.departureStations.length > 0) {
      query.andWhere(
        'flight.scheduledDepartureStation IN (:...departureStations)',
        { departureStations: filter.departureStations },
      );
    }

    if (filter.arrivalStations && filter.arrivalStations.length > 0) {
      query.andWhere(
        'flight.scheduledArrivalStation IN (:...arrivalStations)',
        { arrivalStations: filter.arrivalStations },
      );
    }

    if (filter.limit) {
      query.limit(filter.limit);
    }

    return query.getMany();
  }

  async getCategoryValues(category: string): Promise<string[]> {
    let results;

    switch (category) {
      case 'registrations':
        results = await this.flightRepository
          .createQueryBuilder('flight')
          .select('DISTINCT flight.registration', 'value')
          .orderBy('value')
          .getRawMany();
        break;
      case 'airlines':
        results = await this.flightRepository
          .createQueryBuilder('flight')
          .select('DISTINCT flight.airline', 'value')
          .orderBy('value')
          .getRawMany();
        break;
      case 'aircraftTypes':
        results = await this.flightRepository
          .createQueryBuilder('flight')
          .select('DISTINCT flight.aircraftType', 'value')
          .orderBy('value')
          .getRawMany();
        break;
      case 'flightNumbers':
        results = await this.flightRepository
          .createQueryBuilder('flight')
          .select('DISTINCT flight.flightNumber', 'value')
          .orderBy('value')
          .getRawMany();
        break;
      case 'stations':
        const departureStations = await this.flightRepository
          .createQueryBuilder('flight')
          .select('DISTINCT flight.scheduledDepartureStation', 'value')
          .getRawMany();
        const arrivalStations = await this.flightRepository
          .createQueryBuilder('flight')
          .select('DISTINCT flight.scheduledArrivalStation', 'value')
          .getRawMany();

        const stations = new Set([
          ...departureStations.map((result) => result.value),
          ...arrivalStations.map((result) => result.value),
        ]);

        results = Array.from(stations).sort();
        return results;
      default:
        throw new NotFoundException(`Category ${category} not found`);
    }

    return results.map((result) => result.value);
  }
}
