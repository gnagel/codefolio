/*!
 * Codefolio
 * Copyright(c) 2016 MSMFSD
 * MIT Licensed
 */
import React, { Component, PropTypes } from 'react'
import { Link } from 'react-router'
import CssModules from 'react-css-modules'
import Api from '../../utils/api'
import Panel from '../../components/Panel/Panel'
import Loader from '../../components/Loader/Loader'
import ProjectsList from '../../components/ProjectsList/ProjectsList'
import styles from './App.css'

/**
 * @class App
 * @extends Component
 */
class App extends Component {

  constructor (props) {
    super(props)
    this.state = {
      loading: true,
      error: false,
      errorMessage: '',
      profileData: { },
      projectsData: { }
    }
  }

  componentWillMount () {
    // ensure all CDN libs are defined
    if(typeof $ === 'undefined' || typeof Materialize === 'undefined') {
      throw new Error('CODEFOLIO ERROR: CDN lib undefined')
    }
  }

  componentDidMount () {
    // get codefolio api data
    Api.FetchCodefolioData()
        .then(apiData => {
          // get github stars for each project repo
          Api.FetchGithubData(apiData.projects.data)
                .then(newData => {
                  // add new repo data to projects
                  apiData.projects.data.forEach((project, index) => {
                    if(typeof newData[index] === 'undefined' || !apiData.projects.data[index].repo.display) {
                      apiData.projects.data[index].repo.watchers = 0
                    } else {
                      apiData.projects.data[index].repo.watchers = newData[index]
                    }
                  })
                  this.handleResponse(apiData)
                })
                .catch(reason => {
                  console.error(reason)
                  // probable github api call issue
                  // add empty repo data and continue
                  apiData.projects.data.forEach((project, index) => {
                    apiData.projects.data[index].repo.watchers = 0
                  })
                  this.handleResponse(apiData)
                })
        })
        .catch(reason => {
          this.handleError(reason)
        })
  }

  /**
   * Handle api server response
   * @param apiData : object
   * @returns {}
   */
  handleResponse (apiData) {
    if(!apiData.profile.success) {
      this.setState({
        loading: false,
        error: true,
        errorMessage: 'API error fetching profile: ' + apiData.profile.message
      })
    } else if(!apiData.projects.success) {
      this.setState({
        loading: false,
        error: true,
        errorMessage: 'API error fetching projects: ' + apiData.projects.message
      })
    } else {
      // success - update app state
      this.setState({
        loading: false,
        profileData: apiData.profile.data,
        projectsData: apiData.projects
      })
      // then init layout
      this.initialiseLayout(apiData.profile.data.layout)
    }
  }

  /**
   * Handle api server error
   * @param reason : object
   * @returns {}
   */
  handleError (reason) {
    this.setState({
      loading: false,
      error: true,
      errorMessage: reason.message + ' - Ensure your Codefolio API server is running.'
    })
  }

  /**
   * Method to set theme & bg image
   * & any dom manipulation
   * @param layout : object
   * @returns {}
   */
  initialiseLayout (layout) {
    // set body classes
    let classes = []
    classes.push('cf-theme-' + layout.theme)
    classes.push('background-image-' + String(layout.displayBgImage))
    for (let value of classes) {
      document.body.classList.add(value)
    }
    // initialise Materialize mobile menu widget
    $('#cf-button-collapse').sideNav({ closeOnClick: true })
  }

  render () {
    if(this.state.loading) {
      return (
        <div styleName="cf-container" className="container"><div className="row"><div className="col s12" styleName="cf-main"><div styleName="panel-height"><Loader /></div></div></div></div>
      )
    } else if(this.state.error) {
      return (
        <div styleName="cf-container" className="container"><div className="row"><div className="col s12" styleName="cf-main"><div styleName="panel-height"><Panel message={'Error: ' + this.state.errorMessage} /></div></div></div></div>
      )
    }
    return (
      <div styleName="cf-container" className="container">
        <div className="row">
          <div className="col s12" styleName="cf-main">
            <div styleName="cf-main-inner"></div>
            <div styleName="cf-main-divider" className="hide-on-med-and-down"></div>
            <div className="row">
              <div styleName="cf-nav" className="col s12 l3 no-padding">
                <Link styleName="cf-logo" to="/">Codefolio</Link>
                <a href="#" id="cf-button-collapse" data-activates="cf-projects" styleName="cf-button-collapse">
                  <i className="material-icons">menu</i>
                </a>
                <div id="cf-projects" styleName="cf-projects">
                  <ProjectsList data={this.state.projectsData.data} />
                </div>
              </div>
              <div styleName="cf-content" className="col s12 l9 no-padding">
                { this.props.children && React.cloneElement(this.props.children, { profileData: this.state.profileData, projectsData: this.state.projectsData }) }
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

}

App.propTypes = {
  children: PropTypes.object.isRequired
}

export default CssModules(App, styles)
