import { Card, Title, Space, Text, Button, ActionIcon } from '@mantine/core';
import { Calendar, TimePicker } from '@mantine/dates';
import { UseFormReturnType } from '@mantine/form';
import { Poll } from '~/pages/organize/poll';
import dayjs from 'dayjs';
import { IconPlus, IconX } from '@tabler/icons-react';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(customParseFormat);
type Props = {
  form: UseFormReturnType<Poll, (values: Poll) => Poll>;
};

export const CalendarCardPoll = ({ form }: Props) => {
  const dates = form.values.dates;
  const handleSelect = (date: string) => {
    const key = dayjs(date).format('YYYY-MM-DD');
    const isSelected = dates.some((d) => d.date === key);

    if (isSelected) {
      form.setFieldValue('dates', (current) => {
        const next = [...current];
        const index = next.findIndex((d) => d.date === key);
        if (index !== -1) {
          next.splice(index, 1);
        }
        return next;
      });
      return;
    }

    form.setFieldValue('dates', (current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        date: key,
        startTime: '10:00',
        endTime: '11:00',
      },
    ]);
  };

  const handleAddTime = (key: string, startTime: string, endTime: string) => {
    // example: add a default 1-hour slot; adjust as you like
    form.setFieldValue('dates', (current) => [
      ...current,
      {
        id: crypto.randomUUID(),
        date: key,
        startTime,
        endTime,
      },
    ]);
  };

  const handleDeleteTime = (id: string) => {
    form.setFieldValue('dates', (current) => {
      const next = [...current];
      const slotIndex = next.findIndex((slot) => slot.id === id);
      if (slotIndex !== -1) {
        next.splice(slotIndex, 1);
      }
      return next;
    });
  };

  const handleChangeTime = (id: string) => {
    return (time: string, type: 'startTime' | 'endTime') => {
      form.setFieldValue('dates', (current) => {
        const next = [...current];
        const slot = next.find((slot) => slot.id === id);
        if (slot) {
          next[next.indexOf(slot)] = {
            ...slot,
            [type]: time,
          };
        }
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
        <div className="flex flex-col md:flex-row gap-2 p-4 justify-center">
          <Calendar
            getDayProps={(date) => {
              const key = dayjs(date).format('YYYY-MM-DD');
              return {
                selected: dates.some((d) => d.date === key),
                onClick: () => handleSelect(date),
              };
            }}
          />

          <div className="flex flex-col gap-2">
            {form.values.dates
              .sort((a, b) => dayjs(a.date).valueOf() - dayjs(b.date).valueOf())
              .reduce(
                (acc, slot) => {
                  const dateKey = slot.date;
                  let group = acc.find((g) => g.date === dateKey);
                  if (!group) {
                    group = { date: dateKey, slots: [] };
                    acc.push(group);
                  }
                  group.slots.push(slot);
                  return acc;
                },
                [] as {
                  date: string;
                  slots: (typeof form.values.dates)[0][];
                }[],
              )
              .map((timeSlots) => (
                <Card
                  withBorder
                  key={timeSlots.date}
                  className="flex gap-2 items-start flex-nowrap !flex-row !p-3"
                >
                  <Card
                    withBorder
                    className="flex flex-col items-center !py-0 !px-2"
                  >
                    <Text>{dayjs(timeSlots.date).format('MMM')}</Text>
                    <Title order={3}>
                      {dayjs(timeSlots.date).format('DD')}
                    </Title>
                  </Card>
                  <div className="flex flex-col gap-2">
                    {timeSlots.slots.map((slot, index) => {
                      let timeSlotValid = true;

                      if (
                        dayjs(slot.endTime, 'HH:mm').isBefore(
                          dayjs(slot.startTime, 'HH:mm'),
                        ) ||
                        dayjs(slot.endTime, 'HH:mm').isSame(
                          dayjs(slot.startTime, 'HH:mm'),
                        )
                      ) {
                        timeSlotValid = false;
                      }

                      return (
                        <div className="flex gap-2 items-center" key={index}>
                          <TimePicker
                            styles={
                              !timeSlotValid
                                ? {
                                    input: {
                                      backgroundColor: 'orange',
                                      color: 'white',
                                    },
                                    field: {
                                      color: 'white',
                                    },
                                  }
                                : undefined
                            }
                            value={slot.startTime}
                            onChange={(time) =>
                              handleChangeTime(slot.id)(time, 'startTime')
                            }
                          />
                          -
                          <TimePicker
                            styles={
                              !timeSlotValid
                                ? {
                                    input: {
                                      backgroundColor: 'orange',
                                      color: 'white',
                                    },
                                    field: {
                                      color: 'white',
                                    },
                                  }
                                : undefined
                            }
                            value={slot.endTime}
                            onChange={(time) =>
                              handleChangeTime(slot.id)(time, 'endTime')
                            }
                          />
                          <ActionIcon
                            size="input-sm"
                            variant="subtle"
                            onClick={() => handleDeleteTime(slot.id)}
                          >
                            <IconX size={16} />
                          </ActionIcon>
                        </div>
                      );
                    })}

                    <div>
                      <Button
                        leftSection={<IconPlus size={16} />}
                        variant="outline"
                        onClick={() =>
                          handleAddTime(timeSlots.date, '10:00', '11:00')
                        }
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
