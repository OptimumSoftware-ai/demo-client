import { ModalType } from '../components/Modal/Modal'

export enum NotificationType {
  SUCCESS = 'SUCCESS',
  FAILURE = 'FAILURE',
  INFO = 'INFO',
}

export type BlockUi = {
  created: number
  id: string
  headline?: string
  message?: string
  remove: () => void
  updateMessage: (message: string) => void
}

export interface Notification {
  id: string
  className?: string
  created: number
  message: string
  remove: () => void
  type: NotificationType
}

export interface BlockingNotification extends Notification {
  header?: string
  modalType?: ModalType
  onConfirm?: (notification: BlockingNotification) => void
  onCancel?: (notification: BlockingNotification) => void
}