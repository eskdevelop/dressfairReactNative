import {
  extractNotificationDisplayText,
  mergeNotificationTextFields,
} from './notificationPayload';

describe('extractNotificationDisplayText', () => {
  it('reads title and body from FCM data when OS content is empty', () => {
    const result = extractNotificationDisplayText({
      title: '',
      body: '',
      data: {
        type: 'web_route',
        path: '/order/1',
        title: 'Order shipped',
        body: 'Your order is on the way',
      },
    });
    expect(result.title).toBe('Order shipped');
    expect(result.body).toBe('Your order is on the way');
    expect(result.hasBody).toBe(true);
  });

  it('prefers OS notification block over generic data title', () => {
    const result = extractNotificationDisplayText({
      title: 'Notification',
      body: '',
      data: {
        title: 'Real headline',
        message: 'Real body',
      },
    });
    expect(result.title).toBe('Real headline');
    expect(result.body).toBe('Real body');
  });

  it('merges better text on upsert', () => {
    expect(
      mergeNotificationTextFields(
        { title: 'Notification', body: '' },
        { title: 'Order shipped', body: 'Track your package' },
      ),
    ).toEqual({
      title: 'Order shipped',
      body: 'Track your package',
    });
  });
});
