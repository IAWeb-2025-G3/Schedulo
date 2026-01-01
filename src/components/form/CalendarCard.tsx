import { Card, Title, Space, Text, Button, ActionIcon } from '@mantine/core';
import { Calendar, TimePicker } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { Poll } from '~/pages';
import dayjs from 'dayjs';
import { IconPlus, IconX } from '@tabler/icons-react';

type Props = {
  form: UseFormReturnType<Poll, (values: Poll) => Poll>;
};

export const CalendarCard = ({ form }: Props) => {
  const datesRecord = form.values.dates;
  const handleSelect = (date: string) => {
    const key = dayjs(date).format('YYYY-MM-DD');
    const isSelected = Object.prototype.hasOwnProperty.call(datesRecord, key);

    if (isSelected) {
      form.setFieldValue('dates', (current) => {
        const next = { ...current };
        delete next[key];
        return next;
      });
      return;
    }

    if (Object.keys(datesRecord).length >= 3) return;

    form.setFieldValue('dates', (current) => ({
      ...current,
      [key]: current[key] ?? [],
    }));
  };

  const handleAddTime = (key: string, startTime: string, endTime: string) => {
    // example: add a default 1-hour slot; adjust as you like
    form.setFieldValue('dates', (current) => ({
      ...current,
      [key]: [
        ...(current[key] ?? []),
        { startTime: startTime, endTime: endTime },
      ],
    }));
  };

  const handleDeleteTime = (dateKey: string, index: number) => {
    form.setFieldValue('dates', (current) => {
      const next = { ...current };
      next[dateKey] = next[dateKey].filter((_, i) => i !== index);
      return next;
    });
  };

  const handleChangeTime = (dateKey: string, index: number) => {
    return (time: string, type: 'startTime' | 'endTime') => {
      form.setFieldValue('dates', (current) => {
        const next = { ...current };
        const slot = next[dateKey][index];
        next[dateKey][index] = {
          ...slot,
          [type]: time,
        };
        return next;
      });
    };
  };

  return (
    <Card withBorder>
      <div className="flex flex-col">
        <Title order={3}>Calendar</Title>
        <Text>Select potential dates or times for your event</Text>
      </div>

      <Space h="md" />

      <Card.Section>
        <div className="flex gap-2 p-4 justify-center">
          <Calendar
            getDayProps={(date) => {
              const key = dayjs(date).format('YYYY-MM-DD');
              return {
                selected: Object.prototype.hasOwnProperty.call(
                  datesRecord,
                  key,
                ),
                onClick: () => handleSelect(date),
              };
            }}
          />

          <div className="flex flex-col gap-2">
            {Object.entries(form.values.dates)
              .sort(([a], [b]) => dayjs(a).valueOf() - dayjs(b).valueOf())
              .map(([dateKey, timeSlots]) => (
                <Card
                  withBorder
                  key={dateKey}
                  className="flex gap-2 items-start flex-nowrap !flex-row !p-3"
                >
                  <Card
                    withBorder
                    className="flex flex-col items-center !py-0 !px-2"
                  >
                    <Text>{dayjs(dateKey).format('MMM')}</Text>
                    <Title order={3}>{dayjs(dateKey).format('DD')}</Title>
                  </Card>
                  <div className="flex flex-col gap-2">
                    {timeSlots.map((slot, index) => (
                      <div className="flex gap-2 items-center" key={index}>
                        <TimePicker
                          value={slot.startTime}
                          onChange={(time) =>
                            handleChangeTime(dateKey, index)(time, 'startTime')
                          }
                        />
                        <TimePicker
                          value={slot.endTime}
                          onChange={(time) =>
                            handleChangeTime(dateKey, index)(time, 'endTime')
                          }
                        />
                        <ActionIcon
                          size="input-sm"
                          variant="subtle"
                          onClick={() => handleDeleteTime(dateKey, index)}
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      </div>
                    ))}

                    <div>
                      <Button
                        leftSection={<IconPlus size={16} />}
                        variant="outline"
                        onClick={() => handleAddTime(dateKey, '00:00', '24:00')}
                      >
                        Add Time
                      </Button>
                    </div>
                  </div>
                </Card>
              ))}
          </div>
        </div>
      </Card.Section>
    </Card>
  );
};
