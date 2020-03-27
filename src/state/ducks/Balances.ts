import Immutable from 'immutable'
import { createSelector } from 'reselect'
import KiltAction from '../../types/Action'
import { IMyIdentity } from '../../types/Contact'
import { State as ReduxState } from '../PersistentStore'

interface IUpdateAction extends KiltAction {
  payload: {
    address: IMyIdentity['identity']['address']
    balance: number
  }
}

interface IRemoveAction extends KiltAction {
  payload: IMyIdentity['identity']['address']
}

export type Action = IUpdateAction | IRemoveAction

type State = {
  balances: Immutable.Map<IMyIdentity['identity']['address'], number>
}

export type ImmutableState = Immutable.Record<State>

class Store {
  public static reducer(
    state: ImmutableState = Store.createState(),
    action: Action
  ): ImmutableState {
    switch (action.type) {
      case Store.ACTIONS.UPDATE_BALANCE: {
        const { address, balance } = (action as IUpdateAction).payload
        return state.setIn(['balances', address], balance)
      }
      case Store.ACTIONS.REMOVE_BALANCE: {
        const address = (action as IRemoveAction).payload
        return state.deleteIn(['identities', address])
      }
      default:
        return state
    }
  }

  public static updateBalance(
    address: IMyIdentity['identity']['address'],
    balance: number
  ): IUpdateAction {
    return {
      payload: { address, balance },
      type: Store.ACTIONS.UPDATE_BALANCE,
    }
  }

  public static removeBalance(
    address: IMyIdentity['identity']['address']
  ): IRemoveAction {
    return {
      payload: address,
      type: Store.ACTIONS.REMOVE_BALANCE,
    }
  }

  public static createState(obj?: State): ImmutableState {
    return Immutable.Record({
      balances: Immutable.Map<IMyIdentity['identity']['address'], number>(),
    } as State)(obj)
  }

  private static ACTIONS = {
    REMOVE_BALANCE: 'balances/REMOVE_BALANCE',
    UPDATE_BALANCE: 'balances/UPDATE_BALANCE',
  }
}

const getAllBalances = (state: ReduxState): Immutable.Map<string, number> => {
  return state.balances.get('balances')
}

const getBalances = createSelector(
  [getAllBalances],
  (balances: Immutable.Map<string, number>) => balances
)

const getStateBalance = (
  state: ReduxState,
  address: IMyIdentity['identity']['address']
): number | undefined => state.balances.get('balances').get(address)

const getBalance = createSelector([getStateBalance], (entry: number) => entry)

export { Store, getBalance, getBalances }
