import { Notification } from '../application/notification';

export abstract class Entity {
  notification: Notification = new Notification();
}