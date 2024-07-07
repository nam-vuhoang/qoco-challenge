import React from 'react';
import styles from './Timeline.module.scss';
import { TaskGroup } from '../../models/TaskGroup.entity';
import InlineIcon from '../InlineIcon/InlineIcon';
import { GanttChartTypeInfo } from '../GanttChart/GanttChart';
import { Box, Flex } from '@chakra-ui/react';
import { emToPx, pxToEm, smallFontSizeInEm } from '../../utils/CssUtils';

interface TimelineProps {
  taskGroups: TaskGroup[];
  expandedGroups: Set<string>;
  minTime: Date;
  maxTime: Date;
  millisecondWidth: number;
  taskTypeInfos?: GanttChartTypeInfo[];
}

const getDefaultTaskColor = (type: number) => {
  return type % 2 === 1 ? styles.ganttChartTaskBarColor1 : styles.ganttChartTaskBarColor2;
};

const Timeline: React.FC<TimelineProps> = ({
  taskGroups,
  expandedGroups,
  minTime,
  millisecondWidth,
  taskTypeInfos,
}) => {
  return (
    <div className={styles.timeline}>
      {taskGroups.map((group) => {
        const isExpanded = expandedGroups.has(group.name);
        return (
          <div key={group.name}>
            {isExpanded && <div className={styles.emptyRow}></div>}
            {group.tasks.map((task) => {
              // Calculate taskStartX and taskWidth in terms of pixels
              const taskStartX = (task.startTime.getTime() - minTime.getTime()) * millisecondWidth;
              const taskWidth = (task.endTime.getTime() - task.startTime.getTime()) * millisecondWidth;

              const taskTypeInfo = taskTypeInfos?.find((info) => info.typeIndex === task.typeIndex);
              const taskColor = taskTypeInfo?.barColor || getDefaultTaskColor(task.typeIndex);

              let hasMultipleTexts = false;

              if (task.startName && task.endName) {
                const totalTextLength = task.name.length + task.startName.length + task.endName.length;
                hasMultipleTexts = taskWidth > emToPx(totalTextLength * smallFontSizeInEm * 0.7);
              }

              const justifyContent = hasMultipleTexts ? 'space-between' : 'center';

              const replacer = (key: string, value: any) => {
                if (key === 'startTime' || key === 'endTime') {
                  return undefined;
                }
                return value;
              };

              const title = `${taskTypeInfo?.caption + ': '}${task.name}${
                (task.startName && task.endName && '( ' + task.startName + '-' + task.endName + ')') || ''
              }\nStart: ${task.startTime.toLocaleString()}\nEnd: ${task.endTime.toLocaleString()}\nDetails:\n${JSON.stringify(
                task,
                replacer,
                2
              )}`;

              return (
                <React.Fragment key={task.id}>
                  <Flex
                    className={styles.taskBar}
                    justifyContent={justifyContent}
                    left={`${taskStartX}px`}
                    width={`${taskWidth}px`}
                    backgroundColor={taskColor}
                    title={title}
                  >
                    {hasMultipleTexts && task.startName}
                    <span>
                      {<InlineIcon>{taskTypeInfo?.icon}</InlineIcon>}
                      {task.name}
                    </span>
                    {hasMultipleTexts && task.endName}
                  </Flex>
                  {isExpanded && <div className={styles.emptyRow}></div>}
                </React.Fragment>
              );
            })}
            {!isExpanded && <div className={styles.emptyRow}></div>}
          </div>
        );
      })}
    </div>
  );
};

export default Timeline;
