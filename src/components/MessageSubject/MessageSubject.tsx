import {
  IMessage,
  IRequestClaimsForCtype,
  IRequestLegitimations,
  MessageBodyType,
} from '@kiltprotocol/prototype-sdk'
import { ReactNode } from 'react'
import * as React from 'react'

import './MessageSubject.scss'
import ContactPresentation from '../ContactPresentation/ContactPresentation'
import CTypePresentation from '../CTypePresentation/CTypePresentation'

type Props = {
  message: IMessage
}

const MessageSubject = (props: Props) => {
  const { message } = props
  if (!message || !message.body || !message.body.content) {
    return <span className="MessageSubject">-</span>
  }

  if (!message.body || !message.body.type) {
    return <span className="MessageSubject">{message.body}</span>
  }

  let additionalInfo: string | ReactNode = ''
  try {
    const messageBodyType: MessageBodyType | undefined = message.body.type

    switch (messageBodyType) {
      case MessageBodyType.REQUEST_CLAIMS_FOR_CTYPE:
        additionalInfo = (
          <span>
            {' '}
            for cType{' '}
            <CTypePresentation
              cTypeHash={(message.body as IRequestClaimsForCtype).content}
            />
          </span>
        )
        break
      case MessageBodyType.REQUEST_LEGITIMATIONS:
        additionalInfo = (
          <span>
            {' '}
            for cType{' '}
            <CTypePresentation
              cTypeHash={(message.body as IRequestLegitimations).content.cType}
            />
          </span>
        )
        break
    }
  } catch (error) {
    additionalInfo = ''
  }

  return (
    <span className="MessageSubject">
      <span className="type">{message.body!.type}</span>
      {additionalInfo}
    </span>
  )
}

export default MessageSubject
