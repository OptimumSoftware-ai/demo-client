import './QuoteView.scss'
import React from 'react'
import { connect, MapStateToProps } from 'react-redux'
import { RouteComponentProps, withRouter } from 'react-router-dom'
import * as sdk from '@kiltprotocol/sdk-js'
import { State as ReduxState } from '../../state/PersistentStore'
import { IMyIdentity } from '../../types/Contact'
import * as Wallet from '../../state/ducks/Wallet'
import * as Quotes from '../../state/ducks/Quotes'
import QuoteCreate from '../QuoteCreate/QuoteCreate'
import Code from '../../components/Code/Code'

type StateProps = {
  selectedIdentity: IMyIdentity
  quoteEntries?: Quotes.Entry[]
}

type OwnProps = {
  claim: sdk.IPartialClaim
  senderAddress?: string
  receiverAddress?: string
  updateQuote: (quote: sdk.IQuote) => void
}

type Props = RouteComponentProps<{ quoteId: Quotes.Entry['quoteId'] }> &
  StateProps &
  OwnProps

type State = {
  createNewQuote: boolean
  newQuote?: sdk.IQuote
}

class QuoteView extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props)
    this.state = { createNewQuote: false }
    this.createQuote = this.createQuote.bind(this)
    this.onCancelQuote = this.onCancelQuote.bind(this)
    this.confirmQuote = this.confirmQuote.bind(this)
  }

  public componentDidUpdate(): void {
    const { updateQuote } = this.props
    const { newQuote } = this.state

    if (newQuote) updateQuote(newQuote)
  }

  private onCancelQuote(): void {
    this.setState({ createNewQuote: false })
  }

  private createQuote(): void {
    this.setState({ createNewQuote: true })
  }

  private confirmQuote(quote: sdk.IQuote): void {
    if (quote) {
      this.setState({ newQuote: quote, createNewQuote: false })
    }
  }

  public render(): JSX.Element {
    const { senderAddress, receiverAddress, claim } = this.props

    const { createNewQuote, newQuote } = this.state
    return (
      <section className="QuoteView">
        <h1>Quote </h1>
        {newQuote ? (
          <div>
            <span>
              <Code>{newQuote}</Code>
            </span>
          </div>
        ) : (
          <div>No Quote</div>
        )}

        {!createNewQuote ? (
          <section>
            <div className="actions">
              <button
                type="button"
                className="submit-quote"
                onClick={this.createQuote}
              >
                Create new Quote
              </button>
            </div>
          </section>
        ) : (
          <section>
            <QuoteCreate
              claimerAddress={senderAddress}
              attesterAddress={receiverAddress}
              cTypeHash={claim?.cTypeHash}
              onCancel={this.onCancelQuote}
              newQuote={quote => this.confirmQuote(quote)}
            />
          </section>
        )}
      </section>
    )
  }
}

const mapStateToProps: MapStateToProps<
  StateProps,
  OwnProps,
  ReduxState
> = state => ({
  selectedIdentity: Wallet.getSelectedIdentity(state),
  quoteEntries: Quotes.getAllMyQuotes(state),
})

export default connect(mapStateToProps)(withRouter(QuoteView))
