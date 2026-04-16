import { Notification } from '@shared/application/notification';

export abstract class Entity {
  notification: Notification = new Notification();
}