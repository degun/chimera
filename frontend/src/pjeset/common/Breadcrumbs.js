import React from 'react';
import { Breadcrumb} from 'office-ui-fabric-react/lib/Breadcrumb';
import { connect } from 'react-redux';
import './Breadcrumbs.sass';

function Breadcrumbs({token}){
    function _onBreadcrumbItemClicked(e, item){
        console.log(item)
    }
    if(!token) return null;
    return (
        <div id="breadcrumbs">
            <Breadcrumb
                className="breadcrumb"
                styles={{root: {fontSize: '0.6em'}}}
                items={[
                    { text: 'Users', key: 'users', onClick: _onBreadcrumbItemClicked },
                    { text: 'Users list', key: 'users_list', onClick: _onBreadcrumbItemClicked, isCurrentItem: true }
                ]}
                dividerAs={() => <span>/</span>}
                ariaLabel="Breadcrumb with no maxDisplayedItems"
                overflowAriaLabel="More links"
            />
        </div>
    )
}

const mapStateToProps = state => {
  return {
    token: state.auth.token
  }
}

const mapDispatchToProps = dispatch => {
  return {
    
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Breadcrumbs);