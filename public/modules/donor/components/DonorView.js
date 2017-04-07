import React, {Component} from 'react'
import {connect} from 'react-redux'
import {stateGo} from 'redux-ui-router';
import {utc} from 'moment'
import set from 'lodash/set'
import {Table} from 'react-bootstrap'

import {View} from '../../core/services/view.client.service'
import {selectors} from '../../../store'
import {loadDonor, saveDonor, deleteDonor} from '../../../store/donor'

import DynamicView from '../../common/components/DynamicView'
import Page from '../../common/components/Page'
import DonationView from './DonationView'
import DonationCreate from './DonationCreate'

const mapStateToProps = state => ({
  user: state.auth.user,
  savingDonor: state.donor.saving,
  savingDonorError: state.donor.saveError,
  loadingDonors: selectors.loadingDonors(state),
  loadDonorsError: selectors.loadDonorsError(state),
  getDonor: selectors.getOneDonor(state),
  donorId: state.router.currentParams.donorId,
  settings: state.settings.data
});

const mapDispatchToProps = dispatch => ({
  loadDonor: (id, admin) => dispatch(loadDonor(id, admin)),
  deleteDonor: id => dispatch(deleteDonor(id)),
  push: (route, params, options) => dispatch(stateGo(route, params, options))
});

class DonorView extends Component {
  constructor(props) {
    super(props)
    this.isAdmin = props.user.roles.find(role => role === 'admin')
    this.state = {
      donorModel: null,
      error: null,
      donationModel: null,
      newDonationModal: false,
      viewDonationModal: false
    }
  }

  componentWillMount() {
    this.props.loadDonor(this.props.donorId, this.isAdmin)
  }

  componentWillReceiveProps(nextProps) {
    const {
      savingDonors,
      saveDonorsError,
      loadingDonors,
      loadDonorsError,
      getDonor
    } = nextProps

    // Tried to save donor
    if (!savingDonors && this.props.savingDonors) {
      this.setState({error: savingDonorError})
    }

    // Tried to load donor
    if (!loadingDonors && this.props.loadingDonors) {
      this.setState({error: loadDonorsError})
    }

    // generate donor view
    const donor = getDonor(nextProps.donorId)
    if (donor && !this.state.donorModel) {
      this.setState({
        donorModel: {...donor}
      })
    }
  }

  toggleNewDonationModal = () => this.setState({
    donationModel: {},
    newDonationModal: !this.state.newDonationModal
  })

  toggleViewDonationModal = donation => () => {
    this.setState({
      donationModel: {...donation},
      viewDonationModal: !this.state.viewDonationModal
    })
  }

  handleFieldChange = (field, value) => ev => {
    if (!value) value = ev.target.value

    const donationModel = set({...this.state.donationModel}, field, value)
    this.setState({donationModel})
  }

  render() {
    const {donorModel, donationModel, error} = this.state
    if (!donorModel) return null
    console.log('donorModel.donations', donorModel.donations)
    return (
      <Page heading={donorModel.fullName}>
        <div className="row">
          <div className="col-xs-12">
            <div className="box">
              <div className="box-header">
                <h3 className="box-title">Donations</h3>
                <div className="box-tools">
                  <button
                    className="btn btn-success btn-flat"
                    onClick={this.toggleNewDonationModal}
                  >
                    <i className="fa fa-plus"></i> Add Donation
                  </button>
                </div>
              </div>
              <div className="box-body table-responsive no-padding top-buffer">
                <Table responsive>
                  <thead>
                    <tr>
                      <th>Date</th>
                      <th>Amount</th>
                      <th>Type</th>
                      <th>Tax receipt ID</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {donorModel.donations.map((donation, i) =>
                      <tr key={i}>
                        <td><span>
                          {utc(donation.dateReceived).format('YYYY-MM-DD')}
                        </span></td>
                        <td><span>${donation.eligibleForTax}</span></td>
                        <td><span>{donation.type}</span></td>
                        <td><span>{donation._id}</span></td>
                        <td>
                          <a
                            className="btn btn-info btn-flat btn-xs"
                            onClick={this.toggleViewDonationModal(donation)}
                          ><i className="fa fa-eye"></i> View</a>
                        </td>
                      </tr>
                    )}
                    {!donorModel.donations.length &&
                      <tr>
                        <td className="text-center" colspan="5">This donor hasn't made any donations yet.</td>
                      </tr>
                    }
                  </tbody>
                </Table>
              </div>
              <DonationView
                show={this.state.viewDonationModal}
                close={this.toggleViewDonationModal()}
                donation={donationModel}
                donorId={donorModel.id}
              />
              <DonationCreate
                show={this.state.newDonationModal}
                close={this.toggleNewDonationModal}
                donation={donationModel}
                handleFieldChange={this.handleFieldChange}
              />
              <div className="box-footer">
                <div className="row">
                  <div className="col-sm-6 col-md-4 col-lg-2">
                    <button className="btn btn-default btn-flat btn-block">
                      <i className="fa fa-print"></i> Print
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Page>
    )
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(DonorView)