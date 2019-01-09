import * as React from 'react'
import { Link } from 'react-router-dom'

import * as Claims from '../../state/ducks/Claims'

type Props = {
  claims: Claims.Entry[]
}

const ClaimListView = (props: Props) => {
  return (
    <section className="ClaimListView">
      <h1>My Claims</h1>
      <Link to="/ctype">Create Claim from CTYPE</Link>
      {props.claims && !!props.claims.length && (
        <table>
          <thead>
            <tr>
              <th>Alias</th>
              <th>Claim JSON</th>
            </tr>
          </thead>
          <tbody>
            {props.claims.map(claim => (
              <tr key={claim.alias}>
                <td>{claim.alias}</td>
                <td>{JSON.stringify(claim.claim)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </section>
  )
}

export default ClaimListView