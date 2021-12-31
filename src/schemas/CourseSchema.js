export const CourseSchema = {
  name: 'Course',
  properties: {
    _id: 'objectId?',
    color: 'string?',
    flashCards: 'FlashCardCourse[]',
    icon: 'string?',
    name: 'string?',
    notificationsStudy: 'NotificationsStudyCourse[]',
    userID: 'string?',
  },
  primaryKey: '_id',
};

export const FlashCardCourseSchema = {
  name: 'FlashCardCourse',
  embedded: true,
  properties: {
    back: 'string?',
    backImg: 'string?',
    front: 'string?',
    frontImg: 'string?',
    id: 'string?',
    name: 'string?',
  },
};

export const NotificationsStudyCourseSchema = {
  name: 'NotificationsStudyCourse',
  embedded: true,
  properties: {
    body: 'string?',
    id: 'string?',
    isActive: 'bool?',
    isRandomTime: 'bool?',
    notifications: 'CourseNotification[]',
    randomTimeRange: 'RandomTimeRange',
    repetitionCount: 'int?',
    title: 'string?',
  },
};

export const CourseNotificationSchema = {
  name: 'CourseNotification',
  embedded: true,
  properties: {
    fireHour: 'int?',
    fireMinute: 'int?',
    notificationId: 'int?',
  },
};

export const RandomTimeRangeSchema = {
  name: 'RandomTimeRange',
  embedded: true,
  properties: {
    end: 'date?',
    start: 'date?',
  },
};
