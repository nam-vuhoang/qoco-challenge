import React, { useEffect, useRef, useState } from 'react';
import { Box, Text } from '@chakra-ui/react';
import './TimeRuler.module.scss';
import { TimeUnit, roundUp, getTimeMarksOfInterval } from '../../utils/TimeUtils';
import moment from 'moment';

export interface TimeScaleFormat {
  /**
   * Time unit for the scale, e.g. 'hour', 'hour-2', 'hour-3', 'hour-6', 'day', 'week', 'month'
   */
  unit: TimeUnit;

  /**
   * Date format according to moment library (see https://momentjscom.readthedocs.io/en/latest/moment/04-displaying/01-format/)
   */
  format: string;
}

interface TimeRulerProps {
  minTime: Date;
  maxTime: Date;
  scaleFormats: TimeScaleFormat[];
  unitWidth?: number; // Minimum width of each time unit box
}

type TimeScale = {
  unit: TimeUnit;
  boxes: {
    time: Date;
    weight: number;
    text: string;
  }[];
};

const TimeRuler: React.FC<TimeRulerProps> = ({ scaleFormats, minTime, maxTime, unitWidth = 25 }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number>(unitWidth);

  useEffect(() => {
    const updateContainerWidth = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.offsetWidth);
      }
    };

    updateContainerWidth();
    window.addEventListener('resize', updateContainerWidth);

    return () => {
      window.removeEventListener('resize', updateContainerWidth);
    };
  }, []);

  const lowestScaleFormat = scaleFormats[scaleFormats.length - 1];
  maxTime = roundUp(maxTime, lowestScaleFormat.unit);

  const timeScales: TimeScale[] = scaleFormats.map((scaleFormat) => {
    const timeMarks: Date[] = getTimeMarksOfInterval(minTime, maxTime, scaleFormat.unit);
    return {
      unit: scaleFormat.unit,
      boxes: timeMarks.map((time) => ({
        time,
        weight: 1,
        text: moment(time).format(scaleFormat.format),
      })),
    };
  });

  const unitScale = timeScales[timeScales.length - 1];
  const unitBoxes = unitScale.boxes;
  const unitCount = unitBoxes.length;

  for (let i = timeScales.length - 2; i >= 0; i--) {
    const upperBoxes = timeScales[i].boxes;
    let unitIndex = unitCount - 1;
    for (let j = upperBoxes.length - 1; j >= 0; j--) {
      upperBoxes[j].weight = 0; // reset weight
      while (unitIndex >= 0 && upperBoxes[j].time <= unitBoxes[unitIndex].time) {
        upperBoxes[j].weight += unitBoxes[unitIndex].weight;
        unitIndex--;
      }
    }
  }

  unitWidth = Math.round(Math.max(unitWidth, containerWidth / unitCount));

  return (
    <Box className="time-ruler" ref={containerRef} width="100%">
      {timeScales.map((timeScale, i) => (
        <Box key={i} className="time-scale" display="flex" width={`${unitWidth * unitCount}px`}>
          {timeScale.boxes.map((timeBox, j) => (
            <Box
              key={j}
              className="time-unit"
              display="inline-flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
              borderRight="1px solid #e2e8f0"
              paddingY="5px"
              width={`${unitWidth * timeBox.weight}px`} // Width based on weight and calculated box width
            >
              <Text whiteSpace="nowrap" title={timeBox.time.toLocaleString()}>
                {timeBox.text}
              </Text>
            </Box>
          ))}
        </Box>
      ))}
    </Box>
  );
};

export default TimeRuler;