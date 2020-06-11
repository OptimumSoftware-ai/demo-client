import * as sdk from '@kiltprotocol/sdk-js'
import { IMetadata } from '@kiltprotocol/sdk-js/build/types/CTypeMetadata'
import {
  ROOT_SEED,
  CTYPE,
  CTYPE_METADATA,
  DELEGATION_ROOT_ID,
} from './data/anticov.json'
import { IMyIdentity } from '../../types/Contact'
import CTypeRepository from '../../services/CtypeRepository'
import { BalanceUtilities } from '../../services/BalanceUtilities'
import MessageRepository from '../../services/MessageRepository'
import DelegationsService from '../../services/DelegationsService'
import FeedbackService, {
  notifySuccess,
  notifyFailure,
} from '../../services/FeedbackService'

const root = sdk.Identity.buildFromMnemonic(ROOT_SEED)

const ctype = sdk.CType.fromCType(CTYPE as sdk.ICType)
ctype.owner = root.address
const metadata: IMetadata = CTYPE_METADATA

const delegationRoot = new sdk.DelegationRootNode(
  DELEGATION_ROOT_ID,
  ctype.hash,
  root.address
)

async function newDelegation(delegate: IMyIdentity): Promise<void> {
  const delegationNode = new sdk.DelegationNode(
    sdk.UUID.generate(),
    delegationRoot.id,
    delegate.identity.address,
    [sdk.Permission.ATTEST]
  )
  const signature = delegate.identity.signStr(delegationNode.generateHash())
  await delegationNode.store(root, signature)
  notifySuccess(`Delegation successfully created for ${delegate.metaData.name}`)
  await DelegationsService.importDelegation(
    delegationNode.id,
    'AntiCov Attester',
    false
  )
  notifySuccess(`Delegation imported. Switch to Delegation Tab to see it.`)
  const messageBody: sdk.MessageBody = {
    type: sdk.MessageBodyType.INFORM_CREATE_DELEGATION,
    content: { delegationId: delegationNode.id, isPCR: false },
  }
  await MessageRepository.sendToAddresses(
    [delegate.identity.address],
    messageBody
  )
}

async function verifyOrAddCtypeAndRoot(): Promise<void> {
  if (!(await ctype.verifyStored())) {
    await ctype.store(root)
    CTypeRepository.register({
      cType: ctype,
      metaData: { metadata, ctypeHash: ctype.hash },
    })
    notifySuccess(`CTYPE ${metadata.title.default} successfully created.`)
  }
  // delegationRoot.verify() is unreliable when using the currently released mashnet-node & sdk
  // workaround is checking the ctype hash of the query result; it is 0x000... if it doesn't exist on chain
  const queriedRoot = await sdk.DelegationRootNode.query(delegationRoot.id)
  if (queriedRoot?.cTypeHash !== ctype.hash) {
    await delegationRoot.store(root)
    const messageBody: sdk.MessageBody = {
      type: sdk.MessageBodyType.INFORM_CREATE_DELEGATION,
      content: { delegationId: delegationRoot.id, isPCR: false },
    }
    notifySuccess(`AntiCov Delegation Root successfully created.`)
    // sending root owner message for importing the root
    const message = new sdk.Message(messageBody, root, root)
    await MessageRepository.dispatchMessage(message)
    notifySuccess(`Sent Delegation Root to AntiCov root authority.`)
  }
}

export async function setupAndDelegate(delegate: IMyIdentity): Promise<void> {
  const blockUi = FeedbackService.addBlockUi({
    headline: 'Creating AntiCov Delegation',
  })
  try {
    blockUi.updateMessage('Transferring funds to AntiCov authority')
    await new Promise(resolve => {
      BalanceUtilities.makeTransfer(delegate, root.address, 4, () => resolve())
    })
    blockUi.updateMessage('Setting up CType and Root Delegation')
    await verifyOrAddCtypeAndRoot()
    blockUi.updateMessage('Creating Delegation Node for current identity')
    await newDelegation(delegate)
  } catch (error) {
    notifyFailure(`Failed to set up Delegation Node: ${error}`)
  }
  blockUi.remove()
}

export default setupAndDelegate