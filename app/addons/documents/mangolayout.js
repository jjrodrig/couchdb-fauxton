// Licensed under the Apache License, Version 2.0 (the "License"); you may not
// use this file except in compliance with the License. You may obtain a copy of
// the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations under
// the License.

import React, { Component } from 'react';
import { connect } from 'react-redux';
import app from "../../app";
import { Breadcrumbs } from '../components/header-breadcrumbs';
import { NotificationCenterButton } from '../fauxton/notifications/notifications';
import MangoComponents from "./mango/mango.components";
import * as MangoAPI from "./mango/mango.api";
import IndexResultsContainer from './index-results/containers/IndexResultsContainer';
import PaginationContainer from './index-results/containers/PaginationContainer';
import ApiBarContainer from './index-results/containers/ApiBarContainer';
import FauxtonAPI from "../../core/api";
import Constants from './constants';

export const RightHeader = ({ docURL, endpoint }) => {
  const apiBar = <ApiBarContainer docURL={docURL} endpoint={endpoint} />;
  return (
    <div className="right-header-wrapper flex-layout flex-row flex-body">
      <div id="right-header" className="flex-body">
      </div>
      {apiBar}
      <div id='notification-center-btn'>
        <NotificationCenterButton />
      </div>
    </div>
  );
};

export const MangoFooter = ({databaseName, fetchUrl, queryDocs}) => {
  return (
    <div id="footer">
      <PaginationContainer
        databaseName={databaseName}
        fetchUrl={fetchUrl}
        queryDocs={queryDocs} />
    </div>
  );
};

export const MangoHeader = ({ crumbs, docURL, endpoint }) => {
  return (
    <div className="header-wrapper flex-layout flex-row">
      <div className='flex-body faux__breadcrumbs-mango-header'>
        <Breadcrumbs crumbs={crumbs} />
      </div>
      <RightHeader
        docURL={docURL}
        endpoint={endpoint}
      />
    </div>
  );
};

MangoHeader.defaultProps = {
  crumbs: []
};

export const MangoContent = ({ edit, designDocs, explainPlan, databaseName, fetchUrl, queryDocs, docType }) => {
  const leftContent = edit ?
    <MangoComponents.MangoIndexEditorContainer
      description={app.i18n.en_US['mango-descripton-index-editor']}
      databaseName={databaseName}
    /> :
    <MangoComponents.MangoQueryEditorContainer
      description={app.i18n.en_US['mango-descripton']}
      editorTitle={app.i18n.en_US['mango-title-editor']}
      additionalIndexesText={app.i18n.en_US['mango-additional-indexes-heading']}
      databaseName={databaseName}
    />;

  let resultsPage = <IndexResultsContainer
                      fetchUrl={fetchUrl}
                      designDocs={designDocs}
                      ddocsOnly={false}
                      databaseName={databaseName}
                      fetchAtStartup={false}
                      queryDocs={queryDocs}
                      docType={docType} />;

  let mangoFooter = <MangoFooter
                      databaseName={databaseName}
                      fetchUrl={fetchUrl}
                      queryDocs={queryDocs} />;

  if (explainPlan) {
    resultsPage = <MangoComponents.ExplainPage explainPlan={explainPlan} />;
    mangoFooter = null;
  }

  return (
    <div id="two-pane-content" className="flex-layout flex-row flex-body">
      <div id="left-content" className="flex-body">
        {leftContent}
      </div>
      <div id="right-content" className="flex-body flex-layout flex-col">
        <div id="dashboard-lower-content" className="flex-body">
          {resultsPage}
        </div>
        {mangoFooter}
      </div>
    </div>
  );
};

class MangoLayout extends Component {
  constructor(props) {
    super(props);
  };

  render() {
    const { database, edit, docURL, crumbs, designDocs, fetchUrl, databaseName, queryFindCode } = this.props;
    let endpoint = this.props.endpoint;

    if (this.props.explainPlan) {
      endpoint = FauxtonAPI.urls('mango', 'explain-apiurl', database);
    }
    let queryFunction = (params) => { return MangoAPI.mangoQueryDocs(databaseName, queryFindCode, params); };
    let docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_QUERY;
    if (edit) {
      queryFunction = (params) => { return MangoAPI.fetchIndexes(databaseName, params); };
      docType = Constants.INDEX_RESULTS_DOC_TYPE.MANGO_INDEX;
    }
    return (
      <div id="dashboard" className="two-pane flex-layout flex-col">
        <MangoHeader
          docURL={docURL}
          endpoint={endpoint}
          crumbs={crumbs}
        />
        <MangoContent
          edit={edit}
          designDocs={designDocs}
          explainPlan={this.props.explainPlan}
          databaseName={databaseName}
          fetchUrl={fetchUrl}
          queryDocs={queryFunction}
          docType={docType}
          />
      </div>
    );
  }
};

const mapStateToProps = ({ mangoQuery }) => {
  return {
    explainPlan: mangoQuery.explainPlan,
    queryFindCode: mangoQuery.queryFindCode
  };
};

export const MangoLayoutContainer = connect(
  mapStateToProps
)(MangoLayout);
